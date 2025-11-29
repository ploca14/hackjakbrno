from tqdm import tqdm
import logging
import time
from sentence_transformers import SentenceTransformer
from sqlalchemy import text
from database import get_db_connection, get_patient_events, get_batch_patient_events, PatientEvent
from processor import linearize_patient_history, linearize_for_query
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VectorEngine:
    def __init__(self):
        logger.info("Initializing VectorEngine...")
        self.model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
        # self.index_patients() # Uncomment to run indexing on startup, or call explicitly


    def events_to_string(self, events: list[PatientEvent], patient_id: str = None) -> str:
        """
        Converts a list of events into a semantic string using Smart String linearization.
        Uses the enhanced processor for better signal-to-noise ratio.
        """
        return linearize_patient_history(events, patient_id)

    def index_patients(self, batch_size=50, limit=None):
        """Fetches patients without embeddings and generates them."""
        logger.info("Starting patient indexing...")
        with get_db_connection() as conn:
            # Find patients not yet in embeddings table
            query_str = """
                SELECT DISTINCT p.ID_PACIENT 
                FROM DATA.Pacienti p
                LEFT JOIN DATA.PatientEmbeddings e ON p.ID_PACIENT = e.ID_PACIENT
                WHERE e.ID_PACIENT IS NULL
            """
            query = text(query_str)
            result = conn.execute(query).fetchall()
            patient_ids = [row[0] for row in result]
            
            if limit:
                patient_ids = patient_ids[:limit]
            
            logger.info(f"Found {len(patient_ids)} patients to index.")
            
            # Process in batches to avoid OOM
            for i in tqdm(range(0, len(patient_ids), batch_size), desc="Indexing Patients"):
                batch_start = time.time()
                batch_ids = patient_ids[i:i+batch_size]
                
                # Fetch events for entire batch with single connection and 3 queries
                t0 = time.time()
                events_map = get_batch_patient_events(batch_ids)
                t1 = time.time()
                logger.info(f"  DB Fetch: {t1-t0:.2f}s")
                
                batch_texts = []
                batch_pids = []
                
                t0 = time.time()
                for pid in batch_ids:
                    events = events_map.get(pid, [])
                    if pid == batch_ids[0]:
                        logger.info(f"  Patient {pid} event count: {len(events)}")
                    if not events:
                        continue
                    
                    # USE THE NEW SMART STRING LINEARIZATION
                    text_rep = self.events_to_string(events, patient_id=pid)
                    
                    # Log first example for debugging
                    if pid == batch_ids[0]:
                        logger.info(f"  Sample linearization ({len(text_rep)} chars): {text_rep[:200]}...")
                    
                    batch_texts.append(text_rep)
                    batch_pids.append(pid)
                t1 = time.time()
                logger.info(f"  Text Conversion: {t1-t0:.2f}s")
                
                if not batch_texts:
                    continue
                    
                # Batch encode
                t0 = time.time()
                embeddings = self.model.encode(batch_texts, show_progress_bar=False)
                t1 = time.time()
                logger.info(f"  Embedding Generation: {t1-t0:.2f}s")
                
                # Insert embeddings
                t0 = time.time()
                for pid, embedding in zip(batch_pids, embeddings):
                    embedding_str = str(embedding.tolist())
                    conn.execute(
                        text("INSERT INTO DATA.PatientEmbeddings (ID_PACIENT, Embedding) VALUES (:pid, TO_VECTOR(:embedding, DECIMAL))"), 
                        {"pid": pid, "embedding": embedding_str}
                    )
                conn.commit()
                t1 = time.time()
                logger.info(f"  DB Insert: {t1-t0:.2f}s")
                
                batch_end = time.time()
                logger.info(f"Batch total: {batch_end-batch_start:.2f}s")

    def find_similar_patients_with_scores(self, patient_history: list[PatientEvent], top_k: int = 5) -> list[tuple[str, float]]:
        """
        Finds similar patients with similarity scores.
        Returns list of (patient_id, similarity_score) tuples.
        """
        text_rep = linearize_for_query(patient_history)
        query_embedding = self.model.encode(text_rep).tolist()
        query_embedding_str = str(query_embedding)

        with get_db_connection() as conn:
            sql = text("""
                SELECT TOP :k ID_PACIENT, VECTOR_DOT_PRODUCT(Embedding, TO_VECTOR(:embedding, DECIMAL)) as similarity
                FROM DATA.PatientEmbeddings
                ORDER BY similarity DESC
            """)
            result = conn.execute(sql, {"k": top_k, "embedding": query_embedding_str}).fetchall()
            return [(row[0], float(row[1])) for row in result]

    def _detect_outcome(self, events: list[dict]) -> str:
        """Detect the likely outcome from a trajectory's events."""
        if not events:
            return "UNKNOWN"
        
        # Check last few events for outcome indicators
        last_events_text = " ".join(e["label"].upper() for e in events[-10:])
        
        if "PALIATIV" in last_events_text or "HOSPIC" in last_events_text:
            return "END_OF_LIFE"
        elif "ZEMŘEL" in last_events_text or "PROHLÍDKA ZEMŘELÉHO" in last_events_text:
            return "DEATH"
        elif "PROPUŠTĚN" in last_events_text:
            return "DISCHARGED"
        elif any(kw in last_events_text for kw in ["INTENZIVNÍ", "JIP", "ARO", "RESUSCIT"]):
            return "CRITICAL"
        elif any(kw in last_events_text for kw in ["REHABILITACE", "LÁZEŇ"]):
            return "REHABILITATION"
        else:
            return "ONGOING"

    def get_future_trajectories(self, patient_history: list[PatientEvent], snapshot_events: int = None, top_k: int = 5) -> list[dict]:
        """
        Returns k complete future trajectories from similar patients.
        Each trajectory is a real patient's actual journey - coherent and realistic.
        
        Uses event-count alignment: aligns similar patients at the same event count,
        then returns their subsequent events as the "future".
        
        Args:
            patient_history: Full event history of the query patient
            snapshot_events: Number of events to use as "current state" (default: all events)
            top_k: Number of trajectory completions to return
            
        Returns:
            List of trajectory completions matching PatientFuture schema:
            - expected_health_services: complete event sequence (the trajectory)
            - probability: confidence score (similarity * 100)
        """
        # Determine how many events define "current state"
        if snapshot_events is None:
            snapshot_events = len(patient_history)
        else:
            snapshot_events = min(snapshot_events, len(patient_history))
        
        # Use only snapshot events for similarity search
        snapshot_history = patient_history[:snapshot_events]
        
        if not snapshot_history:
            return []
        
        # Find similar patients with scores (get extra to account for filtering)
        similar_patients = self.find_similar_patients_with_scores(snapshot_history, top_k=top_k * 2)
        
        trajectories = []
        
        for pid, similarity in similar_patients:
            # Get this patient's complete event history
            similar_events = get_patient_events(pid)
            
            # Skip if similar patient has fewer or equal events (no future to show)
            if len(similar_events) <= snapshot_events:
                continue
            
            # Event-count alignment: find their Nth event as anchor
            anchor_event = similar_events[snapshot_events - 1]
            anchor_day = anchor_event.date
            
            # Extract future events (after the alignment point)
            future_events = []
            for event in similar_events[snapshot_events:]:
                # Light filtering - only remove truly administrative noise
                if "REGULAČNÍ POPLATEK" in event.label.upper():
                    continue
                
                future_events.append({
                    "label": event.label,
                    "type": event.type.value if hasattr(event.type, 'value') else str(event.type),
                    "delta_days": event.date - anchor_day,  # Relative to alignment point
                    "detail": event.detail
                })
            
            # Skip if no future events after filtering
            if not future_events:
                continue
            
            # Detect outcome from the trajectory
            outcome = self._detect_outcome(future_events)
            
            # Calculate confidence as percentage (similarity score is typically 0-1 for normalized vectors)
            # Clamp to 0-100 range
            confidence = max(0, min(100, int(similarity * 100)))
            
            trajectories.append({
                "expected_health_services": future_events,
                "probability": confidence,  # Using probability field for confidence score
                "_metadata": {
                    "source_patient": pid,
                    "event_count": len(future_events),
                    "time_span_days": future_events[-1]["delta_days"] if future_events else 0,
                    "outcome": outcome
                }
            })
            
            # Stop once we have enough trajectories
            if len(trajectories) >= top_k:
                break
        
        # Sort by confidence (probability)
        trajectories.sort(key=lambda x: x["probability"], reverse=True)
        
        return trajectories

# Singleton instance
vector_engine = VectorEngine()

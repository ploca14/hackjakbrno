# evaluate.py - Backtest evaluation for trajectory predictions with enhanced metrics

import sys
import math
from random import sample
from database import get_patient_events, get_db_connection
from vector_engine import vector_engine
from sqlalchemy import text


# Critical event keywords for recall/precision
CRITICAL_KEYWORDS = [
    "INTENZIVNÍ", "JIP", "ARO", "RESUSCIT", "OPERACE", "CHIRURG",
    "BIOPSIE", "ONKOLOG", "CHEMOTERAPIE", "DIALÝZA", "TRANSPLANT",
    "INFARKT", "EMBOLIE", "SEPSE", "ŠOKOVÁ", "PALIATIV"
]


def detect_outcome_from_events(events) -> str:
    """Detect outcome from actual PatientEvent list."""
    if not events:
        return "UNKNOWN"
    last_text = " ".join(e.label.upper() for e in events[-10:])
    if "PALIATIV" in last_text or "HOSPIC" in last_text:
        return "END_OF_LIFE"
    elif "ZEMŘEL" in last_text or "PROHLÍDKA ZEMŘELÉHO" in last_text:
        return "DEATH"
    elif "PROPUŠTĚN" in last_text:
        return "DISCHARGED"
    elif any(kw in last_text for kw in ["INTENZIVNÍ", "JIP", "ARO", "RESUSCIT"]):
        return "CRITICAL"
    elif any(kw in last_text for kw in ["REHABILITACE", "LÁZEŇ"]):
        return "REHABILITATION"
    return "ONGOING"


def is_critical_event(label: str) -> bool:
    """Check if an event is critical."""
    label_upper = label.upper()
    return any(kw in label_upper for kw in CRITICAL_KEYWORDS)


def compute_lcs_length(seq1: list, seq2: list) -> int:
    """
    Compute Longest Common Subsequence length.
    Measures sequence similarity while allowing gaps.
    """
    m, n = len(seq1), len(seq2)
    if m == 0 or n == 0:
        return 0
    
    # DP table
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if seq1[i-1] == seq2[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    
    return dp[m][n]


def compute_temporal_accuracy(actual_events, predicted_events) -> dict:
    """
    Compute temporal accuracy for matched events.
    Returns RMSE and mean absolute error for timing.
    """
    # Create lookup of predicted events by label
    predicted_by_label = {}
    for e in predicted_events:
        label = e["label"]
        if label not in predicted_by_label:
            predicted_by_label[label] = []
        predicted_by_label[label].append(e["delta_days"])
    
    # Find matched events and compute timing errors
    timing_errors = []
    matched_count = 0
    
    for e in actual_events:
        label = e.label
        actual_day = e.date
        
        if label in predicted_by_label and predicted_by_label[label]:
            # Get closest predicted timing
            predicted_days = predicted_by_label[label]
            closest_pred = min(predicted_days, key=lambda x: abs(x - actual_day))
            timing_errors.append(abs(actual_day - closest_pred))
            matched_count += 1
            # Remove used prediction
            predicted_by_label[label].remove(closest_pred)
    
    if not timing_errors:
        return {"rmse": None, "mae": None, "matched_count": 0}
    
    mae = sum(timing_errors) / len(timing_errors)
    rmse = math.sqrt(sum(e**2 for e in timing_errors) / len(timing_errors))
    
    return {
        "rmse": round(rmse, 1),
        "mae": round(mae, 1),
        "matched_count": matched_count
    }


def compute_critical_event_metrics(actual_events, predicted_events) -> dict:
    """
    Compute precision and recall for critical events.
    """
    actual_critical = set()
    for e in actual_events:
        if is_critical_event(e.label):
            actual_critical.add(e.label)
    
    predicted_critical = set()
    for e in predicted_events:
        if is_critical_event(e["label"]):
            predicted_critical.add(e["label"])
    
    true_positives = len(actual_critical & predicted_critical)
    
    precision = true_positives / len(predicted_critical) if predicted_critical else None
    recall = true_positives / len(actual_critical) if actual_critical else None
    
    return {
        "actual_critical_count": len(actual_critical),
        "predicted_critical_count": len(predicted_critical),
        "true_positives": true_positives,
        "precision": round(precision, 3) if precision is not None else None,
        "recall": round(recall, 3) if recall is not None else None
    }


def evaluate_patient(patient_id: str, snapshot_pct: float = 0.5) -> dict | None:
    """
    Evaluate prediction accuracy for a patient using backtesting.
    Includes enhanced trajectory metrics.
    """
    # Get complete history
    all_events = get_patient_events(patient_id)
    
    # Skip patients with too few events
    if len(all_events) < 20:
        return None
    
    # Split into "known" (past) and "actual future"
    snapshot_count = int(len(all_events) * snapshot_pct)
    if snapshot_count < 10:
        return None
        
    known_events = all_events[:snapshot_count]
    actual_future = all_events[snapshot_count:]
    
    if len(actual_future) < 5:
        return None
    
    # Get predictions using only known events
    trajectories = vector_engine.get_future_trajectories(
        patient_history=known_events,
        snapshot_events=snapshot_count,
        top_k=5
    )
    
    if not trajectories:
        return {
            "patient_id": patient_id,
            "status": "NO_PREDICTIONS",
            "reason": "No similar patients with more events"
        }
    
    # Get top prediction
    top_trajectory = trajectories[0]
    predicted_events = top_trajectory["expected_health_services"]
    
    # === SET-BASED METRICS ===
    
    # Event Label Overlap (Jaccard)
    actual_labels = set(e.label for e in actual_future)
    predicted_labels = set(e["label"] for e in predicted_events)
    label_intersection = len(actual_labels & predicted_labels)
    label_union = len(actual_labels | predicted_labels)
    label_jaccard = label_intersection / label_union if label_union > 0 else 0
    
    # Event Type Overlap (Jaccard)
    actual_types_set = set(e.type.value if hasattr(e.type, 'value') else str(e.type) for e in actual_future)
    predicted_types_set = set(e["type"] for e in predicted_events)
    type_intersection = len(actual_types_set & predicted_types_set)
    type_union = len(actual_types_set | predicted_types_set)
    type_jaccard = type_intersection / type_union if type_union > 0 else 0
    
    # === SEQUENCE METRICS ===
    
    # LCS on event labels (sequence similarity)
    actual_label_seq = [e.label for e in actual_future]
    predicted_label_seq = [e["label"] for e in predicted_events]
    lcs_length = compute_lcs_length(actual_label_seq, predicted_label_seq)
    lcs_ratio = lcs_length / max(len(actual_label_seq), len(predicted_label_seq)) if actual_label_seq else 0
    
    # LCS on event types (coarser sequence similarity)
    actual_type_seq = [e.type.value if hasattr(e.type, 'value') else str(e.type) for e in actual_future]
    predicted_type_seq = [e["type"] for e in predicted_events]
    type_lcs_length = compute_lcs_length(actual_type_seq, predicted_type_seq)
    type_lcs_ratio = type_lcs_length / max(len(actual_type_seq), len(predicted_type_seq)) if actual_type_seq else 0
    
    # === TEMPORAL METRICS ===
    temporal_metrics = compute_temporal_accuracy(actual_future, predicted_events)
    
    # Time span comparison
    actual_span = actual_future[-1].date - actual_future[0].date if len(actual_future) > 1 else 0
    predicted_span = top_trajectory.get("_metadata", {}).get("time_span_days", 0)
    span_diff = abs(actual_span - predicted_span)
    
    # === CRITICAL EVENT METRICS ===
    critical_metrics = compute_critical_event_metrics(actual_future, predicted_events)
    
    # === OUTCOME METRICS ===
    actual_outcome = detect_outcome_from_events(actual_future)
    predicted_outcome = top_trajectory.get("_metadata", {}).get("outcome", "UNKNOWN")
    outcome_match = actual_outcome == predicted_outcome
    
    return {
        "patient_id": patient_id,
        "status": "OK",
        "snapshot_events": snapshot_count,
        "actual_future_events": len(actual_future),
        "predicted_events": len(predicted_events),
        "confidence": top_trajectory["probability"],
        
        # Set-based metrics
        "label_jaccard": round(label_jaccard, 3),
        "type_jaccard": round(type_jaccard, 3),
        
        # Sequence metrics
        "lcs_ratio": round(lcs_ratio, 3),
        "type_lcs_ratio": round(type_lcs_ratio, 3),
        
        # Temporal metrics
        "temporal_rmse": temporal_metrics["rmse"],
        "temporal_mae": temporal_metrics["mae"],
        "matched_events": temporal_metrics["matched_count"],
        "time_span_diff": span_diff,
        
        # Critical event metrics
        "critical_recall": critical_metrics["recall"],
        "critical_precision": critical_metrics["precision"],
        "actual_critical_count": critical_metrics["actual_critical_count"],
        "predicted_critical_count": critical_metrics["predicted_critical_count"],
        
        # Outcome metrics
        "outcome_match": outcome_match,
        "actual_outcome": actual_outcome,
        "predicted_outcome": predicted_outcome,
        
        "num_trajectories_returned": len(trajectories)
    }


def run_evaluation(sample_size: int = 30, snapshot_pct: float = 0.5, verbose: bool = True):
    """
    Run evaluation on multiple patients with enhanced metrics.
    """
    print(f"\n{'='*70}")
    print(f"TRAJECTORY PREDICTION EVALUATION (Enhanced Metrics)")
    print(f"{'='*70}")
    print(f"Snapshot: {snapshot_pct:.0%} of events | Sample size: {sample_size}")
    print(f"{'='*70}\n")
    
    # Get indexed patient IDs
    with get_db_connection() as conn:
        result = conn.execute(text('SELECT ID_PACIENT FROM "DATA"."PatientEmbeddings"')).fetchall()
        patient_ids = [row[0] for row in result]
    
    print(f"Total indexed patients: {len(patient_ids)}")
    
    # Sample patients
    test_patients = sample(patient_ids, min(sample_size, len(patient_ids)))
    
    results = []
    skipped = 0
    no_predictions = 0
    
    for i, pid in enumerate(test_patients):
        result = evaluate_patient(pid, snapshot_pct=snapshot_pct)
        
        if result is None:
            skipped += 1
            continue
        
        if result.get("status") == "NO_PREDICTIONS":
            no_predictions += 1
            if verbose:
                print(f"[{i+1}/{len(test_patients)}] Patient {pid}: No predictions")
            continue
        
        results.append(result)
        
        if verbose:
            print(f"[{i+1}/{len(test_patients)}] Patient {pid}: "
                  f"LCS={result['lcs_ratio']:.0%}, "
                  f"Jaccard={result['label_jaccard']:.0%}, "
                  f"Outcome={'✓' if result['outcome_match'] else '✗'}, "
                  f"Conf={result['confidence']}%")
    
    # === SUMMARY STATISTICS ===
    print(f"\n{'='*70}")
    print(f"SUMMARY ({len(results)} patients evaluated)")
    print(f"{'='*70}")
    
    print(f"Skipped (too few events): {skipped}")
    print(f"No predictions available: {no_predictions}")
    
    if results:
        # Set-based metrics
        avg_label_jaccard = sum(r["label_jaccard"] for r in results) / len(results)
        avg_type_jaccard = sum(r["type_jaccard"] for r in results) / len(results)
        
        # Sequence metrics
        avg_lcs = sum(r["lcs_ratio"] for r in results) / len(results)
        avg_type_lcs = sum(r["type_lcs_ratio"] for r in results) / len(results)
        
        # Temporal metrics
        temporal_results = [r for r in results if r["temporal_rmse"] is not None]
        avg_temporal_rmse = sum(r["temporal_rmse"] for r in temporal_results) / len(temporal_results) if temporal_results else None
        avg_temporal_mae = sum(r["temporal_mae"] for r in temporal_results) / len(temporal_results) if temporal_results else None
        avg_time_diff = sum(r["time_span_diff"] for r in results) / len(results)
        
        # Critical event metrics
        critical_results = [r for r in results if r["critical_recall"] is not None]
        avg_critical_recall = sum(r["critical_recall"] for r in critical_results) / len(critical_results) if critical_results else None
        precision_results = [r for r in results if r["critical_precision"] is not None]
        avg_critical_precision = sum(r["critical_precision"] for r in precision_results) / len(precision_results) if precision_results else None
        
        # Outcome metrics
        outcome_accuracy = sum(r["outcome_match"] for r in results) / len(results)
        avg_confidence = sum(r["confidence"] for r in results) / len(results)
        
        print(f"\n--- Set-Based Metrics (unordered overlap) ---")
        print(f"Event Label Overlap (Jaccard):     {avg_label_jaccard:.1%}")
        print(f"Event Type Overlap (Jaccard):      {avg_type_jaccard:.1%}")
        
        print(f"\n--- Sequence Metrics (ordered similarity) ---")
        print(f"Label Sequence Similarity (LCS):   {avg_lcs:.1%}")
        print(f"Type Sequence Similarity (LCS):    {avg_type_lcs:.1%}")
        
        print(f"\n--- Temporal Metrics ---")
        if avg_temporal_mae is not None:
            print(f"Matched Event Timing MAE:          {avg_temporal_mae:.0f} days")
            print(f"Matched Event Timing RMSE:         {avg_temporal_rmse:.0f} days")
        else:
            print(f"Matched Event Timing:              N/A (no matched events)")
        print(f"Trajectory Time Span Difference:   {avg_time_diff:.0f} days")
        
        print(f"\n--- Critical Event Detection ---")
        if avg_critical_recall is not None:
            print(f"Critical Event Recall:             {avg_critical_recall:.1%} (of actual critical events predicted)")
        else:
            print(f"Critical Event Recall:             N/A (no critical events in actual)")
        if avg_critical_precision is not None:
            print(f"Critical Event Precision:          {avg_critical_precision:.1%} (of predicted critical events correct)")
        else:
            print(f"Critical Event Precision:          N/A (no critical events predicted)")
        
        print(f"\n--- Outcome Prediction ---")
        print(f"Outcome Accuracy:                  {outcome_accuracy:.1%}")
        print(f"Avg Confidence Score:              {avg_confidence:.0f}%")
        
        # Detailed outcome breakdown
        print(f"\n--- Outcome Breakdown ---")
        outcomes = {}
        for r in results:
            actual = r["actual_outcome"]
            if actual not in outcomes:
                outcomes[actual] = {"total": 0, "correct": 0}
            outcomes[actual]["total"] += 1
            if r["outcome_match"]:
                outcomes[actual]["correct"] += 1
        
        for outcome, stats in sorted(outcomes.items()):
            acc = stats["correct"] / stats["total"] if stats["total"] > 0 else 0
            print(f"  {outcome}: {stats['correct']}/{stats['total']} ({acc:.0%})")
        
        # Best and worst predictions
        print(f"\n--- Best/Worst Predictions ---")
        sorted_by_lcs = sorted(results, key=lambda x: x["lcs_ratio"], reverse=True)
        print(f"Best LCS:  Patient {sorted_by_lcs[0]['patient_id']} - {sorted_by_lcs[0]['lcs_ratio']:.0%}")
        print(f"Worst LCS: Patient {sorted_by_lcs[-1]['patient_id']} - {sorted_by_lcs[-1]['lcs_ratio']:.0%}")
    
    print(f"\n{'='*70}")
    
    return results


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Evaluate trajectory predictions")
    parser.add_argument("--sample", type=int, default=30, help="Number of patients to evaluate")
    parser.add_argument("--snapshot", type=float, default=0.5, help="Snapshot percentage (0.0-1.0)")
    parser.add_argument("--quiet", action="store_true", help="Only show summary")
    
    args = parser.parse_args()
    
    run_evaluation(
        sample_size=args.sample,
        snapshot_pct=args.snapshot,
        verbose=not args.quiet
    )

import time
from typing import List
import sqlalchemy
from langchain_iris import IRISVector
from langchain_openai import OpenAIEmbeddings
from langchain.retrievers import ParentDocumentRetriever
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document

# Imports from your local modules
from .iris_store import IRISStore
from .database import get_batch_patient_events, engine, PatientEvent

# Configuration
CONNECTION_STRING = "iris://_SYSTEM:ISCDEMO@localhost:32782/FHIRSERVER"
COLLECTION_NAME = "PatientVectorStore"

# --- CORE LOGIC: TIMELINE TO TEXT ---
def format_patient_story(patient_id: str, events: List[PatientEvent]) -> str:
    """
    Turns a list of events into the 'Patient Journey' string.
    """
    story = [f"PATIENT ID: {patient_id}"]
    story.append("-" * 40)
    story.append("TIMELINE:")

    if not events:
        story.append("No recorded events.")
        return "\n".join(story)

    # Group by Date
    from itertools import groupby
    # Ensure events are sorted by date before grouping
    events.sort(key=lambda x: x.date)
    
    for day, day_events in groupby(events, key=lambda x: x.date):
        day_header = f"Day {day}:"
        day_lines = []
        
        for event in day_events:
            context_parts = []
            if event.type == "Hospitalization":
                if t := event.detail.get("termination"): context_parts.append(f"Exit: {t}")
            elif event.type == "Care":
                if d := event.detail.get("department"): context_parts.append(d)
            elif event.type == "Spa":
                if t := event.detail.get("type"): context_parts.append(t)
            
            context_str = f" [{', '.join(context_parts)}]" if context_parts else ""
            line = f"  {event.type}{context_str}: {event.label}"
            day_lines.append(line)
        
        story.append(day_header)
        story.extend(day_lines)

    return "\n".join(story)

# --- CORE LOGIC: CHUNKING STRATEGY ---
def get_text_splitter():
    """
    Returns the exact splitter used for ingestion, so we can test it.
    """
    return RecursiveCharacterTextSplitter(
        chunk_size=1000, 
        chunk_overlap=100,
        # Priority: Split by Day first, then by newline
        separators=["\nDay ", "\n", " ", ""] 
    )

# --- INGESTION COMPONENTS ---
def get_retriever():
    embeddings = OpenAIEmbeddings()
    vectorstore = IRISVector(
        embedding_function=embeddings,
        connection_string=CONNECTION_STRING,
        collection_name=COLLECTION_NAME
    )
    store = IRISStore(connection_string=CONNECTION_STRING)
    
    return ParentDocumentRetriever(
        vectorstore=vectorstore,
        docstore=store,
        child_splitter=get_text_splitter(), # <--- Uses the shared splitter
        parent_splitter=RecursiveCharacterTextSplitter(chunk_size=50000)
    )
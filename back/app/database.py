import os
from sqlalchemy import create_engine, text
from datetime import datetime
from typing import List, Dict, Any
from pydantic import BaseModel

# --- Configuration ---
# Update these with your actual IRIS credentials and port
# Port 1972 is mapped to 32782 in docker-compose
IRIS_USER = "_SYSTEM"
IRIS_PASSWORD = "ISCDEMO"
IRIS_HOST = "localhost"
IRIS_PORT = "32782"
IRIS_NAMESPACE = "FHIRSERVER" 

CONNECTION_STRING = f"iris://{IRIS_USER}:{IRIS_PASSWORD}@{IRIS_HOST}:{IRIS_PORT}/{IRIS_NAMESPACE}"

engine = create_engine(CONNECTION_STRING)

class PatientEvent(BaseModel):
    date: int # Days from reference (or absolute date if applicable, but using days for now)
    type: str # 'Hospitalization', 'Spa', 'Care'
    label: str
    detail: Dict[str, Any] = {}

def get_db_connection():
    return engine.connect()

def get_patient_events(patient_id: str) -> List[PatientEvent]:
    """
    Fetches patient history from DATA.Hospitalizace, DATA.Lazne, and DATA.Pece.
    Normalizes them into a list of PatientEvent objects.
    """
    events = []
    
    with get_db_connection() as conn:
        # 1. Fetch Hospitalizations
        # Assuming DNY_OD_ZAKLADNI_HOSP is the day offset
        query_hosp = text('SELECT DNY_OD_ZAKLADNI_HOSP, DRG_NAZEV, UKONCENI FROM "DATA"."Hospitalizace" WHERE ID_PACIENT = :pid')
        result_hosp = conn.execute(query_hosp, {"pid": patient_id}).fetchall()
        for row in result_hosp:
            events.append(PatientEvent(
                date=row[0] if row[0] is not None else 0,
                type="Hospitalization",
                label=row[1] or "Unknown Hospitalization",
                detail={"termination": row[2]}
            ))

        # 2. Fetch Spa (Lazne)
        query_lazne = text('SELECT DNY_OD_ZAKLADNI_HOSP, NAZEV_INDIKACNI_SKUPINA, TYP_LECBY FROM "DATA"."Lazne" WHERE ID_PACIENT = :pid')
        result_lazne = conn.execute(query_lazne, {"pid": patient_id}).fetchall()
        for row in result_lazne:
            events.append(PatientEvent(
                date=row[0] if row[0] is not None else 0,
                type="Spa",
                label=row[1] or "Unknown Spa Treatment",
                detail={"type": row[2]}
            ))

        # 3. Fetch Care (Pece)
        # Assuming DNY_OD_ZAKLADNI_PECE is the day offset
        query_pece = text('SELECT DNY_OD_ZAKLADNI_PECE, NAZEV_VYKON, ODB_NAZEV FROM "DATA"."Pece" WHERE ID_PACIENT = :pid')
        result_pece = conn.execute(query_pece, {"pid": patient_id}).fetchall()
        for row in result_pece:
            events.append(PatientEvent(
                date=row[0] if row[0] is not None else 0,
                type="Care",
                label=row[1] or "Unknown Care",
                detail={"department": row[2]}
            ))

    # Sort events by date
    events.sort(key=lambda x: x.date)
    return events


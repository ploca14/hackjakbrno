import os
from sqlalchemy import create_engine, text
from datetime import datetime
from typing import List, Dict, Any
from pydantic import BaseModel

from dto.response.HealthService import HealthServiceType

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


def _map_typvyk_to_health_service_type(typvyk: str | None) -> HealthServiceType:
    """
    Maps TYPVYK values from Pece table to HealthServiceType.
    
    TYPVYK values:
    - 0 -> PROCEDURE (výkon)
    - 1, 2 -> MEDICATION (léčivé přípravky)
    - 3 -> HEALTH_TOOL (zdravotnický prostředek)
    - 4 -> STOMATOLOGICAL_TOOL (stomatologický výrobek)
    - 6 -> TRANSPORT (výkon dopravy)
    """
    if typvyk == "0":
        return HealthServiceType.PROCEDURE
    elif typvyk in ("1", "2"):
        return HealthServiceType.MEDICATION
    elif typvyk == "3":
        return HealthServiceType.HEALTH_TOOL
    elif typvyk == "4":
        return HealthServiceType.STOMATOLOGICAL_TOOL
    elif typvyk == "6":
        return HealthServiceType.TRANSPORT
    else:
        return HealthServiceType.UNKNOWN


class PatientEvent(BaseModel):
    date: int  # Days from reference (negative = past, positive = future)
    type: HealthServiceType
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
                type=HealthServiceType.HOSPITALIZATION,
                label=row[1] or "Unknown Hospitalization",
                detail={"termination": row[2]}
            ))

        # 2. Fetch Spa (Lazne)
        query_lazne = text('SELECT DNY_OD_ZAKLADNI_HOSP, NAZEV_INDIKACNI_SKUPINA, TYP_LECBY FROM "DATA"."Lazne" WHERE ID_PACIENT = :pid')
        result_lazne = conn.execute(query_lazne, {"pid": patient_id}).fetchall()
        for row in result_lazne:
            events.append(PatientEvent(
                date=row[0] if row[0] is not None else 0,
                type=HealthServiceType.SPA,
                label=row[1] or "Unknown Spa Treatment",
                detail={"type": row[2]}
            ))

        # 3. Fetch Care (Pece)
        # Aggregated by day, type (TYPVYK), and label to reduce volume
        query_pece = text("""
            SELECT 
                DNY_OD_ZAKLADNI_PECE, 
                COALESCE(NAZEV_VYKON, SEGMENT_NAZEV, 'Unknown Care'), 
                COUNT(*), 
                MIN(ODB_NAZEV),
                TYPVYK
            FROM "DATA"."Pece" 
            WHERE ID_PACIENT = :pid
            GROUP BY DNY_OD_ZAKLADNI_PECE, COALESCE(NAZEV_VYKON, SEGMENT_NAZEV, 'Unknown Care'), TYPVYK
        """)
        result_pece = conn.execute(query_pece, {"pid": patient_id}).fetchall()
        for row in result_pece:
            count = row[2]
            label = row[1]
            if count > 1:
                label = f"{label} ({count} items)"
                
            events.append(PatientEvent(
                date=row[0] if row[0] is not None else 0,
                type=_map_typvyk_to_health_service_type(row[4]),
                label=label,
                detail={"department": row[3], "count": count}
            ))

    # Sort events by date
    events.sort(key=lambda x: x.date)
    return events

def get_batch_patient_events(patient_ids: List[str]) -> Dict[str, List[PatientEvent]]:
    """
    Fetches patient history for a batch of patients.
    Returns a dictionary mapping patient_id -> list of PatientEvent objects.
    """
    events_map: Dict[str, List[PatientEvent]] = {pid: [] for pid in patient_ids}
    
    if not patient_ids:
        return events_map
        
    # SQLAlchemy handling of list IN clause might vary, usually assumes tuple or list expansion
    # For IRIS/SQLAlchemy, we might need to be careful with large lists in IN clause.
    # But for batch size 500 it should be fine.
    
    with get_db_connection() as conn:
        # Create dynamic placeholders for IN clause
        # e.g. :p0, :p1, :p2 ...
        bindparams = {f"p{i}": pid for i, pid in enumerate(patient_ids)}
        placeholders = ", ".join([f":p{i}" for i in range(len(patient_ids))])
        
        # 1. Fetch Hospitalizations
        query_hosp = text(f'SELECT ID_PACIENT, DNY_OD_ZAKLADNI_HOSP, DRG_NAZEV, UKONCENI FROM "DATA"."Hospitalizace" WHERE ID_PACIENT IN ({placeholders})')
        result_hosp = conn.execute(query_hosp, bindparams).fetchall()
        for row in result_hosp:
            pid = row[0]
            if pid in events_map:
                events_map[pid].append(PatientEvent(
                    date=row[1] if row[1] is not None else 0,
                    type=HealthServiceType.HOSPITALIZATION,
                    label=row[2] or "Unknown Hospitalization",
                    detail={"termination": row[3]}
                ))

        # 2. Fetch Spa (Lazne)
        query_lazne = text(f'SELECT ID_PACIENT, DNY_OD_ZAKLADNI_HOSP, NAZEV_INDIKACNI_SKUPINA, TYP_LECBY FROM "DATA"."Lazne" WHERE ID_PACIENT IN ({placeholders})')
        result_lazne = conn.execute(query_lazne, bindparams).fetchall()
        for row in result_lazne:
            pid = row[0]
            if pid in events_map:
                events_map[pid].append(PatientEvent(
                    date=row[1] if row[1] is not None else 0,
                    type=HealthServiceType.SPA,
                    label=row[2] or "Unknown Spa Treatment",
                    detail={"type": row[3]}
                ))

        # 3. Fetch Care (Pece)
        # Aggregated by day, type (TYPVYK), and label to reduce volume
        query_pece = text(f"""
            SELECT 
                ID_PACIENT, 
                DNY_OD_ZAKLADNI_PECE, 
                COALESCE(NAZEV_VYKON, SEGMENT_NAZEV, 'Unknown Care'), 
                COUNT(*), 
                MIN(ODB_NAZEV),
                TYPVYK
            FROM "DATA"."Pece" 
            WHERE ID_PACIENT IN ({placeholders})
            GROUP BY ID_PACIENT, DNY_OD_ZAKLADNI_PECE, COALESCE(NAZEV_VYKON, SEGMENT_NAZEV, 'Unknown Care'), TYPVYK
        """)
        result_pece = conn.execute(query_pece, bindparams).fetchall()
        for row in result_pece:
            pid = row[0]
            if pid in events_map:
                count = row[3]
                label = row[2]
                if count > 1:
                    label = f"{label} ({count} items)"
                    
                events_map[pid].append(PatientEvent(
                    date=row[1] if row[1] is not None else 0,
                    type=_map_typvyk_to_health_service_type(row[5]),
                    label=label,
                    detail={"department": row[4], "count": count}
                ))

    # Sort events for each patient
    for pid in events_map:
        events_map[pid].sort(key=lambda x: x.date)
        
    return events_map


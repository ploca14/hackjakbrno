from fastapi import FastAPI
from fastapi.responses import JSONResponse
import json
import logging


class EndpointFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        return "/openapi.json" not in record.getMessage()

logging.getLogger("uvicorn.access").addFilter(EndpointFilter())

from dto.response.SuggestResult import SuggestResult, SuggestResultType
from dto.response.patient.Patient import Patient
from dto.response.patient.PatientHistory import PatientHistory
from dto.response.patient.PatientFuture import PatientFuture
from dto.response.EWS import EWS
from fastapi.middleware.cors import CORSMiddleware
from vector_engine import vector_engine
from database import get_patient_events

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)

@app.on_event("startup")
def save_openapi():
    with open("openapi.json", "w") as f:
        json.dump(app.openapi(), f)
    # Optional: Trigger indexing on startup
    # vector_engine.index_patients()

@app.get("/suggest", response_model=list[SuggestResult])
async def suggest():
    return JSONResponse(content=[
        {
            "label": "12812937763543 (Franz Kafka)",
            "type": SuggestResultType.PATIENT
        },
        {
            "label": "874674624 (NemocnTBrno Kamo)",
            "type": SuggestResultType.SERVICE_PROVIDER
        },
        {
            "label": "Toxické účinky (21-X03)",
            "type": SuggestResultType.DRG
        }
    ])

@app.get("/patients", description="Get list of patients", response_model=list[Patient])
async def get_patients():
    return [
        {"name": "Plumbus", "price": 3},
        {"name": "Portal Gun", "price": 9001},
    ]


@app.get("/patients/{patient_id}", description="Get detail of a patient", response_model=Patient)
async def get_patient(patient_id):
    return JSONResponse(content={
        "patient_id": 234321,
        "name": "Franz Kafka"
    })

@app.get("/patients/{patient_id}/history", description="Get history of this patient", response_model=PatientHistory)
async def get_patient_history(patient_id):
    events = get_patient_events(patient_id)
    
    # Map database events to API response format
    api_events = [
        {
            "label": event.label,
            "type": event.type,  # Already a HealthServiceType from database layer
            "delta_days": event.date,
            "detail": event.detail
        }
        for event in events
    ]
        
    return JSONResponse(content={
        "received_health_services": api_events
    })


@app.get("/patients/{patient_id}/futures", description="Get possible future trajectories for this patient", response_model=list[PatientFuture])
async def get_patient_futures(patient_id: str, snapshot_events: int = None, top_k: int = 5):
    """
    Returns k complete future trajectories based on similar patients.
    Each trajectory is a real patient's actual journey - coherent and realistic.
    
    Uses event-count alignment: finds similar patients and shows what happened
    to them after the same number of healthcare events.
    
    Args:
        patient_id: The patient ID to predict for
        snapshot_events: Number of events to use as "current state" (default: all events).
                        Use this to simulate "what if we queried at event N?"
        top_k: Number of trajectory completions to return (default: 5)
    """
    # Get patient's complete history
    history = get_patient_events(patient_id)

    if not history:
        return JSONResponse(content=[])
    
    # Get future trajectories using event-count alignment
    trajectories = vector_engine.get_future_trajectories(
        patient_history=history,
        snapshot_events=snapshot_events,
        top_k=top_k
    )
    
    return JSONResponse(content=trajectories)


@app.get("/patients/{patient_id}/ews",
         description="Get a list of possible DRGs that could happen to this person within given time frame",
         response_model=list[EWS])
async def get_patient_ews(patient_id):
    return JSONResponse(content=[
        {
            "drg": {
                "code": "06-F03",
                "label": "Vaskulární onemocnění střeva a obstrukce trávicí soustavy"
            },
            "probability": 12,
            "eta": 7
        },
        {
            "drg": {
                "code": "21-X03",
                "label": "Toxické účinky"
            },
            "probability": 24,
            "eta": 21
        }
    ])
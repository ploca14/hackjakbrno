from fastapi import FastAPI
import json

from dto.SuggestResult import SuggestResult
from dto.patient.Patient import Patient
from dto.patient.PatientHistory import PatientHistory
from dto.patient.PatientFuture import PatientFuture

app = FastAPI()

@app.on_event("startup")
def save_openapi():
    with open("openapi.json", "w") as f:
        json.dump(app.openapi(), f)

@app.get("/suggest", response_model=list[SuggestResult])
async def suggest():
    return []

@app.get("/patients", description="Get list of patients", response_model=list[Patient])
async def get_patients():
    return [
        {"name": "Plumbus", "price": 3},
        {"name": "Portal Gun", "price": 9001},
    ]


@app.get("/patients/{patient_id}", description="Get detail of a patient", response_model=Patient)
async def get_patient():
    return []

@app.get("/patients/{patient_id}/history", description="Get history of this patient", response_model=PatientHistory)
async def get_patient_history():
    return []


@app.get("/patients/{patient_id}/futures", description="Get possible futures of this patient", response_model=list[PatientFuture])
async def get_patient_history():
    return []

from fastapi import FastAPI
from fastapi.responses import JSONResponse
import json
import logging

from dto.response.HealthService import HealthServiceType


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

@app.get("/suggest", response_model=list[SuggestResult])
async def suggest():
    return JSONResponse(content=[
        {
            "label": "12812937763543 (Franz Kafka)",
            "type": SuggestResultType.PATIENT
        },
        {
            "label": "874674624 (Nemocnice Brno Kamo)",
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
    return JSONResponse(content={
        "received_health_services": [
            {
                "label": "Operace slepého střeva",
                "type": HealthServiceType.PROCEDURE,
                "delta_days": 0,
                "detail": {}
            },
            {
                "label": "Návštěva praktického lékaře",
                "type": HealthServiceType.PROCEDURE,
                "delta_days": -3,
                "detail": {}
            },
            {
                "label": "Návštěva praktického lékaře",
                "type": HealthServiceType.PROCEDURE,
                "delta_days": -6,
                "detail": {}
            }
        ]
    })


@app.get("/patients/{patient_id}/futures", description="Get possible futures of this patient", response_model=list[PatientFuture])
async def get_patient_futures(patient_id):
    return JSONResponse(content=[
        {
            "expected_health_services": [
                    {
                        "label": "Předepsání prášků na bolest",
                        "type": HealthServiceType.PROCEDURE,
                        "delta_days": 2,
                        "detail": {}
                    }
            ],
            "probability": 60,
        },
        {
            "expected_health_services": [
                {
                    "label": "Smrt",
                    "type": HealthServiceType.DEATH,
                    "delta_days": 7,
                    "detail": {}
                }
            ]
        }
    ])

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
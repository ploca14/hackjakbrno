from pydantic import BaseModel
from dto.HealthService import HealthService


class PatientHistory(BaseModel):
    received_health_services: list[HealthService]
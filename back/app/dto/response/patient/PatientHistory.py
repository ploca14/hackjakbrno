from pydantic import BaseModel
from dto.response.HealthService import HealthService


class PatientHistory(BaseModel):
    received_health_services: list[HealthService]
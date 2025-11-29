from pydantic import BaseModel
from dto.HealthService import HealthService


class PatientFuture(BaseModel):
    expected_health_services: list[HealthService]
    probability: float
from pydantic import BaseModel
from enum import Enum
from typing import Any


# TYPVYK values: 0=výkon, 1,2 - léčivé přípravky, 3=zdravotnický prostředek, 4=stomatologický výrobek, 6=výkon dopravy
class HealthServiceType(str, Enum):
    PROCEDURE = "PROCEDURE" # TYPVYK 0
    MEDICATION = "MEDICATION" # TYPVYK 1,2
    HEALTH_TOOL = "HEALTH_TOOL" # TYPVYK 3
    STOMATOLOGICAL_TOOL = "STOMATOLOGICAL_TOOL" # TYPVYK 4
    TRANSPORT = "TRANSPORT" # TYPVYK 6
    HOSPITALIZATION = "HOSPITALIZATION" # From Hospitalizace table
    SPA = "SPA" # From Lazne table
    DEATH = "DEATH"
    UNKNOWN = "UNKNOWN" # Fallback for unmapped types


class HealthService(BaseModel, use_enum_values=True):
    label: str
    type: HealthServiceType
    delta_days: int
    detail: Any
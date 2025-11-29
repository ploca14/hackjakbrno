from pydantic import BaseModel
from enum import Enum
from typing import Any


# 0=výkon, 1,2 - léčivé přípravky, 3=zdravotnický prostředek, 4=stomatologický výrobek, 6=výkon dopravy
class HealthServiceType(str, Enum):
    PROCEDURE = "PROCEDURE" # 0
    MEDICATION = "MEDICATION" # 1,2
    HEALTH_TOOL = "HEALTH_TOOL" # 3
    STOMATOLOGICAL_TOOL = "STOMATOLOGICAL_TOOL" # 4
    TRANSPORT = "TRANSPORT" # 6
    DEATH = "DEATH"


class HealthService(BaseModel, use_enum_values=True):
    label: str
    type: HealthServiceType
    delta_days: int
    detail: Any
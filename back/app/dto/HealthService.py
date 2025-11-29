from pydantic import BaseModel
from enum import Enum


# 0=výkon, 1,2 - léčivé přípravky, 3=zdravotnický prostředek, 4=stomatologický výrobek, 6=výkon dopravy
class HealthServiceType(str, Enum):
    SURGERY = "SURGERY"
    MEDICATION = "MEDICATION"
    HEALTH_TOOL = "HEALTH_TOOL"
    STOMATOLOGICAL_TOOL = "STOMATOLOGICAL_TOOL"
    TRANSPORT = "TRANSPORT"


class HealthService(BaseModel, use_enum_values=True):
    label: str
    type: HealthServiceType
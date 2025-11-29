from pydantic import BaseModel
from enum import Enum


class SuggestResultType(str, Enum):
    PATIENT = "PATIENT"
    SERVICE_PROVIDER = "SERVICE_PROVIDER"
    DRG = "DRG"


class SuggestResult(BaseModel, use_enum_values=True):
    label: str
    type: SuggestResultType

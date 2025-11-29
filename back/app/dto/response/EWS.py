from pydantic import BaseModel

from dto.response.DRG import DRG


class EWS(BaseModel):
    drg: DRG
    probability: float
    eta: int
from pydantic import BaseModel


class DRG(BaseModel):
    code: str
    label: str
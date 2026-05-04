from pydantic import BaseModel
from typing import Optional


class CarCreate(BaseModel):
    brand: str
    model: str
    year: int
    license_plate: str
    vin: str
    color: str


class CarUpdate(BaseModel):
    brand: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    license_plate: Optional[str] = None
    vin: Optional[str] = None
    color: Optional[str] = None


class CarResponse(BaseModel):
    id: str
    client_id: str
    brand: str
    model: str
    year: int
    license_plate: str
    vin: str
    color: str
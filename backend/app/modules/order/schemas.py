from pydantic import BaseModel


class CreateOrderRequest(BaseModel):
    client_id: str
    car_info: str


class AddWorkRequest(BaseModel):
    work_id: str
    hours: float


class AddPartRequest(BaseModel):
    part_id: str
    quantity: int

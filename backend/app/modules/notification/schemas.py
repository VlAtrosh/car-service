from pydantic import BaseModel


class SmsRequest(BaseModel):
    phone: str
    text: str


class ApprovalRequest(BaseModel):
    phone: str
    order_id: str
    order_number: str

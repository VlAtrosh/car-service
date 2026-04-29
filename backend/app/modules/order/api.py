from fastapi import APIRouter, HTTPException, Depends
from ...core.dependencies import get_current_user
from ..user.models import User, UserRole
from .service import OrderService
from .models import OrderStatus
from .schemas import CreateOrderRequest, AddWorkRequest, AddPartRequest

router = APIRouter(prefix="/api/v1/order", tags=["order"])


@router.post("/create")
def create_order(request: CreateOrderRequest, current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.CLIENT, UserRole.RECEIVER]:
        raise HTTPException(status_code=403, detail="Not enough rights")

    order = OrderService.create_order(request.client_id, request.car_info)
    return {"order_id": order.id, "order_number": order.number, "status": order.status}


@router.post("/{order_id}/add-work")
def add_work(order_id: str, request: AddWorkRequest, current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.MECHANIC:
        raise HTTPException(status_code=403, detail="Only mechanic can add works")

    order = OrderService.add_work(order_id, request.work_id, request.hours)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"status": order.status, "total": order.total}


@router.post("/{order_id}/add-part")
def add_part(order_id: str, request: AddPartRequest, current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.MECHANIC:
        raise HTTPException(status_code=403, detail="Only mechanic can add parts")

    order = OrderService.add_part(order_id, request.part_id, request.quantity)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"status": order.status, "total": order.total}


@router.put("/{order_id}/status")
def change_status(order_id: str, new_status: OrderStatus, current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.MECHANIC, UserRole.RECEIVER, UserRole.DIRECTOR]:
        raise HTTPException(status_code=403, detail="Not enough rights")

    result = OrderService.change_status(order_id, new_status, current_user.role)
    if not result:
        raise HTTPException(status_code=400, detail="Cannot change status")

    from ..notification.service import NotificationService
    order = OrderService.get_order(order_id)
    if order and new_status in [OrderStatus.READY, OrderStatus.WAITING_APPROVAL]:
        NotificationService.send_status_notification(order.client_id, order.number, new_status)

    return {"status": new_status}

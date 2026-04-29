import uuid
from ...core.database import db
from .models import Order, OrderItem, OrderStatus
from .status_machine import StatusMachine
from ..reference.service import ReferenceService


class OrderService:

    @staticmethod
    def create_order(client_id: str, car_info: str) -> Order:
        order_id = str(uuid.uuid4())[:8]
        order = Order(
            id=order_id,
            number=f"ЗН-{order_id}",
            client_id=client_id,
            car_info=car_info
        )
        db.orders[order_id] = order
        return order

    @staticmethod
    def add_work(order_id: str, work_id: str, hours: float):
        order = db.orders.get(order_id)
        if not order:
            return None

        work = ReferenceService.get_work(work_id)
        if not work:
            return None

        total_price = hours * work.price_per_hour
        item = OrderItem("work", work_id, work.name, hours, total_price)
        order.items.append(item)
        OrderService._recalculate_total(order)
        return order

    @staticmethod
    def add_part(order_id: str, part_id: str, quantity: int):
        order = db.orders.get(order_id)
        if not order:
            return None

        part = ReferenceService.get_part(part_id)
        if not part:
            return None

        total_price = quantity * part.price
        item = OrderItem("part", part_id, part.name, quantity, total_price)
        order.items.append(item)
        OrderService._recalculate_total(order)
        return order

    @staticmethod
    def _recalculate_total(order: Order):
        order.total = sum(item.total for item in order.items)

    @staticmethod
    def change_status(order_id: str, new_status: OrderStatus, user_role: str) -> bool:
        order = db.orders.get(order_id)
        if not order:
            return False
        return StatusMachine.transition(order, new_status)

    @staticmethod
    def get_order(order_id: str):
        return db.orders.get(order_id)

    @staticmethod
    def get_orders_by_client(client_id: str):
        return [o for o in db.orders.values() if o.client_id == client_id]

    @staticmethod
    def get_all_orders():
        return list(db.orders.values())

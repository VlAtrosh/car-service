from typing import Dict
from ..modules.user.models import User
from ..modules.order.models import Order


class Database:
    def __init__(self):
        self.users: Dict[str, User] = {}
        self.orders: Dict[str, Order] = {}
        self.tokens: Dict[str, str] = {}


db = Database()

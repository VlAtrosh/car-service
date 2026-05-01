from ..modules.user.models import User, UserRole
from ..modules.order.models import Order, OrderStatus


class Database:
    def __init__(self):
        self.users: dict = {}
        self.orders: dict = {}
        self.tokens: dict = {}
        self._init_test_data()

    def _init_test_data(self):
        # Тестовый пользователь
        test_user = User(
            id="client1",
            name="Тест Клиент",
            phone="+79123456789",
            email="test@mail.ru",
            role=UserRole.CLIENT,
            password_hash="202cb962ac59075b964b07152d234b70"  # md5 of "123"
        )
        self.users["client1"] = test_user

        # Тестовый заказ
        test_order = Order(
            id="order1",
            number="ЗН-001",
            client_id="client1",
            car_info="Toyota Camry 2020"
        )
        test_order.status = OrderStatus.COMPLETED
        test_order.total = 15000
        self.orders["order1"] = test_order


db = Database()

# Модуль order/service.py
class OrderService:
    def create_order(self, order_data, current_user):
        # 1. Получаем данные клиента через модуль пользователей
        client = UserModule.get_user(order_data['client_id'])
        
        # 2. Получаем справочные данные через модуль справочников
        works = ReferenceModule.get_works(order_data['work_ids'])
        parts = ReferenceModule.get_parts(order_data['part_ids'])
        
        # 3. Создаем заказ в БД
        order = Order(
            client_id=client.id,
            car=order_data['car'],
            status='accepted',
            total=self.calculate_total(works, parts)
        )
        db.save(order)
        
        # 4. Вызываем модуль уведомлений
        NotificationModule.send_sms(
            phone=client.phone,
            text=f"Заказ {order.number} принят. Следите за статусом."
        )
        
        # 5. Данные для отчета уже доступны модулю отчетности
        return order

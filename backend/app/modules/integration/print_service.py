class PrintService:
    @staticmethod
    def print_order(order_data: dict) -> bool:
        print(f"[PRINT] Print order: {order_data.get('number', 'Unknown')}")
        return True

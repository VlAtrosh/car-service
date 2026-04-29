# Модуль report/service.py
def get_revenue_report(start_date, end_date):
    # Получаем данные из модуля заказов
    orders = OrderModule.get_orders_by_period(start_date, end_date)
    
    # Агрегируем
    total = sum(o.total for o in orders)
    avg = total / len(orders) if orders else 0
    
    report_data = {
        'period': f"{start_date} - {end_date}",
        'total_revenue': total,
        'orders_count': len(orders),
        'avg_check': avg
    }
    
    # Интеграция с модулем интеграции для экспорта
    IntegrationModule.export_to_excel(report_data, f"revenue_{start_date}.xlsx")
    
    return report_data

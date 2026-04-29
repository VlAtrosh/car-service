# AutoServiceSystem

Система автоматизации автосервиса.

## Запуск

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## API Endpoints
- POST /api/v1/user/register - регистрация

- POST /api/v1/user/login - вход

- POST /api/v1/order/create - создание заказа

- POST /api/v1/order/{id}/add-work - добавление работы

- PUT /api/v1/order/{id}/status - смена статуса

- GET /api/v1/report/revenue - отчет по выручке


---

### 35. `frontend/web/package.json`

```json
{
  "name": "autoservice-web",
  "version": "1.0.0",
  "scripts": {
    "dev": "echo 'Frontend will be started here'"
  }
}
```

## docker-compose.yml
```
version: '3.8'
services:
  backend:
    build: ./docker
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```


## Структура проекта

```
auto-service-system/
│
├── README.md
├── requirements.txt
├── docker-compose.yml
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # Точка входа (FastAPI/Flask)
│   │   ├── config.py
│   │   │
│   │   ├── modules/
│   │   │   ├── __init__.py
│   │   │   │
│   │   │   ├── user/               # Модуль пользователей
│   │   │   │   ├── __init__.py
│   │   │   │   ├── models.py       # SQLAlchemy модели
│   │   │   │   ├── schemas.py      # Pydantic схемы
│   │   │   │   ├── api.py          # Эндпоинты
│   │   │   │   ├── service.py      # Бизнес-логика
│   │   │   │   └── utils.py        # Хэширование, JWT
│   │   │   │
│   │   │   ├── reference/          # Модуль справочных данных
│   │   │   │   ├── __init__.py
│   │   │   │   ├── models.py
│   │   │   │   ├── schemas.py
│   │   │   │   ├── api.py
│   │   │   │   └── service.py
│   │   │   │
│   │   │   ├── order/              # Модуль заказ-нарядов
│   │   │   │   ├── __init__.py
│   │   │   │   ├── models.py
│   │   │   │   ├── schemas.py
│   │   │   │   ├── api.py
│   │   │   │   ├── service.py
│   │   │   │   └── status_machine.py  # Логика статусов
│   │   │   │
│   │   │   ├── notification/       # Модуль уведомлений
│   │   │   │   ├── __init__.py
│   │   │   │   ├── models.py
│   │   │   │   ├── schemas.py
│   │   │   │   ├── api.py
│   │   │   │   ├── service.py
│   │   │   │   ├── sms_client.py   # Интеграция с SMS-шлюзом
│   │   │   │   └── email_client.py
│   │   │   │
│   │   │   ├── report/             # Модуль отчетности
│   │   │   │   ├── __init__.py
│   │   │   │   ├── schemas.py
│   │   │   │   ├── api.py
│   │   │   │   └── service.py
│   │   │   │
│   │   │   └── integration/        # Модуль интеграции
│   │   │       ├── __init__.py
│   │   │       ├── api.py
│   │   │       ├── service.py
│   │   │       ├── excel_export.py
│   │   │       ├── pdf_export.py
│   │   │       └── print_service.py
│   │   │
│   │   ├── core/                   # Общие компоненты
│   │   │   ├── database.py
│   │   │   ├── dependencies.py
│   │   │   └── exceptions.py
│   │   │
│   │   └── utils/
│   │       └── logger.py
│   │
│   └── tests/
│       ├── test_user.py
│       ├── test_order.py
│       ├── test_notification.py
│       ├── test_report.py
│       └── test_integration.py
│
├── frontend/
│   ├── web/                        # Веб-интерфейс (React/Vue)
│      ├── src/
│      │   ├── pages/
│      │   ├── components/
│      │   ├── api/                # Вызовы к backend
│      │   └── store/
│      └── package.json
│   
│   
│      
├── database/
│   ├── migrations/
│   └── seeders/
│
└── docker/
    ├── Dockerfile.backend
    ├── Dockerfile.frontend
    └── nginx.conf

```


#  AutoServiceSystem: Система автоматизации ремонтов и заказ-нарядов

AutoServiceSystem — это веб-приложение для автоматизации работы автосервиса (СТО). Система позволяет управлять заказ-нарядами, клиентами, автомобилями, справочниками работ и запчастей, а также формировать отчёты по выручке. Проект демонстрирует возможности FastAPI для создания REST API, интеграцию с базой данных (в памяти), современный фронтенд с адаптивным дизайном и полный цикл тестирования (модульные и интеграционные тесты).

Проект создан для наглядной демонстрации возможностей FastAPI: REST API, авторизация через JWT-токены, статусная модель заказов, уведомления (SMS), отчёты и интерактивный интерфейс.

##  Моё мнение о FastAPI

FastAPI — это современный и быстрый фреймворк для создания API на Python. Он сочетает в себе простоту Flask и мощь асинхронности, автоматически генерирует документацию Swagger UI, валидирует данные через Pydantic и работает на скорости Starlette (практически догоняет Node.js и Go).

Вместо того чтобы вручную писать валидацию запросов, документацию и сериализацию, FastAPI всё делает за вас. Достаточно описать модели через Pydantic — и вы получаете:

- Автоматическую валидацию входных данных
- Документацию API (Swagger UI и ReDoc)
- Автодополнение в IDE
- Асинхронную обработку запросов

Для production-проектов FastAPI незаменим. Он отлично подходит для микросервисов, бэкенда мобильных приложений, систем реального времени и машинного обучения. Проект демонстрирует, что создание профессионального API может быть быстрым, простым и даже увлекательным.

##  Быстрый старт

### Требования

- Python 3.8+
- Git

### Установка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/VlAtrosh/car-service.git
cd auto_service


# Windows
python -m venv venv
venv\Scripts\activate
```

### Создайте виртуальное окружение (рекомендуется):
```
# Linux/macOS
python3 -m venv venv
source venv/bin/activate

```
### Установите зависимости:
```
pip install -r requirements.txt
```

### Запустите сервер:
```
cd backend
uvicorn app.main:app --reload --port 8000
```

### Откройте в браузере:
```
http://localhost:8000
```

## Справка по командам

```
# Запуск сервера в режиме разработки
uvicorn app.main:app --reload --port 8000

# Запуск в PRODUCTION режиме
set APP_ENV=production && uvicorn app.main:app --reload --port 8000

# Запуск в DEBUG режиме (отключена проверка токенов)
set APP_ENV=debug && uvicorn app.main:app --reload --port 8000

# Запуск в TEST режиме (заглушка для SMS)
set APP_ENV=test && uvicorn app.main:app --reload --port 8000

# Проверка качества кода Ruff
ruff check .

# Авто-исправление Ruff
ruff check . --fix

# Форматирование кода Black
black .

# Проверка форматирования Black
black --check .

# Запуск модульных тестов
pytest tests/ -v

# Запуск интеграционных тестов
pytest tests/test_integration.py -v -s

# Открыть Swagger документацию
# http://localhost:8000/docs
```

## Примеры вывода

Главная страница (фронтенд)

```
<img width="1200" height="700" alt="Главная страница" src="https://user-images.githubusercontent.com/placeholder/autoservice-main.png" />
```

## Авторизация

```
POST /api/v1/user/login
Content-Type: application/json

{
  "email": "test@mail.ru",
  "password": "123"
}
```

Ответ:
```
{
  "access_token": "87dccd9a-3c63-4ab1-bb19-f60f9eb0e84f",
  "token_type": "bearer"
}
```


Создание заказа:

```
POST /api/v1/order/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "client_id": "client1",
  "car_info": "BMW X5 2022"
}
```
Ответ:
```
{
  "order_id": "8fefec3e",
  "order_number": "ЗН-8fefec3e",
  "status": "accepted"
}
```


Смена статуса заказа

```
PUT /api/v1/order/8fefec3e/status?new_status=ready
Authorization: Bearer <token>
```

Ответ:
```
{
  "status": "ready"
}
```

SMS в консоли сервера:

```
[SMS] -> +79123456789: Your order ЗН-8fefec3e is ready for pickup
```

## Интерфейс

```
<img width="1200" height="500" alt="Заказ-наряды" src="https://github.com/user-attachments/assets/placeholder-orders.png" /
```

Карточки заказ-нарядов с цветовой индикацией статусов

```
<img width="1200" height="400" alt="Выпадающее меню пользователя" src="https://github.com/user-attachments/assets/placeholder-menu.png" />
```

![Uploading Снимок экрана (1387).png…]()



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

## 📦 Назначение файлов

| Файл | Что делает |
|------|------------|
| `backend/app/main.py` | Точка входа, подключение роутеров, CORS, раздача статики |
| `backend/app/config.py` | Конфигурация с режимами PRODUCTION/DEBUG/TEST |
| `backend/app/modules/user/` | Регистрация, авторизация, JWT-токены, роли |
| `backend/app/modules/order/` | Заказ-наряды, статусная модель, расчёт стоимости |
| `backend/app/modules/reference/` | Справочники работ и запчастей |
| `backend/app/modules/notification/` | Отправка SMS (заглушка) |
| `backend/app/modules/report/` | Отчёты по выручке |
| `backend/app/modules/integration/` | Экспорт в Excel/PDF |
| `frontend/web/` | HTML/CSS/JS интерфейс |
| `tests/` | Модульные и интеграционные тесты |



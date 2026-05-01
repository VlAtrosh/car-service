from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from .modules.user.api import router as user_router
from .modules.order.api import router as order_router
from .modules.reference.api import router as reference_router
from .modules.report.api import router as report_router
from .modules.integration.api import router as integration_router

app = FastAPI(title="AutoServiceSystem", version="1.0.0")

# CORS для фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключение роутеров
app.include_router(user_router)
app.include_router(order_router)
app.include_router(reference_router)
app.include_router(report_router)
app.include_router(integration_router)

STATIC_DIR = Path(__file__).resolve().parent / "static"
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

@app.get("/")
async def serve_index():
    return FileResponse(str(STATIC_DIR / "index.html"))


@app.get("/health")
def health():
    return {"status": "ok"}

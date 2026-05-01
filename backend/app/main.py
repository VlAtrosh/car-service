from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path

from .modules.user.api import router as user_router
from .modules.order.api import router as order_router
from .modules.reference.api import router as reference_router
from .modules.report.api import router as report_router
from .modules.integration.api import router as integration_router

app = FastAPI(title="AutoServiceSystem", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router)
app.include_router(order_router)
app.include_router(reference_router)
app.include_router(report_router)
app.include_router(integration_router)

# Путь к фронтенду (относительно корня проекта)
FRONTEND_DIR = Path(__file__).parent.parent.parent / "frontend" / "web"

if FRONTEND_DIR.exists():
    app.mount("/css", StaticFiles(directory=str(FRONTEND_DIR / "css")), name="css")
    app.mount("/js", StaticFiles(directory=str(FRONTEND_DIR / "js")), name="js")
    
    @app.get("/")
    async def serve_index():
        index_file = FRONTEND_DIR / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        return {"error": "index.html not found"}

@app.get("/health")
def health():
    return {"status": "ok"}

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .modules.user.api import router as user_router
from .modules.order.api import router as order_router
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
app.include_router(report_router)
app.include_router(integration_router)


@app.get("/")
def root():
    return {"message": "AutoServiceSystem API", "status": "running"}


@app.get("/health")
def health():
    return {"status": "ok"}

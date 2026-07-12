import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import recommendation, summarize, performance

app = FastAPI(title="NConnect AI Service")

allowed_origins = os.getenv("ALLOWED_ORIGIN", "http://localhost:8080").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(recommendation.router)
app.include_router(summarize.router)
app.include_router(performance.router)


@app.get("/health")
def health():
    return {"status": "ok"}
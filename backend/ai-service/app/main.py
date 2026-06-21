from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import recommendation, summarize

app = FastAPI(title="NConnect AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(recommendation.router)
app.include_router(summarize.router)


@app.get("/health")
def health():
    return {"status": "ok"}
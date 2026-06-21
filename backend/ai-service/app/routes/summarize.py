from fastapi import APIRouter
from app.models.schemas import SummarizeRequest, SummarizeResponse
from app.services.summarizer_service import summarize_text

router = APIRouter()


@router.post("/summarize", response_model=SummarizeResponse)
def summarize(payload: SummarizeRequest):
    return SummarizeResponse(summary=summarize_text(payload.text))
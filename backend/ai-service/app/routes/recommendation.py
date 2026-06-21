from fastapi import APIRouter
from typing import List
from app.models.schemas import (
    ProjectRecommendationRequest, MatchScore,
    VolunteerRecommendationRequest, VolunteerScore,
    NgoRecommendationRequest, NgoScore,
)
from app.services.recommendation_service import score_projects, score_volunteers, score_ngos

router = APIRouter()


@router.post("/recommend/projects", response_model=List[MatchScore])
def recommend_projects(payload: ProjectRecommendationRequest):
    return score_projects(payload)


@router.post("/recommend/volunteers", response_model=List[VolunteerScore])
def recommend_volunteers(payload: VolunteerRecommendationRequest):
    return score_volunteers(payload)


@router.post("/recommend/ngos", response_model=List[NgoScore])
def recommend_ngos(payload: NgoRecommendationRequest):
    return score_ngos(payload)
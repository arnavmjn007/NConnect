from fastapi import APIRouter
from typing import List
from app.models.schemas import (
    VolunteerPerformanceRequest, VolunteerPerformanceScore,
    ProjectPerformanceRequest, ProjectPerformanceScore,
)
from app.services.performance_service import score_volunteer_performance, score_project_performance

router = APIRouter()


@router.post("/performance/volunteers", response_model=List[VolunteerPerformanceScore])
def performance_volunteers(payload: VolunteerPerformanceRequest):
    return score_volunteer_performance(payload)


@router.post("/performance/projects", response_model=List[ProjectPerformanceScore])
def performance_projects(payload: ProjectPerformanceRequest):
    return score_project_performance(payload)
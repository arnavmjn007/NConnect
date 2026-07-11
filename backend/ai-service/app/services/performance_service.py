from typing import List
from app.models.schemas import (
    VolunteerPerformanceRequest, VolunteerPerformanceScore,
    ProjectPerformanceRequest, ProjectPerformanceScore,
)


def score_volunteer_performance(payload: VolunteerPerformanceRequest) -> List[VolunteerPerformanceScore]:
    results = []
    for v in payload.volunteers:
        raw = (v.acceptedCount * 20) + (min(v.totalApplications, 5) * 4)
        score = min(100, round(raw))
        results.append(VolunteerPerformanceScore(userId=v.userId, score=score))

    results.sort(key=lambda r: r.score, reverse=True)
    return results


def score_project_performance(payload: ProjectPerformanceRequest) -> List[ProjectPerformanceScore]:
    results = []
    for p in payload.projects:
        fill_rate = min((p.volunteersJoined / p.volunteerSlots) if p.volunteerSlots > 0 else 0.0, 1.0)
        funding_rate = min((p.raisedAmount / p.goalAmount) if p.goalAmount > 0 else 0.0, 1.0)

        raw = (fill_rate * 0.5) + (funding_rate * 0.5)
        score = round(raw * 100)
        results.append(ProjectPerformanceScore(projectId=p.projectId, score=score))

    results.sort(key=lambda r: r.score, reverse=True)
    return results
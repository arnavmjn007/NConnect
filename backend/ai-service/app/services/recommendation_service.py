from typing import List
from app.models.schemas import (
    ProjectRecommendationRequest, MatchScore,
    VolunteerRecommendationRequest, VolunteerScore,
    NgoRecommendationRequest, NgoScore,
)


def _overlap_score(a: List[str], b: List[str]) -> float:
    set_a = {x.strip().lower() for x in a if x}
    set_b = {x.strip().lower() for x in b if x}
    if not set_a or not set_b:
        return 0.0
    return len(set_a & set_b) / len(set_a | set_b)


def score_projects(payload: ProjectRecommendationRequest) -> List[MatchScore]:
    results = []
    for project in payload.projects:
        skill_score = _overlap_score(payload.skills, project.requiredSkills)
        interest_score = _overlap_score(payload.interests, project.tags + [project.category])
        location_bonus = 0.1 if (
            payload.location and project.location and
            payload.location.strip().lower() == project.location.strip().lower()
        ) else 0.0

        raw = (skill_score * 0.6) + (interest_score * 0.3) + location_bonus
        match_score = round(min(raw, 1.0) * 100)
        results.append(MatchScore(projectId=project.projectId, matchScore=match_score))

    results.sort(key=lambda r: r.matchScore, reverse=True)
    return results


def score_volunteers(payload: VolunteerRecommendationRequest) -> List[VolunteerScore]:
    results = []
    for candidate in payload.candidates:
        skill_score = _overlap_score(candidate.skills, payload.requiredSkills)
        interest_score = _overlap_score(candidate.interests, [payload.category])
        location_bonus = 0.1 if (
            payload.location and candidate.location and
            payload.location.strip().lower() == candidate.location.strip().lower()
        ) else 0.0

        raw = (skill_score * 0.7) + (interest_score * 0.2) + location_bonus
        score = round(min(raw, 1.0) * 100)
        results.append(VolunteerScore(userId=candidate.userId, score=score))

    results.sort(key=lambda r: r.score, reverse=True)
    return results


def score_ngos(payload: NgoRecommendationRequest) -> List[NgoScore]:
    results = []
    history = list({c.strip().lower() for c in (payload.volunteeredCategories + payload.donatedCategories) if c})

    for ngo in payload.ngos:
        interest_score = _overlap_score(payload.interests, ngo.categories)
        history_score = _overlap_score(history, ngo.categories)
        location_bonus = 0.1 if (
            payload.location and ngo.location and
            payload.location.strip().lower() == ngo.location.strip().lower()
        ) else 0.0

        raw = (interest_score * 0.5) + (history_score * 0.4) + location_bonus
        score = round(min(raw, 1.0) * 100)
        results.append(NgoScore(ngoId=ngo.ngoId, score=score))

    results.sort(key=lambda r: r.score, reverse=True)
    return results
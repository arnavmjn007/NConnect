from pydantic import BaseModel
from typing import List, Optional


class ProjectCandidate(BaseModel):
    projectId: str
    title: str
    category: str
    requiredSkills: List[str] = []
    tags: List[str] = []
    location: Optional[str] = None


class ProjectRecommendationRequest(BaseModel):
    skills: List[str] = []
    interests: List[str] = []
    location: Optional[str] = None
    projects: List[ProjectCandidate] = []


class MatchScore(BaseModel):
    projectId: str
    matchScore: int


class VolunteerCandidate(BaseModel):
    userId: str
    skills: List[str] = []
    interests: List[str] = []
    location: Optional[str] = None


class VolunteerRecommendationRequest(BaseModel):
    projectId: str
    requiredSkills: List[str] = []
    category: str
    location: Optional[str] = None
    candidates: List[VolunteerCandidate] = []


class VolunteerScore(BaseModel):
    userId: str
    score: int


class NgoCandidate(BaseModel):
    ngoId: str
    organizationName: str
    categories: List[str] = []
    location: Optional[str] = None


class NgoRecommendationRequest(BaseModel):
    interests: List[str] = []
    location: Optional[str] = None
    volunteeredCategories: List[str] = []
    donatedCategories: List[str] = []
    donationCount: int = 0
    ngos: List[NgoCandidate] = []


class NgoScore(BaseModel):
    ngoId: str
    score: int


class SummarizeRequest(BaseModel):
    text: str


class SummarizeResponse(BaseModel):
    summary: str


class VolunteerPerformanceCandidate(BaseModel):
    userId: str
    name: Optional[str] = None
    acceptedCount: int = 0
    totalApplications: int = 0


class VolunteerPerformanceRequest(BaseModel):
    volunteers: List[VolunteerPerformanceCandidate] = []


class VolunteerPerformanceScore(BaseModel):
    userId: str
    score: int


class ProjectPerformanceCandidate(BaseModel):
    projectId: str
    title: str
    volunteersJoined: int = 0
    volunteerSlots: int = 0
    raisedAmount: int = 0
    goalAmount: int = 0


class ProjectPerformanceRequest(BaseModel):
    projects: List[ProjectPerformanceCandidate] = []


class ProjectPerformanceScore(BaseModel):
    projectId: str
    score: int
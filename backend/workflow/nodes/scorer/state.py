"""State definition for resume scorer workflow."""

from typing import TypedDict, Optional


class ScorerState(TypedDict):
    """State object that gets passed between scorer nodes."""
    resume_analysis: str
    job_id: Optional[str]
    job_description: str
    job_requirements: str
    score_result: Optional[str]
    ai_score: Optional[int]
    step: str



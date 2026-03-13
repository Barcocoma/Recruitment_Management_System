"""State definition for resume analyzer workflow."""

from typing import TypedDict, Optional


class AnalyzerState(TypedDict):
    """State object that gets passed between analyzer nodes."""
    resume_path: str
    job_id: Optional[str]
    job_description: Optional[str]
    job_requirements: Optional[str]
    extracted_text: Optional[str]
    analysis_result: Optional[str]
    step: str



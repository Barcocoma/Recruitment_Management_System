"""Factory for the Resume Scorer Agent."""

from datetime import datetime, timezone
from agents import Agent
from app.tools import score_resume_match


def _now_iso_utc() -> str:
    """Return current UTC timestamp string for instructions."""
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")


def create_resume_scorer_agent(model_override: str | None = None) -> Agent:
    """Return a resume scorer agent with scoring tools attached."""
    instructions = (
        f"You are a Resume Scorer Agent. Current date/time: {_now_iso_utc()}. "
        "Your role is to score resumes based on how well they match job requirements. "
        "You receive resume analysis results and job requirements, then use the score_resume_match tool "
        "to calculate a match score (0-100) and provide detailed scoring breakdown. "
        "Consider factors like skills match, experience level, education, and overall fit. "
        "Provide clear scoring rationale and recommendations."
    )
    return Agent(
        name="resume-scorer-agent",
        instructions=instructions,
        tools=[score_resume_match],
        model=model_override or "gpt-4o-mini"
    )



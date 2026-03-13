"""Factory for the Resume Analyzer Agent."""

from datetime import datetime, timezone
from agents import Agent
from app.tools import extract_resume_text, analyze_resume_content


def _now_iso_utc() -> str:
    """Return current UTC timestamp string for instructions."""
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")


def create_resume_analyzer_agent(model_override: str | None = None) -> Agent:
    """Return a resume analyzer agent with resume processing tools attached."""
    instructions = (
        f"You are a Resume Analyzer Agent. Current date/time: {_now_iso_utc()}. "
        "Your role is to analyze resumes and extract key information. "
        "You have access to tools that can extract text from PDF/DOCX files and analyze resume content. "
        "When given a resume file path, first use extract_resume_text to get the text content, "
        "then use analyze_resume_content to extract structured information like skills, experience, education, etc. "
        "Provide a comprehensive analysis of the resume including all relevant details. "
        "Be thorough and accurate in your analysis."
    )
    return Agent(
        name="resume-analyzer-agent",
        instructions=instructions,
        tools=[extract_resume_text, analyze_resume_content],
        model=model_override or "gpt-4o-mini"
    )



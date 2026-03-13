"""Analyze node for resume analyzer workflow."""

from .state import AnalyzerState
from app.tools.resume_tools import analyze_resume_content


def analyze_node(state: AnalyzerState) -> AnalyzerState:
    """
    Analyzes the extracted resume text and extracts structured information.
    
    Args:
        state: Current workflow state with extracted_text
        
    Returns:
        Updated workflow state with analysis_result
    """
    extracted_text = state.get('extracted_text', '')
    job_description = state.get('job_description', '')
    
    print(f"🔍 Analyze Node: Analyzing resume content...")
    print(f"   Extracted text length: {len(extracted_text) if extracted_text else 0} characters")
    
    if not extracted_text or extracted_text.startswith("Error"):
        print("⚠️  Warning: No valid text to analyze")
        analysis_result = '{"error": "No text extracted from resume", "skills": [], "experience_years": 0, "summary": "Empty or invalid resume file"}'
    else:
        # Check if text is empty or too short
        text_stripped = extracted_text.strip()
        if len(text_stripped) == 0:
            print("⚠️  Warning: Empty PDF - no text content")
            analysis_result = '{"error": "Empty PDF file", "skills": [], "experience_years": 0, "summary": "Empty PDF - no content found"}'
        elif len(text_stripped) < 50:
            print(f"⚠️  Warning: Very short content ({len(text_stripped)} chars) - may be empty")
            analysis_result = '{"error": "Very short content", "skills": [], "experience_years": 0, "summary": "Resume content too short or invalid"}'
        else:
            # Analyze using the tool
            analysis_result = analyze_resume_content(extracted_text, job_description)
            print(f"✅ Analysis completed")
    
    return {
        **state,
        "step": "analyzed",
        "analysis_result": analysis_result,
    }



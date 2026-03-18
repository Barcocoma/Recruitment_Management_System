"""Score node for resume scorer workflow."""

import json
from .state import ScorerState
from app.tools.resume_tools import score_resume_match


def score_node(state: ScorerState) -> ScorerState:
    """
    Scores the resume based on analysis and job requirements.
    
    Args:
        state: Current workflow state with resume_analysis and job requirements
        
    Returns:
        Updated workflow state with score_result and ai_score
    """
    resume_analysis = state.get('resume_analysis', '{}')
    job_description = state.get('job_description', '')
    job_requirements = state.get('job_requirements', '')
    instructions_text = state.get('instructions_text', '')
    
    print(f"🎯 Score Node: Calculating resume match score...")
    if instructions_text:
        print(f"   Using custom instructions for scoring guidance")
    
    # Score using the tool
    score_result = score_resume_match(resume_analysis, job_requirements, job_description, instructions_text)
    
    # Extract the score from the result
    try:
        score_data = json.loads(score_result) if isinstance(score_result, str) else score_result
        ai_score = score_data.get('overall_score', 0)
        print(f"✅ Score calculated: {ai_score}/100")
    except:
        ai_score = 0
        print("⚠️  Warning: Could not parse score result")
    
    return {
        **state,
        "step": "scored",
        "score_result": score_result,
        "ai_score": ai_score,
    }



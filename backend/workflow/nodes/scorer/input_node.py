"""Input node for resume scorer workflow."""

from .state import ScorerState


def input_node(state: ScorerState) -> ScorerState:
    """
    Initial node that receives and validates scoring inputs.
    
    Args:
        state: Current workflow state with resume_analysis and job requirements
        
    Returns:
        Updated workflow state
    """
    resume_analysis = state['resume_analysis']
    job_description = state.get('job_description', '')
    job_requirements = state.get('job_requirements', '')
    job_id = state.get('job_id')
    
    print(f"📥 Scorer Input Node: Preparing to score resume")
    if job_id:
        print(f"   Job ID: {job_id}")
    
    return {
        **state,
        "step": "input_validated",
        "score_result": None,
        "ai_score": None,
    }



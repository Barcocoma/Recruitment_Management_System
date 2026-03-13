"""Input node for resume analyzer workflow."""

from .state import AnalyzerState


def input_node(state: AnalyzerState) -> AnalyzerState:
    """
    Initial node that receives and validates resume file path.
    
    Args:
        state: Current workflow state with resume_path
        
    Returns:
        Updated workflow state
    """
    resume_path = state['resume_path']
    job_id = state.get('job_id')
    job_description = state.get('job_description', '')
    job_requirements = state.get('job_requirements', '')
    
    print(f"📥 Analyzer Input Node: Processing resume at {resume_path}")
    if job_id:
        print(f"   Job ID: {job_id}")
    
    return {
        **state,
        "step": "input_validated",
        "extracted_text": None,
        "analysis_result": None,
    }



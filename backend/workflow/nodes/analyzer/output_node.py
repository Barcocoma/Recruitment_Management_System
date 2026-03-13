"""Output node for resume analyzer workflow."""

from .state import AnalyzerState


def output_node(state: AnalyzerState) -> AnalyzerState:
    """
    Final node that prepares the analysis results.
    
    Args:
        state: Current workflow state with analysis_result
        
    Returns:
        Final workflow state
    """
    print(f"\n📤 Analyzer Output Node: Finalizing analysis results")
    print("="*50)
    print(f"  Resume Path: {state['resume_path']}")
    print(f"  Analysis Status: {state['step']}")
    if state.get('analysis_result'):
        print(f"  Analysis Result: Available")
    print("="*50)
    
    return {
        **state,
        "step": "completed"
    }



"""Output node for resume scorer workflow."""

from .state import ScorerState


def output_node(state: ScorerState) -> ScorerState:
    """
    Final node that prepares the scoring results.
    
    Args:
        state: Current workflow state with score_result
        
    Returns:
        Final workflow state
    """
    ai_score = state.get('ai_score', 0)
    
    print(f"\n📤 Scorer Output Node: Finalizing score results")
    print("="*50)
    print(f"  Final AI Score: {ai_score}/100")
    print(f"  Status: {state['step']}")
    if state.get('score_result'):
        print(f"  Detailed Score: Available")
    print("="*50)
    
    return {
        **state,
        "step": "completed"
    }



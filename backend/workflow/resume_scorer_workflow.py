"""
Resume Scorer Workflow

This workflow scores resumes based on analysis results:
1. Validating input (resume analysis and job requirements)
2. Scoring the resume match (0-100)
3. Outputting score results
"""

from langgraph.graph import StateGraph, END
from workflow.nodes.scorer import (
    ScorerState,
    input_node,
    score_node,
    output_node,
)


def create_scorer_workflow() -> StateGraph:
    """
    Creates a resume scorer workflow.
    
    Workflow structure (linear):
    START → input → score → output → END
    
    Returns:
        StateGraph: The compiled LangGraph workflow
    """
    # Create the state graph
    workflow = StateGraph(ScorerState)
    
    # Add nodes to the graph
    workflow.add_node("input", input_node)
    workflow.add_node("score", score_node)
    workflow.add_node("output", output_node)
    
    # Define the linear flow
    workflow.set_entry_point("input")
    workflow.add_edge("input", "score")
    workflow.add_edge("score", "output")
    workflow.add_edge("output", END)
    
    return workflow


def run_scorer_workflow(resume_analysis: str, job_description: str, 
                       job_requirements: str, job_id: str = None) -> dict:
    """
    Execute the resume scorer workflow.
    
    Args:
        resume_analysis: JSON string containing resume analysis results
        job_description: Full job description
        job_requirements: Required skills and qualifications
        job_id: Optional job ID
        
    Returns:
        dict: The final state with scoring results
    """
    print("\n" + "="*60)
    print("🚀 Starting Resume Scorer Workflow")
    print("="*60 + "\n")
    
    # Create the workflow
    workflow = create_scorer_workflow()
    
    # Compile the workflow
    app = workflow.compile()
    
    # Initial state
    initial_state: ScorerState = {
        "resume_analysis": resume_analysis,
        "job_id": job_id,
        "job_description": job_description,
        "job_requirements": job_requirements,
        "score_result": None,
        "ai_score": None,
        "step": "started",
    }
    
    # Run the workflow
    final_state = app.invoke(initial_state)
    
    print("\n" + "="*60)
    print("✅ Scorer Workflow Complete!")
    print("="*60)
    print(f"Status: {final_state['step']}\n")
    
    return final_state



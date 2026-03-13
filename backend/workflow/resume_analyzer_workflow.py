"""
Resume Analyzer Workflow

This workflow analyzes resumes by:
1. Validating input (resume file path)
2. Extracting text from PDF/DOCX files
3. Analyzing content to extract structured information
4. Outputting analysis results
"""

from langgraph.graph import StateGraph, END
from workflow.nodes.analyzer import (
    AnalyzerState,
    input_node,
    extract_node,
    analyze_node,
    output_node,
)


def create_analyzer_workflow() -> StateGraph:
    """
    Creates a resume analyzer workflow.
    
    Workflow structure (linear):
    START → input → extract → analyze → output → END
    
    Returns:
        StateGraph: The compiled LangGraph workflow
    """
    # Create the state graph
    workflow = StateGraph(AnalyzerState)
    
    # Add nodes to the graph
    workflow.add_node("input", input_node)
    workflow.add_node("extract", extract_node)
    workflow.add_node("analyze", analyze_node)
    workflow.add_node("output", output_node)
    
    # Define the linear flow
    workflow.set_entry_point("input")
    workflow.add_edge("input", "extract")
    workflow.add_edge("extract", "analyze")
    workflow.add_edge("analyze", "output")
    workflow.add_edge("output", END)
    
    return workflow


def run_analyzer_workflow(resume_path: str, job_id: str = None, 
                         job_description: str = None, job_requirements: str = None) -> dict:
    """
    Execute the resume analyzer workflow.
    
    Args:
        resume_path: Path to the resume file
        job_id: Optional job ID
        job_description: Optional job description
        job_requirements: Optional job requirements
        
    Returns:
        dict: The final state with analysis results
    """
    print("\n" + "="*60)
    print("🚀 Starting Resume Analyzer Workflow")
    print("="*60 + "\n")
    
    # Create the workflow
    workflow = create_analyzer_workflow()
    
    # Compile the workflow
    app = workflow.compile()
    
    # Initial state
    initial_state: AnalyzerState = {
        "resume_path": resume_path,
        "job_id": job_id,
        "job_description": job_description or "",
        "job_requirements": job_requirements or "",
        "extracted_text": None,
        "analysis_result": None,
        "step": "started",
    }
    
    # Run the workflow
    final_state = app.invoke(initial_state)
    
    print("\n" + "="*60)
    print("✅ Analyzer Workflow Complete!")
    print("="*60)
    print(f"Status: {final_state['step']}\n")
    
    return final_state



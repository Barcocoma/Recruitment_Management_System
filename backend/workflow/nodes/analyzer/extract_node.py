"""Extract node for resume analyzer workflow."""

import os
from .state import AnalyzerState
from app.tools.resume_tools import extract_resume_text


def extract_node(state: AnalyzerState) -> AnalyzerState:
    """
    Extracts text content from the resume file.
    
    Args:
        state: Current workflow state with resume_path
        
    Returns:
        Updated workflow state with extracted_text
    """
    resume_path = state['resume_path']
    
    print(f"📄 Extract Node: Extracting text from resume...")
    print(f"   Original resume_path: {resume_path}")
    
    # resume_path should already be absolute path from app.py
    # But handle both cases: absolute path or relative path
    if not os.path.isabs(resume_path):
        # If relative, assume it's in uploads folder
        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
        uploads_dir = os.path.join(backend_dir, 'uploads')
        resume_path = os.path.join(uploads_dir, resume_path)
    
    # Normalize path
    resume_path = os.path.normpath(resume_path)
    print(f"   Full resume_path: {resume_path}")
    print(f"   File exists: {os.path.exists(resume_path)}")
    
    if not os.path.exists(resume_path):
        # Try alternative paths
        alt_paths = [
            os.path.join('/app', 'uploads', os.path.basename(resume_path)),
            os.path.join('/app/uploads', os.path.basename(resume_path)),
        ]
        for alt_path in alt_paths:
            if os.path.exists(alt_path):
                resume_path = alt_path
                print(f"   Found file at alternative path: {resume_path}")
                break
    
    # Extract text using the tool
    extracted_text = extract_resume_text(resume_path)
    
    if extracted_text.startswith("Error"):
        print(f"⚠️  Warning: {extracted_text}")
    else:
        print(f"✅ Successfully extracted {len(extracted_text)} characters")
    
    return {
        **state,
        "step": "extracted",
        "extracted_text": extracted_text,
    }


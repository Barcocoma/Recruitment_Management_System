"""Resume processing tools for AI agents."""

import os
import json
from typing import Dict, Optional
from agents import function_tool

try:
    import PyPDF2
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False

try:
    from docx import Document
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False


@function_tool
def extract_resume_text(file_path: str) -> str:
    """Extract text content from a resume file (PDF or DOCX).
    
    Args:
        file_path: Path to the resume file
        
    Returns:
        Extracted text content from the resume
    """
    if not os.path.exists(file_path):
        return f"Error: File not found at {file_path}"
    
    file_ext = file_path.rsplit('.', 1)[1].lower() if '.' in file_path else ''
    
    try:
        if file_ext == 'pdf':
            if not PDF_AVAILABLE:
                return "Error: PyPDF2 library not installed. Install with: pip install PyPDF2"
            
            text_content = []
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_content.append(page_text)
            
            combined_text = "\n".join(text_content)
            # Check if extracted text is empty or just whitespace
            if not combined_text or not combined_text.strip():
                return "Error: Empty PDF - no text content found"
            return combined_text
        
        elif file_ext in ['docx', 'doc']:
            if not DOCX_AVAILABLE:
                return "Error: python-docx library not installed. Install with: pip install python-docx"
            
            doc = Document(file_path)
            text_content = []
            for paragraph in doc.paragraphs:
                text_content.append(paragraph.text)
            
            return "\n".join(text_content)
        
        else:
            return f"Error: Unsupported file type: {file_ext}"
    
    except Exception as e:
        return f"Error extracting text: {str(e)}"


@function_tool
def analyze_resume_content(resume_text: str, job_description: Optional[str] = None) -> str:
    """Analyze resume content and extract key information.
    
    This tool analyzes the resume text and extracts:
    - Personal information (name, email, phone)
    - Skills and technologies
    - Work experience
    - Education
    - Certifications
    - Years of experience
    
    Args:
        resume_text: The extracted text content from the resume
        job_description: Optional job description to compare against
        
    Returns:
        JSON string containing structured analysis of the resume
    """
    # Check if resume text is empty or invalid
    if not resume_text or not resume_text.strip() or resume_text.startswith("Error"):
        return json.dumps({
            "error": "Empty or invalid resume",
            "skills": [],
            "experience_years": 0,
            "education": [],
            "certifications": [],
            "summary": "Empty PDF - no content found"
        }, indent=2)
    
    # Basic analysis - in production, this would use LLM
    analysis = {
        "skills": [],
        "experience_years": 0,
        "education": [],
        "certifications": [],
        "summary": "Resume analysis completed"
    }
    
    # Simple keyword extraction (in production, use LLM for better analysis)
    resume_lower = resume_text.lower()
    
    # Common skills keywords
    tech_skills = ['python', 'javascript', 'java', 'react', 'node', 'sql', 'mysql', 
                   'mongodb', 'aws', 'docker', 'kubernetes', 'git', 'html', 'css',
                   'typescript', 'angular', 'vue', 'flask', 'django', 'fastapi']
    
    found_skills = [skill for skill in tech_skills if skill in resume_lower]
    analysis["skills"] = found_skills
    
    # Try to extract years of experience
    import re
    experience_patterns = [
        r'(\d+)\+?\s*years?\s*(?:of\s*)?experience',
        r'experience[:\s]+(\d+)\+?\s*years?',
    ]
    
    for pattern in experience_patterns:
        match = re.search(pattern, resume_lower)
        if match:
            try:
                analysis["experience_years"] = int(match.group(1))
                break
            except:
                pass
    
    return json.dumps(analysis, indent=2)


@function_tool
def score_resume_match(resume_analysis: str, job_requirements: str, job_description: str, instructions_text: str = '') -> str:
    """Score how well a resume matches a job posting.
    
    This tool evaluates the resume analysis against job requirements and returns a score.
    
    Args:
        resume_analysis: JSON string containing resume analysis results
        job_requirements: Required skills and qualifications for the job
        job_description: Full job description
        instructions_text: Optional custom instructions for evaluating applicants (e.g., consider those with limited experience but tool knowledge, or those with no skills but show potential)
        
    Returns:
        JSON string containing score (0-100) and detailed breakdown
    """
    try:
        analysis = json.loads(resume_analysis) if isinstance(resume_analysis, str) else resume_analysis
    except:
        analysis = {}
    
    # Check if resume is empty or has no valid content
    if analysis.get("error") or "Error" in str(resume_analysis):
        # Empty or invalid resume - return 0 score
        result = {
            "overall_score": 0,
            "breakdown": {
                "skills_match": 0,
                "experience_years": 0,
                "skill_score": 0,
                "experience_score": 0,
                "base_score": 0,
                "reason": "Empty or invalid resume file. No base score given."
            },
            "recommendation": "Invalid Resume"
        }
        return json.dumps(result, indent=2)
    
    # Basic scoring logic (in production, use LLM for better scoring)
    score = 0
    max_score = 100
    
    # Score based on skills match (60 points - increased since no base score)
    resume_skills = analysis.get("skills", [])
    required_skills_lower = job_requirements.lower()
    
    # Check if resume has any content at all
    # If no skills AND no experience, it's an empty resume - return 0 score immediately
    resume_skills_count = len(resume_skills)
    experience_years = analysis.get("experience_years", 0)
    
    # Check if resume is truly empty - if 0 skills AND 0 experience, it's empty
    has_error = analysis.get("error") or "Error" in str(analysis.get("summary", ""))
    has_no_content = (resume_skills_count == 0 and experience_years == 0)
    
    # If error OR no content (0 skills + 0 experience), return 0 score
    if has_error or has_no_content:
        # Empty or invalid resume - return 0 score (NO base score)
        result = {
            "overall_score": 0,
            "breakdown": {
                "skills_match": 0,
                "experience_years": 0,
                "skill_score": 0,
                "experience_score": 0,
                "base_score": 0,
                "reason": "Empty resume - no skills or experience detected. No base score given."
            },
            "recommendation": "Invalid Resume"
        }
        print(f"   ⚠️  Empty resume detected (0 skills, {experience_years} years) - returning 0% score")
        return json.dumps(result, indent=2)
    
    # Extract required skills from job requirements (split by comma or common separators)
    import re
    required_skills_list = [s.strip().lower() for s in re.split(r'[,;]|\s+', required_skills_lower) if s.strip()]
    
    # Count matches: how many resume skills match required skills
    matched_skills = [skill for skill in resume_skills if skill.lower() in required_skills_lower]
    skill_matches = len(matched_skills)
    
    # Find missing skills
    missing_skills = []
    if required_skills_list:
        for req_skill in required_skills_list:
            if not any(skill.lower() == req_skill for skill in resume_skills):
                missing_skills.append(req_skill)
    
    # Calculate skill score: based on how many required skills are matched (60 points max)
    if len(required_skills_list) > 0:
        # Score based on percentage of required skills found
        skill_score = min(60, (skill_matches / len(required_skills_list)) * 60)
        skill_score = round(skill_score)  # Round to whole number
        skill_percentage = (skill_matches / len(required_skills_list)) * 100
    elif len(resume_skills) > 0:
        # Fallback: if no required skills listed, give partial credit for having skills
        skill_score = 30
        skill_percentage = 50
    else:
        skill_score = 0
        skill_percentage = 0
    
    score += skill_score
    print(f"   Skills Match: {skill_matches} out of {len(required_skills_list)} required skills")
    print(f"   Skill Score: {skill_score}/60")
    
    # Score based on experience (40 points - increased since no base score)
    # Apply instructions_text guidance for limited experience but tool knowledge
    instructions_lower = instructions_text.lower() if instructions_text else ''
    consider_limited_experience = 'limited experience' in instructions_lower or 'no experience' in instructions_lower or 'tool knowledge' in instructions_lower or 'tools' in instructions_lower
    consider_no_skills = 'no skills' in instructions_lower or 'potential' in instructions_lower or 'willingness to learn' in instructions_lower
    
    # Adjust scoring based on instructions
    experience_bonus = 0
    skill_bonus = 0
    instruction_note = ""
    
    # If instructions mention considering limited experience but tool knowledge
    if consider_limited_experience and experience_years < 3:
        # Give bonus if applicant has tool knowledge (skills) even with limited experience
        if len(resume_skills) > 0:
            experience_bonus = min(15, experience_years * 5)  # Up to 15 bonus points
            instruction_note = "Bonus applied: Limited experience but demonstrates tool knowledge (per instructions). "
            print(f"   📝 Instruction applied: Limited experience bonus (+{experience_bonus} points) for tool knowledge")
    
    # If instructions mention considering applicants with no skills but potential
    if consider_no_skills and len(resume_skills) == 0:
        # Give small base score if instructions say to consider potential
        if 'potential' in instructions_lower or 'willingness to learn' in instructions_lower:
            skill_bonus = 10  # Small bonus for potential
            instruction_note += "Bonus applied: No skills but shows potential (per instructions). "
            print(f"   📝 Instruction applied: Potential bonus (+{skill_bonus} points) for showing potential")
    
    # Base experience scoring
    if experience_years >= 3:
        score += 40
        experience_score_breakdown = 40
        experience_assessment = "Excellent - Meets or exceeds the typical requirement of 3+ years"
    elif experience_years >= 1:
        score += 20
        experience_score_breakdown = 20
        experience_assessment = f"Moderate - Has {experience_years} year(s) of experience, but ideally needs 3+ years for full points"
    else:
        experience_score_breakdown = 0
        experience_assessment = "Limited - No significant professional experience detected"
    
    # Apply bonuses from instructions (but do NOT forcibly set score to threshold;
    # we keep the raw AI score so you can still see if it's 5%, 20%, etc.)
    score += experience_bonus + skill_bonus
    if experience_bonus > 0:
        experience_score_breakdown += experience_bonus
    if skill_bonus > 0:
        skill_score += skill_bonus
    
    # NO BASE SCORE - removed as per user request
    # Just submitting a resume doesn't give points anymore
    base_score = 0
    if instructions_text:
        print(f"   ℹ️  Using custom instructions for scoring guidance")
    else:
        print("   ℹ️  No base score - scoring based only on skills and experience")
    
    # Ensure score is between 0-100
    score = min(100, max(0, int(score)))
    
    # Calculate breakdown scores
    skill_score_breakdown = skill_score  # Already calculated above
    
    # Generate detailed explanation
    explanation_parts = []
    
    # Skills explanation (plain paragraph style)
    if len(required_skills_list) > 0:
        if skill_matches > 0:
            explanation_parts.append(
                f"Skills match ({skill_score}/60 points): the resume matches {skill_matches} out of {len(required_skills_list)} required skills "
                f"({skill_percentage:.1f}% match). Matched skills include {', '.join(matched_skills[:5])}"
                + (f" and {len(matched_skills) - 5} more." if len(matched_skills) > 5 else ". ")
            )
            if missing_skills:
                explanation_parts.append(
                    f"The resume is missing {len(missing_skills)} required skill(s): "
                    f"{', '.join(missing_skills[:5])}"
                    + (f" and {len(missing_skills) - 5} more. " if len(missing_skills) > 5 else ". ")
                )
        else:
            explanation_parts.append(
                "Skills match (0/60 points): no matching skills were found. "
                "The resume does not contain any of the main required skills such as "
                f"{', '.join(required_skills_list[:5])}"
                + (f" and {len(required_skills_list) - 5} more. " if len(required_skills_list) > 5 else ". ")
            )
    else:
        if len(resume_skills) > 0:
            explanation_parts.append(
                f"Skills match ({skill_score}/60 points): no specific skills were required for this position, "
                f"but the resume shows {len(resume_skills)} relevant skill(s), so partial credit is given. "
            )
        else:
            explanation_parts.append(
                "Skills match (0/60 points): no technical skills were detected in the resume. "
            )
    
    # Experience explanation
    experience_explanation = f"Experience ({experience_score_breakdown}/40 points): {experience_assessment}."
    if experience_bonus > 0:
        experience_explanation += f" {instruction_note}"
    explanation_parts.append(experience_explanation + " ")
    
    # Add instruction note if applicable
    if instruction_note and (experience_bonus > 0 or skill_bonus > 0):
        explanation_parts.append(
            f"Scoring guidance applied: custom instructions were used to adjust the score. "
        )
    
    # Overall assessment with status explanation
    if score >= 90:
        explanation_parts.append(
            "Overall assessment: this resume demonstrates an exceptional match with the job requirements. "
            "The candidate has excellent skills and extensive experience for the role. "
        )
        explanation_parts.append(
            f"STATUS: HIGHLY QUALIFIED - The candidate achieved a score of {score}% which is 90% or above. "
            "This indicates an outstanding fit for the position with all key requirements met or exceeded. "
            "This applicant is highly recommended for immediate consideration. "
        )
    elif score >= 70:
        explanation_parts.append(
            "Overall assessment: this resume demonstrates a strong match with the job requirements. "
            "The candidate has relevant skills and sufficient experience for the role. "
        )
        explanation_parts.append(
            f"STATUS: QUALIFIED - The candidate achieved a score of {score}% which meets the passing threshold. "
            "This indicates a good fit for the position with most key requirements satisfied. "
            "This applicant is recommended for further review and potential interview. "
        )
    elif score >= 50:
        explanation_parts.append(
            "Overall assessment: this resume shows a moderate match. "
            "The candidate has some relevant qualifications but may be missing key skills or experience. "
        )
        explanation_parts.append(
            f"STATUS: MODERATE MATCH - The candidate achieved a score of {score}%. "
            "This score indicates the candidate meets some of the key requirements but has gaps in other areas. "
            "The final status depends on your configured passing threshold. "
        )
    elif score > 0:
        explanation_parts.append(
            "Overall assessment: this resume shows a weak match. "
            "There are significant gaps in the required skills or experience. "
        )
        # Check if instructions_text exists to determine the actual status
        has_instructions = bool(instructions_text and instructions_text.strip())
        if has_instructions:
            explanation_parts.append(
                f"STATUS: NEEDS REVIEW - The candidate achieved a score of {score}% which is below the passing threshold. "
                "The low score is due to insufficient matching skills and/or lack of relevant experience. "
                "This applicant is marked as 'Needs Review' for manual evaluation based on your scoring guidelines. "
                "Please review the candidate's profile to determine if they have potential worth considering. "
            )
        else:
            explanation_parts.append(
                f"STATUS: NOT QUALIFIED - The candidate achieved a score of {score}% which is below the passing threshold. "
                "The low score is due to insufficient matching skills and/or lack of relevant experience. "
                "This applicant does not meet the minimum requirements for the position. "
            )
    else:
        explanation_parts.append(
            "Overall assessment: this resume does not meet the basic requirements. "
            "No relevant skills or experience were detected. "
        )
        explanation_parts.append(
            "STATUS: NOT QUALIFIED - The candidate achieved a score of 0% because no matching skills or relevant experience were found in the resume. "
            "This could be due to an empty/unreadable resume file, or the candidate's background does not align with the job requirements at all. "
            "This applicant is not recommended for this position. "
        )
    
    # Recommendations
    if score < 70:
        recommendations = []
        if skill_matches < len(required_skills_list) and len(required_skills_list) > 0:
            recommendations.append(f"Add missing skills: {', '.join(missing_skills[:3])}")
        if experience_years < 3:
            recommendations.append(f"Increase experience level (currently {experience_years} year(s), target: 3+ years")
        if recommendations:
            explanation_parts.append(
                "Recommendations: " + "; ".join(recommendations) + ". "
            )
    
    detailed_explanation = "".join(explanation_parts)
    
    result = {
        "overall_score": score,
        "breakdown": {
            "skills_match": skill_matches,
            "experience_years": experience_years,
            "skill_score": skill_score_breakdown,
            "experience_score": experience_score_breakdown if 'experience_score_breakdown' in locals() else 0,
            "base_score": 0,  # No base score anymore
            "matched_skills": matched_skills,
            "missing_skills": missing_skills[:10],  # Limit to first 10
            "total_required_skills": len(required_skills_list),
            "skill_match_percentage": round(skill_percentage, 1) if 'skill_percentage' in locals() else 0,
            "explanation": detailed_explanation
        },
        "recommendation": "Strong Match" if score >= 70 else ("Moderate Match" if score >= 50 else ("Weak Match" if score > 0 else "Invalid Resume"))
    }
    
    return json.dumps(result, indent=2)



# AI Agents para sa Recruitment Management System

Ang system na ito ay may dalawang AI agents na nag-a-analyze at nag-s-score ng resumes:

## 🤖 AI Agents

### 1. Resume Analyzer Agent
- **Layunin**: I-analyze ang resume at i-extract ang key information
- **Workflow**: `input → extract → analyze → output`
- **Tools**:
  - `extract_resume_text` - Nag-e-extract ng text mula sa PDF/DOCX files
  - `analyze_resume_content` - Nag-a-analyze ng resume content at nag-e-extract ng structured data

### 2. Resume Scorer Agent
- **Layunin**: I-score ang resume base sa job requirements
- **Workflow**: `input → score → output`
- **Tools**:
  - `score_resume_match` - Nag-c-calculate ng match score (0-100) base sa analysis at job requirements

## 📁 Structure

```
backend/
├── agents.py                          # Agent framework
├── app/
│   ├── agents/
│   │   ├── resume_analyzer_agent.py   # Resume Analyzer Agent
│   │   └── resume_scorer_agent.py    # Resume Scorer Agent
│   └── tools/
│       └── resume_tools.py            # Resume processing tools
└── workflow/
    ├── resume_analyzer_workflow.py    # Analyzer workflow
    ├── resume_scorer_workflow.py      # Scorer workflow
    └── nodes/
        ├── analyzer/                  # Analyzer workflow nodes
        │   ├── input_node.py
        │   ├── extract_node.py
        │   ├── analyze_node.py
        │   └── output_node.py
        └── scorer/                    # Scorer workflow nodes
            ├── input_node.py
            ├── score_node.py
            └── output_node.py
```

## 🚀 Paano Gumagana

### Automatic Analysis
Kapag may nag-upload ng resume sa `/api/applicants` endpoint:
1. **Resume Analyzer Workflow** ang unang tumatakbo:
   - Nag-e-extract ng text mula sa resume file
   - Nag-a-analyze ng content (skills, experience, education, etc.)
   
2. **Resume Scorer Workflow** ang sumusunod:
   - Nag-c-calculate ng match score base sa analysis at job requirements
   - Nagre-return ng score (0-100)

3. Ang `ai_score` ay automatic na na-save sa database

### Manual Analysis
Pwede ring i-trigger manually ang analysis gamit ang:
```
POST /api/ai/analyze-resume
{
  "resume_path": "filename.pdf",
  "job_id": "job-uuid"
}
```

## 📦 Dependencies

Ang mga dependencies na kailangan:
- `openai>=1.60.0` - Para sa OpenAI API
- `langgraph>=0.2.0` - Para sa workflow orchestration
- `langchain-core>=0.3.0` - LangChain core
- `langchain-openai>=0.2.0` - LangChain OpenAI integration
- `PyPDF2>=3.0.0` - Para sa PDF text extraction
- `python-docx>=1.1.0` - Para sa DOCX text extraction

## ⚙️ Setup

1. **Install dependencies**:
```bash
pip install -r requirements.txt
```

2. **Set environment variables**:
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

3. **Run the backend**:
```bash
python app.py
```

## 🔄 Workflow Flow

### Resume Analyzer Workflow
```
START
  ↓
Input Node (Validate resume path)
  ↓
Extract Node (Extract text from PDF/DOCX)
  ↓
Analyze Node (Analyze content, extract skills/experience)
  ↓
Output Node (Prepare analysis results)
  ↓
END
```

### Resume Scorer Workflow
```
START
  ↓
Input Node (Validate inputs)
  ↓
Score Node (Calculate match score 0-100)
  ↓
Output Node (Prepare score results)
  ↓
END
```

## 📊 Output Format

### Analyzer Output
```json
{
  "skills": ["python", "javascript", "react"],
  "experience_years": 3,
  "education": [],
  "certifications": [],
  "summary": "Resume analysis completed"
}
```

### Scorer Output
```json
{
  "overall_score": 75,
  "breakdown": {
    "skills_match": 5,
    "experience_years": 3,
    "skill_score": 35,
    "experience_score": 30,
    "base_score": 30
  },
  "recommendation": "Strong Match"
}
```

## 🛠️ Tools

### `extract_resume_text(file_path: str) -> str`
Nag-e-extract ng text mula sa PDF o DOCX file.

### `analyze_resume_content(resume_text: str, job_description: str) -> str`
Nag-a-analyze ng resume text at nag-e-extract ng structured information.

### `score_resume_match(resume_analysis: str, job_requirements: str, job_description: str) -> str`
Nag-c-calculate ng match score base sa analysis at job requirements.

## 📝 Notes

- Ang AI agents ay automatic na tumatakbo kapag may nag-upload ng resume
- Ang `ai_score` ay na-save sa `applicants` table
- Parehong workflows ay gumagamit ng LangGraph para sa orchestration
- Ang mga tools ay pwede ring gamitin independently



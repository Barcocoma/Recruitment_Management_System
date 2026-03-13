# 🔄 AI Agent Flow Explanation

## Complete Flow ng System

### 1. HR Creates Job Posting
```
HR → Add Job Modal
  ├─ Job Title: "Senior Python Developer"
  ├─ Job Description: "Looking for Python developer..."
  ├─ Required Skills: "Python, Flask, MySQL, AWS, React" ⭐ IMPORTANTE
  └─ Save → Job Created
```

### 2. HR Gets Shareable Link
```
Job ID: abc-123-xyz
Shareable Link: http://localhost:3000/apply/abc-123-xyz
```

### 3. Applicant Clicks Link & Applies
```
Applicant → Opens Link
  ├─ Sees Job Details
  ├─ Fills Application Form:
  │   ├─ Name: "John Doe"
  │   ├─ Email: "john@email.com"
  │   ├─ Phone: "123-456-7890"
  │   └─ Upload Resume: "resume.pdf" ⭐
  └─ Submit Application
```

### 4. Backend Receives Application
```
POST /api/applicants
{
  "name": "John Doe",
  "email": "john@email.com",
  "job_id": "abc-123-xyz",
  "resume_path": "uuid-filename.pdf"
}
```

### 5. AI Analysis Starts (AUTOMATIC)
```
Backend → create_applicant()
  ├─ Get Job Details:
  │   ├─ job_description: "Looking for Python developer..."
  │   └─ job_requirements: "Python, Flask, MySQL, AWS, React"
  │
  ├─ 🤖 Resume Analyzer Agent (Step 1)
  │   ├─ Extract text from PDF/DOCX
  │   ├─ Analyze content:
  │   │   ├─ Find skills: ["python", "flask", "react", "sql"]
  │   │   ├─ Extract experience: 5 years
  │   │   └─ Get education, etc.
  │   └─ Return: analysis_result (JSON)
  │
  └─ 🎯 Resume Scorer Agent (Step 2)
      ├─ Compare analysis vs job requirements:
      │   ├─ Skills Match: 4/5 required skills found
      │   ├─ Experience: 5 years (meets 3+ requirement)
      │   └─ Calculate score
      ├─ Score Calculation:
      │   ├─ Skills: 32/40 points (4/5 skills matched)
      │   ├─ Experience: 30/30 points (5 years)
      │   └─ Base: 30/30 points
      └─ Final Score: 92/100 ✅
```

### 6. Save to Database
```
INSERT INTO applicants
  ├─ name: "John Doe"
  ├─ email: "john@email.com"
  ├─ job_id: "abc-123-xyz"
  ├─ resume_path: "uuid-filename.pdf"
  └─ ai_score: 92 ⭐ (NOT 30!)
```

### 7. HR Sees Results
```
HR → Applicants Tab
  └─ Sees Applicant:
      ├─ Name: "John Doe"
      ├─ Job: "Senior Python Developer"
      └─ AI Score: 92% ✅ (Green badge)
```

## ⚠️ Important Points

### Para Gumana ang AI Analysis:

1. **Job Posting MUST have Required Skills:**
   ```
   Required Skills: "Python, Flask, MySQL, AWS, React"
   ```
   - Dapat may laman ang "Required Skills" field
   - Comma-separated ang format
   - Case-insensitive (pwede lowercase o uppercase)

2. **Resume MUST be uploaded:**
   - PDF o DOCX format lang
   - Dapat may actual content (hindi corrupted)

3. **Job ID MUST be provided:**
   - Automatic naman ito kapag nag-apply via link
   - Pero dapat valid ang job_id

## 🔍 Debugging

### Check kung tumatakbo ang AI:

1. **Check Backend Logs:**
   ```powershell
   docker-compose logs backend -f
   ```

2. **Dapat makita mo:**
   ```
   🔍 DEBUG: Creating applicant
      resume_path: uuid-filename.pdf
      job_id: abc-123-xyz
      job_requirements: Python, Flask, MySQL...
   
   🤖 Starting AI Analysis for resume: uuid-filename.pdf
      Job ID: abc-123-xyz
      Job Requirements: Python, Flask, MySQL...
   
   ✅ Resume file found: /app/uploads/uuid-filename.pdf
   📄 Extract Node: Extracting text from resume...
   ✅ Successfully extracted 1234 characters
   🔍 Analyze Node: Analyzing resume content...
   📊 Analyzer Result: analyzed
      Has analysis_result: True
   🎯 Score Node: Calculating resume match score...
      Skills Match: 4 out of 5 required skills
      Skill Score: 32/40
   ✅ AI Analysis Complete - Score: 92/100
   📝 Final AI Score to save: 92
   ```

### Kung 30% pa rin:

1. **Check kung may Required Skills ang Job:**
   - Dapat may laman ang "Required Skills" field
   - Hindi dapat empty

2. **Check kung naka-upload ang Resume:**
   - Dapat may file na na-upload
   - Dapat PDF o DOCX format

3. **Check Backend Logs:**
   - Tingnan kung may errors
   - Tingnan kung tumatakbo ang AI analysis

4. **Try Re-analyze:**
   - Use the re-analyze endpoint para sa existing applicants

## 📋 Example Job Posting

Para sa best results, ganito dapat ang job posting:

```
Job Title: Senior Python Developer

Job Description:
We are looking for an experienced Python developer to join our team.
You will be responsible for building scalable web applications and RESTful APIs.
The ideal candidate should have strong experience in Python, React, and database management.

Required Skills: Python, Flask, FastAPI, React, MySQL, PostgreSQL, AWS, Docker, JavaScript, SQL

Experience Level: Senior (3+ years)
```

Kapag may nag-apply na may resume na may mga skills na nakalista sa "Required Skills", dapat makakuha ng mataas na score (70-100)!


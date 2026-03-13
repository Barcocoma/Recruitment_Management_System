# Test Resume Guide - AI Resume Analysis

## 📄 Sample Resume Content

I've created a sample resume file at `backend/uploads/sample_resume.txt` that you can use for testing.

## 🧪 How to Test the AI Agents

### Option 1: Convert Text to PDF/DOCX

1. **Using Microsoft Word:**
   - Open `sample_resume.txt` in Word
   - Format it nicely
   - Save as PDF or DOCX
   - Upload via the frontend

2. **Using Online Converter:**
   - Go to https://www.ilovepdf.com/text-to-pdf
   - Upload `sample_resume.txt`
   - Convert to PDF
   - Download and upload

### Option 2: Create Your Own Test Resume

Create a resume with the following content structure:

```
Name: John Doe
Email: john.doe@email.com
Phone: +1 (555) 123-4567

Skills: Python, JavaScript, React, SQL, MySQL, AWS, Docker
Experience: 5 years of software development
Education: Bachelor's in Computer Science
```

## 🎯 Test Scenarios

### Scenario 1: Strong Match Resume
**Job Posting:**
- Title: Senior Python Developer
- Required Skills: Python, Flask, MySQL, AWS, React
- Description: Looking for experienced Python developer with 3+ years experience

**Expected Result:**
- AI Score: 70-90 (Strong Match)
- Skills Match: Python ✓, Flask ✓, MySQL ✓, AWS ✓, React ✓
- Experience: 5 years (meets requirement)

### Scenario 2: Moderate Match Resume
**Job Posting:**
- Title: Frontend Developer
- Required Skills: React, Vue.js, TypeScript, Node.js
- Description: Frontend developer with 2+ years experience

**Expected Result:**
- AI Score: 50-70 (Moderate Match)
- Skills Match: React ✓, Vue.js ✓ (partial match)
- Experience: 5 years (exceeds requirement)

### Scenario 3: Weak Match Resume
**Job Posting:**
- Title: Data Scientist
- Required Skills: R, Machine Learning, TensorFlow, Data Analysis
- Description: Data scientist with ML experience

**Expected Result:**
- AI Score: 30-50 (Weak Match)
- Skills Match: None (different field)
- Experience: 5 years (but wrong field)

## 📋 Sample Job Postings for Testing

### Job 1: Python Backend Developer
```
Title: Senior Python Backend Developer
Department: Engineering
Location: Remote
Type: Full-time
Description: We are looking for an experienced Python developer to join our backend team. 
You will be responsible for building scalable APIs and microservices.

Required Skills: Python, Flask, FastAPI, MySQL, PostgreSQL, RESTful APIs, Docker
Experience Level: 3+ years
```

### Job 2: Full Stack Developer
```
Title: Full Stack Developer
Department: Engineering  
Location: San Francisco, CA
Type: Full-time
Description: Join our team as a full stack developer working on modern web applications.

Required Skills: JavaScript, React, Node.js, Python, SQL, AWS
Experience Level: 2+ years
```

### Job 3: Frontend Developer
```
Title: Frontend Developer
Department: Engineering
Location: Remote
Type: Full-time
Description: We need a skilled frontend developer to build beautiful user interfaces.

Required Skills: React, TypeScript, HTML5, CSS3, Vue.js
Experience Level: 1+ years
```

## 🚀 Testing Steps

1. **Start the Docker containers** (if not running):
   ```bash
   docker-compose up -d
   ```

2. **Access the frontend:**
   - Go to http://localhost:3000
   - Login or register

3. **Create a Job Posting:**
   - Click "Add Job"
   - Fill in job details
   - **Important:** Add required skills in the "Required Skills" field
   - Save

4. **Upload Resume:**
   - Click "Apply" on the job
   - Fill in applicant details
   - Upload the resume file (PDF or DOCX)
   - Submit

5. **Check AI Score:**
   - Go to "Applicants" tab
   - Look for the AI Score column
   - The score should appear automatically (0-100)

## 🔍 What to Look For

After uploading a resume, check:

1. **AI Score Column:**
   - Should show a number between 0-100
   - Green badge if ≥90
   - Yellow badge if <90

2. **Backend Logs:**
   ```bash
   docker-compose logs backend -f
   ```
   You should see:
   - "🚀 Starting Resume Analyzer Workflow"
   - "📄 Extract Node: Extracting text..."
   - "🔍 Analyze Node: Analyzing resume content..."
   - "🎯 Score Node: Calculating resume match score..."
   - "✅ AI Analysis Complete - Score: XX/100"

3. **Database:**
   - Check `applicants` table
   - `ai_score` column should have a value (0-100)

## ⚠️ Troubleshooting

### If AI Score is 0:
- Check if `OPENAI_API_KEY` is set in `.env` file
- Check backend logs for errors
- Verify resume file was uploaded successfully
- Make sure job has `required_skills` filled in

### If Analysis Fails:
- Check if resume file is PDF or DOCX format
- Verify file is not corrupted
- Check backend logs for specific error messages

## 📝 Quick Test Resume (Copy-Paste Ready)

You can copy this and save as a text file, then convert to PDF:

```
JOHN DOE
Software Developer
Email: john.doe@email.com
Phone: +1 (555) 123-4567

SKILLS
Python, JavaScript, React, SQL, MySQL, PostgreSQL, AWS, Docker, Flask, FastAPI

EXPERIENCE
Senior Software Developer | Tech Company | 2021 - Present
- Developed web applications using Python and React
- Built RESTful APIs using Flask
- Worked with MySQL database
- 5 years of experience in software development

EDUCATION
Bachelor of Science in Computer Science | State University | 2018
```

Save this as `test_resume.txt`, convert to PDF, and upload!


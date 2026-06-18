# Recruitment Management System (SprintHR)

A full-stack HR recruitment platform that helps teams post jobs, collect applications, and automatically score applicants using AI.

## What This System Does

This is **not** a Google AI Studio template. The project was originally scaffolded with AI tooling, but it has been built into a complete **Recruitment Management System** with:

- **Job management** — Create, track, and share job postings
- **Applicant tracking** — View applicants, filter by status, and review submissions
- **Shareable apply links** — Applicants apply via `/apply/{job-id}`
- **AI resume analysis** — Automatically extracts skills, experience, and education from resumes
- **AI resume scoring** — Scores each applicant (0–100) against job requirements
- **User profiles & settings** — HR dashboard for managing recruitment workflows

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Python, Flask |
| Database | PostgreSQL |
| AI | OpenAI (resume analyzer & scorer agents) |
| Storage | Cloudflare R2 (optional, for resume files) |
| Deployment | Docker & Docker Compose |

## Project Structure

```
Recruitment_Management_System/
├── frontend/          # React UI (jobs, applicants, auth, settings)
├── backend/           # Flask API, AI agents, PostgreSQL
├── docker-compose.yml # Full stack (postgres + backend + web)
└── Dockerfile         # Frontend production build
```

## Run Locally

### Prerequisites

- Node.js 18+
- Python 3.10+
- PostgreSQL (or use Docker Compose below)
- OpenAI API key (for AI scoring features)

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env — set DB_* values and OPENAI_API_KEY
pip install -r requirements.txt
python app.py
```

Backend runs at **http://localhost:5000**

See [backend/SETUP.md](backend/SETUP.md) for detailed environment variable setup.

### 2. Frontend

```bash
npm install
npm run dev
```

Frontend runs at **http://localhost:3000**

## Run with Docker (Recommended)

**Prerequisites:** Docker and Docker Compose

1. Create `backend/.env` from `backend/.env.example` and add your `OPENAI_API_KEY`.

2. Start all services:

   ```bash
   docker-compose up -d
   ```

3. Open the app:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

4. Stop services:

   ```bash
   docker-compose down
   ```

## How the AI Flow Works

1. HR creates a job with title, description, and required skills
2. HR shares the apply link with candidates
3. Applicant submits the form and uploads a resume
4. Backend runs two AI agents automatically:
   - **Resume Analyzer** — extracts structured data from the resume
   - **Resume Scorer** — compares the resume against job requirements and assigns a score
5. HR views scored applicants in the dashboard

For a detailed walkthrough, see [AI_FLOW_EXPLANATION.md](AI_FLOW_EXPLANATION.md) and [backend/AI_AGENTS_README.md](backend/AI_AGENTS_README.md).

## Additional Documentation

- [backend/SETUP.md](backend/SETUP.md) — Backend and database setup
- [POSTGRESQL_MIGRATION.md](POSTGRESQL_MIGRATION.md) — PostgreSQL migration notes
- [SETUP_OPENAI_KEY.md](SETUP_OPENAI_KEY.md) — OpenAI API key setup
- [TEST_RESUME_GUIDE.md](TEST_RESUME_GUIDE.md) — Testing resume upload and scoring
- [backend/R2_SETUP.md](backend/R2_SETUP.md) — Cloudflare R2 storage setup

## License

This project is for educational and recruitment workflow purposes.

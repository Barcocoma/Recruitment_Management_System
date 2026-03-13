# Setup Guide - Recruitment Management System

## 🔧 Environment Variables Setup

### Step 1: Create .env file

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

### Step 2: Configure Environment Variables

Edit the `.env` file and set the following variables:

#### Database Configuration
```env
DB_HOST=postgres          # Database host (use 'localhost' if running locally)
DB_USER=postgres           # Database username
DB_PASSWORD=postgrespassword  # Database password
DB_NAME=recruitments_db    # Database name
DB_PORT=5432               # PostgreSQL port
```

#### OpenAI API Key (Required for AI Features)
```env
OPENAI_API_KEY=your_openai_api_key_here
```

**How to get OpenAI API Key:**
1. Go to https://platform.openai.com/api-keys
2. Sign up or log in
3. Click "Create new secret key"
4. Copy the key and paste it in your `.env` file

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Setup Database

The database tables will be automatically created when you start the backend application. No manual setup needed!

If using Docker, PostgreSQL will be automatically started and tables will be created on first run.

### Step 5: Run the Application

```bash
python app.py
```

The backend will run on `http://localhost:5000`

## 📋 Environment Variables Summary

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DB_HOST` | PostgreSQL database host | No | `postgres` |
| `DB_USER` | PostgreSQL database username | No | `postgres` |
| `DB_PASSWORD` | PostgreSQL database password | No | `postgrespassword` |
| `DB_NAME` | PostgreSQL database name | No | `recruitments_db` |
| `DB_PORT` | PostgreSQL database port | No | `5432` |
| `OPENAI_API_KEY` | OpenAI API key for AI features | **Yes** | None |

## ⚠️ Important Notes

1. **Never commit `.env` file to git** - It contains sensitive information
2. The `.env.example` file is safe to commit as it doesn't contain real credentials
3. Make sure your OpenAI API key has credits/balance for the AI features to work
4. For local development, change `DB_HOST` to `localhost` if PostgreSQL is running locally

## 🐳 Docker Setup

If using Docker, environment variables can also be set in `docker-compose.yml`:

```yaml
environment:
  - DB_HOST=postgres
  - DB_USER=postgres
  - DB_PASSWORD=postgrespassword
  - DB_NAME=recruitments_db
  - DB_PORT=5432
  - OPENAI_API_KEY=${OPENAI_API_KEY}
```

Then run:
```bash
docker-compose up
```



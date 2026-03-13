# 🔑 Paano i-Set ang OPENAI_API_KEY

## Problem: Lahat ng AI Score ay 30%
Ang 30% ay **base score lang** - hindi tumatakbo ang AI analysis dahil walang OpenAI API key.

## ✅ Solution: Set ang OPENAI_API_KEY

### Step 1: Gumawa ng `.env` file

1. **Gumawa ng file** na `.env` sa root folder:
   ```
   C:\Users\Acer\Downloads\recruitments\.env
   ```

2. **I-copy ang content na ito** sa `.env` file:
   ```env
   OPENAI_API_KEY=sk-your-actual-openai-api-key-here
   ```

3. **Palitan ang** `sk-your-actual-openai-api-key-here` ng actual OpenAI API key mo.

### Step 2: Get OpenAI API Key

1. Pumunta sa: https://platform.openai.com/api-keys
2. Sign up o Login
3. Click **"Create new secret key"**
4. Copy ang key (magsisimula sa `sk-...`)
5. I-paste sa `.env` file

### Step 3: Restart Docker Containers

```powershell
cd C:\Users\Acer\Downloads\recruitments
docker-compose down
docker-compose up -d
```

### Step 4: Verify

Check kung naka-set na:
```powershell
docker-compose exec backend env | Select-String "OPENAI"
```

Dapat makita mo:
```
OPENAI_API_KEY=sk-...
```

## 🧪 Test After Setup

1. Upload ng bagong resume
2. Check ang backend logs:
   ```powershell
   docker-compose logs backend -f
   ```
3. Dapat makita mo:
   - "🤖 Starting AI Analysis"
   - "✅ AI Analysis Complete - Score: XX/100"
   - Hindi na 30% ang score!

## ⚠️ Important Notes

- **Huwag i-commit ang `.env` file** sa git (may sensitive info)
- Ang `.env` file ay dapat nasa **root folder** (`recruitments/`)
- After mag-set ng key, **kailangan i-restart** ang containers
- Ang OpenAI API ay may **cost** - check mo ang pricing

## 🔍 Troubleshooting

### Kung hindi pa rin gumagana:

1. **Check kung naka-set ang key:**
   ```powershell
   docker-compose exec backend printenv OPENAI_API_KEY
   ```

2. **Check backend logs:**
   ```powershell
   docker-compose logs backend --tail=50
   ```

3. **Verify ang `.env` file:**
   - Dapat nasa `C:\Users\Acer\Downloads\recruitments\.env`
   - Dapat may content: `OPENAI_API_KEY=sk-...`
   - Walang spaces sa paligid ng `=`

4. **Check kung may credits ang OpenAI account:**
   - Pumunta sa: https://platform.openai.com/usage
   - Dapat may available credits

## 📝 Example `.env` file:

```env
OPENAI_API_KEY=sk-proj-abc123xyz789...
DB_HOST=postgres
DB_USER=postgres
DB_PASSWORD=postgrespassword
DB_NAME=recruitments_db
DB_PORT=5432
```

**Note:** Ang `OPENAI_API_KEY` lang ang required para sa AI features. Ang iba ay optional kung naka-set na sa docker-compose.yml.


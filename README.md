<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/d4a7122c-8de3-4bd1-96fd-8bb91474943c

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Run with Docker

**Prerequisites:** Docker and Docker Compose

### Using Docker Compose (Recommended)

1. Build and run the container:
   ```bash
   docker-compose up -d
   ```
   
2. Access the app at: http://localhost:3000

3. Stop the container:
   ```bash
   docker-compose down
   ```

### Using Docker directly

1. Build the Docker image:
   ```bash
   docker build -t recruitments-app .
   ```

2. Run the container:
   ```bash
   docker run -d -p 3000:80 --name recruitments-app recruitments-app
   ```

3. Access the app at: http://localhost:3000

4. Stop the container:
   ```bash
   docker stop recruitments-app
   docker rm recruitments-app
   ```

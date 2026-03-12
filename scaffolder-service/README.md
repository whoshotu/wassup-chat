Scaffolder Service
Open-source standalone microservice for scaffolding + translation + vibe-check

How to run locally:
- Install dependencies: cd scaffolder-service && npm ci
- Start LibreTranslate with Docker Compose: docker-compose up libretranslate -d
- Start scaffolder: node src/index.js
- Or use docker-compose: docker-compose up scaffolder libretranslate

API
- POST /generate-project
- POST /translate
- GET /health
- GET /status

Env
- LIBRETRANSLATE_URL: URL of translation service (default http://localhost:5000)

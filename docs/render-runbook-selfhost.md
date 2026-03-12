Render Free Runbook — Self-hosted LibreTranslate + Scaffolder (no cost)

Overview
- Three services on Render Free: scaffolder-service (API), wassup-frontend (Static Site), and a self-hosted LibreTranslate instance (host on your infra).
- The frontend calls the scaffolder API; scaffolder uses LibreTranslate for translations and returns a multi-language scaffold path if needed (disabled by default).

Prerequisites
- Render account and login
- Node 18+ locally for building Docker images (optional)
- A host to self-host LibreTranslate (could be a VM in your cloud/Pi or local). Docker installed on host

1) Prepare the services in your repo
- Ensure render.yaml exists (it does in this repo) and points to:
  - scaffolder-service (Dockerfile in scaffolder-service)
  - wassup-frontend (Dockerfile)
  - libretranslate (Docker image; you will host it yourself, not on Render)
- Ensure Scaffolder Service can reach LibreTranslate via LIBRETRANSLATE_URL env var (set to http://<libretranslate-host>:5000)
- Set TENANCY_ENABLED to true in Render environment if you want tenancy hooks on, BULK_LANG_GEN to false (disabled by default)

2) Self-host LibreTranslate (local example)
- On your own host, install Docker and run:
  docker run -d --name libretranslate -p 5000:5000 libretranslate/libretranslate:latest
- Verify: curl -X POST http://host:5000/translate -d '{"q":"Hello","source":"en","target":"es"}'
- If you want TLS, put LibreTranslate behind a reverse proxy with TLS or expose only internal network

3) Deploy on Render (Free plan)
- Push push to Render (three services) or connect to your repo that houses render.yaml
- For Scaffolder Service: set LIBRETRANSLATE_URL to your LibreTranslate host URL (http://<libretranslate-host>:5000)
- For Frontend: set VITE_SCAFFOLDER_URL to your Scaffolder service URL
- Optional: set SCAFFOLDER_API_KEY for secured API calls
- Verify: Health endpoint and a sample generate-project payload

4) Validation and rollout
- Run a local test: curl POST to /generate-project with sample text and Spanish target
- Validate the translated scaffold is produced and translated content is sane
- Keep Bulk OFF until you’re ready to canary

5) Maintenance
- Rotate API keys periodically
- Monitor usage on Render Free; upgrade to paid tier later if needed
- When ready, you can enable the bulk path behind a feature-flag canary

Notes
- This runbook assumes self-host LibreTranslate; if you prefer a hosted translation, you can switch to a public API but it will incur cost.
- If you want multi-tenant isolation from day one, the X-Tenant-Id header is supported; you can pass it from the UI now.

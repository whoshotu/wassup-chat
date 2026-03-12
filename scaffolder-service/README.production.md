Scaffolder Service - Production Readiness Guide

- Runbook for deployment on Kubernetes or equivalent.
- Endpoint: POST /generate-project, POST /translate, GET /metrics, GET /health, GET /status
- Security: Use API key (SCAFFOLDER_API_KEY) and TLS via Ingress.
- Observability: Prometheus metrics exposed on /metrics; Prometheus scrapes at /metrics.
- Scaling: Run at least 2 replicas; autoscale as needed.
 - Translation: LibreTranslate self-hosted; ensure proper TLS when calling.
- Self-host translation: If you want to run LibreTranslate on your own host, see steps below:
  - Local docker-compose (for development):
    1) Install Docker.
    2) From repo root, run: `docker-compose up --build`.
    3) LibreTranslate will be available at http://localhost:5000 (host 5000), scaffolder at http://localhost:4000.
  1) Install Docker on a host (Linux/macOS/Windows).
  2) Run: `docker run -d --name libretranslate -p 5000:5000 libretranslate/libretranslate:latest`
  3) Verify: `curl -s -X POST http://<host>:5000/translate -d '{"q":"Hello","source":"en","target":"es","format":"text"}'`
  4) In the Scaffolder Service environment, set LIBRETRANSLATE_URL to the host URL, e.g. http://<host>:5000
  5) Ensure the host is reachable from Render (open inbound ports if behind a firewall)
- Caching: translation results cached in memory; consider Redis for distributed cache in production.

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import client from 'prom-client';
import generateProject, { detectLanguageFromText } from './lib/generator.js';
import translate from './lib/translate.js';

const app = express();
const SCAFFOLDER_API_KEY = process.env.SCAFFOLDER_API_KEY;
function requireApiKey(req, res, next) {
  if (!SCAFFOLDER_API_KEY) return next();
  const key = req.headers['x-api-key'];
  if (key && key === SCAFFOLDER_API_KEY) return next();
  res.status(401).json({ success: false, error: 'Unauthorized' });
}
const port = process.env.PORT || 4000;

// Production-ready middleware
app.use(helmet());
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: 'Too many requests, try again later.' });
app.use(limiter);
app.use(cors());
client.collectDefaultMetrics();
const requests = new client.Counter({ name: 'scaffolder_requests_total', help: 'Total scaffolder requests' });
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});
app.use(bodyParser.json({ limit: '1mb' }));

// API key guard already defined above; this block removed to avoid duplicates

app.post('/generate-project', requireApiKey, async (req, res) => {
  requests.inc({ route: '/generate-project' });
  try {
    const input = req.body || {};
    const tenantId = (req.headers['x-tenant-id'] || req.headers['X-Tenant-Id'] || '');
    const result = await generateProject(input, tenantId);
    res.json({ success: true, data: result });
  } catch (e) {
    res.status(500).json({ success: false, error: e?.message ?? 'generation failed' });
  }
});

app.post('/translate', requireApiKey, async (req, res) => {
  requests.inc({ route: '/translate' });
  const { text, from = 'auto', to = 'en' } = req.body || {};
  try {
    const translated = await translate(text ?? '', from, to);
    res.json({ success: true, translatedText: translated });
  } catch (err) {
    res.status(500).json({ success: false, error: err?.message ?? 'translation failed' });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/status', (req, res) => res.json({ status: 'scaffolder-service', version: '0.1.0' }));

app.listen(port, () => {
  console.log(`Scaffolder service listening on port ${port}`);
});

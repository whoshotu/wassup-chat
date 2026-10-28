/**
 * Wassup license worker.
 * Routes: POST /kofi-webhook, POST /activate, POST /verify, GET /health.
 */

import {
  handleActivate,
  handleKoFiWebhook,
  handleVerify,
  json,
  preflight,
} from './handlers.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') return preflight();

    if (url.pathname === '/health') {
      return json({ ok: true, service: 'wassup-license' });
    }

    if (request.method !== 'POST') {
      return json({ ok: false, error: 'method_not_allowed' }, 405);
    }

    switch (url.pathname) {
      case '/kofi-webhook':
        return handleKoFiWebhook(request, env);
      case '/activate':
        return handleActivate(request, env);
      case '/verify':
        return handleVerify(request, env);
      default:
        return json({ ok: false, error: 'not_found' }, 404);
    }
  },
};

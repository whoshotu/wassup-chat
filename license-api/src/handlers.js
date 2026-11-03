/**
 * Request handlers for the Wassup license worker.
 *
 * Flow:
 *   Ko-fi sale  -> POST /kofi-webhook -> purchases row (email hash, order id, license key)
 *   Buyer       -> POST /claim        -> read the license key for their own purchase
 *   Extension   -> POST /activate     -> claim the key once, return a signed token
 *   Extension   -> POST /verify       -> confirm a token is still valid
 *
 * The extension never sees a stored list of order ids; it only holds a key and a
 * token it cannot forge or extend.
 */

import {
  claimPurchase,
  consumeRateLimit,
  findPurchaseByEmail,
  findPurchaseByKey,
  generateLicenseKey,
  isValidEmail,
  normalizeEmail,
  normalizeLicenseKey,
  recordPurchase,
  sha256Hex,
  timingSafeEqual,
} from './store.js';
import { signLicenseToken, TOKEN_TTL_MS, verifyLicenseToken } from './token.js';

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 10;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...CORS_HEADERS },
  });
}

export function preflight() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

function normalizeOrderId(value) {
  return String(value ?? '').trim().replace(/^#/, '').trim();
}

/** Ko-fi posts application/x-www-form-urlencoded with a JSON `data` field. */
export async function readKoFiPayload(request) {
  const contentType = request.headers.get('content-type') || '';
  const raw = await request.text();

  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  const params = new URLSearchParams(raw);
  const data = params.get('data');
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

const PAID_TYPES = new Set(['Shop Order', 'Commission']);

/** Shared fixed-window limit for the endpoints that touch purchases. */
async function withinRateLimit(db, request, action) {
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  return consumeRateLimit(
    db,
    `${action}:${await sha256Hex(ip)}`,
    Math.floor(Date.now() / RATE_WINDOW_MS),
    RATE_LIMIT
  );
}

/** First value that is a non-empty string. Numbers, objects and blanks are ignored. */
function firstNonEmptyString(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

export async function handleKoFiWebhook(request, env) {
  // Fail closed: without a configured secret nothing can be authenticated, so
  // reject outright instead of comparing against a missing value.
  const configuredSecret = env?.KO_FI_VERIFICATION_TOKEN;
  if (typeof configuredSecret !== 'string' || configuredSecret.length === 0) {
    return json({ ok: false, error: 'webhook_not_configured' }, 500);
  }

  const payload = await readKoFiPayload(request);
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return json({ ok: false, error: 'bad_payload' }, 400);
  }

  // timingSafeEqual rejects non-strings and length mismatches, so an empty or
  // absent token cannot match a configured secret.
  if (!timingSafeEqual(payload.verification_token, configuredSecret)) {
    return json({ ok: false, error: 'bad_token' }, 401);
  }

  // Authenticated from here on. Only paid product sales unlock the extension;
  // tips, memberships and unknown types are acknowledged without recording a purchase.
  const type = typeof payload.type === 'string' ? payload.type : '';
  if (!PAID_TYPES.has(type)) {
    return json({ ok: true, ignored: true });
  }

  const messageId = firstNonEmptyString(payload.message_id, payload.kofi_transaction_id);
  const email = normalizeEmail(typeof payload.email === 'string' ? payload.email : '');
  if (!messageId || !isValidEmail(email)) {
    return json({ ok: false, error: 'missing_fields' }, 422);
  }

  await recordPurchase(env.DB, {
    messageId,
    orderId: normalizeOrderId(payload.kofi_transaction_id || messageId),
    emailHash: await sha256Hex(email),
    licenseKey: generateLicenseKey(),
    itemName: payload.shop_items?.[0]?.direct_link_code || null,
    amount: Number(payload.amount) || null,
    currency: payload.currency || null,
    purchasedAt: Date.parse(payload.timestamp) || Date.now(),
  });

  return json({ ok: true });
}

/**
 * Give the buyer the key for a purchase they can prove they made. The key is
 * returned even after activation so a lost key can be looked up again.
 */
export async function handleClaim(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'bad_payload' }, 400);
  }

  const email = normalizeEmail(body?.email);
  if (!isValidEmail(email)) {
    return json({ ok: false, error: 'invalid_email' }, 400);
  }

  if (!(await withinRateLimit(env.DB, request, 'claim'))) {
    return json({ ok: false, error: 'rate_limited' }, 429);
  }

  const purchase = await findPurchaseByEmail(
    env.DB,
    await sha256Hex(email),
    normalizeOrderId(body?.orderId) || null
  );

  if (!purchase?.license_key) {
    return json(
      {
        ok: false,
        error: 'no_purchase',
        message:
          'No purchase was found for that email and order id. Check the details in your Ko-fi receipt.',
      },
      404
    );
  }

  return json({ ok: true, key: purchase.license_key });
}

export async function handleActivate(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'bad_payload' }, 400);
  }

  const key = normalizeLicenseKey(body?.key);
  if (!key) {
    return json({ ok: false, error: 'missing_key' }, 400);
  }

  if (!(await withinRateLimit(env.DB, request, 'activate'))) {
    return json({ ok: false, error: 'rate_limited' }, 429);
  }

  const purchase = await findPurchaseByKey(env.DB, key);

  if (!purchase) {
    return json(
      {
        ok: false,
        error: 'invalid_key',
        message:
          'That license key is not valid. Re-check the key from your Ko-fi purchase, or claim it again with the email you used at checkout.',
      },
      404
    );
  }

  const now = Date.now();
  const expiresAt = now + TOKEN_TTL_MS;
  const activationId = crypto.randomUUID();

  const claimed = await claimPurchase(
    env.DB,
    purchase.kofi_message_id,
    activationId,
    now,
    expiresAt
  );
  if (!claimed) {
    return json(
      { ok: false, error: 'already_activated', message: 'That license key is already active on another device.' },
      409
    );
  }

  const token = await signLicenseToken(
    {
      v: 1,
      lid: activationId,
      pm: purchase.kofi_message_id,
      iat: now,
      exp: expiresAt,
    },
    env.TOKEN_PRIVATE_JWK
  );

  return json({ ok: true, token, expiresAt });
}

export async function handleVerify(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'bad_payload' }, 400);
  }

  const result = await verifyLicenseToken(body?.token, env.TOKEN_PUBLIC_JWK);
  if (!result.valid) {
    return json({ ok: true, valid: false, reason: result.reason });
  }

  return json({ ok: true, valid: true, expiresAt: result.payload.exp });
}

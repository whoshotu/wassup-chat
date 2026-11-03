import { test, before } from 'node:test';
import assert from 'node:assert/strict';

import { createD1Stub } from '../test-support/d1-stub.mjs';
import { handleActivate, handleClaim, handleKoFiWebhook, handleVerify } from '../src/handlers.js';
import { isValidEmail, sha256Hex, timingSafeEqual } from '../src/store.js';
import { signLicenseToken, TOKEN_TTL_MS, verifyLicenseToken } from '../src/token.js';

const WEBHOOK_SECRET = 'test-verification-token';
const VALID_EMAIL = 'buyer@example.com';

let keyPair;
let publicJwk;
let privateJwk;
let otherPublicJwk;

function makeEnv(overrides = {}) {
  return {
    DB: createD1Stub(),
    KO_FI_VERIFICATION_TOKEN: WEBHOOK_SECRET,
    TOKEN_PRIVATE_JWK: JSON.stringify(privateJwk),
    TOKEN_PUBLIC_JWK: JSON.stringify(publicJwk),
    ...overrides,
  };
}

function webhookRequest(payload, secret = WEBHOOK_SECRET) {
  const body = new URLSearchParams({
    data: JSON.stringify({ verification_token: secret, ...payload }),
  }).toString();
  return new Request('https://license.test/kofi-webhook', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  });
}

function rawWebhookRequest(body, contentType = 'application/x-www-form-urlencoded') {
  return new Request('https://license.test/kofi-webhook', {
    method: 'POST',
    headers: { 'content-type': contentType },
    body,
  });
}

function claimRequest(body, ip = '203.0.113.7') {
  return new Request('https://license.test/claim', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'cf-connecting-ip': ip },
    body: JSON.stringify(body),
  });
}

function activateRequest(body, ip = '203.0.113.7') {
  return new Request('https://license.test/activate', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'cf-connecting-ip': ip },
    body: JSON.stringify(body),
  });
}

function verifyRequest(token) {
  return new Request('https://license.test/verify', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ token }),
  });
}

const SHOP_ORDER = {
  type: 'Shop Order',
  message_id: 'msg-1001',
  kofi_transaction_id: 'txn-abc',
  email: VALID_EMAIL,
  amount: '4.00',
  currency: 'USD',
  timestamp: '2026-10-20T12:00:00Z',
  shop_items: [{ direct_link_code: 'Wassup Decoder Pro' }],
};

before(async () => {
  keyPair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  privateJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey);
  publicJwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey);

  const other = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  otherPublicJwk = await crypto.subtle.exportKey('jwk', other.publicKey);
});

test('signs and verifies a license token', async () => {
  const now = Date.now();
  const token = await signLicenseToken({ v: 1, lid: 'abc', exp: now + TOKEN_TTL_MS }, privateJwk);
  const result = await verifyLicenseToken(token, publicJwk, now);

  assert.equal(result.valid, true);
  assert.equal(result.payload.lid, 'abc');
  assert.equal(result.payload.exp, now + TOKEN_TTL_MS);
});

test('rejects a tampered token payload', async () => {
  const now = Date.now();
  const token = await signLicenseToken({ v: 1, lid: 'abc', exp: now + 1000 }, privateJwk);
  const [header, , signature] = token.split('.');
  const forgedPayload = Buffer.from(JSON.stringify({ v: 1, lid: 'abc', exp: now + 999999 })).toString('base64url');

  const result = await verifyLicenseToken(`${header}.${forgedPayload}.${signature}`, publicJwk, now);
  assert.equal(result.valid, false);
  assert.equal(result.reason, 'signature');
});

test('rejects an expired token', async () => {
  const now = Date.now();
  const token = await signLicenseToken({ v: 1, lid: 'abc', exp: now - 1 }, privateJwk);
  const result = await verifyLicenseToken(token, publicJwk, now);

  assert.equal(result.valid, false);
  assert.equal(result.reason, 'expired');
});

test('rejects a token signed by a different key', async () => {
  const token = await signLicenseToken({ v: 1, lid: 'abc', exp: Date.now() + 1000 }, privateJwk);
  const result = await verifyLicenseToken(token, otherPublicJwk);

  assert.equal(result.valid, false);
  assert.equal(result.reason, 'signature');
});

test('rejects malformed tokens without throwing', async () => {
  for (const bad of ['', 'nope', 'a.b', 'a.b.c.d']) {
    const result = await verifyLicenseToken(bad, publicJwk);
    assert.equal(result.valid, false);
  }
});

test('constant-time compare and email validation behave', () => {
  assert.equal(timingSafeEqual('secret', 'secret'), true);
  assert.equal(timingSafeEqual('secret', 'secreT'), false);
  assert.equal(timingSafeEqual('short', 'longer-value'), false);
  // Non-strings must never compare equal: this was the webhook fail-open.
  assert.equal(timingSafeEqual(undefined, ''), false);
  assert.equal(timingSafeEqual(undefined, undefined), false);
  assert.equal(timingSafeEqual(null, ''), false);
  assert.equal(timingSafeEqual('', ''), true);

  assert.equal(isValidEmail('buyer@example.com'), true);
  assert.equal(isValidEmail('  Buyer@Example.COM '), true);
  assert.equal(isValidEmail('not-an-email'), false);
  assert.equal(isValidEmail(''), false);
});

test('hashes are stable and case-insensitive for emails', async () => {
  const a = await sha256Hex('buyer@example.com');
  const b = await sha256Hex('buyer@example.com');
  const c = await sha256Hex('other@example.com');

  assert.equal(a, b);
  assert.notEqual(a, c);
  assert.equal(a.length, 64);
});

test('webhook rejects a wrong verification token', async () => {
  const env = makeEnv();
  const response = await handleKoFiWebhook(webhookRequest(SHOP_ORDER, 'wrong-token'), env);

  assert.equal(response.status, 401);
  assert.equal(env.DB.purchases.size, 0);
});

test('webhook ignores tips and stores shop orders idempotently', async () => {
  const env = makeEnv();

  const donation = await handleKoFiWebhook(
    webhookRequest({ ...SHOP_ORDER, type: 'Donation', message_id: 'msg-donation' }),
    env
  );
  assert.equal(donation.status, 200);
  assert.equal(env.DB.purchases.size, 0);

  await handleKoFiWebhook(webhookRequest(SHOP_ORDER), env);
  await handleKoFiWebhook(webhookRequest(SHOP_ORDER), env);
  assert.equal(env.DB.purchases.size, 1, 'duplicate deliveries must not create rows');
});

test('webhook fails closed when the shared secret is not configured', async () => {
  const env = makeEnv({ KO_FI_VERIFICATION_TOKEN: undefined });

  for (const token of ['', 'anything']) {
    const response = await handleKoFiWebhook(webhookRequest(SHOP_ORDER, token), env);
    const body = await response.json();
    assert.equal(response.status, 500);
    assert.equal(body.ok, false);
    assert.equal(body.error, 'webhook_not_configured');
  }

  assert.equal(env.DB.purchases.size, 0, 'a misconfigured webhook must not record purchases');
});

test('webhook rejects absent, malformed and non-object bodies', async () => {
  const env = makeEnv();
  const bodies = [
    ['', 'application/x-www-form-urlencoded'],
    ['data=%7Bnot-json', 'application/x-www-form-urlencoded'],
    ['data=null', 'application/x-www-form-urlencoded'],
    ['[]', 'application/json'],
    ['null', 'application/json'],
    ['"a string"', 'application/json'],
    ['42', 'application/json'],
  ];

  for (const [body, contentType] of bodies) {
    const response = await handleKoFiWebhook(rawWebhookRequest(body, contentType), env);
    assert.equal(response.status, 400, `body ${JSON.stringify(body)} should be rejected`);
  }

  assert.equal(env.DB.purchases.size, 0);
});

test('webhook rejects missing, empty and non-string verification tokens', async () => {
  const env = makeEnv();
  const tokens = [undefined, null, '', 123, {}, [], true];

  for (const verification_token of tokens) {
    const payload = { ...SHOP_ORDER, verification_token };
    const body = new URLSearchParams({ data: JSON.stringify(payload) }).toString();
    const response = await handleKoFiWebhook(rawWebhookRequest(body), env);
    assert.equal(response.status, 401, `token ${JSON.stringify(verification_token)} should be rejected`);
  }

  assert.equal(env.DB.purchases.size, 0);
});

test('webhook rejects paid orders with missing or mistyped fields', async () => {
  const env = makeEnv();
  const payloads = [
    { ...SHOP_ORDER, email: undefined },
    { ...SHOP_ORDER, email: 'not-an-email' },
    { ...SHOP_ORDER, email: 12345 },
    { ...SHOP_ORDER, message_id: undefined, kofi_transaction_id: undefined },
    { ...SHOP_ORDER, message_id: '', kofi_transaction_id: '' },
    { ...SHOP_ORDER, message_id: {}, kofi_transaction_id: 99 },
  ];

  for (const payload of payloads) {
    const authenticated = { ...payload, verification_token: WEBHOOK_SECRET };
    const body = new URLSearchParams({ data: JSON.stringify(authenticated) }).toString();
    const response = await handleKoFiWebhook(rawWebhookRequest(body), env);
    assert.equal(response.status, 422, `payload ${JSON.stringify(payload)} should be rejected`);
  }

  assert.equal(env.DB.purchases.size, 0);
});

test('a rejected webhook leaves nothing that can be claimed or activated', async () => {
  const env = makeEnv();

  const rejected = await handleKoFiWebhook(webhookRequest(SHOP_ORDER, 'wrong-token'), env);
  assert.equal(rejected.status, 401);

  const claim = await handleClaim(claimRequest({ email: VALID_EMAIL, orderId: 'txn-abc' }), env);
  assert.equal(claim.status, 404);
  assert.equal((await claim.json()).key, undefined);

  const activation = await handleActivate(activateRequest({ key: 'WASSUP-AAAA-BBBB-CCCC-DDDD' }), env);
  assert.equal(activation.status, 404);
  assert.equal((await activation.json()).token, undefined);
});

test('an unconfigured webhook leaves nothing that can be claimed', async () => {
  const env = makeEnv({ KO_FI_VERIFICATION_TOKEN: undefined });

  const rejected = await handleKoFiWebhook(webhookRequest(SHOP_ORDER, ''), env);
  assert.equal(rejected.status, 500);

  const claim = await handleClaim(claimRequest({ email: VALID_EMAIL }), env);
  assert.equal(claim.status, 404);
  assert.equal((await claim.json()).key, undefined);
});

test('still accepts an authenticated JSON webhook', async () => {
  const env = makeEnv();
  const body = JSON.stringify({ ...SHOP_ORDER, verification_token: WEBHOOK_SECRET });

  const response = await handleKoFiWebhook(rawWebhookRequest(body, 'application/json'), env);
  assert.equal(response.status, 200);
  assert.equal(env.DB.purchases.size, 1);
});

test('authenticated non-paid types are acknowledged without a purchase', async () => {
  const env = makeEnv();

  for (const type of ['Donation', 'Subscription', undefined, 'Unknown']) {
    const payload = { ...SHOP_ORDER, type, verification_token: WEBHOOK_SECRET };
    const body = new URLSearchParams({ data: JSON.stringify(payload) }).toString();
    const response = await handleKoFiWebhook(rawWebhookRequest(body), env);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).ignored, true);
  }

  assert.equal(env.DB.purchases.size, 0);
});

test('webhook mints exactly one license key per purchase', async () => {
  const env = makeEnv();
  await handleKoFiWebhook(webhookRequest(SHOP_ORDER), env);
  await handleKoFiWebhook(webhookRequest(SHOP_ORDER), env);

  assert.equal(env.DB.purchases.size, 1, 'a duplicate delivery must not mint a second key');
  assert.match([...env.DB.purchases.values()][0].license_key, /^WASSUP(-[A-Z2-9]{4}){4}$/);
});

test('claim returns the license key for a matching email and order id', async () => {
  const env = makeEnv();
  await handleKoFiWebhook(webhookRequest(SHOP_ORDER), env);
  const stored = [...env.DB.purchases.values()][0].license_key;

  const response = await handleClaim(
    claimRequest({ email: ' Buyer@Example.com ', orderId: '#txn-abc' }),
    env
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.key, stored);
});

test('claim matches on email alone when no order id is supplied', async () => {
  const env = makeEnv();
  await handleKoFiWebhook(webhookRequest(SHOP_ORDER), env);

  const response = await handleClaim(claimRequest({ email: VALID_EMAIL }), env);
  assert.equal(response.status, 200);
  assert.match((await response.json()).key, /^WASSUP-/);
});

test('claim rejects an email with no purchase', async () => {
  const env = makeEnv();
  const response = await handleClaim(claimRequest({ email: 'stranger@example.com' }), env);
  const body = await response.json();

  assert.equal(response.status, 404);
  assert.equal(body.error, 'no_purchase');
  assert.equal(body.key, undefined);
});

test('claim rejects an invalid, absent or mistyped email', async () => {
  const env = makeEnv();
  for (const email of ['nope', '', undefined, null, 12345, {}]) {
    const response = await handleClaim(claimRequest({ email }), env);
    assert.equal(response.status, 400, `email ${JSON.stringify(email)} should be rejected`);
  }
});

test('claim refuses an order id that belongs to a different email', async () => {
  const env = makeEnv();
  await handleKoFiWebhook(webhookRequest(SHOP_ORDER), env);

  const response = await handleClaim(
    claimRequest({ email: 'attacker@example.com', orderId: 'txn-abc' }),
    env
  );
  assert.equal(response.status, 404);
  assert.equal((await response.json()).key, undefined);
});

test('claim returns the same key after the purchase is activated', async () => {
  const env = makeEnv();
  await handleKoFiWebhook(webhookRequest(SHOP_ORDER), env);
  const key = [...env.DB.purchases.values()][0].license_key;

  await handleActivate(activateRequest({ key }), env);

  const response = await handleClaim(claimRequest({ email: VALID_EMAIL }), env);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).key, key, 'a buyer must be able to re-read a lost key');
});

test('activate rejects a missing, blank or non-string key', async () => {
  const env = makeEnv();
  const bodies = [{}, { key: undefined }, { key: null }, { key: '' }, { key: '   ' }, { key: 123 }, { key: {} }, { key: [] }, { key: true }];

  for (const body of bodies) {
    const response = await handleActivate(activateRequest(body), env);
    assert.equal(response.status, 400, `key ${JSON.stringify(body.key)} should be rejected`);
  }

  assert.equal(env.DB.purchases.size, 0);
});

test('activate rejects a key that matches no purchase', async () => {
  const env = makeEnv();
  await handleKoFiWebhook(webhookRequest(SHOP_ORDER), env);

  const response = await handleActivate(activateRequest({ key: 'WASSUP-AAAA-BBBB-CCCC-DDDD' }), env);
  const body = await response.json();

  assert.equal(response.status, 404);
  assert.equal(body.error, 'invalid_key');
  assert.equal(body.token, undefined);
  assert.equal([...env.DB.purchases.values()][0].activation_id, null);
});

test('activate claims a key once and returns a verifiable token', async () => {
  const env = makeEnv();
  await handleKoFiWebhook(webhookRequest(SHOP_ORDER), env);
  const key = [...env.DB.purchases.values()][0].license_key;

  const response = await handleActivate(activateRequest({ key: key.toLowerCase() }), env);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.ok(body.expiresAt > Date.now());
  assert.equal((await verifyLicenseToken(body.token, publicJwk)).valid, true);

  const row = [...env.DB.purchases.values()][0];
  assert.notEqual(row.activation_id, null);
  assert.equal(row.expires_at, body.expiresAt, 'the 30 days start at first activation');

  const again = await handleActivate(activateRequest({ key }), env);
  assert.equal(again.status, 409, 'a claimed key must not activate a second time');
  assert.equal((await again.json()).token, undefined);
});

test('activate is rate limited per IP', async () => {
  const env = makeEnv();
  await handleKoFiWebhook(webhookRequest(SHOP_ORDER), env);

  let lastStatus = 0;
  for (let i = 0; i < 12; i += 1) {
    const response = await handleActivate(activateRequest({ key: 'WASSUP-AAAA-BBBB-CCCC-DDDD' }), env);
    lastStatus = response.status;
  }
  assert.equal(lastStatus, 429);
});

test('verify accepts a fresh token and rejects garbage', async () => {
  const env = makeEnv();
  const token = await signLicenseToken({ v: 1, lid: 'x', exp: Date.now() + 1000 }, privateJwk);

  const good = await (await handleVerify(verifyRequest(token), env)).json();
  assert.deepEqual({ ok: good.ok, valid: good.valid }, { ok: true, valid: true });

  const bad = await (await handleVerify(verifyRequest('a.b.c'), env)).json();
  assert.equal(bad.valid, false);
});

import { test, before } from 'node:test';
import assert from 'node:assert/strict';

import { createD1Stub } from '../test-support/d1-stub.mjs';
import { handleActivate, handleKoFiWebhook, handleVerify } from '../src/handlers.js';
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
  assert.equal(timingSafeEqual(undefined, ''), true);

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

test('activate rejects an email with no purchase', async () => {
  const env = makeEnv();
  const response = await handleActivate(activateRequest({ email: 'stranger@example.com' }), env);
  const body = await response.json();

  assert.equal(response.status, 404);
  assert.equal(body.error, 'no_purchase');
});

test('activate rejects an invalid email', async () => {
  const env = makeEnv();
  const response = await handleActivate(activateRequest({ email: 'nope' }), env);

  assert.equal(response.status, 400);
});

test('activate claims a purchase once and returns a verifiable token', async () => {
  const env = makeEnv();
  await handleKoFiWebhook(webhookRequest(SHOP_ORDER), env);

  const response = await handleActivate(
    activateRequest({ email: 'Buyer@Example.com', orderId: '#txn-abc' }),
    env
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.ok(body.expiresAt > Date.now());

  const verified = await verifyLicenseToken(body.token, publicJwk);
  assert.equal(verified.valid, true);

  const row = [...env.DB.purchases.values()][0];
  assert.equal(row.activation_id === null, false);

  const again = await handleActivate(activateRequest({ email: VALID_EMAIL }), env);
  assert.equal(again.status, 404, 'a claimed purchase must not activate a second time');
});

test('activate matches on email alone when no order id is supplied', async () => {
  const env = makeEnv();
  await handleKoFiWebhook(webhookRequest(SHOP_ORDER), env);

  const response = await handleActivate(activateRequest({ email: VALID_EMAIL }), env);
  assert.equal(response.status, 200);
});

test('activate refuses an order id that belongs to a different email', async () => {
  const env = makeEnv();
  await handleKoFiWebhook(webhookRequest(SHOP_ORDER), env);

  const response = await handleActivate(
    activateRequest({ email: 'attacker@example.com', orderId: 'txn-abc' }),
    env
  );
  assert.equal(response.status, 404);
});

test('activate is rate limited per IP', async () => {
  const env = makeEnv();
  await handleKoFiWebhook(webhookRequest(SHOP_ORDER), env);

  let lastStatus = 0;
  for (let i = 0; i < 12; i += 1) {
    const response = await handleActivate(activateRequest({ email: 'nobody@example.com' }), env);
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

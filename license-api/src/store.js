/**
 * Storage helpers for the license worker (D1).
 */

const encoder = new TextEncoder();

export async function sha256Hex(value) {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

/**
 * Constant-time string compare so the shared secret cannot be probed by timing.
 * Anything that is not a string is a mismatch: coercing null/undefined to ''
 * would make a missing secret or token compare equal to an empty value.
 */
export function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const left = encoder.encode(a);
  const right = encoder.encode(b);
  let diff = left.length ^ right.length;
  const length = Math.max(left.length, right.length);
  for (let i = 0; i < length; i += 1) {
    diff |= (left[i] ?? 0) ^ (right[i] ?? 0);
  }
  return diff === 0;
}

/** Store a purchase from a Ko-fi webhook. Duplicate deliveries are ignored. */
export async function recordPurchase(db, purchase) {
  await db
    .prepare(
      `INSERT INTO purchases (kofi_message_id, order_id, email_hash, item_name, amount, currency, purchased_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(kofi_message_id) DO NOTHING`
    )
    .bind(
      purchase.messageId,
      purchase.orderId,
      purchase.emailHash,
      purchase.itemName ?? null,
      purchase.amount ?? null,
      purchase.currency ?? null,
      purchase.purchasedAt
    )
    .run();
}

/**
 * Find a purchase that this email (and optional order id) bought and that has not
 * been activated yet.
 */
export async function findActivatablePurchase(db, emailHash, orderId) {
  if (orderId) {
    return db
      .prepare(
        `SELECT * FROM purchases
         WHERE email_hash = ? AND activation_id IS NULL
           AND (order_id = ? OR kofi_message_id = ?)
         ORDER BY purchased_at ASC
         LIMIT 1`
      )
      .bind(emailHash, orderId, orderId)
      .first();
  }

  return db
    .prepare(
      `SELECT * FROM purchases
       WHERE email_hash = ? AND activation_id IS NULL
       ORDER BY purchased_at ASC
       LIMIT 1`
    )
    .bind(emailHash)
    .first();
}

/**
 * Claim a purchase for one activation. Conditional on activation_id still being
 * NULL so two concurrent activations cannot both win.
 * Returns true when this call performed the activation.
 */
export async function claimPurchase(db, messageId, activationId, activatedAt, expiresAt) {
  const result = await db
    .prepare(
      `UPDATE purchases
       SET activation_id = ?, activated_at = ?, expires_at = ?
       WHERE kofi_message_id = ? AND activation_id IS NULL`
    )
    .bind(activationId, activatedAt, expiresAt, messageId)
    .run();
  return (result?.meta?.changes ?? 0) > 0;
}

/** Fixed-window rate limit. Returns true when the caller is still under the limit. */
export async function consumeRateLimit(db, bucketKey, windowStart, limit) {
  await db
    .prepare(
      `INSERT INTO rate_limits (bucket_key, window_start, hits) VALUES (?, ?, 1)
       ON CONFLICT(bucket_key, window_start) DO UPDATE SET hits = hits + 1`
    )
    .bind(bucketKey, windowStart)
    .run();

  const row = await db
    .prepare('SELECT hits FROM rate_limits WHERE bucket_key = ? AND window_start = ?')
    .bind(bucketKey, windowStart)
    .first();

  return (row?.hits ?? limit + 1) <= limit;
}

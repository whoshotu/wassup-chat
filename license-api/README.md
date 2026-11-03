# Wassup license API

A single Cloudflare Worker that verifies Ko-fi purchases and issues signed 30-day
license tokens to the Pro extension.

Runs on the Workers Free plan (100,000 requests/day, D1 included, no credit card,
commercial use permitted), so verification costs nothing at this product's volume.

## Why this exists

The extension previously accepted any non-empty string as a Ko-fi order id and
stored the expiry itself, so unlocking Pro required no purchase. Now:

1. Ko-fi calls `POST /kofi-webhook` when a shop order is paid. The worker verifies
   the shared `verification_token`, stores a SHA-256 hash of the buyer's email and the
   order id, and mints a license key for that purchase. Tips and memberships are
   ignored.
2. The buyer opens `/claim` on the site and enters the email and order id from their
   Ko-fi receipt. `POST /claim` returns the license key for that purchase, and the
   same key can be read again if it is lost.
3. The popup calls `POST /activate` with that key. The worker finds the unused
   purchase, claims it, and returns an ES256-signed token expiring 30 days later, so
   the pass starts at first activation rather than at checkout.
4. The extension verifies that token offline with an embedded public key. Editing
   `chrome.storage` cannot extend the expiry, and a key can be activated once.

No email service is involved. If a verified sending domain is added later, the key
can be delivered by email as a convenience; the claim page is the deliverable that
has to work.

What this does not do: stop someone from unpacking and patching the extension
bundle itself. That is unavoidable for locally installed code and is out of scope.

## Setup

```bash
cd license-api

# 1. Create the database and paste its id into wrangler.toml
npx wrangler d1 create wassup-license

# 2. Create the tables (remote, after the id is set)
npm run schema:remote

# 3. Generate the signing keypair. Keep the private key out of git.
npm run keys
npx wrangler secret put TOKEN_PRIVATE_JWK          # paste the private JWK
npx wrangler secret put TOKEN_PUBLIC_JWK           # paste the public JWK
npx wrangler secret put KO_FI_VERIFICATION_TOKEN   # a long random string

# 4. Deploy
npm run deploy
```

Then in the extension:

- set `LICENSE_API_URL` in `wassup-extension/src/lib/license.ts` to the deployed
  `https://<worker>.workers.dev` URL;
- paste the printed public key into `LICENSE_PUBLIC_JWK` in the same file;
- rebuild, reload the extension, and activate once.

And in the web app:

- set `VITE_LICENSE_API_URL` to the same Worker URL so `/claim` can look up keys;
- redeploy the site after the change.

Finally, in Ko-fi: Settings -> API -> Webhooks, set the URL to
`https://<worker>.workers.dev/kofi-webhook` and copy the verification token into
the `KO_FI_VERIFICATION_TOKEN` secret.

## Routes

| Route | Method | Purpose |
| --- | --- | --- |
| `/kofi-webhook` | POST | Receive payment notifications (form-encoded `data` JSON) |
| `/claim` | POST | `{ orderId?, email }` -> `{ ok, key }` |
| `/activate` | POST | `{ key }` -> `{ ok, token, expiresAt }` |
| `/verify` | POST | `{ token }` -> `{ ok, valid, expiresAt? }` |
| `/health` | GET | Liveness check |

`/claim` and `/activate` are each rate limited to 10 attempts per IP per 10 minutes.
The signing key is ES256 (P-256); the private half exists only as a Worker secret.
Keys look like `WASSUP-XXXX-XXXX-XXXX-XXXX` and activation accepts them in any case.

## Webhook rejections

Every failure is explicit and none of them records a purchase:

| Condition | Status | Body |
| --- | --- | --- |
| `KO_FI_VERIFICATION_TOKEN` is unset or empty | 500 | `webhook_not_configured` |
| Body absent, malformed, or not a JSON object | 400 | `bad_payload` |
| Verification token missing, non-string, or wrong | 401 | `bad_token` |
| Paid order missing a message/transaction id or a valid email | 422 | `missing_fields` |

A correct token from a non-paid type (tip, membership, unknown) is acknowledged
with `{ ok: true, ignored: true }` and no purchase is stored.

## Tests

```bash
npm test
```

Covers token signing/verification (tampering, expiry, wrong key, malformed input),
webhook authentication and every rejection path (unset secret, absent or malformed
bodies, non-string tokens, missing order fields, and proof that a rejected webhook
cannot be claimed or activated), key minting and idempotency, claim lookup by email
or order id, refusal of a foreign email or order id, activation of a missing,
unknown or already-used key, activation tracking, and rate limiting, using an
in-memory D1 stand-in from `test-support/`.

## Purchases recorded before the license-key change

Rows created by the older order-id flow have `license_key = NULL`, so `/claim`
returns `no_purchase` for them. Backfill those rows once after deploying:

```sql
-- Any unguessable per-row key works; the extension only compares strings.
UPDATE purchases SET license_key = 'WASSUP-' || upper(hex(randomblob(8)))
WHERE license_key IS NULL;
```

## Redeploying after a schema change

```bash
npm run schema:remote && npm run deploy
```

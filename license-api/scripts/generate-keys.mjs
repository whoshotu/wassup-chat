#!/usr/bin/env node
/**
 * Generates the ES256 keypair used to sign license tokens.
 *
 * Run this once, then store the private key as a Worker secret and paste the
 * public key into the extension (wassup-extension/src/lib/license.ts).
 *
 * The public key is not a secret: it can only verify tokens. Never commit the
 * private key.
 */

const keyPair = await crypto.subtle.generateKey(
  { name: 'ECDSA', namedCurve: 'P-256' },
  true,
  ['sign', 'verify']
);

const privateJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey);
const publicJwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey);

const publicVerifyJwk = { kty: publicJwk.kty, crv: publicJwk.crv, x: publicJwk.x, y: publicJwk.y };

console.log('--- private key (Worker secret, never commit) ---\n');
console.log(JSON.stringify(privateJwk));
console.log('\nStore it with:\n');
console.log(`  npx wrangler secret put TOKEN_PRIVATE_JWK`);
console.log('\n--- public key (safe to embed in the extension) ---\n');
console.log(JSON.stringify(publicVerifyJwk, null, 2));
console.log('\nPaste the public key into LICENSE_PUBLIC_JWK in');
console.log('wassup-extension/src/lib/license.ts, and set LICENSE_API_URL to your');
console.log('deployed worker URL.\n');

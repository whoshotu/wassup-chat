/**
 * License tokens: compact JWT-style strings signed with ECDSA P-256 (ES256).
 *
 * The private key lives only in the Worker secret store. The matching public JWK
 * is embedded in the extension, so the extension can verify a token offline and
 * cannot mint one or extend its expiry.
 */

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export function base64UrlEncode(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function base64UrlDecode(value) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function encodeJson(value) {
  return base64UrlEncode(encoder.encode(JSON.stringify(value)));
}

const ECDSA_KEY_ALGORITHM = { name: 'ECDSA', namedCurve: 'P-256' };
const ECDSA_SIGN_ALGORITHM = { name: 'ECDSA', hash: 'SHA-256' };

/** Accepts either a JWK object or the JSON string form stored in secrets. */
export function parseJwk(value) {
  if (!value) return null;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  return value;
}

export async function signLicenseToken(payload, privateJwk) {
  const jwk = parseJwk(privateJwk);
  if (!jwk) throw new Error('Missing signing key');
  const key = await crypto.subtle.importKey('jwk', jwk, ECDSA_KEY_ALGORITHM, false, ['sign']);
  const signingInput = `${encodeJson({ alg: 'ES256', typ: 'JWT' })}.${encodeJson(payload)}`;
  const signature = await crypto.subtle.sign(
    ECDSA_SIGN_ALGORITHM,
    key,
    encoder.encode(signingInput)
  );
  return `${signingInput}.${base64UrlEncode(new Uint8Array(signature))}`;
}

/**
 * Returns { valid, reason?, payload? }. Never throws for malformed input.
 */
export async function verifyLicenseToken(token, publicJwk, now = Date.now()) {
  const jwk = parseJwk(publicJwk);
  if (!jwk) return { valid: false, reason: 'server_key_missing' };
  if (typeof token !== 'string') return { valid: false, reason: 'malformed' };

  const parts = token.split('.');
  if (parts.length !== 3) return { valid: false, reason: 'malformed' };

  const [header, payload, signature] = parts;

  try {
    const key = await crypto.subtle.importKey('jwk', jwk, ECDSA_KEY_ALGORITHM, false, ['verify']);
    const verified = await crypto.subtle.verify(
      ECDSA_SIGN_ALGORITHM,
      key,
      base64UrlDecode(signature),
      encoder.encode(`${header}.${payload}`)
    );
    if (!verified) return { valid: false, reason: 'signature' };
  } catch {
    return { valid: false, reason: 'signature' };
  }

  let claims;
  try {
    claims = JSON.parse(decoder.decode(base64UrlDecode(payload)));
  } catch {
    return { valid: false, reason: 'malformed' };
  }

  if (typeof claims.exp !== 'number' || !Number.isFinite(claims.exp)) {
    return { valid: false, reason: 'malformed' };
  }
  if (claims.exp <= now) return { valid: false, reason: 'expired', payload: claims };

  return { valid: true, payload: claims };
}

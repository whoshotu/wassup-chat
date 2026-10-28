-- Wassup license worker schema (Cloudflare D1).
-- Apply with: npx wrangler d1 execute wassup-license --remote --file=./schema.sql

CREATE TABLE IF NOT EXISTS purchases (
  kofi_message_id TEXT PRIMARY KEY,
  order_id TEXT,
  email_hash TEXT NOT NULL,
  item_name TEXT,
  amount REAL,
  currency TEXT,
  purchased_at INTEGER NOT NULL,
  activation_id TEXT,
  activated_at INTEGER,
  expires_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_purchases_email ON purchases (email_hash);

-- Fixed-window counters for abuse control on /activate.
CREATE TABLE IF NOT EXISTS rate_limits (
  bucket_key TEXT NOT NULL,
  window_start INTEGER NOT NULL,
  hits INTEGER NOT NULL,
  PRIMARY KEY (bucket_key, window_start)
);

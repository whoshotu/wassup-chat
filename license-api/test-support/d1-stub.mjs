/**
 * Minimal in-memory stand-in for a D1 binding, covering exactly the statements
 * the license handlers issue. Not a SQL engine; it pattern-matches the queries.
 */

export function createD1Stub() {
  const purchases = new Map();
  const limits = new Map();

  return {
    purchases,
    limits,
    prepare(sql) {
      const statement = sql.replace(/\s+/g, ' ').trim();

      return {
        bind(...args) {
          return {
            async run() {
              if (statement.startsWith('INSERT INTO purchases')) {
                const [messageId, orderId, emailHash, itemName, amount, currency, purchasedAt] = args;
                const existed = purchases.has(messageId);
                if (!existed) {
                  purchases.set(messageId, {
                    kofi_message_id: messageId,
                    order_id: orderId,
                    email_hash: emailHash,
                    item_name: itemName,
                    amount,
                    currency,
                    purchased_at: purchasedAt,
                    activation_id: null,
                    activated_at: null,
                    expires_at: null,
                  });
                }
                return { meta: { changes: existed ? 0 : 1 } };
              }

              if (statement.startsWith('UPDATE purchases')) {
                const [activationId, activatedAt, expiresAt, messageId] = args;
                const row = purchases.get(messageId);
                if (!row || row.activation_id) return { meta: { changes: 0 } };
                Object.assign(row, {
                  activation_id: activationId,
                  activated_at: activatedAt,
                  expires_at: expiresAt,
                });
                return { meta: { changes: 1 } };
              }

              if (statement.startsWith('INSERT INTO rate_limits')) {
                const key = `${args[0]}:${args[1]}`;
                limits.set(key, (limits.get(key) ?? 0) + 1);
                return { meta: { changes: 1 } };
              }

              throw new Error(`d1-stub: unsupported run statement: ${statement}`);
            },

            async first() {
              if (statement.startsWith('SELECT * FROM purchases')) {
                const [emailHash, first, second] = args;
                const candidates = [...purchases.values()]
                  .filter((row) => row.email_hash === emailHash && !row.activation_id)
                  .filter((row) => (args.length === 3 ? row.order_id === first || row.kofi_message_id === second : true))
                  .sort((a, b) => a.purchased_at - b.purchased_at);
                return candidates[0] ?? null;
              }

              if (statement.startsWith('SELECT hits FROM rate_limits')) {
                const key = `${args[0]}:${args[1]}`;
                return limits.has(key) ? { hits: limits.get(key) } : null;
              }

              throw new Error(`d1-stub: unsupported first statement: ${statement}`);
            },
          };
        },
      };
    },
  };
}

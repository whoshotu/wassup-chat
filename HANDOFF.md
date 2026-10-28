# Wassup Decoder - Handoff Report

**Date:** October 28, 2026
**Branch:** `fix/project-review-defects`

---

## 1. What changed in this session

The project review found a set of defects; this branch fixes them. No Learning Brain
features were added (see section 5 for what is still open).

- **AI path works again.** The web app pinned `gemini-1.5-flash`, which Google shut
  down on 2025-09-29, so every enhanced decode silently 404'd and fell back. Both
  builds now use `src/lib/models.ts`: `gemini-3.5-flash-lite` by default and
  `gemini-3.8-flash` as the fallback, retried automatically when one is unavailable.
- **AI failures are visible.** `DecodeResult.aiError` is set when a key is supplied
  but the AI path cannot run (rate limit, rejected key, missing model). The decoder
  page shows an amber notice and the extension popup shows the same status instead
  of looking like AI was never enabled.
- **Personal Dictionary actually applies.** `decodeMessage` takes an optional
  dictionary, replaces entries (longest first, unicode word boundaries) before
  detection, translation, and AI analysis, and reports `dictionaryNote`. The web app
  gained a Settings card stored in `wassup_custom_dict`; the extension's existing
  dictionary UI now feeds `background.ts` and the AI prompt instead of going nowhere.
- **One shared library.** `src/lib` is canonical. `scripts/sync-extension-lib.mjs`
  generates the extension's copies, wired into its `predev`/`prebuild`. The drifted
  extension copy and its duplicate `geminiModels.ts` are gone.
- **Extension dependency declared.** It imported `@google/generative-ai` without
  listing it and only typechecked by resolving through the root `node_modules`.
- **Types consolidated.** `DecodeResult` and friends live in `src/lib/types.ts`;
  `src/types/index.ts` re-exports them. The three hand-maintained copies are gone.
- **Builds fail on type errors.** Root `build` is now `tsc --noEmit && vite build`;
  both packages gained a `typecheck` script. The stray `extensionerror.txt` bundle
  was deleted.
- **Licensing is server-verified.** `license-api/` is a Cloudflare Worker + D1 that
  receives Ko-fi webhooks and issues ES256-signed 30-day tokens. The extension
  verifies them locally, so editing `chrome.storage` no longer grants access. The
  hardcoded developer hash and the "any string works" activation are removed.
- **Extension archived.** `extension-baseline/` holds a frozen snapshot of the
  pre-fix extension source. See section 4.

---

## 2. Current architecture

| Piece | Location | Notes |
| --- | --- | --- |
| Web app | `src/` + root config | React 18, Vite 7, Tailwind, shadcn/ui, PWA. Static deploy (`render.yaml`). |
| Shared logic | `src/lib/` | decoder, gemini, models, rate limit, idiom helper, types. Canonical. |
| Extension | `wassup-extension/` (gitignored) | MV3 + crxjs. Local only; see section 4. |
| License API | `license-api/` | Cloudflare Worker, D1, `node --test` suite. |
| Frozen snapshot | `extension-baseline/` | Pre-fix extension source, not built. |

Decode flow: `decodeMessage(text, targetLang, geminiKey?, customDict?)` applies the
dictionary, tries Gemini when a key exists and the rate limit allows, otherwise runs
the free path (language detection, idiom disambiguation, MyMemory translation, tone
and vibe heuristics, template replies). Safety scanning runs on the original and the
translation, independent of which path produced it.

All user state is client-side. The web app uses `wassup_history`,
`wassup_preferred_lang`, `wassup_custom_dict`, `wassup-theme`,
`wassup_gemini_api_key`, `wassup_gemini_usage`. The extension uses
`chrome.storage.local` (`wassupLicenseToken`, `wassupLicenseCheckedAt`,
`wassupTargetLanguage`, `wassupUniversalToggle`, `wassupCustomDict`,
`wassupGeminiKey`, `wassupGeminiModel`, `wassupDeepAI`, `wassupAiVerified`,
`wassupReplyLang`, `wassupLastAiError`).

---

## 3. How to work on it

```bash
npm install            # web app
npm run dev            # web app dev server
npm run typecheck      # tsc --noEmit
npm run sync:lib       # regenerate wassup-extension/src/lib from src/lib
npm run build          # typecheck + production build

cd wassup-extension
npm install            # its own deps, including @google/generative-ai
npm run build          # syncs the shared lib first, then tsc + vite
zip -r wassup-extension.zip dist/
```

Edit `src/lib` only; the extension copies are generated and carry a banner. Running
the sync twice must produce no diff (it is idempotent).

---

## 4. The extension is intentionally not tracked

`wassup-extension/` stays in `.gitignore` so the paid extension is not published from
this public repository. `extension-baseline/` is the only tracked copy: a frozen,
pre-fix snapshot that nothing builds.

Consequences to keep in mind:

- Fixes made inside `wassup-extension/` on this branch are local only. The extension
  work in this session (license client, dictionary wiring, AI error reporting,
  dependency declaration, generated lib) exists on the maintainer's machine.
- `wassup-extension/dist.pem` is the CRX signing key. It is gitignored and excluded
  from the baseline. Never commit it; rotate it if it ever leaks.
- If real history is wanted later, give the extension its own private remote.

---

## 5. What is still open

1. **Deploy the license API before shipping.** The code is complete and tested, but
   activation returns "the license server is not configured in this build" until
   `LICENSE_API_URL` and `LICENSE_PUBLIC_JWK` are set in
   `wassup-extension/src/lib/license.ts` and the Worker is deployed with its secrets
   (`license-api/README.md` has the exact steps, including the Ko-fi webhook URL).
2. **Existing Pro users must re-activate once.** Old `wassupProKey` / `activationTime`
   values are ignored by design. Consider mentioning it in the renewal message.
3. **Learning Brain is still unstarted** apart from the dictionary, which is now live.
   Remaining items from `LEARNING_BRAIN_PLAN.md`: context memory (last ~15 messages),
   the feedback loop plus `feedbackService.ts`, and the suggested-reply / non-English
   translation prompt overhaul.
4. **Auth remains a mock.** `AuthPage.tsx` just navigates after a timeout; there is
   no backend, no accounts, and history is per-device.
5. **Ko-fi only notifies on payment.** Refunds and chargebacks are not observed, so a
   refunded pass stays valid until it expires.
6. **The free decoder is still best-effort.** MyMemory has no SLA and the fallback
   dictionary is tiny; the safety scanner is regex-based and only aims at illegal
   content, not general moderation.

---

## 6. Verification performed

- `npx tsc --noEmit` in the root and in `wassup-extension/`.
- `npm run build` in the root; the extension build with its sync prebuild.
- `node scripts/sync-extension-lib.mjs` run twice, no diff on the second run.
- `cd license-api && npm test` - 16 tests covering token signing/verification
  (tampering, expiry, wrong key, malformed), webhook authentication and idempotency,
  activation claiming, order-id ownership, and rate limiting.
- Manual web-app smoke test of a decode with and without a Personal Dictionary entry.

---

## 7. Style rules to keep

- No em dashes or `---` separators in user-facing copy or generated text.
- Keep API keys out of anything but local storage; the Gemini key is user-supplied.
- New copy should stay casual and short, matching the existing UI voice.

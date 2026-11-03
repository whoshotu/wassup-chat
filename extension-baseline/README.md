# Extension baseline (frozen)

This folder is a read-only snapshot of the `wassup-extension/` source as it existed on
2026-10-28, before the project-review fixes.

It exists so the Pro extension has an archived copy in version control. It is **not**
part of the build:

- Nothing imports from this folder.
- `npm install` and `npm run build` are never run here.
- Do not edit these files; changes made here will not reach the shipping extension.

## Why it is here and not `wassup-extension/`

`wassup-extension/` is intentionally gitignored so the working copy of the paid
extension is not published to this public repository. Only this pre-fix snapshot is
tracked. The current (fixed) extension lives in `wassup-extension/` on the maintainer's
machine.

## Restoring a working copy from this snapshot

```bash
cp -R extension-baseline/src extension-baseline/public \
      extension-baseline/manifest.json extension-baseline/package.json \
      extension-baseline/package-lock.json extension-baseline/index.html \
      extension-baseline/tsconfig.json extension-baseline/vite.config.ts \
      extension-baseline/postcss.config.js \
      wassup-extension/
cd wassup-extension && npm install && npm run build
```

Files deliberately excluded from the snapshot: `node_modules/`, `dist/`, `*.zip`,
`*.crx`, and `dist.pem` (the CRX signing key, which must never be committed).

#!/usr/bin/env node
/**
 * Copies the canonical shared library from src/lib into the extension workspace.
 *
 * src/lib is the single source of truth. wassup-extension/src/lib holds generated
 * copies so the extension keeps its own build and its own gitignored workspace.
 * Run from anywhere; the script resolves paths from its own location.
 *
 * Idempotent: files are only rewritten when their content changes.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const sourceLib = join(repoRoot, 'src', 'lib');
const targetLib = join(repoRoot, 'wassup-extension', 'src', 'lib');

const SHARED_LIB_FILES = [
  'decoder.ts',
  'gemini.ts',
  'geminiRateLimit.ts',
  'idiomHelper.ts',
  'models.ts',
  'types.ts',
];

const SHARED_DATA_FILES = [{ from: join(repoRoot, 'src', 'data', 'idioms.json'), to: join(repoRoot, 'wassup-extension', 'src', 'data', 'idioms.json') }];

const BANNER =
  '// GENERATED FILE - do not edit.\n' +
  '// Source: src/lib/%NAME%\n' +
  '// Regenerate with: npm run sync:lib (repo root)\n\n';

async function writeIfChanged(target, contents, label) {
  let existing = null;
  try {
    existing = await readFile(target, 'utf8');
  } catch {
    existing = null;
  }
  if (existing === contents) return false;
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, contents, 'utf8');
  console.log(`  updated ${label}`);
  return true;
}

async function main() {
  let changed = 0;

  for (const file of SHARED_LIB_FILES) {
    const source = await readFile(join(sourceLib, file), 'utf8');
    const banner = BANNER.replace('%NAME%', file);
    const target = join(targetLib, file);
    if (await writeIfChanged(target, banner + source, `src/lib/${file}`)) changed += 1;
  }

  for (const { from, to } of SHARED_DATA_FILES) {
    const source = await readFile(from, 'utf8');
    const label = `src/data/${from.split(/[\\/]/).pop()}`;
    if (await writeIfChanged(to, source, label)) changed += 1;
  }

  console.log(
    changed === 0
      ? 'Shared lib already in sync.'
      : `Shared lib synced (${changed} file${changed === 1 ? '' : 's'}).`
  );
}

main().catch((error) => {
  console.error('Failed to sync the shared lib:', error);
  process.exitCode = 1;
});

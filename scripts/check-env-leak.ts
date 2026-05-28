/**
 * scripts/check-env-leak.ts — DEPLOY-03 / D-08 NEXT_PUBLIC_* leak gate (Phase 7).
 *
 * Next.js inlines any `NEXT_PUBLIC_*` env var into the CLIENT bundle at build
 * time, so a secret accidentally given that prefix would ship to every visitor.
 * This project's ONLY sanctioned client-exposed var is `NEXT_PUBLIC_SITE_URL`
 * (a public origin by design — read in lib/constants.ts → SITE_URL).
 *
 * The gate scans the TRACKED source tree (via `git ls-files`, so untracked /
 * .gitignored files like .env*.local are out of scope) for `NEXT_PUBLIC_*`
 * identifiers and FAILS if:
 *   - any identifier OTHER than NEXT_PUBLIC_SITE_URL appears, OR
 *   - a NEXT_PUBLIC_* line ALSO matches a secret heuristic (the words
 *     secret/token/key/password/api[_-]?key, or a long opaque >=32-char
 *     token literal on the same line).
 *
 * The gate excludes itself (this file names NEXT_PUBLIC_* in prose/regex) and
 * sibling check scripts that legitimately reference the allowed var name.
 *
 * Mirrors scripts/check-i18n-parity.ts's exit-0 contract: console.error +
 * process.exit(1) on any violation, console.log + exit 0 when clean.
 *
 * Run: `npm run check:env-leak` (tsx scripts/check-env-leak.ts).
 */
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const ALLOWED = 'NEXT_PUBLIC_SITE_URL';
const NEXT_PUBLIC_RE = /NEXT_PUBLIC_[A-Z0-9_]+/g;
const SECRET_RE = /(secret|token|password|api[_-]?key|\bkey\b)/i;
const LONG_TOKEN_RE = /['"`][A-Za-z0-9_\-]{32,}['"`]/;

// Gate scripts mention NEXT_PUBLIC_* in prose/regex by design — skip them so
// the scanner does not flag its own documentation.
const SELF_SKIP = new Set([
  'scripts/check-env-leak.ts',
  'scripts/check-analytics.ts',
]);

// Only scan tracked code/config files (matches the "tracked tree" requirement);
// .md docs + assets are excluded by the glob.
const tracked = execSync(`git ls-files "*.ts" "*.tsx" "*.js" "*.mjs" "*.cjs" "*.json"`, {
  encoding: 'utf8',
})
  .split('\n')
  .map((f) => f.trim())
  .filter(Boolean)
  .filter((f) => !SELF_SKIP.has(f));

const failures: string[] = [];

for (const file of tracked) {
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    const matches = line.match(NEXT_PUBLIC_RE);
    if (!matches) return;
    const lineNo = i + 1;
    for (const ident of matches) {
      if (ident !== ALLOWED) {
        failures.push(`${file}:${lineNo} — unexpected client-exposed var "${ident}" (only ${ALLOWED} is allowed)`);
      }
    }
    // Even the allowed var must never sit on a line that looks secret-bearing.
    if (SECRET_RE.test(line) || LONG_TOKEN_RE.test(line)) {
      failures.push(`${file}:${lineNo} — NEXT_PUBLIC_* line matches a secret heuristic: ${line.trim()}`);
    }
  });
}

if (failures.length) {
  console.error('check-env-leak FAILED.');
  failures.forEach((f) => console.error(`  ❌ ${f}`));
  process.exit(1);
}
console.log(`check-env-leak OK — only ${ALLOWED} exposed (public origin).`);

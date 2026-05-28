/**
 * scripts/check-analytics.ts — DEPLOY-03 static analytics-mount gate (Phase 7 D-08).
 *
 * Asserts that app/[locale]/layout.tsx wires Vercel Web Analytics + Speed
 * Insights the canonical Next 16 App Router way:
 *   1. imports BOTH from the `/next` entry point (NOT `/react` — `/react`
 *      silently drops App Router route tracking, Pitfall 1);
 *   2. renders BOTH <Analytics /> + <SpeedInsights /> components;
 *   3. the layout stays a Server Component — it must NOT carry a top-level
 *      'use client' directive (Pitfall 3 — that would break setRequestLocale /
 *      getMessages / generateMetadata). The `/next` components carry their own
 *      internal client boundary, so no directive is needed here.
 *
 * Mirrors scripts/check-i18n-parity.ts's exit-0 contract: console.error +
 * process.exit(1) on any violation, console.log + exit 0 when clean.
 *
 * Run: `npm run check:analytics` (tsx scripts/check-analytics.ts).
 */
import { readFileSync } from 'node:fs';

const LAYOUT = 'app/[locale]/layout.tsx';
const src = readFileSync(LAYOUT, 'utf8');

const failures: string[] = [];

// (1) + (2): the four required markers — both /next imports + both components.
const markers = [
  '@vercel/analytics/next',
  '@vercel/speed-insights/next',
  '<Analytics',
  '<SpeedInsights',
];
for (const m of markers) {
  if (!src.includes(m)) failures.push(`missing required marker: ${m}`);
}

// (3): the layout must NOT be a Client Component. Find the first line that is
// not blank and not a comment (/* … */ block or // line) — if that first
// "real" line is a use-client directive, fail. This is the canonical position
// a 'use client' pragma would occupy (it is only valid at the top of a module).
const firstReal = src
  .split('\n')
  .map((l) => l.trim())
  .find((l) => l !== '' && !l.startsWith('//') && !l.startsWith('/*') && !l.startsWith('*'));
if (firstReal === "'use client';" || firstReal === '"use client";' || firstReal === "'use client'" || firstReal === '"use client"') {
  failures.push("layout has a top-level 'use client' directive — it must stay a Server Component");
}

if (failures.length) {
  console.error(`check-analytics FAILED (${LAYOUT}).`);
  failures.forEach((f) => console.error(`  ❌ ${f}`));
  process.exit(1);
}
console.log(
  'check-analytics OK — both /next imports + both components mounted; layout stays a Server Component.',
);

/**
 * scripts/check-mdx-structure.ts — Phase 5 CONTENT-01 gate.
 *
 * Reads every content/projects/*.{fr,en}.mdx file (SKIPPING files starting with
 * '_', mirroring the D-24 filter in lib/projects.ts), parses each with gray-matter
 * to separate frontmatter from body, and asserts:
 *   - FR bodies contain the 4 H2 markers: ## Contexte, ## Défi, ## Processus, ## Résultat
 *   - EN bodies contain the 4 H2 markers: ## Context, ## Challenge, ## Process, ## Outcome
 *   - Body word count (split on whitespace) is within 250-400 inclusive
 *
 * Collects ALL failures, prints each, and exits 1 if any failed; else prints the
 * count of OK files and exits 0. Standalone tsx-runnable Node script (no Vitest).
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';

const CONTENT_ROOT = join(process.cwd(), 'content', 'projects');

const FR_MARKERS = ['## Contexte', '## Défi', '## Processus', '## Résultat'] as const;
const EN_MARKERS = ['## Context', '## Challenge', '## Process', '## Outcome'] as const;

const MIN_WORDS = 250;
// Most case studies sit ~300 words; tool-suite write-ups that detail many
// sub-components (e.g. HRS.tab's pyRevit plugins) legitimately run longer.
const MAX_WORDS = 700;

type Locale = 'fr' | 'en';

function localeOf(filename: string): Locale | null {
  if (filename.endsWith('.fr.mdx')) return 'fr';
  if (filename.endsWith('.en.mdx')) return 'en';
  return null;
}

const files = readdirSync(CONTENT_ROOT).filter((f) => {
  if (f.startsWith('_')) return false; // D-24 — skip templates
  return localeOf(f) !== null;
});

const failures: string[] = [];
let okCount = 0;

for (const filename of files) {
  const locale = localeOf(filename) as Locale;
  const raw = readFileSync(join(CONTENT_ROOT, filename), 'utf8');
  const { content: body } = matter(raw);

  const markers = locale === 'fr' ? FR_MARKERS : EN_MARKERS;
  const missing = markers.filter((m) => !body.includes(m));

  const words = body.split(/\s+/).filter(Boolean).length;

  const fileFailures: string[] = [];
  if (missing.length > 0) {
    fileFailures.push(`missing H2 section(s): ${missing.join(', ')}`);
  }
  if (words < MIN_WORDS || words > MAX_WORDS) {
    fileFailures.push(`word count ${words} out of range ${MIN_WORDS}-${MAX_WORDS}`);
  }

  if (fileFailures.length > 0) {
    failures.push(`❌ ${filename}: ${fileFailures.join('; ')}`);
  } else {
    okCount += 1;
  }
}

if (failures.length > 0) {
  console.error('MDX structure check FAILED.');
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}

console.log(`✅ ${okCount} files OK (4 H2 sections + ${MIN_WORDS}-${MAX_WORDS} words each).`);

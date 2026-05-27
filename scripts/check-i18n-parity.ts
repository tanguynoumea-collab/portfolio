/**
 * scripts/check-i18n-parity.ts — Phase 1 D-15 parity gate, extended for Phase 4.
 *
 * Reads messages/fr.json and messages/en.json, flattens both to sorted
 * leaf-key paths, and exits non-zero if the sets differ. Run during CI / before
 * commit. Phase 4 adds about.paragraphs.{1,2}, skills.groups.{tech,design,bim}.{label,items}, hero.scrollCue.
 *
 * Arrays count as a single leaf — represented by their path. Differences in
 * array length are NOT caught by this script (intentional: translators may
 * choose different counts for some lists). The shape contract (same keys
 * present in both locales) is what matters.
 */
import { readFileSync } from 'node:fs';

function flatten(obj: unknown, prefix = ''): string[] {
  if (Array.isArray(obj)) {
    // Arrays count as a single leaf — represented by the path itself.
    return [prefix];
  }
  if (obj && typeof obj === 'object') {
    const out: string[] = [];
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      out.push(...flatten(v, prefix ? `${prefix}.${k}` : k));
    }
    return out;
  }
  return [prefix];
}

const fr = JSON.parse(readFileSync('messages/fr.json', 'utf8'));
const en = JSON.parse(readFileSync('messages/en.json', 'utf8'));
const frKeys = new Set(flatten(fr));
const enKeys = new Set(flatten(en));

const onlyFr = [...frKeys].filter((k) => !enKeys.has(k));
const onlyEn = [...enKeys].filter((k) => !frKeys.has(k));

if (onlyFr.length || onlyEn.length) {
  console.error('FR/EN parity FAILED.');
  if (onlyFr.length) console.error('  Keys only in FR:', onlyFr);
  if (onlyEn.length) console.error('  Keys only in EN:', onlyEn);
  process.exit(1);
}
console.log(`FR/EN parity OK — ${frKeys.size} leaf paths.`);

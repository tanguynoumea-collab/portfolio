/**
 * scripts/check-reduced-motion.ts — A11Y-05 static regression gate (Phase 6 D-12).
 *
 * Walks components/ + app/ and flags any non-test .tsx that uses a GSAP
 * animation API (useGSAP / gsap.timeline / gsap.to() / gsap.from()) OR a
 * motion animate API (whileHover / whileTap / animate= / <motion.) WITHOUT a
 * sibling reduced-motion guard in the SAME file (usePrefersReducedMotion /
 * useReducedMotion / gsap.matchMedia / a prefers-reduced-motion media query /
 * Tailwind motion-safe: / motion-reduce: variants).
 *
 * This is the regression guard for the 15+ files that already gate motion: it
 * prevents a future contributor from adding an ungated animation. It mirrors
 * scripts/check-i18n-parity.ts's exit-0 contract — console.error + exit(1) on
 * any gap, console.log + exit(0) when every animating file is guarded.
 *
 * Run: `npm run check:reduced-motion` (tsx scripts/check-reduced-motion.ts).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOTS = ['components', 'app'];
const ANIM = /useGSAP|gsap\.timeline|gsap\.to\(|gsap\.from\(|whileHover|whileTap|animate=|motion\./;
const GUARD =
  /usePrefersReducedMotion|useReducedMotion|gsap\.matchMedia|prefers-reduced-motion|motion-safe:|motion-reduce:/;

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (p.endsWith('.tsx') && !/\.(test|spec)\.tsx$/.test(p)) out.push(p);
  }
  return out;
}

const failures: string[] = [];
for (const root of ROOTS) {
  for (const file of walk(root)) {
    const src = readFileSync(file, 'utf8');
    if (ANIM.test(src) && !GUARD.test(src)) {
      failures.push(`❌ ${file}: animates but no reduced-motion guard found`);
    }
  }
}
if (failures.length) {
  console.error('Reduced-motion gate FAILED.');
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log('✅ Reduced-motion gate OK — every animating file has a guard.');

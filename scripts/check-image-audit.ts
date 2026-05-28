/**
 * scripts/check-image-audit.ts — A11Y-06 static image gate (Phase 6 D-13).
 *
 * Walks components/ + app/ and asserts the image contract:
 *   1. NO bare <img> tags — every raster image must go through next/image
 *      (the @/components/mdx/Image wrapper is `NextImage`/`MDXImage`).
 *   2. Every <Image> / <NextImage> / <MDXImage> usage has either `fill` OR
 *      both `width` and `height` — so next/image always reserves layout box
 *      (no CLS) and can emit responsive srcset.
 *
 * The OG ImageResponse JSX (lib/og.tsx + opengraph-image.tsx) renders via
 * Satori (an SVG/PNG rasterizer), NOT the DOM, and uses plain <div> elements
 * — it contains no <Image>/<img>, so it is naturally out of scope here; the
 * walker also skips *.test.tsx / *.spec.tsx.
 *
 * Mirrors scripts/check-i18n-parity.ts's exit-0 contract: console.error +
 * exit(1) on any violation, console.log + exit(0) when clean.
 *
 * Run: `npm run check:images` (tsx scripts/check-image-audit.ts).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

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
for (const root of ['components', 'app']) {
  for (const file of walk(root)) {
    const src = readFileSync(file, 'utf8');
    if (/<img[\s>]/.test(src)) failures.push(`❌ ${file}: bare <img> — use next/image`);
    // Require whitespace after the element name so a prose `<Image>` reference
    // inside a JSDoc comment (e.g. "* <Image> MDX component …" in
    // components/mdx/Image.tsx) is NOT matched — a real next/image usage always
    // has attributes (src + fill|width/height), hence whitespace before them.
    // `[^>]*` already spans newlines (the negated class matches \n), so no
    // dotAll `s` flag is needed — and `s` would require tsconfig target es2018+.
    const blocks = src.match(/<(?:Image|NextImage|MDXImage)\s[^>]*\/?>/g) ?? [];
    for (const b of blocks) {
      const hasFill = /\bfill\b/.test(b);
      const hasDims = /\bwidth=/.test(b) && /\bheight=/.test(b);
      if (!hasFill && !hasDims) failures.push(`❌ ${file}: <Image> missing fill or width+height`);
    }
  }
}
if (failures.length) {
  console.error('Image audit FAILED.');
  failures.forEach((f) => console.error(`  ${f}`));
  process.exit(1);
}
console.log('✅ Image audit OK.');

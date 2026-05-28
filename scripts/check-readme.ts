/**
 * scripts/check-readme.ts — DEPLOY-01 README real-content + repo-URL gate (Phase 7 D-04/D-02).
 *
 * Asserts that README.md is a real portfolio README, not the create-next-app
 * scaffold, AND that the GitHub repo URL is consistent across the three places
 * it lives (lib/constants.ts GITHUB_URL, lib/ascii.ts GITHUB_URL, README.md):
 *
 *   1. FAIL if README contains scaffold boilerplate (`bootstrapped with` or
 *      `create-next-app`).
 *   2. FAIL unless README contains the portfolio markers: `Tanguy` AND
 *      `Next.js 16` AND at least one stack-list signal (Tailwind / next-intl /
 *      GSAP).
 *   3. Repo-URL consistency (keeps D-02 honest — when 07-01 changes the owner,
 *      all three must move together): extract the github.com owner/repo literal
 *      from lib/constants.ts + lib/ascii.ts, assert they match each other, and
 *      assert README references the SAME owner/repo.
 *
 * Mirrors scripts/check-i18n-parity.ts's exit-0 contract: console.error +
 * process.exit(1) on any violation, console.log + exit 0 when clean.
 *
 * Run: `npm run check:readme` (tsx scripts/check-readme.ts).
 */
import { readFileSync } from 'node:fs';

const readme = readFileSync('README.md', 'utf8');
const failures: string[] = [];

// (1) no scaffold boilerplate.
for (const boilerplate of ['bootstrapped with', 'create-next-app']) {
  if (readme.includes(boilerplate)) {
    failures.push(`README still contains scaffold boilerplate: "${boilerplate}"`);
  }
}

// (2) portfolio markers.
if (!readme.includes('Tanguy')) failures.push('README missing portfolio marker: "Tanguy"');
if (!readme.includes('Next.js 16')) failures.push('README missing stack marker: "Next.js 16"');
if (!/Tailwind|next-intl|GSAP/.test(readme)) {
  failures.push('README missing a stack-list signal (Tailwind / next-intl / GSAP)');
}

// (3) repo-URL consistency across constants.ts / ascii.ts / README.
const OWNER_REPO_RE = /github\.com\/([\w-]+\/[\w.-]+?)(?:["'`\s)/]|\.git|$)/;
function ownerRepo(file: string): string | null {
  const m = readFileSync(file, 'utf8').match(OWNER_REPO_RE);
  return m ? m[1] : null;
}

const constantsRepo = ownerRepo('lib/constants.ts');
const asciiRepo = ownerRepo('lib/ascii.ts');

if (!constantsRepo) failures.push('could not extract github owner/repo from lib/constants.ts');
if (!asciiRepo) failures.push('could not extract github owner/repo from lib/ascii.ts');
if (constantsRepo && asciiRepo && constantsRepo !== asciiRepo) {
  failures.push(`repo URL mismatch: lib/constants.ts="${constantsRepo}" vs lib/ascii.ts="${asciiRepo}"`);
}

const expectedRepo = constantsRepo ?? asciiRepo;
if (expectedRepo && !readme.includes(expectedRepo)) {
  failures.push(`README does not reference the repo "${expectedRepo}" used in constants.ts/ascii.ts`);
}

if (failures.length) {
  console.error('check-readme FAILED.');
  failures.forEach((f) => console.error(`  ❌ ${f}`));
  process.exit(1);
}
console.log(
  'check-readme OK — real portfolio README + consistent repo URL across constants/ascii/README.',
);

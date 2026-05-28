/**
 * lib/constants.ts — User-specific data for Hero / Footer / Contact / ConsoleArt.
 *
 * Phase 4 D-06: 3 values the user swaps pre-deploy.
 *   - EMAIL is a placeholder; user provides their real email before Phase 7.
 *   - GITHUB_URL matches the Footer + ConsoleArt fallback from Phase 3.
 *   - LINKEDIN_URL is a placeholder; user provides their real profile URL.
 *
 * NO hardcoded values elsewhere in the codebase — Hero/Contact import from
 * here. Footer is already configured separately in Phase 3 (Footer.tsx
 * inlines the same URLs; Phase 4 deferred refactor is to migrate Footer to
 * import from this file too — not in scope for Phase 4).
 */
export const EMAIL = 'tanguy@example.com';
export const GITHUB_URL = 'https://github.com/tanguynoumea-collab/portfolio';
export const LINKEDIN_URL = 'https://www.linkedin.com/in/tanguy-delrieu';

/**
 * SITE_URL — the canonical origin used as `metadataBase` (Phase 6 D-01) and
 * the base for absolute hreflang / sitemap / OG URLs.
 *
 * Env-aware: `NEXT_PUBLIC_SITE_URL` overrides the placeholder before deploy
 * (Phase 7 sets the real domain). The trailing slash is stripped so
 * `${SITE_URL}${pathname}` never produces a double slash.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tanguy.dev'
).replace(/\/$/, '');

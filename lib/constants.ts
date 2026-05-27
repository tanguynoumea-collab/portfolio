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
export const GITHUB_URL = 'https://github.com/tanguynoumea/portfolio';
export const LINKEDIN_URL = 'https://www.linkedin.com/in/tanguy-delrieu';

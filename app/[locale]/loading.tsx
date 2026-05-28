/**
 * app/[locale]/loading.tsx — A11Y-03 Suspense fallback (Phase 6 D-09).
 *
 * Server Component (no client directive) — it ships as the instant Suspense
 * boundary fallback while a [locale] segment streams. Kept deliberately
 * lightweight: a
 * single centered brand dot rather than a section-shaped skeleton (over-
 * engineering for a fast static site, per D-09 discretion).
 *
 * Reduced-motion (A11Y-05): the pulse uses the `motion-safe:animate-pulse`
 * Tailwind variant, which is gated behind `@media (prefers-reduced-motion:
 * no-preference)`. Motion-sensitive users therefore get a STATIC dot (no
 * animation) while everyone else sees the gentle pulse — no JS gate needed.
 *
 * a11y: role="status" + aria-label announces the busy state to assistive tech;
 * the sr-only text is the visible-to-AT loading message. (D-09 sanctions the
 * literal "Loading" label as-is — no new i18n key required.)
 *
 * Colors: palette CSS-var alias only (bg-accent) — NO hardcoded color.
 */

export default function Loading() {
  return (
    <div
      className="flex min-h-[60vh] items-center justify-center"
      role="status"
      aria-label="Loading"
    >
      <div className="bg-accent h-10 w-10 rounded-full opacity-80 motion-safe:animate-pulse" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}

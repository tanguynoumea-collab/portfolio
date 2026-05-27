---
status: partial
phase: 03-layout-animation-foundation
source: [03-VERIFICATION.md]
started: 2026-05-27T15:10:00Z
updated: 2026-05-27T15:10:00Z
---

## Current Test

[awaiting human testing — none in progress]

## Tests

### 1. Inter font renders FR diacritics
expected: Open /fr in browser, inspect rendered headings/body in DevTools, copy 'é' into the URL bar — character renders identically with Inter (no fallback substitution to system font)
result: [pending]

### 2. Lenis smooth-scroll on nav anchor clicks
expected: Open /fr, click any nav anchor; observe eased ~700-1200ms inertial scroll (NOT instant browser jump). Compare to a hash navigation with reduced-motion enabled (instant).
result: [pending]

### 3. Sheet content scrolls natively (data-lenis-prevent honored)
expected: Open PaletteSwitcher Sheet on small viewport with overflowing content; mouse-wheel inside — Sheet content scrolls, body behind does NOT scroll
result: [pending]

### 4. ScrollTrigger position re-syncs after palette swap (~450ms post-swap)
expected: Open DevTools console with breakpoint or log inside LenisProvider 450ms timeout; click a palette preset — confirm ScrollTrigger.refresh fires once after the 400ms color transition
result: [pending]

### 5. Nav transparent → bg-background/80 + backdrop-blur-md + border-b after scrolling >50px
expected: Open /fr, observe nav at scrollY=0 (transparent, no border). Scroll past 50px; observe nav solid (semi-opaque background, backdrop blur, bottom border)
result: [pending]

### 6. Active section link highlight tracks scrolled section (IntersectionObserver firing)
expected: Open /fr, scroll through each placeholder section; the matching nav anchor gains aria-current='true' + text-foreground (vs text-muted-foreground) as the section enters the centered 20% band
result: [pending]

### 7. Language switch preserves scroll position via lenis.scrollTo({immediate:true})
expected: Open /fr, scroll deep down the page (≥500px), click EN in LanguageSwitcher; after route swap, scroll position is restored to the same Y offset (NOT teleported to top)
result: [pending]

### 8. document.documentElement.lang attribute updates imperatively after locale swap
expected: Open /fr, inspect `<html lang='fr'>` in DevTools. Click EN. Re-inspect — `<html lang='en'>`. Without the imperative useEffect, next-intl would not re-render the `<html>` element
result: [pending]

### 9. Native OS cursor remains visible everywhere (no cursor:none anywhere)
expected: Open /fr on desktop pointer:fine; the default OS cursor (arrow/pointer/text) renders normally on every element. CustomCursor is a SEPARATE decorative dot orbiting the OS cursor
result: [pending]

### 10. CustomCursor follows pointer with spring and grows on link/button hover
expected: Open /fr on desktop, move pointer — small 8px accent-colored dot orbits with spring delay (mass 0.3, stiffness 800). Hover over nav links / PaletteFab / hamburger trigger — dot scales to ~4× (32px)
result: [pending]

### 11. CustomCursor renders null on touch device / reduced-motion / forced-colors
expected: DevTools emulate touch device — CustomCursor vanishes (no DOM node). Toggle prefers-reduced-motion:reduce — vanishes. Toggle forced-colors:active — vanishes
result: [pending]

### 12. Page transition fade + 8px Y-translate completes in ≤350ms on real navigation
expected: DevTools Performance recording: navigate between routes (e.g. /fr to /en, or any client-side navigation). Measure motion.div mount-to-final transition — must complete under 350ms
result: [pending]

### 13. Reduced-motion page transition = instant fade ≤100ms (no translate)
expected: Toggle prefers-reduced-motion:reduce in DevTools, navigate between routes, observe NO Y-translate, only opacity transition, completing within 100ms
result: [pending]

### 14. Console ASCII art prints once on cold load with accent color + GitHub link + Konami hint
expected: Open /fr in fresh tab (NOT hot-reloaded); DevTools Console shows colored 'Tanguy' FIGlet wordmark + bilingual intro + clickable https://github.com/tanguynoumea/portfolio + '// ↑ ↑ ↓ ↓ ← → ← → B A' line
result: [pending]

### 15. Console art is ONE-SHOT — does NOT reprint on route navigation
expected: Open /fr, observe one print. Click nav anchor (#about) — no reprint. Hard-load /en — re-print (module reloads on cold load only)
result: [pending]

### 16. FR console art on /fr; EN console art on /en
expected: Hard-load /fr → ASCII shows 'Profil hybride — Tech × Design × BIM' and FR welcome line. Hard-load /en → ASCII shows 'Hybrid profile' and EN welcome line
result: [pending]

### 17. Footer lucide-react v1 substitutions read correctly with screen reader
expected: Use VoiceOver / NVDA / Narrator to navigate Footer social links. Confirm aria-labels read "GitHub", "LinkedIn", "Email" (or French equivalents on /fr) — NOT "Code", "Briefcase", "Mail" (which are the underlying lucide icon names after the v1 brand-icon removal).
result: [pending]

## Summary

total: 17
passed: 0
issues: 0
pending: 17
skipped: 0
blocked: 0

## Gaps

None recorded yet — all items pending human verification. If any test fails, append a gap entry here with:
- failing_test: N
- observed: <actual behavior>
- expected: <copy from above>
- debug_session: <link if created via /gsd:debug>

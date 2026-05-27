---
status: partial
phase: 04-homepage-sections
source: [04-VERIFICATION.md]
started: 2026-05-27T21:14:00Z
updated: 2026-05-27T21:14:00Z
---

## Current Test

[awaiting human testing — none in progress]

## Tests

### 1. Hero SplitText char stagger reveals on cold load /fr and /en
expected: Name 'Tanguy' reveals char-by-char, then role 'Tech × Design × BIM', then tagline + CTA. Total <1.2s. No layout shift (CLS=0).
result: [pending]

### 2. Hero CTA scrolls smoothly to #projects via Lenis
expected: Click 'Découvrir mon travail' / 'See my work' — page glides ~1s with -64px nav offset to projects section
result: [pending]

### 3. Hero ChevronDown scroll cue bounces under full motion
expected: Chevron below CTA gently bounces (y:[0,8,0], 2s loop)
result: [pending]

### 4. About scroll reveal triggers at top 75% with photo slide-from-left + paragraph stagger
expected: Scroll until About section is 25% into viewport — photo slides from x=-40 (0.7s), paragraphs stagger up from y=30 (0.15s)
result: [pending]

### 5. About reduced-motion: elements render at final state immediately
expected: DevTools emulate prefers-reduced-motion → reload + scroll — no animation, photo + paragraphs visible immediately
result: [pending]

### 6. CategoryFilter motion layoutId indicator smoothly slides between buttons
expected: Click All → Tech → Design → BIM. Active background morphs between buttons via spring transition
result: [pending]

### 7. ProjectGrid filter transitions feel smooth (popLayout exit + enter)
expected: Click filters repeatedly. Cards scale+fade out, remaining cards reflow smoothly, no flash, no jank
result: [pending]

### 8. ProjectCard hover triggers scale 1.02 + brightness + accent border + arrow translate
expected: Hover each card — visible scale, image brightens, border becomes accent, ArrowUpRight slides up-right
result: [pending]

### 9. ProjectCard hover disabled under reduced-motion
expected: Toggle reduced-motion, hover cards — no scale/translate
result: [pending]

### 10. ProjectCard Link navigates to /fr/projects/{slug} (locale-prefixed)
expected: Click any card — URL becomes /fr/projects/texture-manager (or /en/...). Phase 5 ships the detail page; Phase 4 just verifies the locale-aware href.
result: [pending]

### 11. Skills badges stagger entrance on scroll
expected: Scroll to skills — Tech badges stagger up first, then Design, then BIM (cascade 0.15s)
result: [pending]

### 12. Contact email button copies to clipboard with motion icon swap
expected: Click email — clipboard contains 'tanguy@example.com'. Icon swaps Copy→Check + sr-only 'Address copied!' label for 1.5s, then reverts.
result: [pending]

### 13. Contact CV download buttons trigger actual download
expected: Click both CV buttons. Files save as CV_Tanguy_Delrieu_FR.pdf / CV_Tanguy_Delrieu_EN.pdf
result: [pending]

### 14. Contact social links open GitHub + LinkedIn in new tab
expected: Click GitHub → opens https://github.com/tanguynoumea/portfolio in new tab. LinkedIn → opens placeholder URL.
result: [pending]

### 15. Project cards retain category colors across all 5 palettes (cross-phase regression)
expected: Open PaletteSwitcher, cycle terra/nordic/bauhaus/ocean/vaporwave — category badges (Tech/Design/BIM) keep their fixed colors (blue/magenta/amber), do NOT mutate with palette
result: [pending]

### 16. Page transitions still work between routes FR↔EN (cross-phase regression)
expected: Toggle FR ↔ EN — observe fade+Y page transition still plays (Phase 3 ANIM-01 contract)
result: [pending]

### 17. Inter font loads + renders Hero text without FOIT/FOUC (cross-phase regression)
expected: Hard-load /fr — text appears immediately (system fallback) then crisp-swaps to Inter, no flash
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

---
status: partial
phase: 05-project-content-pipeline
source: [05-VERIFICATION.md]
started: 2026-05-28T07:45:00Z
updated: 2026-05-28T07:45:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Cover parallax visually translates on scroll under full motion
expected: Visit /fr/projects/agora with normal motion preference; scroll down — the cover image translates upward (≤50px) slower than the page. Then enable prefers-reduced-motion → cover image stays static (no translate).
result: [pending]

### 2. `<Image>` zoom Dialog opens and closes via Esc / backdrop
expected: Visit /fr/projects/texture-manager, click a gallery image → Dialog opens with the enlarged image; press Esc and click the backdrop → both close. Page behind does not scroll while modal is open (data-lenis-prevent).
result: [pending]

### 3. `<CodeBlock>` copy button copies source and swaps Copy↔Check
expected: On a project page with a fenced code block, hover the block → copy button appears top-right; click it → icon swaps to a check for ~1.5s, and the clipboard holds the raw code source.
result: [pending]

### 4. Full project page renders MDX body + metadata strip + gallery visually
expected: Visit /fr/projects/agora (no gallery) and /en/projects/texture-manager (gallery shows 4 images). Confirm: cover hero, metadata strip with category-specific fields, 4 case-study sections rendered, Callouts styled by variant, prev/next footer navigates with wrap-around.
result: [pending]

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps

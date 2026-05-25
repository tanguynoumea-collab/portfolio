# Feature Research

**Domain:** Bilingual creative personal portfolio — hybrid Tech (dev) × Design (creative) × BIM (architecture/construction) profile
**Researched:** 2026-05-25
**Confidence:** HIGH (table stakes, anti-features, bilingual UX, hybrid-profile specifics validated across multiple 2026 sources); MEDIUM (palette switcher novelty assessment — based on industry surveys, not user testing)

## Executive Summary

The user's plan is **mostly aligned with 2026 expectations** but has three categorical gaps and one concerning signature-feature risk:

1. **Three table-stakes gaps** are missing from the active list: (a) **case study structure** (problem → process → outcome) for project pages — currently only "MDX with gallery" is specified, which is closer to a Behance grid than a 2026 case study; (b) **CV/resume PDF download** — explicitly missing despite the project's stated role as "complement au CV"; (c) **`prefers-reduced-motion` handling** — only mentioned implicitly under WCAG AA but not as an active requirement, and a portfolio this animation-heavy without it will fail accessibility audits and trigger vestibular reactions.

2. **The palette switcher signature feature is differentiated but not unique.** Theme/palette customization is now a *table-stakes* feature in WordPress portfolio templates (Journo, Divi 5) and most modern portfolio builders ship a basic "switch palette" toggle. What makes the user's version novel is **the WCAG live-feedback + harmonic generator + custom picker combo** — that's design-system-as-product, not just a theme toggle. The novelty needs to be **communicated as "design system playground"**, not "palette switcher", to land. A 4th palette toggle is interesting; a public WCAG-aware harmonic generator that ships in a portfolio is a portfolio-as-demo.

3. **Custom cursor (desktop) is a flagged anti-feature in 2026.** Accessibility consensus has shifted hard against it since 2024. Keep only if it (a) respects `prefers-reduced-motion`, (b) keeps the native cursor visible as fallback, (c) auto-disables when system cursor magnification or high-contrast cursor is detected, and (d) is contextual (hover state on interactive elements), not a full-page takeover.

The **BIM dimension is under-served** by the current plan — 2 BIM MDX files with a generic image gallery does not communicate "architecture/construction" the way recruiters in that vertical expect. Specific BIM features (Sketchfab/Autodesk embed, PDF plan viewer, before/after sliders) are differentiators that justify the hybrid positioning.

The **scroll horizontal pin on Projects (GSAP pin)** is the riskiest single technical decision in the plan — mobile-broken on iOS Safari and Chrome Android in 2026 unless implemented with `scrub`-without-pin + IntersectionObserver fallback. Mark as P2 deferred.

## Feature Landscape

### Table Stakes (Users Expect These)

Missing any of these in 2026 = the portfolio reads as "amateur" or "from 2019" to recruiters reviewing 40 portfolios per session.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Above-the-fold role clarity (name + specialization + one-liner)** | Recruiters spend 7 seconds on first pass and 2-3 minutes total. They must understand "what is this person and what do they do" in the first viewport. | S | User's Hero is planned but no requirement currently specifies the *content* must include role + specialization above the fold. **Add to active.** |
| **Responsive design (mobile-first)** | Mobile is 60%+ of traffic in 2026 and Google indexes mobile-first. Recruiters share portfolio links via mobile chat. | M | Constraint already lists mobile-first responsive (`sm/md/lg/xl`). OK. |
| **LCP < 2.5s on mobile** | Hard threshold in 2026 — Google Core Web Vitals, recruiter patience (12MB hero video = closed tab). | M | Lighthouse 90+ constraint covers it. Verify on 3G throttling. |
| **Project case studies with structured narrative (problem → process → outcome)** | 2026 standard: a project page is an *article* with a hook, problem framing, process visuals, and outcome metrics — not a Behance-style image grid. | M | **Currently UNDERSPEC'd.** Active list says "page projet avec MDX renderer + galerie" — that's a gallery, not a case study. Add narrative structure as MDX content convention + template guidance. |
| **Downloadable CV/resume PDF** | The PROJECT.md literally states the portfolio is "complément au CV PDF" — visitors will look for the download link. Industry-standard in 2026 portfolios. | XS | **MISSING from active list.** Add: link to PDF in Contact section + Hero. |
| **Bilingual language switcher (visible in header)** | For an FR/EN portfolio, switcher must be in header (not footer) per 2026 i18n best practices. | S | Already specced: `LanguageSwitcher` in navigation. OK. |
| **Locale shown in native language ("Français" not "French")** | Standard i18n UX rule — users scanning for their language shouldn't have to translate first. | XS | Not explicit in active list — easy to get wrong. **Document in i18n spec.** |
| **Locale persisted across navigation (cookie/localStorage)** | Visitor switches to FR, navigates to a project, returns home — should still be in FR. | XS | next-intl handles via cookie if configured. Verify. |
| **Locale in URL path (`/fr`, `/en`)** | SEO-critical: search engines index each locale separately. | S | Already specced via next-intl routes localisées. OK. |
| **GitHub link in Hero/Contact + LinkedIn + Email** | Standard "verifiable proof" links. Recruiters click GitHub before reading anything. | XS | Already in Footer + Contact. **Also surface in Hero** if possible. |
| **Project category / filter** | Standard since 2018, expected. User has All / Tech / Design / BIM filter. | S | Already specced. OK. |
| **Proper OG image per page (1200×630 or 1200×600 2:1)** | Sharing on Slack/LinkedIn/Twitter without OG image = looks unprofessional. | S | Already in active list via `generateMetadata`. Verify per-project unique OG. **Consider Vercel OG for dynamic generation per project.** |
| **`prefers-reduced-motion` support** | WCAG 2.3.3 + 2026 portfolio convention. EU Accessibility Act in effect since June 2025. Vestibular disorder users can experience nausea from GSAP/Lenis/ScrollTrigger animations. | S | **NOT explicit in active list** — only "WCAG AA garanti" is mentioned. **Add as active requirement.** All GSAP timelines + Lenis + Framer Motion must gate on `prefers-reduced-motion`. |
| **Keyboard navigation (full)** | WCAG 2.1 AA, 2026 minimum. PaletteSwitcher specifically needs focus trap. | M | Already in active list (focus visible, navigation clavier complète sur PaletteSwitcher). OK. |
| **404 page** | Standard expectation; broken links happen. | XS | Already specced. OK. |
| **Skills/stack badges (visible at-a-glance)** | Recruiters skim — visual proof of stack ("Next.js, React, GSAP, Three.js, Revit, ...") in 2 seconds. | S | Already specced (Section Skills with badges). OK. |
| **Lighthouse Performance/Accessibility/SEO 90+** | 2026 minimum baseline. Vercel Analytics will show real-user data. | M | Already a constraint. OK. |

### Differentiators (Competitive Advantage)

Features that elevate the portfolio from "well-done" to "memorable". The user already has several strong differentiators planned — assessment below.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **WCAG-aware harmonic palette generator (the user's signature)** | Theme switchers are now table stakes in 2026 — but a *live harmonic generator with real-time WCAG ratio + automatic AA correction* is a design-system-as-portfolio statement. It proves design system literacy, color theory, accessibility expertise, and frontend craft in a single feature. | XL | **Validated as differentiator BUT positioning needs work.** A "palette switcher" reads as table stakes; a "design system playground / WCAG-aware harmonic generator" reads as differentiator. Frame it that way in copy and possibly call out the WCAG ratio prominently. **The harmonic generator + WCAG live ratio is the real signature, not the 4 presets.** |
| **Konami code easter egg unlocking secret palette** | Plays to dev/gamer audience. Memorable. Combined with ASCII console = consistent "I notice things" persona. | S | Validated. Konami code remains popular in 2026 dev portfolios — not original on its own, but the combination with a *unlockable palette* (not just a banner) is novel. |
| **ASCII art + bilingual hint in browser console** | Dev/recruiter who opens DevTools immediately sees personality. Tiny effort, big "this person ships" signal. | XS | Validated. Standard creative-dev easter egg, still effective in 2026. **Add: include link to GitHub repo of portfolio in console message** — invites code review. |
| **Hybrid Tech × Design × BIM category filter** | Most portfolios are pure-dev OR pure-design. Hybrid positioning is rare and memorable. The filter physically demonstrates the hybrid claim. | S | Already specced. Strong. **Add filter combination support** (e.g. "Tech + Design" projects exist in user's stack — let visitors see crossover, not just buckets). |
| **Sketchfab / Autodesk Viewer / Google Model Viewer 3D embed on BIM projects** | A BIM project shown as static images = anyone can do that. An interactive 3D model in the browser = "I work in 3D and own the web stack." Differentiates this portfolio from both pure-dev and pure-architect peers. | M | **NOT in current active list.** Strongly recommend adding to 1-2 BIM projects in v1. `<model-viewer>` web component is the simplest (~10KB), Sketchfab embed is iframe-based. Three.js custom viewer = scope creep for v1. |
| **PDF plan embed/viewer for architectural drawings** | BIM/architecture audiences expect to see actual plans. A PDF viewer with zoom/pan in-browser proves the project is real, not just renders. | M | **NOT in current active list.** Consider `react-pdf` or `pdf.js` for 1-2 BIM projects. Alternatively, a high-res PNG with shadcn lightbox is 80% of the value at 20% of the cost. |
| **Before/after slider for design/BIM work** | Standard for renovation/redesign work. Excellent for "before BIM modeling / after rendering" or "before redesign / after redesign". | S | **NOT in current active list.** Add as an MDX component if 2+ projects benefit from it. |
| **Custom MDX components (Image with zoom, CodeBlock, Callout)** | Differentiates from plain markdown blogs. Code highlighting matters for Tech projects, image zoom matters for Design/BIM. | M | Already specced. **Add Callout variants** (Note / Warning / Result) for case study structure. |
| **Smooth-scroll (Lenis)** | 2026 expectation for high-end portfolios — without it, scrolling feels "cheap". | S | Already specced. ⚠ Must respect `prefers-reduced-motion` (disable Lenis when user opts out). |
| **GSAP SplitText hero reveal** | Common in 2026 ("character-by-character text reveals appear frequently in high-end landing pages") — *no longer a differentiator*, more like "polish". | S | Already specced. **It is NOT a differentiator in 2026** — it's a baseline polish move. Don't oversell it. Consider a layered reveal (split + scramble or split + masked clip-path) for actual differentiation. |
| **Page transitions with Framer Motion AnimatePresence** | Adds perceived quality. Common in 2026. | M | Already specced. Useful, not signature. |
| **Stack section with technologies categorized (Tech/Design/BIM)** | Visualizing the hybrid skillset in the stack section itself reinforces the positioning. | S | Mentioned but worth tagging stack badges by category (color-coded) to reinforce hybrid identity. |
| **404 page with humour (bilingual)** | Personality reinforcement. Cheap to do, memorable. | XS | Already specced. OK. |
| **Vercel Analytics + Speed Insights** | Proves the developer cares about real-world performance, not just Lighthouse scores. | XS | Already specced. OK. |
| **Project filter with smooth FLIP layout animation** | The transition between "All" → "Tech" matters. With `AnimatePresence` + `layout` props, the filter feels alive. | S | Already specced (AnimatePresence transitions + layout shift fluide). OK. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that look amazing in demos but actively hurt portfolios in 2026.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Custom cursor (full-page takeover) on desktop** | "Looks polished, signals craft, common on Awwwards-style sites." | 2026 accessibility consensus has shifted hard against it. Overrides OS-level cursor accessibility settings (cursor magnification, high-contrast cursor, hover assistive cursors). Funka Foundation calls it a "nightmare for accessibility." On low-end devices it lags behind the real pointer creating motion sickness. Confuses users who don't realize the dot IS the cursor. | **User has it planned (`CustomCursor` desktop). Keep ONLY with strict constraints:** (1) `prefers-reduced-motion` disables it, (2) native cursor remains visible (don't `cursor: none`), (3) cursor enhancement only on hover over interactive elements (link/button/image), not a global persistent custom cursor, (4) auto-disable on touch devices (already implied by "desktop"). Better alternative: contextual cursor *labels* (e.g. "View →" on project card hover) instead of replacing the cursor itself. |
| **Scroll-jacking / forced scroll pacing** | "Cinematic storytelling, controls the reveal." | NN/G, Webflow Accessibility, and 2026 consensus: scroll-jacking breaks keyboard navigation, trackpad acceleration, accessibility tools, and decades-old user mental models. Penalizes power users and users with motor disabilities. | User has Lenis (smooth scroll, not scroll-jacking — this is OK with `prefers-reduced-motion` opt-out). Avoid `gsap.scrollTrigger` patterns that snap-scroll, lock scroll progress to fixed durations, or hijack scroll speed. The pinned horizontal scroll on Projects section is borderline — see below. |
| **Horizontal-scroll-on-pin for Projects section (current plan)** | "Adds dynamism, common pattern." | (1) Mobile-broken: GSAP `ScrollTrigger pin: true` is notoriously unreliable on iOS Safari and Chrome Android in 2026 due to dynamic viewport changes (URL bar). (2) Many users don't realize they need to keep scrolling vertically to advance horizontally. (3) Disables native scroll affordances. (4) Hurts SEO/discoverability of projects below the pin. | **Demote from v1 active list to v1.x.** If kept, implement with `scrub` *without* `pin` + IntersectionObserver fallback. Better v1: standard vertical grid with `AnimatePresence` filter transitions (already specced separately — these conflict). **Pick one.** |
| **Autoplay video with sound** | "Cinematic hero." | User immediately tab-bounces. Disallowed by most browsers anyway. Bandwidth disaster on mobile. | Muted autoplay loop, `playsInline`, with explicit unmute button. Or static hero with optional play. |
| **Splash screen / pre-loader (gratuitous)** | "Hides loading jank, feels polished." | Recruiter has 10-15 seconds of attention. A 1-2 second forced loader = 10-20% of attention budget spent on a logo animation. Modern stacks (Next.js + RSC) shouldn't need it. | Skeleton states on data-dependent components. Optimistic UI. Stream content with React 19 Suspense. |
| **Animated background canvas (particles, fluid sim, WebGL)** | "Signature visual, big wow factor." | Drains battery on mobile, kills LCP, often interferes with cursor accessibility, doesn't communicate any skill (these are template-everywhere now). | If a WebGL background is desired, gate behind `prefers-reduced-motion`, disable on mobile, and ensure it adds < 50KB to LCP. The palette switcher *is already* the signature visual — a particle background would dilute it. |
| **Hover-only project preview (no fallback for touch)** | "Hover reveals project info elegantly." | Breaks on touch devices and keyboard navigation. Touch users see nothing or see info on first tap which then conflicts with link activation. | Hover enhances on desktop; touch shows info inline always. Keyboard `:focus-visible` triggers same reveal as hover. |
| **Custom font with massive payload (>200KB) for headings only** | "Personality typography." | Hits LCP and FCP, CLS issues if font swaps after layout, lots of bytes for ~10 strings. | Variable font subset (Latin only), `font-display: swap`, preload critical weight, system font fallback that's metrically similar (use `size-adjust`). For FR+EN, ensure subset includes accented characters (é à ç ô etc.). |
| **Sticky / persistent contact CTA modal** | "Conversion optimization, always-visible CTA." | Reads as marketing-funnel-y, not creative-portfolio. Hides content on mobile. Annoys returning visitors. | Strong Contact section at bottom + email link in Hero. The FAB for palette switcher is already a persistent element — adding another competes with it. |
| **Live GitHub contribution graph embed** | "Shows recent activity." | Stale within days if you don't commit, breaks/rate-limits, often empty squares look bad. | Link to GitHub profile. Or fetch once at build time and snapshot. Or skip entirely. |
| **CMS for 6-10 projects** | "Scalable content management." | User has correctly excluded this. 6-10 projects = MDX in git is faster, type-safer, version-controlled. | Already correctly excluded in Out of Scope. ✓ |
| **AI chatbot ("ask me anything")** | "2026 trend per some lists." | For a personal portfolio (not a service business), comes across as gimmicky, leaks info you didn't sanction, costs money to run, distracts from work. | Don't. Possible v3+ if the portfolio gains a meaningful audience. |
| **Newsletter signup form** | "Build an audience." | The portfolio's job is to land work, not build a list. Forms require backend, GDPR notice (FR audience!), confirmation flow. | RSS feed if blog exists. mailto link. Already excluded. ✓ |

### Hybrid Tech × Design × BIM-Specific Features

What a hybrid profile portfolio needs that a pure-dev or pure-design portfolio doesn't.

| Feature | Why Hybrid-Specific | Complexity | Priority |
|---------|---------------------|------------|----------|
| **Stack badges color-coded by domain (Tech / Design / BIM)** | A pure-dev portfolio just lists "Next.js, TypeScript, Tailwind". A hybrid portfolio benefits from "Next.js (Tech) · Figma (Design) · Revit (BIM)" with visual grouping that reinforces the three-domain claim. | XS | P1 |
| **Project category filter (Tech / Design / BIM / All)** | Without filter, the portfolio looks scattered ("is this person a dev? a designer? an architect?"). With filter, it reads as "yes, all three, deliberately." | S | P1 — already planned |
| **Per-project domain badge on cards** | At-a-glance: "this is a BIM project, that one is Tech." | XS | P1 |
| **Cross-domain "combo" tag for projects spanning multiple domains** | The hybrid claim is strongest when individual projects touch 2-3 domains. A project tagged "Tech + Design" is more interesting than two single-domain projects. | XS | P2 — if any project qualifies |
| **3D model viewer for BIM projects (Sketchfab, model-viewer, or Three.js)** | Architectural projects shown as static images = "I rendered this in Twinmotion". Interactive 3D = "I model in BIM AND own the web." | M | P2 v1 (1-2 BIM projects); model-viewer web component is lowest-risk |
| **PDF plan/drawing embed for architecture projects** | Recruiters in architecture want to see plans, sections, elevations — not just renders. | M | P2 — only if user has CAD/Revit exports to share |
| **High-res zoomable image (lightbox)** | Architecture renders + UI designs need to be inspected closely. The current "MDX with image gallery" must support full-screen zoom. | S | P1 — already implied via MDX Image with zoom |
| **Before/after slider** | Common in design/architecture: "wireframe → final UI", "site photo → BIM model → render". | S | P2 — add as MDX component if 2+ projects benefit |
| **Video reel / project demo embed (YouTube/Vimeo or self-hosted MP4)** | Tech projects benefit from a 30s screencast more than 5 screenshots. UI design projects benefit from a Lottie or Rive animation export. | S | P2 — define as MDX component, use case-by-case |
| **Code snippet with syntax highlighting** | Tech projects need code samples for credibility. shiki or prism via MDX. | S | P1 — already planned (CodeBlock highlight) |
| **Process diagrams / sketches** | Design + BIM thinking is shown through process artifacts (sketches, wireframes, iteration history), not just final outputs. | XS | P1 — convention, not feature: ensure case study template encourages process imagery |
| **Tool / software icons per project** (Revit, Figma, Next.js, Three.js, AutoCAD, Twinmotion, etc.) | Reinforces hybrid stack literacy at a glance. | XS | P1 — already implied via Project frontmatter `stack` field |
| **Domain-specific glossary / context note for non-experts** | A recruiter who is "Tech recruiter" doesn't know what BIM or Revit is. A short callout per BIM project explains the domain. | XS | P2 — convention in MDX template |

### Bilingual FR/EN-Specific Considerations

Features and pitfalls specific to running a bilingual French/English portfolio.

| Feature / Pitfall | Why It Matters for FR/EN | Implementation |
|-------------------|--------------------------|----------------|
| **Show locale in native language ("Français" / "English")** | Standard i18n UX rule — scanning users shouldn't have to translate the switcher first. | XS — set label in `messages/{fr,en}.json` |
| **No flag icons in switcher** | French is spoken in many countries (FR, BE, CH, CA, ...). 🇫🇷 implies "France only". Same for 🇬🇧 vs English. | Use text labels (or text + minimal abstract icon, never national flags). |
| **Persist locale preference (cookie or localStorage)** | Visitor switches to FR, navigates, returns — should still be FR. next-intl supports this. | Configure next-intl `localeDetection` and cookie. |
| **No silent auto-redirect based on browser language** | NN/G + 2026 i18n best practice — auto-redirect overrides user choice. Detect, offer, but never silently redirect. | Show subtle banner ("Vous êtes en EN — passer en FR ?") on first visit only, dismissable. Or just default to one and let switcher do the work. |
| **URL structure `/fr/...` and `/en/...`** | SEO: search engines index each locale separately. Avoid `?lang=fr` query strings. | Already planned via next-intl routes localisées. ✓ |
| **`<html lang>` updates per locale** | Screen readers and search engines need correct lang attribute. | next-intl handles this in App Router layout. |
| **Hreflang tags in `<head>`** | Tells Google both EN and FR versions exist and which audience. | Add to `generateMetadata` or root layout: `<link rel="alternate" hreflang="fr" href="..." />` |
| **Text expansion handling** | French text is typically 15-25% longer than English (not the 30-35% German case, but real). Button labels especially. | Design with FR-first if possible. Test layout with longest string in each language. Avoid fixed-width buttons. |
| **Date/number formatting per locale** | "25 mai 2026" vs "May 25, 2026". Use `Intl.DateTimeFormat`. | next-intl provides `useFormatter().dateTime()`. Use it for project dates in MDX frontmatter rendering. |
| **Translated frontmatter / per-locale MDX files** | A bilingual portfolio with English-only project content is jarring. Either translate frontmatter OR write two MDX files per project. | `content/projects/{slug}.fr.mdx` + `content/projects/{slug}.en.mdx`. Or one MDX with conditional rendering. Either way: **plan for it now**, retrofitting is painful. |
| **Localized Open Graph title/description per page** | Sharing an FR project on French LinkedIn with English OG = bad. | Per-locale `generateMetadata`. next-intl `getTranslations({locale})`. |
| **Console ASCII art bilingual (FR + EN)** | User explicitly planned this. ✓ | Already in active list. |
| **404 page bilingual** | Already in active list. ✓ | OK. |
| **Email links don't need translation but subject line should be localized** | `mailto:hi@tanguy.dev?subject=...` should have subject "Bonjour" in FR mode, "Hello" in EN mode. | Trivial — read locale from context, set subject string. |
| **Sitemap per locale** | SEO best practice. | Generate `/sitemap.xml` with both locales' URLs. next-intl + Next.js sitemap helper. |
| **PDF CV: provide both FR and EN versions** | The portfolio complements the CV PDF. Recruiter in EN locale downloading FR CV = bad first impression. | Two PDF files: `cv-tanguy-fr.pdf`, `cv-tanguy-en.pdf`. Link per locale. |

## Assessment of User's Planned Features

Direct critique of each major planned feature against 2026 expectations.

| User's Planned Feature | Verdict | Rationale | Recommendation |
|------------------------|---------|-----------|----------------|
| **4 preset palettes + custom color picker + harmonic generator with live WCAG** | ✓ **Strong differentiator** — but reframe positioning | Theme switchers alone are now table stakes (every WordPress portfolio theme has one). The harmonic generator + live WCAG ratio + auto AA correction = design-system-as-portfolio, which IS rare and impressive. The 4 presets alone won't differentiate; the *engineering* will. | **Keep as planned.** Add prominent WCAG ratio display in the UI so visitors *see* the WCAG-awareness, not just experience it abstractly. Position the feature as "design system playground" in copy. |
| **5th secret Vaporwave palette via Konami code** | ✓ **Strong** | Combines two creative-dev tropes (Konami code, vaporwave aesthetic) in a way that rewards exploration. Memorable. | Keep. Ensure the secret palette still meets WCAG AA (vaporwave magenta/cyan can fail contrast). |
| **6-10 projects with Tech/Design/BIM filter** | ✓ **Correct count and structure** | 6-10 is the sweet spot — fewer feels thin, more feels unfocused. Filter is essential for hybrid positioning. | Keep. Ensure even-ish distribution (e.g. 3 Tech + 3 Design + 2 BIM, not 8 Tech + 1 Design + 1 BIM). Tag cross-domain projects. |
| **Hero with GSAP SplitText reveal** | ◐ **Adequate, not differentiating** | Common in 2026 — table stakes for "polished" portfolios, but no longer a wow factor. | Keep, but consider layering with a scramble effect or masked clip-path for an extra beat of differentiation. Don't make it the *hero of the hero*. The content (name + role + one-liner) matters more than the animation. |
| **Custom cursor desktop** | ⚠ **Anti-feature unless constrained** | 2026 accessibility consensus is against full-page custom cursors. Funka Foundation, multiple sources flag as exclusionary. | **Constrain or cut.** If kept: respect `prefers-reduced-motion` (disable), don't hide native cursor, only enhance on hover over interactive elements. Better alternative: contextual hover labels (e.g. "View →" on project card hover) without replacing the cursor at all. |
| **Konami code easter egg** | ✓ **Strong** | Still works in 2026 for the dev/gamer audience. Combined with the palette unlock = novel. | Keep. Add console hint to make it discoverable. |
| **ASCII art in console** | ✓ **Strong** | Cheap to do, big personality signal, expected in creative-dev portfolios. | Keep. **Suggest:** include link to portfolio's GitHub repo in console message + Konami hint. |
| **MDX-based project pages with image gallery** | ◐ **Adequate structure, missing narrative** | "Image gallery" is 2018-era project presentation. 2026 expects *case studies* (problem → process → outcome) with structured narrative. | **Augment:** add MDX content convention for case study structure (`<Hook>`, `<Problem>`, `<Process>`, `<Outcome>` components or just template guidance). Provide MDX template for the 6 demo projects that follows this structure. |
| **Bilingual FR/EN with route-based switcher** | ✓ **Correct approach** | Routes localisées `/fr` `/en` is SEO best practice. Header switcher is correct placement. | Keep. **Add:** locale persistence in cookie, native-language labels ("Français"/"English"), no flag icons, hreflang tags, per-locale OG metadata, plan for per-locale MDX content. |
| **Scroll horizontal sur section Projects en desktop (GSAP pin)** | ⚠ **High-risk, conflicts with other plans** | Mobile-broken (GSAP `pin: true` is notoriously unreliable on iOS Safari / Chrome Android in 2026). Conflicts with the project filter's `AnimatePresence` layout shift (you can't easily horizontal-pin a layout that re-flows on filter change). Scroll-jacking-adjacent. | **Demote to v1.x or cut.** Pick one: either filter+grid (already planned, better mobile UX) OR horizontal pin (more visual impact, fragile). Don't do both. v1 = standard grid with filter; v1.x revisit if you really want the pin. |
| **Parallaxe douce sur images projet via GSAP ScrollTrigger** | ◐ **OK with caveats** | Light parallax is fine. Heavy parallax = motion sickness. Must respect `prefers-reduced-motion`. | Keep, but make it subtle (max 50px translate over scroll), and gate on `prefers-reduced-motion`. |
| **Transitions de page Framer Motion AnimatePresence** | ✓ **Standard polish** | Common, expected, adds perceived quality. | Keep. Ensure exit animations are quick (< 250ms) — long exits frustrate users wanting to navigate. |
| **404 personnalisée avec animation et lien retour humoristique bilingue** | ✓ **Strong** | Personality reinforcement + technical correctness. | Keep. |
| **Lenis smooth scroll** | ✓ **Standard 2026 polish** | Expected on high-end portfolios. | Keep. **Must respect `prefers-reduced-motion` — disable Lenis (revert to native scroll) when set.** |

## Feature Dependencies

```
Palette System (ThemeProvider + culori + CSS variables)
    └──requires──> Tailwind on CSS variables (var(--color-*))
    └──requires──> Server/Client component split (ThemeProvider is "use client")
    └──enables──> Konami code secret palette
    └──enables──> Custom palette persistence (localStorage)
    └──enables──> WCAGBadge live ratio display

Bilingual System (next-intl)
    └──requires──> Routes localisées /fr /en
    └──requires──> messages/{fr,en}.json
    └──enables──> Per-locale MDX content
    └──enables──> Per-locale OG metadata
    └──enables──> Localized date formatting
    └──enables──> Bilingual 404 + console ASCII

Project Case Studies (MDX)
    └──requires──> Project frontmatter type (Project TS type)
    └──requires──> MDX loader (lib/projects.ts)
    └──requires──> Custom MDX components (Image zoom, CodeBlock, Callout)
    └──enables──> Project filter (categorize by frontmatter.category)
    └──enables──> Per-project OG image
    └──enables──> Per-locale variants

GSAP Animations (SplitText, ScrollTrigger, Parallax, Pin)
    └──requires──> useGSAP() hook for cleanup
    └──requires──> "use client" on animated components
    └──requires──> prefers-reduced-motion gate ← MISSING in current plan
    └──conflicts──> Lenis smooth scroll if not configured together (Lenis must drive ScrollTrigger)

Custom Cursor
    └──requires──> "use client" component
    └──requires──> prefers-reduced-motion gate ← MISSING in current plan
    └──requires──> Touch device detection (auto-disable)
    └──conflicts──> OS-level cursor accessibility (magnification, high-contrast) ← UNADDRESSED

Horizontal Scroll Pin (Projects)
    └──requires──> GSAP ScrollTrigger pin
    └──conflicts──> AnimatePresence filter transitions (layout incompatibility)
    └──conflicts──> Mobile reliability (iOS Safari, Chrome Android)
    └──conflicts──> Lenis (must coordinate scroll source)
    └──RECOMMENDATION──> CUT or DEFER to v1.x

3D Model Viewer (BIM projects) [NEW]
    └──requires──> @google/model-viewer OR Sketchfab embed iframe
    └──requires──> .glb/.gltf assets OR Sketchfab account
    └──enhances──> BIM project differentiation

CV PDF Download [NEW]
    └──requires──> cv-tanguy-{fr,en}.pdf in /public
    └──enhances──> Contact section
    └──enhances──> Hero CTA

prefers-reduced-motion Support [NEW — MUST ADD]
    └──affects──> GSAP timelines (disable or simplify)
    └──affects──> Lenis (disable, revert to native)
    └──affects──> Framer Motion (set reduceMotion="user")
    └──affects──> Custom cursor (disable)
    └──affects──> Parallax (disable)
    └──affects──> SplitText hero reveal (instant or fade)
```

### Dependency Notes

- **Palette System requires Tailwind on CSS variables:** Already a constraint. ✓ Without this, palette switcher can't change colors without rebuild.
- **GSAP animations require `prefers-reduced-motion` gate:** Currently missing from active list. This is a hard accessibility requirement in 2026 (WCAG 2.3.3, EU Accessibility Act). All GSAP, Lenis, Framer Motion, and Custom Cursor code must check `window.matchMedia('(prefers-reduced-motion: reduce)')`.
- **Horizontal Scroll Pin conflicts with AnimatePresence filter:** You cannot horizontally pin a section whose contents reshape on filter change — the pin calculations break. The current plan has both. **Pick one.**
- **Lenis must coordinate with GSAP ScrollTrigger:** Lenis hijacks scroll events. ScrollTrigger needs to know about Lenis's scroll progress. Use `lenis.on('scroll', ScrollTrigger.update)` or `gsap-ScrollTrigger`'s `scrollerProxy`. Without this, parallax and scroll-triggered animations stutter.
- **Custom Cursor conflicts with OS accessibility:** Users with cursor magnification or high-contrast cursor lose those settings when a custom cursor takes over. Not solvable for the OS-level case — only `prefers-reduced-motion` is detectable from CSS/JS.
- **MDX per-locale content:** If per-locale MDX files are not planned from day 1, retrofitting bilingual project content is painful (URL slugs, frontmatter duplication, image paths). **Decide and document NOW**.
- **CV PDF link enhances Contact:** Without it, the explicit goal "complément au CV PDF" is broken. Trivial to add.

## MVP Definition

### Launch With (v1)

Minimum viable product — everything needed to validate the portfolio as a credible hybrid Tech×Design×BIM showcase.

**Architecture & fondations (keep as planned):**
- [ ] Next.js 15 + React 19 + TypeScript strict
- [ ] Tailwind on CSS variables
- [ ] next-intl with `/fr` `/en` routes
- [ ] Bilingual frontmatter + per-locale MDX content (`{slug}.{locale}.mdx` OR translated frontmatter — decide)
- [ ] MDX project loader with Project type

**Palette system (signature — keep as planned):**
- [ ] 4 preset palettes + 5th Vaporwave secret
- [ ] Custom color picker
- [ ] Harmonic generator with live WCAG ratio display (prominent — not hidden)
- [ ] Auto-AA correction
- [ ] Persistence in localStorage
- [ ] Konami code to unlock Vaporwave (with confetti)
- [ ] FAB to open switcher
- [ ] Focus trap + keyboard nav

**Layout & content:**
- [ ] Hero with role + specialization + one-liner above the fold (content matters more than animation)
- [ ] Hero text reveal (GSAP SplitText — keep, but it's polish not signature)
- [ ] About section with bio bilingual (FR + EN)
- [ ] Project category filter (All / Tech / Design / BIM) with smooth FLIP/AnimatePresence layout transitions
- [ ] 6 MDX projects with case study structure (Hook → Problem → Process → Outcome) — 2 Tech, 2 Design, 2 BIM
- [ ] Project pages with custom MDX components (Image with zoom, CodeBlock, Callout)
- [ ] Skills section with stack badges color-coded by domain (Tech/Design/BIM)
- [ ] Contact section with email, GitHub, LinkedIn, **CV PDF download (FR + EN versions)**
- [ ] Footer with social + copyright bilingual
- [ ] Navigation with logo + section links + bilingual switcher (in header, native language labels, no flags)

**Bilingual specifics:**
- [ ] Locale persistence (cookie via next-intl)
- [ ] hreflang tags
- [ ] Per-locale OG metadata
- [ ] Per-locale CV PDF
- [ ] No silent auto-redirect on locale
- [ ] Localized date formatting (Intl.DateTimeFormat)

**Personality / easter eggs:**
- [ ] ASCII art bilingual in browser console with Konami hint + GitHub repo link
- [ ] Konami code unlocks Vaporwave palette
- [ ] 404 bilingual with humour + animation

**Accessibility (CRITICAL ADDITIONS):**
- [ ] **`prefers-reduced-motion` gate on ALL animation systems** (GSAP, Lenis, Framer Motion, Custom Cursor, parallax) — disable or simplify
- [ ] Custom cursor (desktop only) constrained: respect `prefers-reduced-motion`, don't hide native cursor, only enhance on hover over interactive elements
- [ ] Focus visible
- [ ] Keyboard nav complete (especially palette switcher)
- [ ] aria-labels on all interactive elements
- [ ] WCAG AA ratio guaranteed by palette system

**Polish:**
- [ ] Lenis smooth scroll (with `prefers-reduced-motion` opt-out)
- [ ] Framer Motion page transitions (short exits < 250ms)
- [ ] Light parallax on project hero images (with `prefers-reduced-motion` opt-out)
- [ ] ProjectCard hover animation (scale + image reveal + accent color)

**SEO & robustness:**
- [ ] `generateMetadata` per page with localized title/description/OG
- [ ] `sitemap.ts` with both locales
- [ ] `robots.ts`
- [ ] `loading.tsx`, `error.tsx`, `not-found.tsx`
- [ ] Images via `next/image` (WebP/AVIF, with `priority` on Hero image)
- [ ] Lighthouse 90+ all categories

**Deployment:**
- [ ] GitHub repo + Vercel
- [ ] Vercel Analytics + Speed Insights

### Add After Validation (v1.x)

Features to add after the portfolio is live and gathering feedback.

- [ ] **3D model viewer for 1-2 BIM projects** (`<model-viewer>` web component is simplest) — adds significant hybrid-profile differentiation but requires .glb assets and testing
- [ ] **PDF plan/drawing embed for 1-2 BIM projects** (`react-pdf` or high-res image with lightbox) — only if user has CAD/Revit exports to share
- [ ] **Before/after slider MDX component** — if 2+ projects benefit
- [ ] **Video reel embed MDX component** (YouTube/Vimeo or self-hosted MP4) — define once, use per-project
- [ ] **Cross-domain combo tag** (e.g. "Tech + Design") for projects spanning multiple domains
- [ ] **Horizontal scroll pin on Projects section** (only if v1 grid feels stale AND mobile-safe implementation is verified)
- [ ] **Layered hero reveal** (split + scramble or split + masked clip-path) for extra differentiation if SplitText alone feels flat
- [ ] **Per-project Open Graph image generation via Vercel OG** (dynamic, per slug)
- [ ] **Testimonials / quotes from collaborators** if any are available (placed on About or Contact section)

### Future Consideration (v2+)

Features to defer until product-market fit (= portfolio is landing interviews/clients).

- [ ] **Blog / articles** (already excluded — keep excluded until there's actually something to write)
- [ ] **Three.js custom 3D scene** (vs Sketchfab embed) for a hero BIM/architecture visualization
- [ ] **Analytics dashboard for content performance** (which projects are viewed most, which language, etc.)
- [ ] **Newsletter / RSS** (only if blog ships)
- [ ] **Live "now" / "uses" pages** (developer convention — niche, useful only for indie-hacker audience)
- [ ] **WebGL background visual on Hero** (only if palette switcher proves to need a stronger visual anchor)
- [ ] **Multi-locale beyond FR/EN** (only if international audience proves it)
- [ ] **Contact form with backend** (only if mailto proves insufficient)
- [ ] **CMS migration** (only if project count exceeds ~30 — currently 6-10 makes MDX correct)

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Palette system (presets + custom + harmonic + WCAG live) | HIGH | XL | P1 |
| Project case study narrative structure (problem→process→outcome) | HIGH | M | P1 |
| Project category filter (Tech/Design/BIM) | HIGH | S | P1 |
| Bilingual FR/EN with route-based switcher | HIGH | M | P1 |
| Per-locale MDX content | HIGH | M | P1 |
| CV PDF download (FR + EN) | HIGH | XS | P1 |
| `prefers-reduced-motion` support everywhere | HIGH | S | P1 |
| Hero with role + specialization above fold | HIGH | S | P1 |
| Skills with color-coded domain badges | HIGH | S | P1 |
| Konami code + ASCII console | MEDIUM | S | P1 |
| 5 MDX project case studies (2T + 2D + 2B minimum, ideally 8-10) | HIGH | L | P1 |
| Hreflang + per-locale OG | MEDIUM | S | P1 |
| Lenis smooth scroll | MEDIUM | S | P1 |
| GSAP SplitText hero reveal | MEDIUM | S | P1 |
| Framer Motion page transitions | MEDIUM | M | P1 |
| Custom cursor (CONSTRAINED) | LOW | S | P2 (or cut) |
| Horizontal scroll pin on Projects | LOW | M | P2 (defer) or CUT |
| 3D model viewer for BIM projects | HIGH (BIM differentiation) | M | P2 (v1.x) |
| PDF plan embed for BIM projects | MEDIUM | M | P2 (v1.x, if assets exist) |
| Before/after slider | MEDIUM | S | P2 (v1.x) |
| Video reel embed | MEDIUM | S | P2 (v1.x) |
| Parallax on project images | LOW | S | P2 |
| Cross-domain combo tags | MEDIUM | XS | P2 |
| Testimonials | MEDIUM | S | P2 |
| Per-project dynamic OG (Vercel OG) | MEDIUM | M | P2 |
| Blog | LOW (v1) | L | P3 |
| Newsletter | LOW | L | P3 |
| Contact form | LOW | M | P3 |

**Priority key:**
- **P1**: Must have for v1 launch. Missing = portfolio incomplete or broken.
- **P2**: Should have soon after v1. Adds differentiation, can be added incrementally.
- **P3**: Future consideration. Defer until validated need.

## Competitor Feature Analysis

| Feature | Pure-dev portfolios (e.g. Awwwards dev) | Pure-design portfolios (e.g. Awwwards creative) | Architecture/BIM portfolios | This Portfolio's Approach |
|---------|------------------------------------------|--------------------------------------------------|------------------------------|---------------------------|
| **Theme switcher** | Dark/light toggle (table stakes) | Often single-theme by intent | Rarely customizable | 4 preset palettes + custom picker + harmonic generator with WCAG (signature, design-system-as-product) |
| **Project showcase** | Code-heavy, GitHub links, live demos | Image-heavy, hover-reveal, often hidden code | High-res renders, PDFs, plans | MDX case studies (problem→process→outcome) + image gallery + filterable by domain |
| **Project filter** | By stack (React, Node, etc.) | By type (Web, Print, Branding) | By project type (Residential, Commercial) | By domain (Tech / Design / BIM) — reinforces hybrid positioning |
| **3D / interactive media** | WebGL hero or Three.js demo | Often Lottie, sometimes WebGL | Static renders + occasional embedded VR tour | Sketchfab/model-viewer embed for BIM projects (v1.x) |
| **Animations** | GSAP/Framer Motion baseline | Heavy GSAP, sometimes scroll-jacking | Often static, slideshow-style | GSAP + Lenis + Framer Motion (with `prefers-reduced-motion`) — measured, not maximalist |
| **Easter eggs** | Common (Konami, console ASCII) | Rare | Almost never | Konami code unlocks Vaporwave palette + console ASCII bilingual — leans into dev/creative crossover |
| **Bilingual support** | Rare (English-only default) | Occasional | More common (FR architects often EN/FR) | Full bilingual FR/EN with route-based switcher, per-locale OG, per-locale MDX, native-language labels |
| **CV / About / Contact** | GitHub-prominent, sometimes Calendly | Visual bio, big email link | PDF CV download common | Bilingual PDF CV + email + GitHub + LinkedIn + ASCII console signature |
| **Performance** | Fast (devs care about Lighthouse) | Often slow (image-heavy, animation-heavy) | Variable | Lighthouse 90+ as constraint, Vercel Speed Insights |
| **Accessibility** | Variable (often weak) | Often weak (motion-heavy, low contrast) | Often weak (PDF-heavy, no alt text) | WCAG AA guaranteed by palette + `prefers-reduced-motion` + keyboard nav + focus trap on palette switcher |
| **Personality / brand** | Restrained, technical | Strong visual brand | Restrained, professional | Creative-dev hybrid: easter eggs + palette playground + bilingual humour |

## Critical Additions to Active Requirements

Translate the most important gaps from this research into requirements the user should add to PROJECT.md.

**Add to Architecture & fondations:**
- [ ] Plan for per-locale MDX content (`content/projects/{slug}.{fr,en}.mdx`) OR translated frontmatter convention — decide before writing project content

**Add to Easter eggs & personnalité:**
- [ ] Include link to portfolio GitHub repo in console ASCII art message (invites code review)

**Add to Sections homepage / Contenu projets:**
- [ ] Hero copy must include name + role + bilingual specialization line (e.g. "Tanguy — Dev × Designer × BIM") above the fold
- [ ] MDX project template convention: Hook → Problem → Process → Outcome (provide as default structure in all 6 demo MDX files)
- [ ] Project frontmatter includes `category: 'tech' | 'design' | 'bim'` AND optional `crossover: string[]` for multi-domain tags
- [ ] CV PDF download in Contact section (FR + EN PDFs in `/public/cv-tanguy-{fr,en}.pdf`)
- [ ] Stack badges in Skills section color-coded by domain (Tech / Design / BIM)

**Add to SEO, accessibilité, robustesse:**
- [ ] **`prefers-reduced-motion` media query gate on ALL animation systems** — GSAP timelines disable or simplify, Lenis disables (revert to native scroll), Framer Motion uses `reduceMotion="user"`, parallax disabled, custom cursor disabled
- [ ] Custom cursor constraints: only enhance on hover over interactive elements, native cursor remains visible, auto-disable on touch and on `prefers-reduced-motion`
- [ ] hreflang tags per page in `generateMetadata`
- [ ] Per-locale OG metadata (title, description, image)
- [ ] Sitemap includes both `/fr/*` and `/en/*` URLs
- [ ] Language switcher uses native-language labels ("Français" / "English"), no flag icons

**Reconsider in active list:**
- [ ] **Scroll horizontal sur section Projects en desktop (GSAP pin)** — cut from v1, move to v1.x. Conflicts with the AnimatePresence filter (you can't pin a layout that re-flows on filter change) and mobile-unreliable. Pick standard grid for v1.
- [ ] **CustomCursor desktop** — keep only with all constraints above; consider replacing with contextual hover labels ("View →" on cards) which achieve the same craft-signal without accessibility tradeoffs

**Optional v1.x additions:**
- [ ] 3D model viewer for 1-2 BIM projects (`<model-viewer>` is lowest-risk)
- [ ] Before/after slider MDX component
- [ ] Video reel embed MDX component

## Sources

- [Developer Portfolio Templates: Build a Stunning Portfolio Website That Gets You Hired in 2026 — Templifica](https://templifica.com/blog/developer-portfolio-templates-creating-a-job-winning-portfolio)
- [10 portfolio templates I would actually clone in 2026 — DEV Community](https://dev.to/designtocodes/10-portfolio-templates-i-would-actually-clone-in-2026-nextjs-react-html-phc)
- [Developer Portfolio Guide 2026: Build a Portfolio That Gets Hired — Hakia](https://hakia.com/skills/building-portfolio/)
- [How to Build a Developer Portfolio That Gets You Hired in 2026 — Curious](https://curious.page/blog/how-to-build-developer-portfolio-gets-hired)
- [Portfolio design trends for 2026: From AI builds to gamified portfolios — Envato](https://elements.envato.com/learn/portfolio-trends)
- [100 Best Designer Portfolio Websites of 2026 — Muzli Blog](https://muz.li/blog/top-100-most-creative-and-unique-portfolio-websites-of-2025/)
- [The Anthology of a Creative Developer: A 2026 Portfolio — DEV Community](https://dev.to/nk2552003/the-anthology-of-a-creative-developer-a-2026-portfolio-56jp)
- [Portfolio Mistakes Designers Still Make in 2026 — Muzli Blog](https://muz.li/blog/portfolio-mistakes-designers-still-make-in-2026/)
- [How Scrolljacking Breaks UX Fundamentals — Web Designer Depot](https://webdesignerdepot.com/how-scrolljacking-breaks-ux-fundamentals/)
- [Scrolljacking 101 — NN/G](https://www.nngroup.com/articles/scrolljacking-101/)
- [Avoid scrolljacking — Webflow Accessibility Checklist](https://webflow.com/accessibility/checklist/task/avoid-scrolljacking)
- [When design kills usability – meet the custom cursor — Funka Foundation](https://stiftelsenfunka.org/whats-up/free-friday-webinars/when-design-kills-usability-meet-the-custom-cursor/)
- [The curse of the custom cursor — Funka Foundation](https://stiftelsenfunka.org/about-us/columns/the-curse-of-the-custom-cursor/)
- [Custom Cursor Accessibility — David Bushell](https://dbushell.com/2025/10/27/custom-cursor-accessibility/)
- [Understanding Success Criterion 2.3.3: Animation from Interactions — W3C](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html)
- [Using prefers-reduced-motion to prevent motion — W3C](https://www.w3.org/WAI/WCAG22/Techniques/css/C39)
- [How to Make Your UI Accessible: Practical Checklist for 2026 — Muzli Blog](https://muz.li/blog/how-to-make-your-ui-accessible-a-practical-checklist-for-2026/)
- [Architecture Portfolio Website Guide — Best Platforms 2026 — Fast.io](https://fast.io/resources/architecture-portfolio-website/)
- [Showcase your BIM data in the Building Viewer — Esri](https://www.esri.com/arcgis-blog/products/js-api-arcgis/3d-gis/showcase-your-bim-data-in-the-building-viewer)
- [Embed Sketchfab — Portfoliobox](https://www.portfoliobox.com/learn/embed-sketchfab)
- [Personal Portfolio including Architectural models and 3D WebDev — three.js forum](https://discourse.threejs.org/t/personal-portfolio-including-architectural-models-and-3d-webdev/53182)
- [Multilingual Website Design: The Complete Guide — better-i18n](https://better-i18n.com/en/blog/multilingual-website-design/)
- [Next.js Internationalization Guide for Multilingual Sites 2026 — Krishang](https://www.krishangtechnolab.com/blog/next-js-internationalization-multilingual-websites-guide/)
- [Website Language Selector: Tips, Best Practices, & Examples — Weglot](https://www.weglot.com/blog/website-language-selector)
- [Best Practices for Designing a Language Button — Weglot](https://www.weglot.com/blog/best-practices-for-designing-a-language-button)
- [Language switching UI/UX on multilingual sites — Robert Jelenic](https://www.robertjelenic.com/language-switching-ui-ux-on-multilingual-sites/)
- [The Ultimate UX Case Study Template & Structure (2026 Guide) — uxfol.io](https://blog.uxfol.io/ux-case-study-template/)
- [How to Write UX Case Studies That Land You Job (2026) — UX Playbook](https://uxplaybook.org/articles/ux-case-study-minto-pyramid-structure-guide)
- [Portfolio Case Study Examples Guide 2026 — InfluenceFlow](https://influenceflow.io/resources/portfolio-case-study-examples-the-complete-2026-guide-for-creative-professionals/)
- [GSAP ScrollTrigger pin: true Nearly Broke My Portfolio — DEV Community](https://dev.to/xuanhai0913/gsap-scrolltrigger-pin-true-nearly-broke-my-portfolio-heres-what-i-learned-28i7)
- [ScrollTrigger Documentation — GSAP](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- [GSAP Text Animation: A Practical SplitText Guide (2026) — Annnimate](https://www.annnimate.com/blog/gsap-text-animation-splittext-guide)
- [Joffrey Spitzer Portfolio: Minimalist Astro + GSAP Build — Codrops](https://tympanus.net/codrops/2026/02/18/joffrey-spitzer-portfolio-a-minimalist-astro-gsap-build-with-reveals-flip-transitions-and-subtle-motion/)
- [Largest Contentful Paint (LCP) — web.dev](https://web.dev/articles/lcp)
- [What is LCP in Core Web Vitals? A 2026 Guide — 12AM Agency](https://12amagency.com/blog/what-is-lcp-in-core-web-vitals/)
- [Open Graph Tags: Boost Social Sharing and SEO in 2026 — iMark Infotech](https://www.imarkinfotech.com/open-graph-tags-boost-social-sharing-and-seo-in-2026/)
- [Open Graph Protocol: Complete Social Sharing Guide (2026) — env.dev](https://env.dev/guides/opengraph)
- [Portfolio Links on Your Resume: 7 Tips for 2026 — WahResume](https://www.wahresume.com/blog/revolutionize-your-resume-with-portfolio-links-a-2026-guide)
- [Easter Eggs in Applications — Konami Code, ASCII art — Codementor](https://www.codementor.io/blog/coding-easter-eggs-1bn648969s)
- [Build a Blog or Portfolio Website using Next.js and MDX — DevGalaktika](https://devgalaktika.vercel.app/blog/nextjs-mdx-blog-portfolio-website)
- [Best Color Palettes for Developer Portfolios (2025) — WebPortfolios.dev](https://www.webportfolios.dev/blog/best-color-palettes-for-developer-portfolio)
- [Changing colors and color palettes — Journo Portfolio](https://help.journoportfolio.com/v2/design/changing-colors-and-color-palettes)

---
*Feature research for: bilingual creative personal portfolio (hybrid Tech × Design × BIM)*
*Researched: 2026-05-25*

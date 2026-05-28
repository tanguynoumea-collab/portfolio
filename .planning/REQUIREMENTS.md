# Requirements: tanguy-portfolio

**Defined:** 2026-05-25
**Core Value:** Démontrer le profil créatif hybride Tech/Design/BIM via une expérience web personnalisable qui prouve la maîtrise technique, le sens du design et l'attention aux détails — un portfolio qui est lui-même une démo vivante de ce que je sais faire.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Architecture & Foundations

- [x] **ARCH-01**: Le projet est scaffolded avec Next.js 16 (App Router) + React 19.2 + TypeScript strict via `create-next-app@latest`, et `npm run dev` démarre sans erreur
- [x] **ARCH-02**: ESLint flat config + Prettier sont opérationnels (`npm run lint` passe sans warning), et la structure de dossiers (`app/`, `components/`, `components/sections/`, `components/theme/`, `components/providers/`, `lib/`, `content/projects/`, `messages/`, `public/`) existe
- [x] **ARCH-03**: Tailwind CSS v4 est configuré avec un bloc `@theme {}` en CSS qui référence des CSS variables OKLCh déclarées en `:root` (toutes les couleurs via `var(--color-*)`, aucune couleur hardcodée dans `@theme`)
- [x] **ARCH-04**: Le fichier `app/globals.css` déclare les CSS variables `--color-bg`, `--color-surface`, `--color-text`, `--color-text-muted`, `--color-accent`, `--color-secondary` et applique une transition globale 400ms sur `color, background-color, border-color`
- [x] **ARCH-05**: shadcn/ui est initialisé via `npx shadcn@latest init`, et les 7 composants `button`, `card`, `dialog`, `slider`, `switch`, `popover`, `tabs` sont installés et utilisent les CSS variables du palette system (aliasing fait dans `globals.css`)
- [x] **ARCH-06**: next-intl v4.12 est configuré avec `routing.ts` + `request.ts` + `proxy.ts` (Next 16), les routes localisées `/fr/*` et `/en/*` fonctionnent, et `/` redirige vers la locale appropriée
- [x] **ARCH-07**: Les fichiers `messages/fr.json` et `messages/en.json` existent avec une structure complète couvrant nav, hero, about, projects, skills, contact, footer, palette switcher, 404
- [x] **ARCH-08**: `lib/projects.ts` expose un type discriminé `Project = TechProject | DesignProject | BIMProject` (chaque variante avec metadata domain-spécifique : Tech.stack, Design.tools, BIM.software+projectScale) et un loader `getProjects(locale)` lit les MDX via `@next/mdx` + `gray-matter` + `compileMDX`
- [x] **ARCH-09**: Le repo git est initialisé avec un `.gitignore` adapté (next, node_modules, .env*.local, .DS_Store, .vercel)

### Theme System (signature feature)

- [x] **THEME-01**: `lib/palettes.ts` exporte 5 palettes typées en OKLCh : `terra` (Terra & Sage), `nordic` (Atelier Nordique), `bauhaus` (Bauhaus Bright), `ocean` (Ocean Studio), `vaporwave` (secrète, "???") avec name + tous les tokens (bg, surface, text, textMuted, accent, secondary), toutes pré-validées WCAG AA
- [x] **THEME-02**: `lib/colors.ts` expose `wcagContrast(c1, c2)` (ratio numérique), `adjustForAA(textColor, bgColor)` (ajuste la luminosité du text en OKLCh pour atteindre 4.5:1), et `validateFullMatrix(palette)` qui vérifie les 7 paires (text/bg, text/surface, textMuted/bg, textMuted/surface, accent/bg, accent/surface, secondary/bg) en retournant {valid, failures}
- [x] **THEME-03**: `lib/colors.ts` expose `generateHarmonic(mode, sourceColor)` qui supporte les 4 modes `complementary` (+180°), `triadic` (+120°/+240°), `analogous` (±30°), `split-complementary` (+150°/+210°) via rotation hue OKLCh, et retourne une `Palette` validée (auto-adjust text via `adjustForAA` si besoin)
- [x] **THEME-04**: `ThemeProvider` (client) wraps l'app, gère la palette active via Context, applique les CSS variables sur `:root`, expose `usePalette()` retournant `{ palette, paletteId, setPreset, setCustomColor, setHarmonic, isCustom }`, et persiste dans localStorage
- [x] **THEME-05**: Un script inline injecté dans `<head>` via `next/script` `strategy="beforeInteractive"` lit localStorage et applique les CSS vars sur `:root` AVANT hydratation (zéro FOUC visible sur cold load avec palette non-default)
- [x] **THEME-06**: `PalettePresets` affiche 4 mini-aperçus carrés cliquables (terra/nordic/bauhaus/ocean — vaporwave reste cachée), avec animation motion sur sélection et indicateur visuel de la palette active
- [x] **THEME-07**: `CustomColorPicker` propose 3 inputs HSL (bg, accent, secondary) avec preview live, met à jour la palette via `setCustomColor`, et auto-régénère les autres tokens manquants via les helpers de `lib/colors.ts`
- [x] **THEME-08**: `HarmonicGenerator` propose un color picker source + sélecteur de mode (4 onglets) + bouton `Generate`, affiche un preview de la palette résultante avant application
- [x] **THEME-09**: `WCAGBadge` affiche en temps réel le ratio (numérique avec 2 décimales) + statut `AA` / `AAA` / `Fail` avec icône colorée (vert/or/rouge), et update instantanément quand la palette change
- [x] **THEME-10**: `PaletteSwitcher` est un panneau coulissant droite (Dialog ou Sheet shadcn) avec 3 onglets `Presets` / `Custom` / `Generate` et est navigable au clavier (Tab, Esc, focus trap)
- [x] **THEME-11**: Un FAB bottom-right (icône palette animée motion) ouvre le `PaletteSwitcher`, visible sur toutes les pages, avec aria-label localisé FR/EN
- [x] **THEME-12**: Un hook `useKonamiCode()` écoute la séquence ↑↑↓↓←→←→BA (avec filtrage : ne déclenche pas si un input/textarea/contentEditable a le focus), débloque la palette `vaporwave` dans `ThemeProvider` et déclenche une animation confetti

### Layout & Core Components

- [x] **LAYOUT-01**: `app/[locale]/layout.tsx` (Server Component) wraps les pages avec le ThemeProvider (Client) + LenisProvider (Client) + IntlProvider (Client) + font custom via `next/font/google` (e.g. Inter ou Geist) + métadonnées de base
- [x] **LAYOUT-02**: `LenisProvider` (client) initialise Lenis avec `autoRaf: false`, l'enregistre dans `gsap.ticker` (un seul rAF partagé Lenis + GSAP), appelle `ScrollTrigger.refresh()` après changements de layout, et expose le scroll natif pour les éléments avec `data-lenis-prevent` (modales/dialogs)
- [x] **LAYOUT-03**: `Navigation` fixe en haut avec logo, liens vers sections (#about, #projects, #contact) traduits, et `LanguageSwitcher` — le PaletteSwitcher est en FAB séparé (pas dans la nav)
- [x] **LAYOUT-04**: `Footer` bilingue avec liens sociaux (GitHub, LinkedIn, email avec `mailto:`), copyright dynamique avec année, et mention "Built with Next.js + ❤️"
- [x] **LAYOUT-05**: `LanguageSwitcher` toggle FR/EN avec labels natifs ("FR" / "EN", pas de drapeaux), animation motion, met à jour l'URL via `router.replace` + le `<html lang>` attribute imperativement, avec `aria-label` localisé
- [ ] **LAYOUT-06**: `CustomCursor` (desktop only, `pointer: fine` + non-touch + non-reduced-motion) suit la souris en motion, change de couleur en fonction de `--color-accent`, et se cache automatiquement sur les zones interactives nativement

### Homepage Sections

- [x] **HOME-01**: Section `Hero` avec révélation de texte via GSAP SplitText (chars stagger), nom + role bilingue ("Tech × Design × BIM" / "Tech × Design × BIM"), visible au-dessus du fold, dans un `useGSAP()` hook avec scope et cleanup auto
- [x] **HOME-02**: Section `About` avec photo (next/image), bio bilingue (2-3 paragraphes), révélation au scroll via ScrollTrigger (fade + translate-y), respecte `prefers-reduced-motion`
- [x] **HOME-03**: `CategoryFilter` propose 4 boutons (`All` / `Tech` / `Design` / `BIM`) localisés, gère l'état actif via React state, met à jour la grille Projects via prop
- [x] **HOME-04**: `ProjectCard` affiche cover + title + year + category badge color-coded par domaine, avec hover motion (scale subtil + image reveal + couleur accent animée), lien vers la page détail `/{locale}/projects/{slug}`
- [x] **HOME-05**: Section `Projects` rend une grille filtrable de `ProjectCard` avec motion `AnimatePresence mode="popLayout"` pour les transitions de filter, layout shift fluide, et empty state si aucun projet ne match
- [x] **HOME-06**: Section `Skills` affiche des badges groupés par domaine (Tech/Design/BIM) avec stagger GSAP au scroll, badges color-coded par catégorie
- [x] **HOME-07**: Section `Contact` propose email avec copy-to-clipboard animé (motion feedback), liens GitHub + LinkedIn, **et 2 boutons de téléchargement du CV PDF** (FR + EN) pointant vers `/cv-fr.pdf` et `/cv-en.pdf`

### Project Content (MDX)

- [x] **CONTENT-01**: 6 projets × 2 locales = 12 fichiers MDX dans `content/projects/` au format `{slug}.{fr|en}.mdx` (2 Tech : ex. `texture-manager`, `agora` ; 2 Design : à définir ; 2 BIM : à définir), avec frontmatter discriminé par catégorie
- [x] **CONTENT-02**: La page projet `app/[locale]/projects/[slug]/page.tsx` rend le MDX via `compileMDX`, génère statiquement via `generateStaticParams(locale × slug)`, et affiche le frontmatter (title, year, category, metadata domain-spécifique) + galerie d'images + contenu MDX
- [x] **CONTENT-03**: `mdx-components.tsx` fournit les composants custom : `Image` (avec zoom modal), `CodeBlock` (highlighting via rehype-pretty-code), `Callout` (variants info/warning/note avec border-left coloré par variant)

### Animations Avancées

- [ ] **ANIM-01**: `app/template.tsx` wraps chaque page avec motion `AnimatePresence mode="popLayout"` pour transitions de route (fade + petite translation), durée ≤ 350ms
- [x] **ANIM-02**: Parallaxe douce sur les images projet (factor ≈ 0.3) via GSAP ScrollTrigger dans `useGSAP()` hooks, respecte `prefers-reduced-motion`

### Easter Eggs & Personality

- [ ] **EGG-01**: ASCII art bilingue (différent par locale) imprimé dans la console navigateur au chargement (via un effet client dans le layout root) avec hint subtil "↑↑↓↓←→←→BA" sans dire ce que ça débloque
- [x] **EGG-02**: Page 404 personnalisée (`app/[locale]/not-found.tsx`) avec animation motion d'arrivée, message humoristique bilingue, lien retour vers `/{locale}` stylé

### SEO, A11y, Robustness

- [x] **A11Y-01**: `generateMetadata` par page (root + projects + 404) avec title, description, og:image, og:locale, hreflang alternates pour FR/EN
- [x] **A11Y-02**: `app/sitemap.ts` génère un sitemap couvrant `/`, `/fr`, `/en`, `/fr/projects/{slug}`, `/en/projects/{slug}`, et `app/robots.ts` autorise tout sauf `/api/*`
- [x] **A11Y-03**: `loading.tsx`, `error.tsx`, `not-found.tsx` existent au minimum à `app/[locale]/`, et `error.tsx` propose un bouton "Reset" via Server Actions
- [x] **A11Y-04**: Audit a11y manuel et automatisé : focus visible sur tous les interactifs, aria-labels sur boutons icon-only, contraste WCAG AA garanti par le ThemeProvider (auto-adjust), navigation clavier complète (Tab cycle complet, Esc ferme dialogs, focus trap dans PaletteSwitcher), axe-core 0 erreur
- [x] **A11Y-05**: `prefers-reduced-motion` respecté sur toutes les animations (GSAP + motion + CustomCursor + Lenis disabled si reduced), via une utility `usePrefersReducedMotion()` ou via `gsap.matchMedia()`
- [x] **A11Y-06**: Toutes les images via `next/image` avec `width`/`height` explicites, formats WebP/AVIF auto, lazy-loading par défaut (sauf cover Hero/above-fold avec `priority`)
- [x] **A11Y-07**: Test de robustesse du palette switcher : les 4 presets passent l'audit a11y, et 10 palettes générées aléatoirement (via `generateHarmonic` avec sources random) ne cassent aucun layout ni accessibilité
- [x] **A11Y-08**: Lighthouse ≥ 90 sur Performance, Accessibility, Best Practices, SEO en mode mobile sur la homepage déployée Vercel

### Deployment

- [x] **DEPLOY-01**: Le repo GitHub `tanguynoumea/portfolio` existe (public ou privé), avec README.md de base, et `main` contient le code production
- [x] **DEPLOY-02**: Vercel est connecté au repo via l'intégration GitHub, déploie automatiquement sur push `main`, et l'URL de production est accessible (live: https://detportfolio.vercel.app)
- [x] **DEPLOY-03**: `@vercel/analytics` et `@vercel/speed-insights` sont installés et actifs en production (Web Vitals trackés, pas de leak d'env vars NEXT_PUBLIC_ sensibles)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Content Expansion

- **CONTENT-v2-01**: Blog / writing section avec MDX posts et flux RSS
- **CONTENT-v2-02**: Section dédiée aux outils / open-source projects (mini-cards séparées des projets clients)

### BIM Showcase

- **BIM-v2-01**: 3D model viewer pour les projets BIM (three.js / model-viewer) — nécessite les assets source

### Interactivité

- **HOME-v2-01**: Scroll horizontal sur Projects en desktop (GSAP pin) — re-évaluer si valeur ajoutée prouvée
- **THEME-v2-01**: Export/import de palette personnalisée (URL share, JSON download)
- **THEME-v2-02**: Palette switcher avec preview avant application

### Audience-specific

- **CONTACT-v2-01**: Formulaire de contact avec backend (Vercel Function + email API) si volume mailto: insuffisant
- **NEWSLETTER-v2-01**: Newsletter / mailing list si le blog se développe

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Dark mode binaire (toggle dark/light) | Remplacé par le système de palettes personnalisables (Vaporwave + palettes custom couvrent les modes sombres) |
| Scroll horizontal sur Projects en desktop (v1) | Casse les gestures mobile, conflit avec AnimatePresence du filter, complexité disproportionnée vs valeur en v1 |
| Backend / API custom | Site statique, déploiement Vercel suffit, aucune logique serveur en v1 |
| CMS pour les projets | MDX dans le repo, source de vérité = git, pas besoin de CMS pour 6-10 projets |
| Formulaire de contact backend (v1) | Contact via `mailto:` et liens sociaux suffit |
| Système de commentaires | Hors valeur pour un portfolio personnel |
| Authentification utilisateur | Site public, aucun compte requis |
| E-commerce | Hors scope total |
| App mobile native | Web responsive mobile-first uniquement |
| Tests automatisés exhaustifs (E2E + unit complets) | Pas critique pour un portfolio personnel, audit manuel + Lighthouse + axe-core suffisent en v1 |
| Intégrations API tierces (feed Twitter, Instagram, etc.) | Aucune dépendance externe en v1 |
| Cursor takeover (cache complètement le curseur natif) | Anti-pattern UX, casse les attentes du pointeur |
| Autoplay sound ou unmute prompts | Anti-pattern, hostile à l'utilisateur |
| Loader > 1s sur cache chaud | Coûte la perception de performance |

## Traceability

Populated by `gsd-roadmapper` on 2026-05-25.

| Requirement | Phase | Status |
|-------------|-------|--------|
| ARCH-01 | Phase 1 | Complete |
| ARCH-02 | Phase 1 | Complete |
| ARCH-03 | Phase 1 | Complete |
| ARCH-04 | Phase 1 | Complete |
| ARCH-05 | Phase 1 | Complete |
| ARCH-06 | Phase 1 | Complete |
| ARCH-07 | Phase 1 | Complete |
| ARCH-08 | Phase 1 | Complete |
| ARCH-09 | Phase 1 | Complete |
| THEME-01 | Phase 2 | Complete |
| THEME-02 | Phase 2 | Complete |
| THEME-03 | Phase 2 | Complete |
| THEME-04 | Phase 2 | Complete |
| THEME-05 | Phase 2 | Complete |
| THEME-06 | Phase 2 | Complete |
| THEME-07 | Phase 2 | Complete |
| THEME-08 | Phase 2 | Complete |
| THEME-09 | Phase 2 | Complete |
| THEME-10 | Phase 2 | Complete |
| THEME-11 | Phase 2 | Complete |
| THEME-12 | Phase 2 | Complete |
| LAYOUT-01 | Phase 3 | Complete |
| LAYOUT-02 | Phase 3 | Complete |
| LAYOUT-03 | Phase 3 | Complete |
| LAYOUT-04 | Phase 3 | Complete |
| LAYOUT-05 | Phase 3 | Complete |
| LAYOUT-06 | Phase 3 | Pending |
| HOME-01 | Phase 4 | Complete |
| HOME-02 | Phase 4 | Complete |
| HOME-03 | Phase 4 | Complete |
| HOME-04 | Phase 4 | Complete |
| HOME-05 | Phase 4 | Complete |
| HOME-06 | Phase 4 | Complete |
| HOME-07 | Phase 4 | Complete |
| CONTENT-01 | Phase 5 | Complete |
| CONTENT-02 | Phase 5 | Complete |
| CONTENT-03 | Phase 5 | Complete |
| ANIM-01 | Phase 3 | Pending |
| ANIM-02 | Phase 5 | Complete |
| EGG-01 | Phase 3 | Pending |
| EGG-02 | Phase 6 | Complete |
| A11Y-01 | Phase 6 | Complete |
| A11Y-02 | Phase 6 | Complete |
| A11Y-03 | Phase 6 | Complete |
| A11Y-04 | Phase 6 | Complete |
| A11Y-05 | Phase 6 | Complete |
| A11Y-06 | Phase 6 | Complete |
| A11Y-07 | Phase 6 | Complete |
| A11Y-08 | Phase 6 | Complete |
| DEPLOY-01 | Phase 7 | Complete |
| DEPLOY-02 | Phase 7 | Complete |
| DEPLOY-03 | Phase 7 | Complete |

**Coverage:**
- v1 requirements: 52 total (header previously listed 51 — actual REQ-ID count is 52)
- Mapped to phases: 52 ✓
- Unmapped: 0 ✓

**Per-phase distribution:**

| Phase | Requirements | Count |
|-------|--------------|-------|
| Phase 1 — Foundations | ARCH-01..09 | 9 |
| Phase 2 — Palette System | THEME-01..12 | 12 |
| Phase 3 — Layout & Animation Foundation | LAYOUT-01..06, ANIM-01, EGG-01 | 8 |
| Phase 4 — Homepage Sections | HOME-01..07 | 7 |
| Phase 5 — Project Content Pipeline | CONTENT-01..03, ANIM-02 | 4 |
| Phase 6 — SEO, Accessibility & Polish | A11Y-01..08, EGG-02 | 9 |
| Phase 7 — Deployment | DEPLOY-01..03 | 3 |
| **Total** | | **52** |

---
*Requirements defined: 2026-05-25*
*Last updated: 2026-05-25 after roadmap creation (52 REQ-IDs mapped to 7 phases with 100% coverage)*

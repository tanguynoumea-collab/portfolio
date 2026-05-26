# Portfolio Tanguy (`tanguy-portfolio`)

## What This Is

Portfolio personnel bilingue FR/EN servant de complément au CV PDF, présentant un profil hybride **Tech (dev) × Design (créatif) × BIM (architecture)**. Le site expose 6 à 10 projets personnels filtrables par catégorie, avec un ton créatif assumé et des easter eggs. Sa **feature signature** est un système de palettes interactif (4 presets + custom color picker + génération harmonique avec contrôle WCAG temps réel + palette secrète Vaporwave déblocable via Konami code) qui permet à chaque visiteur de personnaliser le thème en live.

## Core Value

Démontrer le profil créatif hybride Tech/Design/BIM via une expérience web personnalisable qui **prouve la maîtrise technique, le sens du design et l'attention aux détails** — un portfolio qui est lui-même une démo vivante de ce que je sais faire.

## Requirements

### Validated

**Validated in Phase 1: Foundations (2026-05-26)** — 5 plans, 15 commits, all 9 ARCH REQs satisfied, score 5/5 on phase verification.

- [x] Projet **Next.js 16** (App Router + React 19.2 + TypeScript strict) initialisé via `create-next-app@latest` — `proxy.ts` (Next 16), `params` async, Turbopack par défaut [ARCH-01]
- [x] ESLint flat config + Prettier + structure de dossiers (app, components, lib, content, messages, public) [ARCH-02]
- [x] shadcn/ui initialisé via `npx shadcn@latest init` (style `radix-nova` en 2026, umbrella `radix-ui@^1.4.3`) avec 7 composants : button, card, dialog, slider, switch, popover, tabs [ARCH-05]
- [x] **Tailwind CSS v4** configuré avec `@theme {}` en CSS (pas de `tailwind.config.ts`) — toutes les couleurs via `var(--color-*)` déclarées en OKLCh dans `:root` [ARCH-03]
- [x] `globals.css` avec CSS variables de couleurs (OKLCh, palette Terra par défaut) en `:root`, références dans `@theme {}`, transition globale 400ms sur color/background-color/border-color [ARCH-04]
- [x] next-intl v4.12 configuré avec `routing.ts` + `request.ts` + **`proxy.ts`** (Next 16) et routes localisées `/fr` et `/en` (`localePrefix: 'as-needed'`, `defaultLocale: 'fr'`) [ARCH-06]
- [x] Fichiers de traduction `messages/fr.json` et `messages/en.json` avec 9 namespaces (nav/hero/about/projects/skills/contact/footer/palette/404), parité parfaite 63 leaf keys × 2 locales [ARCH-07]
- [x] Type `Project` TS (union discriminée `TechProject | DesignProject | BIMProject`) + loader MDX dans `lib/projects.ts` via `@next/mdx` + `gray-matter` + `compileMDX` (zéro `any`, filter `_*` enforced) [ARCH-08]
- [x] Repo Git initialisé avec `.gitignore` complet (Next/Node/Vercel exclusions) [ARCH-09]
- [x] `lib/palettes.ts` avec 5 palettes typées (terra/nordic/bauhaus/ocean/vaporwave) anticipé en Phase 1 pour ground Phase 2

### Active

#### Architecture & fondations

- [ ] Dépendances animation installées : `gsap` + `@gsap/react` + `lenis` (avec wrapper `lenis/react` inclus) + `motion` (anciennement `framer-motion`, imports via `motion/react`) — *Phase 3*
- [ ] `culori` installé pour manipulation couleurs OKLCh et calculs WCAG — *Phase 2*

#### Système de palettes (feature signature)

- [ ] `lib/palettes.ts` avec 5 palettes prédéfinies typées (terra, nordic, bauhaus, ocean, vaporwave secrète)
- [ ] `lib/colors.ts` avec helpers culori : `wcagContrast()`, `generateHarmonic(mode, source)` (~30 LOC custom car culori ne ship pas de générateur harmonique, rotation hue en OKLCh : complementary +180°, triadic +120°/+240°, analogous ±30°, split-complementary +150°/+210°), `adjustForAA(text, bg)`, **validateFullMatrix(palette)** vérifiant les 7 paires : text/bg, text/surface, textMuted/bg, textMuted/surface, accent/bg, accent/surface, secondary/bg
- [ ] `ThemeProvider` client component avec Context, état palette, application des CSS variables sur `:root`
- [ ] **Script bloquant FOUC** injecté dans `<head>` via `next/script` (`strategy="beforeInteractive"`) qui lit localStorage et applique les CSS vars sur `:root` AVANT hydratation — évite le flash de couleurs au premier paint
- [ ] **Aliasing shadcn** : remplacer `--primary`, `--background`, `--foreground`, `--accent`, `--muted`, `--secondary` dans `globals.css` par des références `var(--color-*)` vers les tokens du palette system (évite que les composants shadcn ignorent le palette switcher)
- [ ] Persistance localStorage dans ThemeProvider avec sync au mount (gestion hydration mismatch)
- [ ] Hook `usePalette()` exposant : palette, setPalette, setPreset, setCustomColor, setHarmonic, isCustom
- [ ] `PalettePresets` : 4 mini-aperçus carrés cliquables (animation Framer Motion sur sélection)
- [ ] `CustomColorPicker` : 3 inputs HSL (bg, accent, secondary) avec preview live
- [ ] `HarmonicGenerator` : color picker source + sélecteur de mode (4 options) + bouton Generate
- [ ] `WCAGBadge` : ratio temps réel + statut AA/AAA avec icône colorée
- [ ] `PaletteSwitcher` principal : panneau coulissant droite avec onglets Presets / Custom / Generate
- [ ] FAB bottom-right ouvrant le PaletteSwitcher (icône palette animée)
- [ ] Konami code dans ThemeProvider débloquant la palette secrète Vaporwave (animation confetti)

#### Layout & composants core

- [ ] Layout racine `app/layout.tsx` avec ThemeProvider, IntlProvider et police custom
- [ ] `LenisProvider` client wrappant l'app pour smooth scroll, avec `autoRaf: false` et intégration au **`gsap.ticker`** (un seul RAF partagé entre Lenis et GSAP pour éviter le desync ScrollTrigger ↔ Lenis), `ScrollTrigger.refresh()` après changements de layout (notamment swap de palette)
- [ ] Navigation fixe avec logo, liens sections, switcher langue (palette switcher en FAB séparé)
- [ ] Footer avec liens sociaux (GitHub, LinkedIn, email) et copyright bilingue
- [ ] `LanguageSwitcher` animé Framer Motion (toggle FR/EN)
- [ ] `CustomCursor` desktop (suit la souris, change selon accent color)

#### Sections homepage

- [ ] Hero avec révélation texte GSAP SplitText + stagger animation au mount
- [ ] About avec photo, bio bilingue, révélation au scroll via ScrollTrigger
- [ ] `CategoryFilter` (All / Tech / Design / BIM) avec état React
- [ ] `ProjectCard` avec hover Framer Motion (scale + image reveal + accent color animé)
- [ ] Section Projects : grille filtrable + AnimatePresence transitions + layout shift fluide
- [ ] Section Skills avec badges animés au scroll (stagger GSAP)
- [ ] Section Contact avec liens email/GitHub/LinkedIn, copy-to-clipboard animé, et **boutons de téléchargement du CV PDF (FR + EN)** — complément essentiel au portfolio

#### Contenu projets (MDX)

- [ ] 6 projets × 2 locales = **12 fichiers MDX** dans `content/projects/` (format `{slug}.{fr|en}.mdx` — 2 Tech, 2 Design, 2 BIM) avec frontmatter discriminé par catégorie (Tech.stack, Design.tools, BIM.software+projectScale)
- [ ] Template page projet `app/[locale]/projects/[slug]/page.tsx` avec `compileMDX` (RSC) + galerie + `generateStaticParams(locale × slug)`
- [ ] Composants MDX custom (Image avec zoom, CodeBlock highlight, Callout)

#### Animations avancées

- [ ] Transitions de page via `app/template.tsx` avec motion `AnimatePresence mode="popLayout"` (popLayout > wait pour les transitions de filter sur la grille Projects)
- [ ] ~~Scroll horizontal sur section Projects en desktop (GSAP pin)~~ → **DÉPLACÉ vers Out of Scope v1** : conflits avec AnimatePresence du filter + casse les gestures mobile. Reconsidérer en v2 si valeur ajoutée prouvée
- [ ] Parallaxe douce sur images projet via GSAP ScrollTrigger

#### Easter eggs & personnalité

- [ ] ASCII art bilingue dans la console navigateur au chargement (avec hint Konami code)
- [ ] Page 404 personnalisée avec animation et lien retour humoristique bilingue

#### SEO, accessibilité, robustesse

- [ ] Métadonnées dynamiques (`generateMetadata`) avec title, description, OG image par page
- [ ] `sitemap.ts` et `robots.ts` dans `app/`
- [ ] `loading.tsx`, `error.tsx`, `not-found.tsx` pour chaque route principale
- [ ] Audit a11y : focus visible, aria-labels, contraste WCAG AA garanti, navigation clavier complète sur PaletteSwitcher, **`prefers-reduced-motion` respecté sur toutes les animations** (GSAP + motion + cursor + Lenis), axe-core 0 erreur
- [ ] Images optimisées via `next/image` avec formats WebP/AVIF
- [ ] Test palette switcher sur 4 presets + 10 palettes random pour vérifier robustesse UI

#### Déploiement

- [ ] Repo Git initialisé avec `.gitignore` et premier commit
- [ ] Repo GitHub `tanguynoumea/portfolio` créé et code pushé
- [ ] Connexion Vercel via intégration GitHub et déploiement production
- [ ] Vercel Analytics + Speed Insights configurés

### Out of Scope

- **Scroll horizontal sur Projects (GSAP pin)** — Casse les gestures mobile, conflit avec AnimatePresence du filter, complexité disproportionnée vs valeur en v1. Re-évaluer en v2.
- **Dark mode binaire (toggle dark/light)** — Remplacé par le système de palettes personnalisables (Vaporwave + palettes custom couvrent les modes sombres)
- **Backend / API custom** — Site statique, déploiement Vercel suffit, aucune logique serveur en v1
- **CMS pour les projets** — MDX dans le repo, source de vérité = git, pas besoin de CMS pour 6-10 projets
- **Blog / articles** — Pas dans v1, peut venir en v2
- **Formulaire de contact backend / système de commentaires** — Contact via `mailto:` et liens sociaux uniquement
- **Authentification utilisateur** — Aucun compte requis, site public
- **E-commerce** — Hors scope total
- **App mobile native** — Web responsive (mobile-first) uniquement
- **Tests automatisés exhaustifs** — Pas critique pour un portfolio personnel, audit manuel + Lighthouse suffisent en v1
- **Intégrations API tierces** — Aucune dépendance externe en v1 (pas de feed Twitter, Instagram, etc.)

## Context

**Profil utilisateur :**
- Tanguy, profil hybride Tech (développement) × Design (créatif) × BIM (architecture)
- Le portfolio sert de complément au CV PDF — audience : recruteurs, clients potentiels, communauté tech/design/archi
- Confort technique avec Next.js, TypeScript, Tailwind, animations modernes

**Inspiration & benchmark :**
- Portfolios créatifs hybrides combinant fluidité d'animation (style Astro/GSAP) et UX moderne (style Next/Framer Motion)
- Sites de studios design avec forte interaction et personnalité

**Décisions design pré-projet (validées en phase de prep) :**
- Format visuel hybride Astro/GSAP × Next/Framer Motion
- 4 palettes prédéfinies : Terra & Sage, Atelier Nordique, Bauhaus Bright, Ocean Studio + 1 secrète Vaporwave
- Ton créatif assumé avec humour et easter eggs (console ASCII, Konami code)
- Bilingue FR/EN avec switcher visible

## Constraints

- **Tech stack** : **Next.js 16** App Router + React 19.2 + TypeScript 5.6 strict — moderne, performant, SEO-friendly, type-safety obligatoire (pas de `any`). Note Next 16 : `proxy.ts` au lieu de `middleware.ts`, `cookies()`/`headers()`/`params` async, Turbopack par défaut
- **Animations** : GSAP (free 100% depuis avril 2025, inclus SplitText/ScrollTrigger/ScrollSmoother) + Lenis (package `lenis` après rebrand Darkroom Engineering) pour le scroll + **`motion`** (anciennement `framer-motion`, imports via `motion/react`) pour micro-interactions et transitions — séparation claire des responsabilités, chaque lib dans son domaine d'excellence
- **i18n** : next-intl v4.12 avec routes localisées `/fr` et `/en` via `proxy.ts` (Next 16) — SEO-friendly, urls explicites, hreflang dans metadata
- **Couleurs** : TOUTES les couleurs en CSS variables OKLCh (`--color-bg`, `--color-surface`, `--color-text`, `--color-text-muted`, `--color-accent`, `--color-secondary`) déclarées en `:root`, **Tailwind v4** les expose via `@theme {}` en CSS (pas de `tailwind.config.ts`) — palette switcher dynamique sans rebuild ni rechargement, OKLCh permet ajustement perceptuel précis pour WCAG
- **Accessibilité** : WCAG AA garanti par le ThemeProvider (ratio mini 4.5:1 entre `--color-text` et `--color-bg`) — si palette générée par utilisateur échoue, ajustement automatique luminosité texte. Navigation clavier complète, focus visible, aria-labels, focus management sur PaletteSwitcher
- **Performance** : Lighthouse 90+ sur Performance / Accessibility / Best Practices / SEO. Mobile-first responsive (breakpoints sm / md / lg / xl)
- **Patterns animations** : GSAP toujours dans hooks `useGSAP()` pour cleanup automatique. Lenis wrap toute l'app sauf zones nécessitant scroll natif (modales)
- **Composants** : Server Components par défaut, `"use client"` uniquement quand interaction (ThemeProvider obligatoirement client). Components atomiques (1 fichier = 1 responsabilité)
- **Conventions code** : TypeScript strict pas de `any`, components dans `components/` (sections de page dans `components/sections/`, système de thème dans `components/theme/`), contenu projets dans `content/projects/*.mdx`, traductions dans `messages/`, pas de couleurs hardcodées
- **Déploiement** : GitHub `tanguynoumea/portfolio` + Vercel (auto-deploy sur push main), domaine à configurer (ex. `tanguy.dev`)
- **Aucune API tierce** requise en v1

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| **Next.js 16** (App Router) + React 19.2 + TypeScript 5.6 strict | Moderne, SEO-friendly, type-safety, écosystème mature, Vercel-native. Mise à jour depuis l'intention initiale "Next 15" suite à recherche stack | — Pending |
| **Tailwind CSS v4** branché sur CSS variables OKLCh (pas de couleurs hardcodées, pas de `tailwind.config.ts`) | Permet le palette switcher dynamique sans rebuild ni rechargement. Tailwind v4 fait des design tokens des CSS vars natives via `@theme {}` — architecture idéale pour notre cas | — Pending |
| Stack animations triple (GSAP + Lenis + **`motion`**) | Chaque lib excelle dans son domaine : GSAP/ScrollTrigger pour scroll-driven, Lenis pour smooth scroll, `motion` (anciennement framer-motion) pour micro-interactions/transitions. GSAP est gratuit pour usage commercial depuis avril 2025 (rachat Webflow) | — Pending |
| Single RAF Lenis + GSAP (`gsap.ticker`) | Évite le desync de position scroll entre Lenis et ScrollTrigger qui se manifeste si chacun a son propre rAF | — Pending |
| Script `<head>` `beforeInteractive` pour FOUC palette | Lire localStorage dans `useEffect` cause un flash. Seule la lecture synchrone pré-hydratation l'évite | — Pending |
| Validation WCAG matricielle (7 paires) | Vérifier seulement text/bg laisse passer des palettes où accent/bg échoue à 2.3:1. Toutes les paires interactives doivent être validées | — Pending |
| Système de palettes remplace dark/light binaire | Différencie le portfolio, démontre maîtrise WCAG, expérience personnalisable, Vaporwave couvre le mode sombre | — Pending |
| `culori` pour manipulation couleurs + WCAG (OKLCh) | Lib moderne ESM utilisée par Tailwind v4 en interne. ⚠️ ne ship PAS de générateur harmonique → ~30 LOC custom dans `lib/colors.ts` via rotation hue OKLCh | — Pending |
| next-intl avec routes localisées `/fr` et `/en` | SEO-friendly, urls explicites, switcher visible, standard de l'écosystème | — Pending |
| MDX dans `content/projects/` (`{slug}.{fr|en}.mdx`, 1 fichier par projet par locale) | Source de vérité = git, pas de CMS, frontmatter typé pour metadata, écriture confortable en Markdown, workflow traducteur friendly. Stack : `@next/mdx` + `gray-matter` + `next-mdx-remote/rsc compileMDX` (contentlayer est abandonné depuis 2024) | — Pending |
| Vercel pour hébergement | Free tier généreux, déploiement auto GitHub, analytics intégré, Next.js native, edge network | — Pending |
| Easter eggs activés (ASCII console + Konami code) | Ton créatif assumé, attention au détail, mémorable pour les visiteurs tech | — Pending |
| Pas de dark mode binaire | Le système de palettes le remplace (Vaporwave + palettes custom couvrent les modes sombres) | — Pending |
| `useGSAP()` pour toutes les animations GSAP | Cleanup automatique, évite les leaks et re-trigger sur React strict mode | — Pending |
| shadcn/ui pour composants de base | Composants copier-coller customisables, pas de lock-in lib UI, parfaitement compatible Tailwind | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-26 after Phase 1 completion (Foundations) — Next 16 + Tailwind v4 + shadcn aliasing + next-intl `/fr` `/en` + MDX loader pipeline all green, ARCH-01..09 validated*

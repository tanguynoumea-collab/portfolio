# Portfolio Tanguy (`tanguy-portfolio`)

## What This Is

Portfolio personnel bilingue FR/EN servant de complément au CV PDF, présentant un profil hybride **Tech (dev) × Design (créatif) × BIM (architecture)**. Le site expose 6 à 10 projets personnels filtrables par catégorie, avec un ton créatif assumé et des easter eggs. Sa **feature signature** est un système de palettes interactif (4 presets + custom color picker + génération harmonique avec contrôle WCAG temps réel + palette secrète Vaporwave déblocable via Konami code) qui permet à chaque visiteur de personnaliser le thème en live.

## Core Value

Démontrer le profil créatif hybride Tech/Design/BIM via une expérience web personnalisable qui **prouve la maîtrise technique, le sens du design et l'attention aux détails** — un portfolio qui est lui-même une démo vivante de ce que je sais faire.

## Requirements

### Validated

(None yet — ship to validate)

### Active

#### Architecture & fondations

- [ ] Projet Next.js 15 (App Router + React 19 + TypeScript strict) initialisé via `create-next-app`
- [ ] ESLint + Prettier + structure de dossiers (app, components, lib, content, messages, public)
- [ ] Dépendances animation installées (gsap, @gsap/react, lenis, framer-motion)
- [ ] `culori` installé pour manipulation couleurs et calculs WCAG
- [ ] shadcn/ui initialisé avec composants de base (button, card, dialog, slider, switch, popover, tabs)
- [ ] Tailwind configuré sur CSS variables (toutes les couleurs via `var(--color-*)`)
- [ ] `globals.css` avec CSS variables de couleurs et transition globale 400ms sur color/background-color/border-color
- [ ] next-intl configuré avec middleware et routes localisées `/fr` et `/en`
- [ ] Fichiers de traduction `messages/fr.json` et `messages/en.json` avec structure complète
- [ ] Type `Project` TS + loader MDX dans `lib/projects.ts` avec frontmatter (slug, title, category, year, stack, cover)

#### Système de palettes (feature signature)

- [ ] `lib/palettes.ts` avec 5 palettes prédéfinies typées (terra, nordic, bauhaus, ocean, vaporwave secrète)
- [ ] `lib/colors.ts` avec helpers culori : `wcagContrast()`, `generateHarmonic(mode, source)`, `adjustForAA(text, bg)`
- [ ] `ThemeProvider` client component avec Context, état palette, application des CSS variables sur `:root`
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
- [ ] `LenisProvider` client wrappant l'app pour smooth scroll
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
- [ ] Section Contact avec liens email/GitHub/LinkedIn et copy-to-clipboard animé

#### Contenu projets (MDX)

- [ ] 6 fichiers MDX de démo dans `content/projects/` (2 Tech, 2 Design, 2 BIM) avec frontmatter complet
- [ ] Template page projet `app/[locale]/projects/[slug]/page.tsx` avec MDX renderer + galerie
- [ ] Composants MDX custom (Image avec zoom, CodeBlock highlight, Callout)

#### Animations avancées

- [ ] Transitions de page Framer Motion AnimatePresence dans le layout
- [ ] Scroll horizontal sur section Projects en desktop (GSAP pin)
- [ ] Parallaxe douce sur images projet via GSAP ScrollTrigger

#### Easter eggs & personnalité

- [ ] ASCII art bilingue dans la console navigateur au chargement (avec hint Konami code)
- [ ] Page 404 personnalisée avec animation et lien retour humoristique bilingue

#### SEO, accessibilité, robustesse

- [ ] Métadonnées dynamiques (`generateMetadata`) avec title, description, OG image par page
- [ ] `sitemap.ts` et `robots.ts` dans `app/`
- [ ] `loading.tsx`, `error.tsx`, `not-found.tsx` pour chaque route principale
- [ ] Audit a11y : focus visible, aria-labels, contraste WCAG AA garanti, navigation clavier complète sur PaletteSwitcher
- [ ] Images optimisées via `next/image` avec formats WebP/AVIF
- [ ] Test palette switcher sur 4 presets + 10 palettes random pour vérifier robustesse UI

#### Déploiement

- [ ] Repo Git initialisé avec `.gitignore` et premier commit
- [ ] Repo GitHub `tanguynoumea/portfolio` créé et code pushé
- [ ] Connexion Vercel via intégration GitHub et déploiement production
- [ ] Vercel Analytics + Speed Insights configurés

### Out of Scope

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

- **Tech stack** : Next.js 15 App Router + React 19 + TypeScript strict — moderne, performant, SEO-friendly, type-safety obligatoire (pas de `any`)
- **Animations** : GSAP + ScrollTrigger + Lenis (scroll) + Framer Motion (micro-interactions et transitions) — séparation claire des responsabilités, chaque lib dans son domaine d'excellence
- **i18n** : next-intl avec routes localisées `/fr` et `/en` — SEO-friendly, urls explicites
- **Couleurs** : TOUTES les couleurs en CSS variables (`--color-bg`, `--color-surface`, `--color-text`, `--color-text-muted`, `--color-accent`, `--color-secondary`), Tailwind config utilise `var(--color-*)` — palette switcher dynamique sans rebuild ni rechargement
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
| Next.js 15 (App Router) + React 19 + TypeScript strict | Moderne, SEO-friendly, type-safety, écosystème mature, Vercel-native | — Pending |
| Tailwind branché sur CSS variables (pas de couleurs hardcodées) | Permet le palette switcher dynamique sans rebuild ni rechargement | — Pending |
| Stack animations triple (GSAP + Lenis + Framer Motion) | Chaque lib excelle dans son domaine : GSAP/ScrollTrigger pour scroll-driven, Lenis pour smooth scroll, Framer Motion pour micro-interactions/transitions | — Pending |
| Système de palettes remplace dark/light binaire | Différencie le portfolio, démontre maîtrise WCAG, expérience personnalisable, Vaporwave couvre le mode sombre | — Pending |
| `culori` pour manipulation couleurs + WCAG | Lib moderne ESM avec génération harmonique et calcul de contraste précis | — Pending |
| next-intl avec routes localisées `/fr` et `/en` | SEO-friendly, urls explicites, switcher visible, standard de l'écosystème | — Pending |
| MDX dans `content/projects/` (1 fichier = 1 projet) | Source de vérité = git, pas de CMS, frontmatter typé pour metadata, écriture confortable en Markdown | — Pending |
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
*Last updated: 2026-05-25 after initialization*

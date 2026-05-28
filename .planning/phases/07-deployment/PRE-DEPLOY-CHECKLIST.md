# Pre-Deploy Content-Swap Checklist

> **The site deploys and works with placeholders.** This is a content-quality
> checklist, **NOT a deploy blocker** — every item below ships with a plausible
> placeholder today, so the production build, routing, palette system, SEO, and
> animations all function. Swap these for your real data before (or shortly
> after) go-live so the public portfolio reflects you, not the scaffold.

Each item lists **what** to replace and the **exact file(s)** to edit.

## Identity & contact

- [ ] **Real bio text** — `messages/fr.json` + `messages/en.json` → `about.paragraphs.1` and `about.paragraphs.2` (keep both locales in sync; `npx tsx scripts/check-i18n-parity.ts` enforces parity).
- [ ] **Real "about" photo** — `public/about-photo.jpg` (currently a placeholder image).
- [ ] **Real email** — `lib/constants.ts` → `EMAIL` (currently `tanguy@example.com`).
- [ ] **Real LinkedIn URL** — `lib/constants.ts` → `LINKEDIN_URL`.
- [ ] **Real GitHub URL** — `lib/constants.ts` → `GITHUB_URL` **and** `lib/ascii.ts` (console-art `GITHUB_URL`). Finalized in **07-01** once the repo account is confirmed (D-02). `scripts/check-readme.ts` asserts `constants.ts`, `ascii.ts`, and `README.md` all reference the same `owner/repo`, so update them together.

## Projects

- [ ] **Real project covers + gallery** — `public/projects/{slug}/cover.jpg` and `public/projects/{slug}/[1-4].jpg` (currently shared placeholder images).
- [ ] **Real project MDX bodies** — `content/projects/*.fr.mdx` and `content/projects/*.en.mdx` (currently plausible placeholder case studies; `npx tsx scripts/check-mdx-structure.ts` enforces the H2 + word-count contract).

## Skills

- [ ] **Real skill lists** — `messages/fr.json` + `messages/en.json` → `skills.groups.tech.items[]`, `skills.groups.design.items[]`, `skills.groups.bim.items[]` (keep both locales in sync).

## Documents

- [ ] **CV-EN translation** — `public/cv-en.pdf` (currently a copy of the FR PDF — replace with the real English CV).

## Deployment origin

- [ ] **`NEXT_PUBLIC_SITE_URL`** — set the real production origin in the **Vercel dashboard** (Project → Settings → Environment Variables) during 07-01 / D-05. Falls back to `https://tanguy.dev` if unset. This drives `metadataBase`, canonical URLs, hreflang, the sitemap, and OpenGraph images — redeploy after setting it so all absolute URLs resolve to the live origin.

---

_Generated for Phase 07 (deployment), plan 07-00. The autonomous prep ships the
site production-ready; the items above are the personal-content layer the user
supplies. None blocks the first deploy._

/**
 * lib/projects.ts — Server-only MDX project loader + Project type.
 *
 * The portfolio features the author's real software projects (BIM/Revit
 * tooling + desktop apps), so the shape is a single flat Project type rather
 * than the original fictional discriminated union. Two categories drive the
 * homepage filter and the badge color:
 *   - 'bim'  → BIM·Revit tooling (Revit/pyRevit plugins, geometry engines)
 *   - 'tech' → standalone tools / desktop apps
 *
 * Every project is software, so every project has a `stack`. The rest is
 * optional and rendered only when present:
 *   - revit?       Revit version target string (BIM tools only)
 *   - repo?        public repository URL (set ONLY for public repos)
 *   - liveUrl?     download / releases / live URL
 *   - proprietary? true for private/employer/own-IP code — the UI shows a
 *                  "proprietary" badge instead of a (dead) repo link
 *
 * Loader contract:
 *   - Reads content/projects/{slug}.{locale}.mdx files
 *   - Parses frontmatter with gray-matter
 *   - Validates the category discriminator ('bim' | 'tech') + required fields
 *   - Skips files starting with '_' (D-24 — _template stub stays in repo as reusable template)
 *
 * This file is imported by Server Components only (project pages).
 * It uses node:fs and is NOT safe to import from Client Components.
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';

// ----- Project type -----

export type ProjectCategory = 'bim' | 'tech';

type CommonFields = {
  slug: string;
  title: string;
  year: number;
  cover: string; // plain path relative to /public, e.g. '/projects/diskscout/cover.jpg'
  summary: string;
  featured: boolean;
  order?: number; // optional curated sort key (ascending); undefined sorts last.
  gallery?: string[]; // optional. Asset paths under /public/projects/{slug}/.
};

export type Project = CommonFields & {
  category: ProjectCategory;
  stack: string[];
  revit?: string;
  repo?: string;
  liveUrl?: string;
  proprietary?: boolean;
};

export type Locale = 'fr' | 'en';

// ----- Internal helpers -----

const CONTENT_ROOT = join(process.cwd(), 'content', 'projects');

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === 'string');
}

function isCategory(v: unknown): v is ProjectCategory {
  return v === 'bim' || v === 'tech';
}

/**
 * Runtime validator that narrows raw frontmatter data to the Project type.
 * Throws if a field is missing or has the wrong shape — fail loud at build time
 * rather than ship a broken project to production.
 */
export function validateFrontmatter(slug: string, data: Record<string, unknown>): Project {
  const galleryValid =
    data.gallery === undefined ||
    (Array.isArray(data.gallery) && data.gallery.every((s): s is string => typeof s === 'string'));
  if (!galleryValid) {
    throw new Error(
      `[lib/projects] '${slug}' has invalid 'gallery': expected string[] or undefined, got ${typeof data.gallery}.`,
    );
  }

  const common = {
    slug,
    title: typeof data.title === 'string' ? data.title : '',
    year: typeof data.year === 'number' ? data.year : 0,
    cover: typeof data.cover === 'string' ? data.cover : '',
    summary: typeof data.summary === 'string' ? data.summary : '',
    featured: typeof data.featured === 'boolean' ? data.featured : false,
    ...(typeof data.order === 'number' ? { order: data.order } : {}),
    ...(Array.isArray(data.gallery) ? { gallery: data.gallery as string[] } : {}),
  };

  if (!common.title || !common.year || !common.cover || !common.summary) {
    throw new Error(
      `[lib/projects] Invalid frontmatter for '${slug}': missing required common fields (title/year/cover/summary).`,
    );
  }

  if (!isCategory(data.category)) {
    throw new Error(
      `[lib/projects] '${slug}' has invalid category: expected 'bim' | 'tech', got '${String(data.category)}'.`,
    );
  }

  if (!isStringArray(data.stack)) {
    throw new Error(`[lib/projects] '${slug}' is missing a 'stack' string array.`);
  }

  const project: Project = {
    ...common,
    category: data.category,
    stack: data.stack,
    ...(typeof data.revit === 'string' ? { revit: data.revit } : {}),
    ...(typeof data.repo === 'string' ? { repo: data.repo } : {}),
    ...(typeof data.liveUrl === 'string' ? { liveUrl: data.liveUrl } : {}),
    ...(data.proprietary === true ? { proprietary: true } : {}),
  };
  return project;
}

/**
 * Returns all projects for a given locale.
 * Skips files whose name starts with '_' (D-24 — _template stub is reusable template, not a project).
 * Order is whatever readdirSync returns (locale-sorted at consumer level if needed).
 */
export async function getProjects(locale: Locale): Promise<Project[]> {
  if (!existsSync(CONTENT_ROOT)) {
    return [];
  }
  const filenames = readdirSync(CONTENT_ROOT);
  const projects: Project[] = [];

  for (const filename of filenames) {
    if (filename.startsWith('_')) continue; // D-24
    if (!filename.endsWith(`.${locale}.mdx`)) continue;
    const slug = filename.replace(`.${locale}.mdx`, '');
    const raw = readFileSync(join(CONTENT_ROOT, filename), 'utf8');
    const { data } = matter(raw);
    const project = validateFrontmatter(slug, data as Record<string, unknown>);
    projects.push(project);
  }

  // Curated order: explicit `order` ascending, projects without one sort last
  // (then alphabetically by title for a stable, deterministic sequence).
  projects.sort((a, b) => {
    const ao = a.order ?? Number.POSITIVE_INFINITY;
    const bo = b.order ?? Number.POSITIVE_INFINITY;
    if (ao !== bo) return ao - bo;
    return a.title.localeCompare(b.title);
  });

  return projects;
}

/**
 * Returns a single project by slug+locale, or null if it does not exist.
 */
export async function getProjectBySlug(slug: string, locale: Locale): Promise<Project | null> {
  if (slug.startsWith('_')) return null; // D-24 — templates not addressable
  const filename = `${slug}.${locale}.mdx`;
  const path = join(CONTENT_ROOT, filename);
  if (!existsSync(path)) return null;
  const raw = readFileSync(path, 'utf8');
  const { data } = matter(raw);
  return validateFrontmatter(slug, data as Record<string, unknown>);
}

/**
 * Returns the list of slugs available (locale-agnostic — derived from the .fr.mdx set).
 * Used by Phase 5's generateStaticParams to prerender locale × slug combos.
 */
export async function getProjectSlugs(): Promise<string[]> {
  if (!existsSync(CONTENT_ROOT)) {
    return [];
  }
  return readdirSync(CONTENT_ROOT)
    .filter((f) => !f.startsWith('_') && f.endsWith('.fr.mdx'))
    .map((f) => f.replace('.fr.mdx', ''));
}

/**
 * lib/projects.ts — Server-only MDX project loader + discriminated Project type.
 *
 * Discriminated union per CONTEXT.md D-18..D-22:
 *   - TechProject:   common + stack[] + repo? + liveUrl?
 *   - DesignProject: common + tools[] + client?
 *   - BIMProject:    common + software[] + projectScale + location?
 *
 * Loader contract:
 *   - Reads content/projects/{slug}.{locale}.mdx files
 *   - Parses frontmatter with gray-matter
 *   - Validates discriminator (category must be 'tech' | 'design' | 'bim')
 *   - Skips files starting with '_' (D-24 — _template stub stays in repo as reusable template)
 *
 * This file is imported by Server Components only (Phase 5 project pages).
 * It uses node:fs and is NOT safe to import from Client Components.
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';

// ----- Discriminated Project union (D-18..D-22) -----

type CommonFields = {
  slug: string;
  title: string;
  year: number;
  cover: string; // D-22: plain path relative to /public, e.g. '/projects/agora/cover.jpg'
  summary: string;
  featured: boolean;
  gallery?: string[]; // NEW (D-14) — optional. Asset paths under /public/projects/{slug}/.
};

export type TechProject = CommonFields & {
  category: 'tech';
  stack: string[];
  repo?: string;
  liveUrl?: string;
};

export type DesignProject = CommonFields & {
  category: 'design';
  tools: string[];
  client?: string;
};

export type BIMProject = CommonFields & {
  category: 'bim';
  software: string[];
  projectScale: 'concept' | 'residential' | 'commercial' | 'urban';
  location?: string;
};

export type Project = TechProject | DesignProject | BIMProject;

export type Locale = 'fr' | 'en';

// ----- Internal helpers -----

const CONTENT_ROOT = join(process.cwd(), 'content', 'projects');

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === 'string');
}

function isProjectScale(v: unknown): v is 'concept' | 'residential' | 'commercial' | 'urban' {
  return (
    typeof v === 'string' &&
    (v === 'concept' || v === 'residential' || v === 'commercial' || v === 'urban')
  );
}

/**
 * Runtime validator that narrows raw frontmatter data to the discriminated union.
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
    ...(Array.isArray(data.gallery) ? { gallery: data.gallery as string[] } : {}),
  };

  if (!common.title || !common.year || !common.cover || !common.summary) {
    throw new Error(
      `[lib/projects] Invalid frontmatter for '${slug}': missing required common fields (title/year/cover/summary).`,
    );
  }

  const category = data.category;
  if (category === 'tech') {
    if (!isStringArray(data.stack)) {
      throw new Error(
        `[lib/projects] '${slug}' is a tech project but 'stack' is not a string array.`,
      );
    }
    const project: TechProject = {
      ...common,
      category: 'tech',
      stack: data.stack,
      ...(typeof data.repo === 'string' ? { repo: data.repo } : {}),
      ...(typeof data.liveUrl === 'string' ? { liveUrl: data.liveUrl } : {}),
    };
    return project;
  }

  if (category === 'design') {
    if (!isStringArray(data.tools)) {
      throw new Error(
        `[lib/projects] '${slug}' is a design project but 'tools' is not a string array.`,
      );
    }
    const project: DesignProject = {
      ...common,
      category: 'design',
      tools: data.tools,
      ...(typeof data.client === 'string' ? { client: data.client } : {}),
    };
    return project;
  }

  if (category === 'bim') {
    if (!isStringArray(data.software)) {
      throw new Error(
        `[lib/projects] '${slug}' is a BIM project but 'software' is not a string array.`,
      );
    }
    if (!isProjectScale(data.projectScale)) {
      throw new Error(
        `[lib/projects] '${slug}' has invalid projectScale: expected one of 'concept' | 'residential' | 'commercial' | 'urban'.`,
      );
    }
    const project: BIMProject = {
      ...common,
      category: 'bim',
      software: data.software,
      projectScale: data.projectScale,
      ...(typeof data.location === 'string' ? { location: data.location } : {}),
    };
    return project;
  }

  throw new Error(
    `[lib/projects] '${slug}' has invalid category: expected 'tech' | 'design' | 'bim', got '${String(category)}'.`,
  );
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

/**
 * lib/ascii.test.ts — EGG-01 / D-34 contract tests for the bilingual
 * console ASCII signature module.
 *
 * Pure-module tests (no React, no DOM). Asserts the substrings the planner
 * locked in plan 03-05 acceptance criteria:
 *   - GitHub URL exactly https://github.com/tanguynoumea-collab/portfolio
 *   - UTF-8 arrow glyphs (↑ ↓ ← →) in the Konami hint
 *   - 'B A' terminal-pair of the Konami sequence
 *   - FR variant carries the French intro keyword
 *   - EN variant carries the English intro keyword
 *   - Multi-line output (>5 lines) confirms the wordmark is present
 *
 * The ConsoleArt component test (separate file) exercises locale dispatch
 * via console.log spy; this file covers only the pure content shape.
 */
import { describe, it, expect } from 'vitest';
import { getAsciiArt, ASCII_GITHUB_URL, ASCII_KONAMI_HINT } from './ascii';

describe('lib/ascii (EGG-01) — bilingual signature content', () => {
  it('FR variant contains the French intro phrase', () => {
    const out = getAsciiArt('fr');
    expect(out).toContain('Spécialiste BIM');
    expect(out).toContain('coordination & modélisation');
  });

  it('EN variant contains the English intro phrase', () => {
    const out = getAsciiArt('en');
    expect(out).toContain('BIM Specialist');
    expect(out).toContain('coordination & modeling');
  });

  it('contains the portfolio GitHub URL exactly', () => {
    expect(ASCII_GITHUB_URL).toBe('https://github.com/tanguynoumea-collab/portfolio');
    expect(getAsciiArt('fr')).toContain('https://github.com/tanguynoumea-collab/portfolio');
    expect(getAsciiArt('en')).toContain('https://github.com/tanguynoumea-collab/portfolio');
  });

  it('contains the Konami arrow-glyph hint with terminal B A pair', () => {
    expect(ASCII_KONAMI_HINT).toContain('↑');
    expect(ASCII_KONAMI_HINT).toContain('↓');
    expect(ASCII_KONAMI_HINT).toContain('←');
    expect(ASCII_KONAMI_HINT).toContain('→');
    expect(ASCII_KONAMI_HINT).toContain('B A');
  });

  it('outputs are multi-line strings (the wordmark adds line count)', () => {
    expect(getAsciiArt('fr').split('\n').length).toBeGreaterThan(5);
    expect(getAsciiArt('en').split('\n').length).toBeGreaterThan(5);
  });
});

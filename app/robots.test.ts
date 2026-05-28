/**
 * robots.test.ts — A11Y-02 robots rules.
 *
 * Asserts robots() allows '/', disallows '/api/', and references the absolute
 * sitemap URL built from SITE_URL. No next-intl dependency, so no mocking.
 */
import { describe, it, expect } from 'vitest';
import robots from './robots';
import { SITE_URL } from '@/lib/constants';

describe('robots (A11Y-02)', () => {
  it('allows /, disallows /api/, references the sitemap', () => {
    const r = robots();
    const rule = Array.isArray(r.rules) ? r.rules[0]! : r.rules!;
    expect(rule.allow).toBe('/');
    expect(rule.disallow).toBe('/api/');
    expect(r.sitemap).toBe(`${SITE_URL}/sitemap.xml`);
  });
});

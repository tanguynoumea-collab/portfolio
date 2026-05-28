import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import createMDX from '@next/mdx';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/**
 * MDX plugins are passed as STRING IDENTIFIERS (package names) rather than imported
 * function references. Next 16's Turbopack-based MDX loader serializes plugin options
 * across threads and rejects non-serializable values (functions, classes). Passing
 * plugin specs as `[packageName, options]` tuples lets Turbopack resolve the plugin
 * itself in the worker context.
 *
 * Pattern source: Next 16 @next/mdx + Turbopack interop. Same behavior under Webpack
 * (Webpack resolves the string to the package), so this is portable across builders.
 */
const withMDX = createMDX({
  options: {
    // remark-frontmatter strips the YAML `---…---` block so it is NOT rendered as
    // body text on project pages (gray-matter parses it separately for metadata).
    // Must come before remark-gfm so the frontmatter node is removed early.
    remarkPlugins: [['remark-frontmatter', 'yaml'], ['remark-gfm', {}]],
    rehypePlugins: [['rehype-pretty-code', { theme: 'github-dark-dimmed', keepBackground: false }]],
  },
});

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  images: {
    // A11Y-06 (D-13): serve modern formats. AVIF first (best compression),
    // WebP fallback, then the browser's last-resort original.
    formats: ['image/avif', 'image/webp'],
  },
};

export default withNextIntl(withMDX(nextConfig));

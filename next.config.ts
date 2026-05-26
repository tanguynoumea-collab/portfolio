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
    remarkPlugins: [['remark-gfm', {}]],
    rehypePlugins: [['rehype-pretty-code', { theme: 'github-dark-dimmed', keepBackground: false }]],
  },
});

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
};

export default withNextIntl(withMDX(nextConfig));

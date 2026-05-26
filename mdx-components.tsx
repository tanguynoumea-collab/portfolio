import type { MDXComponents } from 'mdx/types';

/**
 * Required entry point for @next/mdx in App Router.
 * Phase 5 will extend this with custom Image (zoom), CodeBlock, Callout components.
 * For Phase 1, this is the minimum scaffold — pass through built-in components.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
  };
}

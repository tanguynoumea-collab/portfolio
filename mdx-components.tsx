import type { MDXComponents } from 'mdx/types';
import MDXImage from '@/components/mdx/Image';
import CodeBlock from '@/components/mdx/CodeBlock';
import { Callout } from '@/components/mdx/Callout';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

/**
 * mdx-components.tsx — App Router convention (required + auto-discovered by
 * @next/mdx at build time, so components inject into rendered MDX without an
 * explicit components={...} prop).
 *
 * D-12: extends the Phase 1 passthrough scaffold with:
 *   - Image (zoom modal) — default import from @/components/mdx/Image
 *   - Callout (3 variants) — named import from @/components/mdx/Callout
 *   - pre: CodeBlock (override <pre> for copy button + language badge)
 *   - a (external → target=_blank + rel; internal → locale-aware Link from
 *     @/i18n/navigation)
 *   - h1/h2/h3/p/ul/ol/blockquote prose styling (Pitfall 5G — max-w-prose only
 *     constrains width, not heading sizes, so MDX headings need explicit sizes)
 *
 * Pitfall 8 (PITFALLS.md): mdx-components.tsx is the App Router convention. Do
 * NOT introduce the @mdx-js/react provider context — RSC does not support React
 * Context. Keep the useMDXComponents(components) signature.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,

    // Custom MDX components (D-09..D-11).
    Image: MDXImage,
    Callout,

    // <pre> override for syntax-highlighted code blocks (D-10).
    pre: CodeBlock,

    // External vs internal link routing (D-12).
    a: ({ href, children, className, ...rest }) => {
      if (!href) {
        return (
          <a
            className={cn(
              'text-primary underline-offset-4 hover:underline',
              className,
            )}
            {...rest}
          >
            {children}
          </a>
        );
      }
      const isExternal =
        href.startsWith('http://') || href.startsWith('https://');
      if (isExternal) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'text-primary underline-offset-4 hover:underline',
              className,
            )}
            {...rest}
          >
            {children}
          </a>
        );
      }
      // Internal link → next-intl locale-aware Link.
      return (
        <Link
          href={href as never}
          className={cn(
            'text-primary underline-offset-4 hover:underline',
            className,
          )}
        >
          {children}
        </Link>
      );
    },

    // Prose styling (Pitfall 5G).
    h1: ({ children, ...rest }) => (
      <h1 className="mt-12 mb-6 text-4xl font-semibold text-foreground" {...rest}>
        {children}
      </h1>
    ),
    h2: ({ children, ...rest }) => (
      <h2 className="mt-10 mb-4 text-2xl font-semibold text-foreground" {...rest}>
        {children}
      </h2>
    ),
    h3: ({ children, ...rest }) => (
      <h3 className="mt-8 mb-3 text-xl font-semibold text-foreground" {...rest}>
        {children}
      </h3>
    ),
    p: ({ children, ...rest }) => (
      <p className="my-4 leading-relaxed text-foreground/90" {...rest}>
        {children}
      </p>
    ),
    ul: ({ children, ...rest }) => (
      <ul className="my-4 list-disc space-y-2 pl-6 text-foreground/90" {...rest}>
        {children}
      </ul>
    ),
    ol: ({ children, ...rest }) => (
      <ol
        className="my-4 list-decimal space-y-2 pl-6 text-foreground/90"
        {...rest}
      >
        {children}
      </ol>
    ),
    blockquote: ({ children, ...rest }) => (
      <blockquote
        className="my-6 border-l-4 border-primary/40 pl-4 text-muted-foreground italic"
        {...rest}
      >
        {children}
      </blockquote>
    ),
  };
}

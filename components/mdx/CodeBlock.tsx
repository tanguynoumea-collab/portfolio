'use client';

import { useRef, useState, type HTMLAttributes } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * <pre> override consumed by mdx-components.tsx (D-10, CONTENT-03).
 *
 * Registered as `pre:` in the registry — authors write ordinary fenced code
 * blocks (```ts ... ```), NOT a <CodeBlock> tag. This keeps MDX prose-friendly
 * while reusing the build-time Shiki pipeline (zero client JS for highlighting).
 *
 * D-10 contract:
 *   - rehype-pretty-code 0.14.3 emits data-language="<lang>" on the <pre>
 *     element (verified by source inspection of packages/core/src/index.ts
 *     line 94). The <pre> is also wrapped in <figure data-rehype-pretty-code-figure>.
 *   - Renders the original <pre> with:
 *       * a language badge (absolute top-left), and
 *       * a copy-to-clipboard button (absolute top-right, hover/focus reveal).
 *   - Copy button reuses the Phase 4 Contact D-20 pattern verbatim:
 *     navigator.clipboard.writeText → setCopied(true) → 1500ms revert → silent
 *     catch (Phase 2 D-02 silent-fallback precedent — no console call).
 *   - AnimatePresence mode="wait" swaps Copy ↔ Check.
 *
 * Pitfall 5F: raw text is extracted via preRef.current.textContent (walks the
 * DOM and concatenates text — gives back the original source 1:1 because Shiki
 * only wraps tokens in spans without inserting/removing characters). No
 * transformer, no next.config.ts change.
 */
export default function CodeBlock({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLPreElement> & {
  'data-language'?: string;
  'data-theme'?: string;
}) {
  const preRef = useRef<HTMLPreElement>(null);
  const t = useTranslations('projects.detail');
  const [copied, setCopied] = useState(false);

  const language =
    typeof props['data-language'] === 'string' ? props['data-language'] : 'text';

  const onCopy = async () => {
    if (!preRef.current) return;
    const raw = preRef.current.textContent ?? '';
    try {
      await navigator.clipboard.writeText(raw);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Silent fallback per Phase 2 D-02 precedent. No log call.
    }
  };

  return (
    <pre
      ref={preRef}
      data-slot="code-block"
      className={cn(
        'group relative my-6 overflow-x-auto rounded-lg bg-card p-4 text-sm',
        className,
      )}
      {...props}
    >
      <span className="absolute top-2 left-3 z-10 font-mono text-xs text-muted-foreground select-none">
        {language}
      </span>
      <button
        type="button"
        onClick={onCopy}
        aria-label={copied ? t('copied') : t('copy')}
        className="border-border bg-background hover:bg-muted focus-visible:ring-ring absolute top-2 right-2 z-10 inline-flex h-7 w-7 items-center justify-center rounded border text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:outline-none"
      >
        <AnimatePresence mode="wait" initial={false}>
          {copied ? (
            <motion.span
              key="check"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            >
              <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            </motion.span>
          ) : (
            <motion.span
              key="copy"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            >
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>
      {children}
    </pre>
  );
}

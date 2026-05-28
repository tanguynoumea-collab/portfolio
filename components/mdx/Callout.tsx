// Server Component — no 'use client' (pure presentational, renders MDX children).
import type { ReactNode } from 'react';
import { Info, AlertTriangle, StickyNote } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CalloutVariant = 'info' | 'warning' | 'note';

export type CalloutProps = {
  variant?: CalloutVariant;
  title?: string;
  children: ReactNode;
};

const VARIANT_CONFIG: Record<
  CalloutVariant,
  { Icon: typeof Info; container: string; iconColor: string }
> = {
  info: {
    Icon: Info,
    container: 'border-l-primary bg-primary/5',
    iconColor: 'text-primary',
  },
  warning: {
    Icon: AlertTriangle,
    container: 'border-l-destructive bg-destructive/5',
    iconColor: 'text-destructive',
  },
  note: {
    Icon: StickyNote,
    container: 'border-l-border bg-muted',
    iconColor: 'text-muted-foreground',
  },
};

/**
 * <Callout> MDX component — info/warning/note variants (D-11, CONTENT-03).
 *
 * Server component (pure presentation, no interaction — NO 'use client').
 *
 * D-11 contract:
 *   - flex gap-3 rounded-lg border-l-4 p-4 my-6.
 *   - info:    bg-primary/5,     border-l-primary,     icon Info               text-primary.
 *   - warning: bg-destructive/5, border-l-destructive, icon AlertTriangle      text-destructive.
 *              (--destructive is the FIXED OKLCh from Phase 1 D-12 — a
 *              palette-independent warning signal; do NOT alias it to --color-*.)
 *   - note:    bg-muted,         border-l-border,      icon StickyNote         text-muted-foreground.
 *   - MDX children render inside <div className="flex-1">; paragraphs inherit the
 *     prose styling from mdx-components.tsx p/h overrides (no nested re-styling).
 *   - Optional title prop renders as a bold leading line.
 *
 * Zero color literals — every color is a palette-aliased Tailwind utility, so a
 * palette swap repaints the callout with no rebuild.
 *
 * Usage in MDX:
 *   <Callout variant="info" title="Note technique">
 *     Body text here.
 *   </Callout>
 */
export function Callout({ variant = 'note', title, children }: CalloutProps) {
  const { Icon, container, iconColor } = VARIANT_CONFIG[variant];

  return (
    <div
      role="note"
      className={cn(
        'my-6 flex gap-3 rounded-lg border-l-4 p-4 text-foreground',
        container,
      )}
    >
      <Icon
        className={cn('mt-0.5 h-5 w-5 shrink-0', iconColor)}
        aria-hidden="true"
      />
      <div className="flex-1">
        {title && <p className="mb-1 font-semibold">{title}</p>}
        {children}
      </div>
    </div>
  );
}

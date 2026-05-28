'use client';

/**
 * app/[locale]/error.tsx — A11Y-03 error boundary (Phase 6 D-08).
 *
 * Next.js App Router error boundaries are inherently Client Components — the
 * 'use client' directive is MANDATORY here (Pitfall 4). This file intentionally:
 *   - does NOT export `metadata`/`generateMetadata` (unsupported in a Client
 *     Component, would break the build),
 *   - does NOT import any server-only next-intl entry point,
 *   - does NOT declare a server directive or wire a Server Action.
 *
 * D-08 CLARIFICATION (locks the REQUIREMENTS.md A11Y-03 ambiguity): A11Y-03 reads
 * "bouton Reset via Server Actions" — NOT applicable. App Router error recovery
 * uses the framework-provided reset() prop, not a Server Action. We keep reset()
 * (the stable, documented prop). Next 16.2 added unstable_retry() and now nudges
 * toward it, but it is unstable-prefixed — reset() matches the locked decision.
 *
 * i18n: useTranslations('errors.500') resolves the EXISTING keys (Phase 1) —
 * title "Quelque chose s'est cassé", message "...j'ai cassé quelque chose...",
 * reset "Réessayer". Works client-side because [locale]/layout.tsx's
 * NextIntlClientProvider supplies the full message bundle up-tree.
 *
 * a11y: role="alert" surfaces the failure to assistive tech as a live region.
 *
 * Colors: palette CSS-var aliases only (text-foreground, text-muted-foreground).
 */

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errors.500');

  useEffect(() => {
    // Hook reserved for error reporting. Kept silent in prod per the project's
    // console-hygiene precedent (Phase 2 D-02 silent-fallback) — no console call.
  }, [error]);

  return (
    <div
      role="alert"
      className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 px-4 text-center"
    >
      <h1 className="text-foreground text-3xl font-semibold">{t('title')}</h1>
      <p className="text-muted-foreground">{t('message')}</p>
      <Button onClick={() => reset()}>{t('reset')}</Button>
    </div>
  );
}

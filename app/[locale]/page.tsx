import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('nav');
  return (
    <main className="bg-background text-foreground flex min-h-screen items-center justify-center">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-semibold">{t('home')}</h1>
        <p className="text-muted-foreground text-sm">Phase 1 foundations — i18n pipeline online.</p>
      </div>
    </main>
  );
}

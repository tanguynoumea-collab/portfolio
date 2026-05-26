import type { ReactNode } from 'react';
import './globals.css';

// Passthrough root layout: <html>, <head>, <body> live in app/[locale]/layout.tsx
// so <html lang={locale}> is locale-aware on first paint (next-intl recommended pattern).
// globals.css is imported here because Next.js requires a root layout file even when it's a passthrough.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}

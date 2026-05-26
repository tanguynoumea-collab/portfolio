import { redirect } from 'next/navigation';
import { routing } from '@/i18n/routing';

// Defensive fallback — proxy.ts already redirects '/' to '/{locale}', but if for any reason
// (e.g., static export) the proxy is bypassed, this page redirects to the default locale.
export default function RootPage() {
  redirect(`/${routing.defaultLocale}`);
}

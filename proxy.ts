import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match all paths except api routes, internals, and files with extensions (Pitfall #7)
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
};

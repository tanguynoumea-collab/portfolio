/**
 * i18n/navigation.ts — locale-aware next-intl 4.12 navigation helpers.
 *
 * createNavigation(routing) returns Link / redirect / usePathname / useRouter /
 * getPathname rebound to the routing config (locales + defaultLocale +
 * localePrefix). The exports are the canonical way to build locale-aware
 * navigation in App Router code:
 *
 *   - usePathname() returns the LOCALE-STRIPPED path (e.g. '/projects/foo',
 *     not '/fr/projects/foo'). This is exactly what LanguageSwitcher needs to
 *     feed back into useRouter().replace() when switching language.
 *   - useRouter().replace(pathname, { locale: target }) handles the locale
 *     swap while preserving the path (and dynamic params if passed in the
 *     object form: replace({ pathname, params }, { locale: target })).
 *   - Link is the locale-aware <a>. The shape Link href={{ pathname, params }}
 *     keeps dynamic segments correct across locales.
 *   - redirect / getPathname are exported for completeness so server-side
 *     consumers (route handlers, Server Actions) can use the same module.
 *
 * No 'use client' directive — this is a barrel/factory that works in both
 * server and client contexts. next-intl's createNavigation internally splits
 * the hooks (client) from redirect (server) at the consumer boundary.
 *
 * See:
 *   - .planning/phases/03-layout-animation-foundation/03-RESEARCH.md §4
 *   - https://next-intl.dev/docs/routing/navigation
 */
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);

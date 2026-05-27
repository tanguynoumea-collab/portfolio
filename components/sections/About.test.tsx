/**
 * About.test.tsx — RED harness for HOME-02.
 *
 * Wave 1 (04-02-about-PLAN) creates About.tsx and makes these pass.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next-intl', () => ({
  useTranslations: (ns: string) => (k: string) => {
    if (ns === 'about') {
      const map: Record<string, string> = {
        title: 'About me',
        'paragraphs.1': 'First paragraph placeholder.',
        'paragraphs.2': 'Second paragraph placeholder.',
      };
      return map[k] ?? `${ns}.${k}`;
    }
    return `${ns}.${k}`;
  },
}));

vi.mock('@gsap/react', () => ({ useGSAP: (fn: () => void) => fn() }));
vi.mock('gsap', () => ({
  gsap: {
    matchMedia: () => ({ add: () => undefined }),
    timeline: () => ({ from: () => ({ from: () => undefined }) }),
    set: vi.fn(),
    registerPlugin: vi.fn(),
  },
}));
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: { create: vi.fn() } }));

vi.mock('next/image', () => ({
  default: (props: { alt?: string; src?: string; width?: number; height?: number }) =>
    `IMG[src=${props.src} alt=${props.alt} ${props.width}x${props.height}]` as unknown as React.ReactElement,
}));

describe('About (HOME-02) — RED until Wave 1 ships', () => {
  it('renders paragraphs from about.paragraphs.{1,2} i18n keys', async () => {
    const { About } = await import('./About');
    render(<About />);
    expect(screen.getByText(/First paragraph/)).toBeTruthy();
    expect(screen.getByText(/Second paragraph/)).toBeTruthy();
  });
});

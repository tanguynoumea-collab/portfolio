'use client';

/**
 * components/sections/About.tsx — HOME-02 Phase 4.
 *
 * 2-column desktop / stacked mobile bio + portrait. ScrollTrigger reveal
 * via useGSAP({ scope }) + gsap.matchMedia reduced-motion gate.
 *
 * Pattern: 04-RESEARCH.md §"Pattern 2: ScrollTrigger inside the Lenis-bridged
 * provider tree" — LenisProvider already called `gsap.registerPlugin(ScrollTrigger)`
 * and bridged Lenis ↔ ScrollTrigger.update at module load. This component just
 * creates ScrollTrigger instances and trusts the bridge.
 *
 * The parent <section id="about"> wrapper is provided by app/[locale]/page.tsx.
 * This component renders an inner <div ref={aboutRef}> as the GSAP scope.
 *
 * The side-effect import `import 'gsap/ScrollTrigger'` merges the ScrollTrigger
 * type augmentation into gsap's typedef so `gsap.timeline({ scrollTrigger: ... })`
 * typechecks. Re-registration is idempotent — LenisProvider already did it.
 *
 * Colors: Tailwind utilities backed by --color-* tokens. No literal colors.
 */

import { useRef } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import 'gsap/ScrollTrigger';

// Minimal blur placeholder — base64 of a 10x10 warm-toned JPEG.
// Replaced when the user provides their real photo (see Wave 0 deferred).
const BLUR_DATA_URL =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wgARCAAKAAoDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAECBP/EABYBAQEBAAAAAAAAAAAAAAAAAAEAAv/aAAwDAQACEAMQAAABs0E//8QAFRABAQAAAAAAAAAAAAAAAAAAEDH/2gAIAQEAAQUCH//EABQRAQAAAAAAAAAAAAAAAAAAACD/2gAIAQMBAT8BH//EABQRAQAAAAAAAAAAAAAAAAAAACD/2gAIAQIBAT8BH//EABUQAQAAAAAAAAAAAAAAAAAAACD/2gAIAQEABj8CH//EABYQAAMAAAAAAAAAAAAAAAAAAAAxYf/aAAgBAQABPyEx/9oADAMBAAIAAwAAABAH/8QAFBEBAAAAAAAAAAAAAAAAAAAAIP/aAAgBAwEBPxAf/8QAFBEBAAAAAAAAAAAAAAAAAAAAIP/aAAgBAgEBPxAf/8QAFRABAQAAAAAAAAAAAAAAAAAAACD/2gAIAQEAAT8QH//Z';

export function About() {
  const aboutRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('about');

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          isReduced: '(prefers-reduced-motion: reduce)',
          isFull: '(prefers-reduced-motion: no-preference)',
        },
        (ctx) => {
          if (!ctx.conditions?.isFull) {
            // Reduced-motion: set elements to final state, no ScrollTrigger.
            gsap.set('[data-about-photo], [data-about-paragraph]', {
              opacity: 1,
              x: 0,
              y: 0,
            });
            return;
          }
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: aboutRef.current,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            },
          });
          tl.from('[data-about-photo]', {
            opacity: 0,
            x: -40,
            duration: 0.7,
            ease: 'power2.out',
          }).from(
            '[data-about-paragraph]',
            {
              opacity: 0,
              y: 30,
              duration: 0.6,
              stagger: 0.15,
              ease: 'power2.out',
            },
            '-=0.4',
          );
        },
      );
    },
    { scope: aboutRef },
  );

  return (
    <div ref={aboutRef} className="w-full">
      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
        <div data-about-photo className="md:col-span-1">
          <Image
            src="/about-photo.jpg"
            alt={t('title')}
            width={400}
            height={500}
            loading="lazy"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            priority={false}
            sizes="(max-width: 768px) 100vw, 33vw"
            className="h-auto w-full rounded-lg object-cover"
          />
        </div>
        <div className="space-y-4 md:col-span-2">
          <h2 className="text-foreground text-3xl font-semibold">
            {t('title')}
          </h2>
          <p
            data-about-paragraph
            className="text-foreground text-lg leading-relaxed"
          >
            {t('paragraphs.1')}
          </p>
          <p
            data-about-paragraph
            className="text-foreground text-lg leading-relaxed"
          >
            {t('paragraphs.2')}
          </p>
        </div>
      </div>
    </div>
  );
}

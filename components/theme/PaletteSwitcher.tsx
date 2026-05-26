'use client';

/**
 * components/theme/PaletteSwitcher.tsx — Client Component (THEME-10 + D-04..D-07).
 *
 * Right-anchored shadcn Sheet shell that assembles the 3-tab palette UI plus
 * the sticky-footer WCAGBadge. Wave 4 PaletteFab owns the open state and mounts
 * this Sheet on FAB click and on Konami unlock — that's why this component
 * accepts `open` + `onOpenChange` as controlled props rather than using
 * SheetTrigger.
 *
 * Layout decisions (RESEARCH.md Pattern 9 + 02-CONTEXT.md):
 *   - D-04: side="right" on SheetContent (right-anchored slide-in)
 *   - D-05: w-full on mobile, sm:max-w-[420px] on desktop (mid-range of the
 *           400-440px discretion window from CONTEXT.md — 420 balances content
 *           density of the 6-swatch HarmonicGenerator preview grid against
 *           common 13" laptop screen widths)
 *   - D-06: WCAGBadge in a border-t flex sibling of Tabs — naturally sticky-
 *           pinned to bottom of the SheetContent flex column (Pattern 9 from
 *           RESEARCH.md lines 624-656)
 *   - D-07: defaultValue="presets" (uncontrolled Tabs) — every Sheet open
 *           starts on Presets. Sheet unmounts SheetContent when closed so the
 *           next open resets to Presets without explicit reset logic. No
 *           last-used-tab persistence per CONTEXT.md.
 *
 * Phase 3 forward-compat:
 *   - data-lenis-prevent on the scrollable TabsContent area — when Phase 3
 *     wraps the app in LenisProvider for smooth scroll, this socket tells
 *     Lenis to NOT delegate the Sheet's internal scroll (Sheet content should
 *     scroll natively so the focus trap + Esc-to-close stay intact).
 *
 * Accessibility (delegated to Radix Dialog under shadcn Sheet):
 *   - Focus trap (Tab cycles inside SheetContent, doesn't leak to page)
 *   - Esc-to-close
 *   - aria-modal + role="dialog" on SheetContent
 *   - Manual keyboard verification per 02-VALIDATION.md row 02-SHEET-01
 *     (Radix internals are battle-tested; we verify visually at phase gate)
 *
 * No new test file in this plan — PaletteSwitcher is a pure composition shell.
 * Each of its 4 children (PalettePresets, CustomColorPicker, HarmonicGenerator,
 * WCAGBadge) has its own integration tests under components/theme/*.test.tsx.
 * Build + lint verification ensures the composition compiles + renders.
 */
import { useTranslations } from 'next-intl';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { CustomColorPicker } from './CustomColorPicker';
import { HarmonicGenerator } from './HarmonicGenerator';
import { PalettePresets } from './PalettePresets';
import { WCAGBadge } from './WCAGBadge';

export type PaletteSwitcherProps = {
  /** Controlled Sheet open state — owned by the caller (PaletteFab in Plan 06). */
  open: boolean;
  /** Sheet open/close handler — also wired to Esc-to-close + overlay click. */
  onOpenChange: (open: boolean) => void;
};

export function PaletteSwitcher({ open, onOpenChange }: PaletteSwitcherProps) {
  const t = useTranslations('palette');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col p-0 sm:max-w-[420px]"
        aria-describedby="palette-switcher-description"
      >
        <SheetHeader className="border-border border-b p-6">
          <SheetTitle>{t('title')}</SheetTitle>
          <SheetDescription
            id="palette-switcher-description"
            className="sr-only"
          >
            {t('title')}
          </SheetDescription>
        </SheetHeader>

        {/* D-07: Tabs always default to Presets on open. Uncontrolled
            (defaultValue) so each remount of SheetContent resets to Presets
            without explicit reset logic. PaletteFab in Plan 06 unmounts
            SheetContent on close via Sheet's open prop, so next open starts
            fresh on Presets. */}
        <Tabs
          defaultValue="presets"
          className="flex flex-1 flex-col overflow-hidden"
        >
          <TabsList className="mx-6 mt-4 grid grid-cols-3">
            <TabsTrigger value="presets">{t('tabs.presets')}</TabsTrigger>
            <TabsTrigger value="custom">{t('tabs.custom')}</TabsTrigger>
            <TabsTrigger value="generate">{t('tabs.generate')}</TabsTrigger>
          </TabsList>

          {/* data-lenis-prevent: Phase 3 forward-compat — LenisProvider will
              wrap the app in smooth scroll; this attribute tells Lenis to NOT
              delegate the Sheet's internal scroll. Costs nothing now. */}
          <div className="flex-1 overflow-y-auto p-6" data-lenis-prevent>
            <TabsContent value="presets" className="m-0">
              <PalettePresets />
            </TabsContent>
            <TabsContent value="custom" className="m-0">
              <CustomColorPicker />
            </TabsContent>
            <TabsContent value="generate" className="m-0">
              <HarmonicGenerator />
            </TabsContent>
          </div>
        </Tabs>

        {/* D-06: sticky-footer WCAGBadge — sibling of Tabs (NOT inside any
            TabsContent), naturally pinned to bottom of the flex column.
            Visible across all 3 tabs. border-t + backdrop-blur for the
            sticky-strip visual treatment. */}
        <div className="border-border bg-background/95 border-t p-4 backdrop-blur">
          <WCAGBadge />
        </div>
      </SheetContent>
    </Sheet>
  );
}

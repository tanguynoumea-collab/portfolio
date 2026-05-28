/**
 * lib/og.tsx — shared Satori-safe OG card JSX + Terra brand hex (D-04).
 *
 * THE ONE SANCTIONED HEX BOUNDARY: Satori (the renderer behind next/og's
 * ImageResponse) requires hex/rgb color values — it does NOT understand the
 * OKLCh CSS variables the rest of the app uses. So the OG cards convert the
 * Terra default palette (PALETTES[0], the cold-load default) to hex via
 * `oklchToHex`. Colors are still SOURCED from the palette, never hand-typed:
 * change Terra in lib/palettes.ts and the OG cards follow.
 *
 * OG snapshots are NOT theme-reactive (a static PNG can't track a runtime
 * palette swap), so using the cold-load default is correct and on-brand.
 *
 * CRITICAL Satori constraint (Pitfall 1): flexbox ONLY — NO `display: 'grid'`.
 * Every multi-child <div> MUST set `display: 'flex'` explicitly or Satori
 * collapses the layout. Inline `style={{}}` objects only (Satori does not run
 * Tailwind). Max bundle 500KB (one Inter weight keeps us well under).
 */
import { PALETTES } from '@/lib/palettes';
import { oklchToHex } from '@/lib/colors';

const terra = PALETTES[0]!; // DEFAULT_PALETTE_ID === 'terra' (PALETTES[0])

export const OG_COLORS = {
  bg: oklchToHex(terra.bg),
  surface: oklchToHex(terra.surface),
  text: oklchToHex(terra.text),
  textMuted: oklchToHex(terra.textMuted),
  accent: oklchToHex(terra.accent),
  secondary: oklchToHex(terra.secondary),
};

export const OG_SIZE = { width: 1200, height: 630 } as const;

// Satori: flex ONLY, no grid. Every multi-child div sets display:flex.
export function OgCard(props: { title: string; subtitle: string; badge?: string }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: OG_COLORS.bg,
        padding: '64px',
        fontFamily: 'Inter',
      }}
    >
      <div
        style={{
          display: 'flex',
          height: '12px',
          width: '160px',
          backgroundColor: OG_COLORS.accent,
          borderRadius: '6px',
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {props.badge && (
          <div
            style={{
              display: 'flex',
              alignSelf: 'flex-start',
              backgroundColor: OG_COLORS.secondary,
              color: OG_COLORS.bg,
              fontSize: 28,
              padding: '6px 18px',
              borderRadius: '999px',
              marginBottom: '20px',
            }}
          >
            {props.badge}
          </div>
        )}
        <div
          style={{
            display: 'flex',
            fontSize: 72,
            fontWeight: 600,
            color: OG_COLORS.text,
            lineHeight: 1.1,
          }}
        >
          {props.title}
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 36,
            color: OG_COLORS.textMuted,
            marginTop: '16px',
          }}
        >
          {props.subtitle}
        </div>
      </div>
    </div>
  );
}

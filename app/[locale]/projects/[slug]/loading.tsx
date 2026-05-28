/**
 * app/[locale]/projects/[slug]/loading.tsx — A11Y-03 fallback for the SLOWEST
 * route (Phase 6 D-09).
 *
 * The project detail page resolves a dynamic MDX import at request time
 * (Phase 5 CONTENT-02), so it is the route most likely to show a streaming
 * fallback. Rather than duplicate the JSX (and risk divergence), re-export the
 * locale-level Loading component — both are tiny Server Components with the
 * identical role="status" + motion-safe pulse contract.
 *
 * Path: from app/[locale]/projects/[slug]/ up two segments (../../) to
 * app/[locale]/loading.
 */

export { default } from '../../loading';

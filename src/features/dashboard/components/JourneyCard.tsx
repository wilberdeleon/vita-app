import { GlassSurface } from '../../../components/ui';
import { radii, spacing } from '../../../theme/tokens';
import { JourneySection } from './JourneySection';
import type { JourneySnapshot } from '../types';

type Props = {
  journey: JourneySnapshot;
};

/**
 * Current Journey (founders, 2026-07-22 — final Sprint 1 density pass).
 * Split back out from the combined Journey+Macros card: this card now
 * carries only the stage/timeline/progress content (JourneySection,
 * unchanged) — no macros, no divider, one clear purpose. Macros moved to
 * their own lighter-weight MacrosCard below.
 */
export function JourneyCard({ journey }: Props) {
  return (
    <GlassSurface variant="card" radius={radii.glassLarge} padding={spacing.xxl}>
      <JourneySection journey={journey} />
    </GlassSurface>
  );
}

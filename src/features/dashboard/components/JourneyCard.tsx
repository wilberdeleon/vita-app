import { router } from 'expo-router';
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
 *
 * Tap-to-navigate to /journey restored (Sprint 1 closeout, 2026-08-02) —
 * present on the original Sprint 0 JourneyCard, dropped somewhere across
 * the redesign's many iterations. Minimal restoration via GlassSurface's
 * existing onPress, no visual change.
 */
export function JourneyCard({ journey }: Props) {
  return (
    <GlassSurface
      variant="card"
      radius={radii.glassLarge}
      padding={spacing.xxl}
      onPress={() => router.push('/journey')}
      accessibilityRole="button"
      accessibilityLabel="View Journey"
    >
      <JourneySection journey={journey} />
    </GlassSurface>
  );
}

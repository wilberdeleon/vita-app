import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SegmentedTabs } from '../../../components/ui';
import { palette, spacing } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import type { JourneyPillar, JourneyViewData } from '../types';
import { OverviewPillar } from './OverviewPillar';
import { PhotosPillar } from './PhotosPillar';
import { WeightPillar } from './WeightPillar';
import { useJourneyAccent } from './useJourneyAccent';

const PILLARS: readonly JourneyPillar[] = ['overview', 'weight', 'photos'];
const LABELS = ['Overview', 'Weight', 'Photos'] as const;

type Props = {
  data: JourneyViewData;
  /**
   * Which pillar opens first. Release never passes it — Journey opens on
   * Overview. The `__DEV__` preview uses it to deep-link a pillar for review.
   */
  initialPillar?: JourneyPillar;
};

/**
 * Journey's three first-class pillars — Overview · Weight · Photos (6.3).
 *
 * The same component renders release and the `__DEV__` preview; only the
 * `data` differs, and it is required. The selected pillar is local state:
 * nothing is persisted, and every visit opens on Overview.
 *
 * The selector is the shared `SegmentedTabs`, in Journey gold. Gold is too
 * light for white text in Dark, so the selected label turns ink there.
 */
export function JourneyView({ data, initialPillar = 'overview' }: Props) {
  const { scheme } = useTheme();
  const accent = useJourneyAccent();
  const [index, setIndex] = useState(PILLARS.indexOf(initialPillar));
  const pillar = PILLARS[index];

  return (
    <View style={styles.root}>
      <SegmentedTabs
        options={LABELS}
        selectedIndex={index}
        onChange={setIndex}
        groupLabel="Journey"
        activeColor={accent}
        activeLabelColor={scheme === 'dark' ? palette.ink : palette.textOnColor}
        fitLabels
      />
      {/* Nothing until the real history is read, so an empty state never flashes over real records. */}
      {data.status === 'ready' ? (
        <>
          {pillar === 'overview' ? <OverviewPillar data={data} /> : null}
          {pillar === 'weight' ? <WeightPillar data={data} /> : null}
          {pillar === 'photos' ? <PhotosPillar data={data} /> : null}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.xxl,
  },
});

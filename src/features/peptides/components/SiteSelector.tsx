import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { TextField } from '../../../components/ui';
import {
  SITE_REGIONS,
  createSiteSnapshot,
  regionLabel,
  type InjectionSiteRegion,
  type InjectionSiteSide,
  type InjectionSiteSnapshot,
} from '../../../lib/peptides';
import { palette, radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

type Props = {
  value?: InjectionSiteSnapshot;
  onChange: (site: InjectionSiteSnapshot | undefined) => void;
  /**
   * Where the last administration was recorded, shown as a memory aid.
   * Deliberately **not** used to preselect anything — see below.
   */
  lastRecordedLabel?: string;
};

const SIDES: Array<{ side: InjectionSiteSide; label: string }> = [
  { side: 'left', label: 'Left' },
  { side: 'right', label: 'Right' },
  { side: 'center', label: 'Center' },
];

/**
 * Choosing where an administration happened.
 *
 * **Optional, and never preselected.** The field starts empty every time,
 * including when a previous site exists. Preselecting last time's site would
 * turn a record into a suggestion — the user would be accepting VITA's answer
 * rather than stating their own, and the app has no business having an answer.
 * The last site is shown as a line of context instead, which is the memory aid
 * people actually want without the implication.
 *
 * **Two steps, not a wall of buttons.** Region first, then side, so the option
 * count stays at five and three rather than a combinatorial grid. Built on
 * React Native's own `Modal`, matching `CategorySelector` — one dependency for
 * one sheet is not a trade worth making.
 *
 * Nothing here ranks, orders by preference, marks a site as due, or avoids
 * one. Every option is styled identically, on purpose.
 */
export function SiteSelector({ value, onChange, lastRecordedLabel }: Props) {
  const { surfaces } = useTheme();
  const [open, setOpen] = useState(false);
  const [region, setRegion] = useState<InjectionSiteRegion | null>(null);
  const [custom, setCustom] = useState('');

  const close = () => {
    setOpen(false);
    setRegion(null);
    setCustom('');
  };

  const commit = (nextRegion: InjectionSiteRegion, side: InjectionSiteSide, label?: string) => {
    onChange(createSiteSnapshot(nextRegion, side, label));
    close();
  };

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={
          value ? `Injection site, currently ${value.label}. Opens the site picker` : 'Choose injection site'
        }
        style={[styles.control, { backgroundColor: surfaces.card, borderColor: surfaces.border }]}
      >
        <View style={styles.controlText}>
          <Text style={[styles.controlLabel, { color: surfaces.textTertiary }]}>INJECTION SITE</Text>
          <Text style={[styles.controlValue, { color: value ? surfaces.text : surfaces.textTertiary }]}>
            {value ? value.label : 'Optional — choose a site'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={surfaces.textTertiary} />
      </Pressable>

      {value ? (
        <Pressable
          onPress={() => onChange(undefined)}
          accessibilityRole="button"
          accessibilityLabel="Clear injection site"
          hitSlop={8}
          style={styles.clear}
        >
          <Text style={[styles.clearLabel, { color: palette.peptide }]}>Clear site</Text>
        </Pressable>
      ) : lastRecordedLabel ? (
        // Context, not a default. Stating what happened last is a memory aid;
        // filling the field in with it would be a recommendation.
        <Text style={[styles.hint, { color: surfaces.textTertiary }]}>
          Last recorded · {lastRecordedLabel}
        </Text>
      ) : null}

      <Modal visible={open} animationType="slide" transparent onRequestClose={close}>
        <Pressable style={styles.backdrop} onPress={close} accessibilityLabel="Close site picker" />
        <View style={[styles.sheet, { backgroundColor: surfaces.background }]}>
          <View style={styles.sheetHead}>
            <Text style={[styles.sheetTitle, { color: surfaces.text }]}>
              {region === null ? 'Injection site' : regionLabel(region)}
            </Text>
            <Pressable onPress={close} accessibilityRole="button" accessibilityLabel="Close" hitSlop={10}>
              <Ionicons name="close" size={22} color={surfaces.textSecondary} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.sheetBody}>
            {region === null ? (
              SITE_REGIONS.map((option) => (
                <Pressable
                  key={option}
                  // Custom opens a name field; the rest open a side choice.
                  onPress={() => setRegion(option)}
                  accessibilityRole="button"
                  accessibilityLabel={regionLabel(option)}
                  style={[styles.option, { backgroundColor: surfaces.card, borderColor: surfaces.border }]}
                >
                  <Text style={[styles.optionLabel, { color: surfaces.text }]}>
                    {regionLabel(option)}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={surfaces.textTertiary} />
                </Pressable>
              ))
            ) : region === 'custom' ? (
              <>
                <TextField
                  label="Site name"
                  placeholder="e.g. Left Hip"
                  value={custom}
                  onChangeText={setCustom}
                  accessibilityLabel="Custom injection site name"
                />
                <Pressable
                  onPress={() => commit('custom', 'none', custom)}
                  disabled={custom.trim().length === 0}
                  accessibilityRole="button"
                  accessibilityLabel="Use this site name"
                  style={[
                    styles.option,
                    { backgroundColor: surfaces.card, borderColor: surfaces.border },
                    custom.trim().length === 0 && styles.disabled,
                  ]}
                >
                  <Text style={[styles.optionLabel, { color: palette.peptide }]}>Use this name</Text>
                </Pressable>
              </>
            ) : (
              SIDES.map(({ side, label }) => (
                <Pressable
                  key={side}
                  onPress={() => commit(region, side)}
                  accessibilityRole="button"
                  accessibilityLabel={`${regionLabel(region)}, ${label}`}
                  style={[styles.option, { backgroundColor: surfaces.card, borderColor: surfaces.border }]}
                >
                  <Text style={[styles.optionLabel, { color: surfaces.text }]}>{label}</Text>
                </Pressable>
              ))
            )}

            {region !== null ? (
              <Pressable
                onPress={() => setRegion(null)}
                accessibilityRole="button"
                accessibilityLabel="Back to regions"
                style={styles.back}
              >
                <Text style={[styles.backLabel, { color: surfaces.textSecondary }]}>Back</Text>
              </Pressable>
            ) : null}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  control: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    borderRadius: radii.control,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
  },
  controlText: {
    flex: 1,
    gap: 2,
  },
  controlLabel: {
    ...typography.micro,
    letterSpacing: 0.6,
  },
  controlValue: {
    ...typography.body,
  },
  clear: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
  },
  clearLabel: {
    ...typography.caption,
  },
  hint: {
    ...typography.caption,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    maxHeight: '70%',
    paddingBottom: spacing.xxl,
  },
  sheetHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.l,
    paddingBottom: spacing.s,
  },
  sheetTitle: {
    ...typography.heading,
  },
  sheetBody: {
    gap: spacing.s,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.l,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radii.control,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
  },
  disabled: {
    opacity: 0.5,
  },
  optionLabel: {
    ...typography.body,
  },
  back: {
    alignItems: 'center',
    paddingVertical: spacing.m,
  },
  backLabel: {
    ...typography.caption,
  },
});

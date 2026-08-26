import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, SegmentedTabs, TextField } from '../../../components/ui';
import {
  SITE_GROUPS,
  createSiteSnapshot,
  siteKeyLabel,
  siteShortLabel,
  type BodyView,
  type InjectionSiteKey,
  type InjectionSiteSnapshot,
} from '../../../lib/peptides';
import { palette, radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import { BodyMap } from './BodyMap';

type Props = {
  value?: InjectionSiteSnapshot;
  onChange: (site: InjectionSiteSnapshot | undefined) => void;
  /**
   * Where the last administration was recorded, shown as a memory aid.
   * Deliberately **not** used to preselect anything — see below.
   */
  lastRecordedLabel?: string;
};

const VIEWS: readonly BodyView[] = ['front', 'back'];
const VIEW_LABELS = ['Front', 'Back'];

/**
 * Choosing where an administration happened.
 *
 * **Optional, and never preselected.** The field starts empty every time,
 * including when a previous site exists. Preselecting last time's site would
 * turn a record into a suggestion — the user would be accepting VITA's answer
 * rather than stating their own. The last site is shown as a line of context
 * instead, which is the memory aid people actually want without the
 * implication.
 *
 * **The map is primary, the list is equal.** Slice 3.8 shipped a two-step
 * text picker and the founder wanted to *see* the body. But a figure alone
 * would be unusable with VoiceOver and untestable, so both paths are always
 * present and either records the same canonical site.
 *
 * **The row stays small until asked.** A full figure permanently embedded in
 * every log form would dominate a screen whose job is "type a number and
 * save". It opens on tap and closes when done.
 */
export function SiteSelector({ value, onChange, lastRecordedLabel }: Props) {
  const { surfaces } = useTheme();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<BodyView>('front');
  const [draft, setDraft] = useState<InjectionSiteSnapshot | undefined>(value);
  const [custom, setCustom] = useState('');

  const start = () => {
    setDraft(value);
    setCustom(value?.key === 'custom' ? (value.customLabel ?? '') : '');
    // Open on the view the current selection lives on, so an existing choice
    // is visible rather than hidden one tap away.
    setView(value?.key.startsWith('glute') ? 'back' : 'front');
    setOpen(true);
  };

  const choose = (key: InjectionSiteKey) => {
    setDraft(createSiteSnapshot(key));
    setCustom('');
  };

  const done = () => {
    if (draft?.key === 'custom') {
      onChange(custom.trim().length > 0 ? createSiteSnapshot('custom', custom) : undefined);
    } else {
      onChange(draft);
    }
    setOpen(false);
  };

  return (
    <>
      <Pressable
        onPress={start}
        accessibilityRole="button"
        accessibilityLabel={
          value
            ? `Injection site, currently ${value.label}. Opens the site picker`
            : 'Choose injection site'
        }
        style={[styles.control, { backgroundColor: surfaces.card, borderColor: surfaces.border }]}
      >
        <View style={styles.controlText}>
          <Text style={[styles.controlLabel, { color: surfaces.textTertiary }]}>INJECTION SITE</Text>
          <Text style={[styles.controlValue, { color: value ? surfaces.text : surfaces.textTertiary }]}>
            {value ? value.label : 'Choose Site'}
          </Text>
        </View>
        {value ? <Text style={[styles.change, { color: palette.peptide }]}>Change</Text> : null}
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

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <Pressable
          style={styles.backdrop}
          onPress={() => setOpen(false)}
          accessibilityLabel="Close site picker"
        />
        <View style={[styles.sheet, { backgroundColor: surfaces.background }]}>
          <View style={styles.sheetHead}>
            <Text style={[styles.sheetTitle, { color: surfaces.text }]}>Choose Injection Site</Text>
            <Pressable
              onPress={() => setOpen(false)}
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={10}
            >
              <Ionicons name="close" size={22} color={surfaces.textSecondary} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.sheetBody}>
            <SegmentedTabs
              options={VIEW_LABELS}
              selectedIndex={VIEWS.indexOf(view)}
              onChange={(index) => setView(VIEWS[index])}
              activeColor={palette.peptide}
              groupLabel="Body view"
            />

            {/* Switching views never clears a choice — an arm selected from
                the front is the same arm from behind. */}
            <BodyMap view={view} selected={draft?.key} onSelect={choose} />

            <Text style={[styles.selected, { color: draft ? palette.peptide : surfaces.textTertiary }]}>
              {draft ? draft.label : 'No site selected'}
            </Text>

            {/*
             * The same choices in words. Not a fallback bolted on for
             * accessibility — it is genuinely faster for someone who already
             * knows the site they want, and it is the path VoiceOver can use
             * with confidence.
             */}
            {SITE_GROUPS.map((group) => (
              <View key={group.region} style={styles.group}>
                <Text style={[styles.groupLabel, { color: surfaces.textTertiary }]}>
                  {group.region.toUpperCase()}
                </Text>
                <View style={styles.chips}>
                  {group.keys.map((key) => {
                    const active = draft?.key === key;
                    return (
                      <Pressable
                        key={key}
                        onPress={() => choose(key)}
                        accessibilityRole="button"
                        accessibilityLabel={siteKeyLabel(key)}
                        accessibilityState={{ selected: active }}
                        style={[
                          styles.chip,
                          { borderColor: active ? palette.peptide : surfaces.border },
                          active && { backgroundColor: `${palette.peptide}1A` },
                        ]}
                      >
                        <Text
                          style={[
                            styles.chipLabel,
                            { color: active ? palette.peptide : surfaces.textSecondary },
                          ]}
                        >
                          {siteShortLabel(key)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}

            <View style={styles.group}>
              <Text style={[styles.groupLabel, { color: surfaces.textTertiary }]}>OTHER</Text>
              <TextField
                placeholder="Name your own — e.g. Left Hip"
                value={custom}
                onChangeText={(text) => {
                  setCustom(text);
                  setDraft(text.trim().length > 0 ? createSiteSnapshot('custom', text) : undefined);
                }}
                accessibilityLabel="Custom injection site name"
              />
            </View>

            <Button label="Done" color={palette.peptide} onPress={done} />
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
  change: {
    ...typography.caption,
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
    maxHeight: '88%',
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
    gap: spacing.m,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  selected: {
    ...typography.bodyMedium,
    textAlign: 'center',
    marginTop: -spacing.xs,
  },
  group: {
    gap: spacing.xs,
  },
  groupLabel: {
    ...typography.micro,
    letterSpacing: 0.6,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
  },
  chip: {
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
  },
  chipLabel: {
    ...typography.caption,
  },
});

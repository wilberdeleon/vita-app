import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, SegmentedTabs, TextField } from '../../../components/ui';
import {
  CUSTOM_SITE_OPTION_LABEL,
  SITE_PICKER_ORDER,
  createSiteSnapshot,
  siteKeyLabel,
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

/** Which layer of the sheet is showing. */
type Mode = 'list' | 'custom' | 'map';

/**
 * Choosing where an administration happened.
 *
 * **The list is the fast path; the body is the optional one** (slice 3.8B).
 * Logging is a thing people do in a hurry, standing up, several times a week,
 * and the earlier design put a full anatomical figure between them and a
 * choice they already knew. Now: tap the row, tap the site, done — one tap
 * inside the sheet, no region-then-side detour, because there are only ten
 * canonical places and naming one directly is faster than describing it.
 *
 * **The figure did not go away, and is not buried in Settings.** *View Body
 * Model* sits under the list wherever a log is written or edited. It answers
 * a genuinely different question — *which one is that?* — and someone who
 * wants it should not have to leave the form to get it.
 *
 * **Optional, and never preselected.** The field starts empty every time,
 * including when a previous site exists. Preselecting last time's site would
 * turn a record into a suggestion — the user would be accepting VITA's answer
 * rather than stating their own. The last site is shown as a line of context
 * instead, which is the memory aid people actually want without the
 * implication.
 */
export function SiteSelector({ value, onChange, lastRecordedLabel }: Props) {
  const { surfaces } = useTheme();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('list');
  const [view, setView] = useState<BodyView>('front');
  const [draft, setDraft] = useState<InjectionSiteSnapshot | undefined>(value);
  const [custom, setCustom] = useState('');

  const start = () => {
    setDraft(value);
    setCustom(value?.key === 'custom' ? (value.customLabel ?? '') : '');
    // Open on the view the current selection lives on, so an existing choice
    // is visible rather than hidden one tap away.
    setView(value?.key.startsWith('glute') ? 'back' : 'front');
    setMode(value?.key === 'custom' ? 'custom' : 'list');
    setOpen(true);
  };

  /** The whole point of the fast path: choose and the sheet is done. */
  const pick = (key: InjectionSiteKey) => {
    if (key === 'custom') {
      setDraft(custom.trim().length > 0 ? createSiteSnapshot('custom', custom) : undefined);
      setMode('custom');
      return;
    }
    onChange(createSiteSnapshot(key));
    setOpen(false);
  };

  /** Confirming from the figure or the custom field, where one tap cannot. */
  const confirm = () => {
    if (mode === 'custom') {
      onChange(custom.trim().length > 0 ? createSiteSnapshot('custom', custom) : undefined);
    } else {
      onChange(draft);
    }
    setOpen(false);
  };

  const confirmLabel = draft ? `Use ${draft.label}` : 'Done';

  return (
    <>
      <Pressable
        onPress={start}
        accessibilityRole="button"
        accessibilityLabel={
          value
            ? `Injection site, currently ${value.label}. Opens the site picker`
            : 'Select injection site'
        }
        style={[styles.control, { backgroundColor: surfaces.card, borderColor: surfaces.border }]}
      >
        <View style={styles.controlText}>
          <Text style={[styles.controlLabel, { color: surfaces.textTertiary }]}>INJECTION SITE</Text>
          <Text
            style={[styles.controlValue, { color: value ? surfaces.text : surfaces.textTertiary }]}
          >
            {value ? value.label : 'Select Site'}
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
          <Text style={[styles.clearLabel, { color: palette.peptide }]}>Clear Site</Text>
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
            {mode === 'list' ? (
              <Text style={[styles.sheetTitle, { color: surfaces.text }]}>Injection Site</Text>
            ) : (
              // Back rather than close: these layers are a step in, not a
              // different task, and closing outright would lose the list.
              <Pressable
                onPress={() => setMode('list')}
                accessibilityRole="button"
                accessibilityLabel="Back to site list"
                hitSlop={10}
                style={styles.back}
              >
                <Ionicons name="chevron-back" size={20} color={palette.peptide} />
                <Text style={[styles.sheetTitle, { color: surfaces.text }]}>
                  {mode === 'map' ? 'Body Model' : 'Custom Site'}
                </Text>
              </Pressable>
            )}
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
            {mode === 'list' ? (
              <>
                <View style={[styles.list, { borderColor: surfaces.border }]}>
                  {SITE_PICKER_ORDER.map((key, index) => {
                    const active = value?.key === key;
                    const label = key === 'custom' ? CUSTOM_SITE_OPTION_LABEL : siteKeyLabel(key);
                    return (
                      <Pressable
                        key={key}
                        onPress={() => pick(key)}
                        accessibilityRole="button"
                        accessibilityLabel={label}
                        accessibilityState={{ selected: active }}
                        style={[
                          styles.row,
                          index > 0 && {
                            borderTopWidth: StyleSheet.hairlineWidth,
                            borderTopColor: surfaces.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.rowLabel,
                            { color: active ? palette.peptide : surfaces.text },
                          ]}
                        >
                          {label}
                        </Text>
                        {active ? (
                          <Ionicons name="checkmark" size={18} color={palette.peptide} />
                        ) : key === 'custom' ? (
                          <Ionicons
                            name="chevron-forward"
                            size={16}
                            color={surfaces.textTertiary}
                          />
                        ) : null}
                      </Pressable>
                    );
                  })}
                </View>

                {/*
                 * The visual path, offered rather than imposed. Styled as a
                 * secondary action because for most logs the list above has
                 * already answered the question.
                 */}
                <Pressable
                  onPress={() => setMode('map')}
                  accessibilityRole="button"
                  accessibilityLabel="View Body Model"
                  style={[styles.secondary, { borderColor: surfaces.border }]}
                >
                  <Ionicons name="body-outline" size={18} color={palette.peptide} />
                  <Text style={[styles.secondaryLabel, { color: palette.peptide }]}>
                    View Body Model
                  </Text>
                </Pressable>
              </>
            ) : mode === 'map' ? (
              <>
                <SegmentedTabs
                  options={VIEW_LABELS}
                  selectedIndex={VIEWS.indexOf(view)}
                  onChange={(index) => setView(VIEWS[index])}
                  activeColor={palette.peptide}
                  groupLabel="Body view"
                />

                {/* Switching views never clears a choice — an arm selected
                    from the front is the same arm from behind. */}
                <BodyMap view={view} selected={draft?.key} onSelect={(key) => setDraft(createSiteSnapshot(key))} />

                <Text
                  style={[
                    styles.selected,
                    { color: draft ? palette.peptide : surfaces.textTertiary },
                  ]}
                >
                  {draft ? draft.label : 'No site selected'}
                </Text>

                {/* Named, not just "Done" — nobody should have to wonder
                    whether the tap on the figure registered. */}
                <Button
                  label={confirmLabel}
                  color={palette.peptide}
                  onPress={confirm}
                  disabled={!draft}
                />
              </>
            ) : (
              <>
                <TextField
                  placeholder="Name the location — e.g. Hip"
                  value={custom}
                  onChangeText={setCustom}
                  accessibilityLabel="Custom injection site name"
                  autoFocus
                />
                <Button
                  label="Done"
                  color={palette.peptide}
                  onPress={confirm}
                  disabled={custom.trim().length === 0}
                />
              </>
            )}
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
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sheetTitle: {
    ...typography.heading,
  },
  sheetBody: {
    gap: spacing.m,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  list: {
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.s,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    minHeight: 48,
  },
  rowLabel: {
    ...typography.body,
  },
  secondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.s,
    borderRadius: radii.control,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.m,
  },
  secondaryLabel: {
    ...typography.bodyMedium,
  },
  selected: {
    ...typography.bodyMedium,
    textAlign: 'center',
    marginTop: -spacing.xs,
  },
});

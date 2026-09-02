import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { RESEARCH_AREAS, researchAreaLabel, type AreaFilter } from '../../../lib/peptides';
import { palette, radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

type Props = {
  value: AreaFilter;
  onChange: (value: AreaFilter) => void;
};

/**
 * The second-level research-area filter, as one compact control.
 *
 * Twelve areas as a second chip row would have doubled the height of the
 * catalog header and pushed the actual list off the first screen — the founder
 * was explicit about not wanting that. So the control stays a single quiet row
 * that states the current selection, and the twelve options live in a sheet
 * that only exists while it is being used.
 *
 * Built from React Native's own `Modal` rather than a sheet library: one
 * dependency for one selector is not a trade worth making, and this is the
 * same restraint the rest of VITA's UI kit follows.
 */
export function CategorySelector({ value, onChange }: Props) {
  const { surfaces } = useTheme();
  const [open, setOpen] = useState(false);

  const current = value === 'all' ? 'All Categories' : researchAreaLabel(value);
  const isFiltered = value !== 'all';

  const select = (next: AreaFilter) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <>
      <View style={styles.controlRow}>
        <Pressable
          onPress={() => setOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={`Category filter, currently ${current}. Opens a list of categories`}
          style={[
            styles.control,
            { borderColor: isFiltered ? palette.peptide : surfaces.border },
            isFiltered && { backgroundColor: `${palette.peptide}14` },
          ]}
        >
          <Ionicons
            name="funnel-outline"
            size={14}
            color={isFiltered ? palette.peptide : surfaces.textTertiary}
          />
          <Text
            style={[styles.controlLabel, { color: isFiltered ? palette.peptide : surfaces.textSecondary }]}
            numberOfLines={1}
          >
            {current}
          </Text>
          <Ionicons
            name="chevron-down"
            size={14}
            color={isFiltered ? palette.peptide : surfaces.textTertiary}
          />
        </Pressable>

        {/*
          * A one-tap way back to everything. Without it, clearing a filter
          * means reopening the sheet and hunting for "All Categories", which
          * is three interactions to undo one.
          */}
        {isFiltered ? (
          <Pressable
            onPress={() => onChange('all')}
            accessibilityRole="button"
            accessibilityLabel="Clear category filter"
            hitSlop={10}
            style={styles.clear}
          >
            <Text style={[styles.clearLabel, { color: surfaces.textTertiary }]}>Clear</Text>
          </Pressable>
        ) : null}
      </View>

      <Modal
        visible={open}
        animationType="slide"
        transparent
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={styles.backdrop}
          accessibilityRole="button"
          accessibilityLabel="Close category list"
          onPress={() => setOpen(false)}
        />
        <View style={[styles.sheet, { backgroundColor: surfaces.card, borderColor: surfaces.border }]}>
          <View style={styles.sheetHeader}>
            <Text
              style={[styles.sheetTitle, { color: surfaces.text }]}
              accessibilityRole="header"
            >
              Category
            </Text>
            <Pressable
              onPress={() => setOpen(false)}
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={10}
            >
              <Ionicons name="close" size={22} color={surfaces.textSecondary} />
            </Pressable>
          </View>

          <ScrollView>
            <Option label="All Categories" selected={value === 'all'} onPress={() => select('all')} />
            {RESEARCH_AREAS.map((area) => (
              <Option
                key={area}
                label={researchAreaLabel(area)}
                selected={value === area}
                onPress={() => select(area)}
              />
            ))}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

function Option({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { surfaces } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      // Selection is a purple tick, which a screen reader cannot see.
      accessibilityState={{ selected }}
      style={[styles.option, { borderTopColor: surfaces.border }]}
    >
      <Text
        style={[
          styles.optionLabel,
          { color: selected ? palette.peptide : surfaces.text },
          selected && styles.optionSelected,
        ]}
      >
        {label}
      </Text>
      {selected ? <Ionicons name="checkmark" size={18} color={palette.peptide} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    marginTop: -spacing.xs,
  },
  control: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.m,
    paddingVertical: 8,
    flexShrink: 1,
  },
  controlLabel: {
    ...typography.caption,
    flexShrink: 1,
  },
  clear: {
    paddingVertical: 4,
  },
  clearLabel: {
    ...typography.caption,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '72%',
    borderTopWidth: 1,
    borderTopLeftRadius: radii.glassLarge,
    borderTopRightRadius: radii.glassLarge,
    paddingBottom: spacing.xxl,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.l,
  },
  sheetTitle: {
    ...typography.heading,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.l,
    borderTopWidth: StyleSheet.hairlineWidth,
    minHeight: 48,
  },
  optionLabel: {
    ...typography.body,
  },
  optionSelected: {
    fontWeight: '600',
  },
});

import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale, VitaSheet } from '../../../components/ui';
import { vitaHaptic } from '../../../lib/haptics';
import { spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import {
  MODULE_LABELS,
  isHidden,
  moveModule,
  toggleModule,
  type DashboardLayout,
} from '../modules';

type Props = {
  visible: boolean;
  layout: DashboardLayout;
  onChange: (next: DashboardLayout) => void;
  onClose: () => void;
};

/**
 * Customize Home — show, hide, reorder. Nothing else.
 *
 * **Deliberately not a page builder.** No resize handles, no grid snapping,
 * no per-module colours or styles, no freeform positioning. VITA chooses the
 * right shape for each module; the user chooses which ones they want and in
 * what order. Someone who does not take peptides can switch that module off
 * and Home stops mentioning them — which was the point of the request.
 *
 * **Reordering is buttons, not dragging.** Drag would mean adding
 * `react-native-gesture-handler` and `react-native-reanimated` — two native
 * dependencies — to move five rows, and a drag target is pointer-only until
 * custom accessibility actions are built on top of it. Move up and move down
 * are reachable by every input method with no dependency and no extra work,
 * and each announces exactly what it does.
 *
 * **The header is not in this list.** VITA branding, the greeting, the date
 * and Settings are structural: they orient the screen and one of them is the
 * way out of it. Only content modules are customisable.
 *
 * Changes apply immediately and persist as they are made — there is no Save
 * button, so there is nothing to lose by closing the sheet.
 */
export function CustomizeHomeSheet({ visible, layout, onChange, onClose }: Props) {
  const { surfaces } = useTheme();

  return (
    <VitaSheet visible={visible} onClose={onClose} title="Customize Home">
      <Text style={[styles.intro, { color: surfaces.textTertiary }]}>
        Choose which sections appear on Home, and their order.
      </Text>

      <View style={styles.list}>
        {layout.order.map((id, index) => {
          const hidden = isHidden(layout, id);
          const label = MODULE_LABELS[id];
          const first = index === 0;
          const last = index === layout.order.length - 1;

          return (
            <View
              key={id}
              style={[styles.row, index > 0 && styles.divided, index > 0 && { borderTopColor: surfaces.border }]}
            >
              <PressableScale
                onPress={() => {
                  vitaHaptic('selection');
                  onChange(toggleModule(layout, id));
                }}
                hitSlop={6}
                accessibilityLabel={hidden ? `Show ${label}` : `Hide ${label}`}
                accessibilityState={{ checked: !hidden }}
                style={styles.toggle}
              >
                <Ionicons
                  name={hidden ? 'ellipse-outline' : 'checkmark-circle'}
                  size={22}
                  color={hidden ? surfaces.textTertiary : surfaces.text}
                />
              </PressableScale>

              <Text
                style={[styles.label, { color: hidden ? surfaces.textTertiary : surfaces.text }]}
                numberOfLines={1}
              >
                {label}
              </Text>

              <View style={styles.moves}>
                <PressableScale
                  onPress={() => {
                    vitaHaptic('selection');
                    onChange(moveModule(layout, id, 'up'));
                  }}
                  disabled={first}
                  hitSlop={6}
                  accessibilityLabel={`Move ${label} up`}
                  style={[styles.move, first && styles.disabled]}
                >
                  <Ionicons name="chevron-up" size={18} color={surfaces.textSecondary} />
                </PressableScale>

                <PressableScale
                  onPress={() => {
                    vitaHaptic('selection');
                    onChange(moveModule(layout, id, 'down'));
                  }}
                  disabled={last}
                  hitSlop={6}
                  accessibilityLabel={`Move ${label} down`}
                  style={[styles.move, last && styles.disabled]}
                >
                  <Ionicons name="chevron-down" size={18} color={surfaces.textSecondary} />
                </PressableScale>
              </View>
            </View>
          );
        })}
      </View>

      <Text style={[styles.note, { color: surfaces.textTertiary }]}>
        The VITA header, greeting and Settings always stay.
      </Text>
    </VitaSheet>
  );
}

const styles = StyleSheet.create({
  intro: {
    ...typography.caption,
    marginTop: spacing.m,
  },
  list: {
    marginTop: spacing.m,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    paddingVertical: spacing.m,
    minHeight: 52,
  },
  divided: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  toggle: {
    minWidth: 26,
    alignItems: 'center',
  },
  label: {
    ...typography.bodyMedium,
    flex: 1,
  },
  moves: {
    flexDirection: 'row',
    gap: spacing.s,
  },
  move: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.3,
  },
  note: {
    ...typography.caption,
    marginTop: spacing.l,
  },
});

import { Ionicons } from '@expo/vector-icons';
import type { PropsWithChildren } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radii, spacing, typography } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';
import { useReducedMotion } from '../../theme/useReducedMotion';

type Props = PropsWithChildren<{
  visible: boolean;
  onClose: () => void;
  /** Shown in the head, and spoken as the sheet's name unless overridden. */
  title?: string;
  /** Spoken name for the sheet as a whole. Defaults to `title`. */
  accessibilityLabel?: string;
  /**
   * Let the content scroll. On by default, because a sheet that cannot scroll
   * is a sheet that traps its own last row on a small phone. Turn it off for
   * content that manages its own scrolling.
   */
  scroll?: boolean;
}>;

/**
 * VITA's bottom sheet (Sprint 5 slice 5.1).
 *
 * **Extracted, not invented.** The Sprint 5 planning audit found four
 * hand-rolled `Modal` sheets in `src/features/peptides/components/` —
 * `TakenSheet`, `RoutineDaySheet`, `CategorySelector`, `SiteSelector` — two of
 * which carried a byte-identical backdrop and shell. Every one of them works
 * and is founder-approved; what they lacked was a shared definition of what a
 * VITA sheet *is*. This is that definition, and slice 5.7 converges them onto
 * it. Nothing here changes how any of them currently behave.
 *
 * **Built on React Native's own `Modal`**, which is what all four already do —
 * `CategorySelector` recorded the reasoning at the time and it still holds.
 * `@gorhom/bottom-sheet` would add `react-native-reanimated` *and*
 * `react-native-gesture-handler` to buy snap points and drag physics that
 * nothing in this product needs.
 *
 * **Deliberately small.** No snap points, no drag-to-dismiss, no nested
 * sheets, no global sheet manager. A sheet appears, holds one task, and
 * leaves. When something genuinely needs more, that is a case to make with a
 * screen behind it, not a framework to build in advance.
 *
 * **Why a sheet rather than a route.** A route is the right home for a task
 * with its own address — one you can navigate back to, deep-link into, or
 * leave and return to. A sheet is for a decision made *in place*, where
 * pushing a whole screen would lose the context the decision is about. Logging
 * a glass of water while looking at today's hydration is the second kind: the
 * thing you are changing should still be on screen while you change it.
 */
export function VitaSheet({
  visible,
  onClose,
  title,
  accessibilityLabel,
  scroll = true,
  children,
}: Props) {
  const insets = useSafeAreaInsets();
  const { surfaces } = useTheme();
  const reducedMotion = useReducedMotion();

  const body = <View style={styles.body}>{children}</View>;

  return (
    <Modal
      visible={visible}
      /**
       * Reduced motion presents the sheet with no slide. The sheet's job is to
       * be *there*; the travel is decoration, and this is the one place the
       * platform lets us drop it without reimplementing the presentation.
       */
      animationType={reducedMotion ? 'none' : 'slide'}
      transparent
      // Android's hardware back button. Without this the sheet is a trap there.
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      {/*
       * The backdrop is a real control, not a scrim: tapping outside is how
       * most people dismiss a sheet. It is labelled so a screen reader can do
       * the same thing, and it sits before the sheet in source order so
       * VoiceOver reaches the content first.
       */}
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.dock}
        pointerEvents="box-none"
      >
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: surfaces.background,
              borderColor: surfaces.border,
              // The home indicator, plus breathing room. A sheet whose last
              // control sits on the gesture bar is a sheet you fight.
              paddingBottom: insets.bottom + spacing.l,
            },
          ]}
          accessibilityLabel={accessibilityLabel ?? title}
        >
          {/*
           * A grabber, purely as an affordance: it says "this came from the
           * bottom and goes back there". Decorative — the sheet is not
           * draggable — so it is hidden from assistive technology rather than
           * announced as something to grab.
           */}
          <View
            style={[styles.grabber, { backgroundColor: surfaces.textTertiary }]}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          />

          {title ? (
            <View style={styles.head}>
              <Text style={[styles.title, { color: surfaces.text }]} numberOfLines={1}>
                {title}
              </Text>
              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Close"
                hitSlop={12}
              >
                <Ionicons name="close" size={22} color={surfaces.textSecondary} />
              </Pressable>
            </View>
          ) : null}

          {scroll ? (
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {body}
            </ScrollView>
          ) : (
            body
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    /**
     * Deeper than the 0.4 the existing sheets use. On a near-black app a
     * shallow scrim leaves the sheet and the screen behind it at almost the
     * same value, so the sheet reads as a panel that appeared rather than a
     * layer that came forward. Light mode needs the depth for the opposite
     * reason: without it, a light sheet on a light screen has no edge at all.
     */
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  dock: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: radii.glassLarge,
    borderTopRightRadius: radii.glassLarge,
    /**
     * A hairline along the top edge only. Same reasoning `Card` records for
     * its border: against a near-black background a shadow does nothing, and
     * this line is what separates the sheet from the screen behind it.
     */
    borderTopWidth: 1,
    maxHeight: '88%',
  },
  grabber: {
    width: 36,
    height: 4,
    borderRadius: radii.pill,
    alignSelf: 'center',
    marginTop: spacing.m,
    opacity: 0.5,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.m,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.l,
  },
  title: {
    ...typography.heading,
    flexShrink: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  body: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.l,
  },
});

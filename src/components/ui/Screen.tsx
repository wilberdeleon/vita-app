import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DOCK_CLEARANCE, spacing } from '../../theme/tokens';

/** Enough room to scroll a form's foot clear of an open numeric keypad. */
const KEYBOARD_CLEARANCE = 320;
import { useTheme } from '../../theme/ThemeProvider';

type Props = PropsWithChildren<{
  /** Scrollable by default; set false for fixed layouts (e.g. barcode scanner). */
  scroll?: boolean;
  /** Reserve space for the floating dock. On for dock tabs, off for stacked screens. */
  dockClearance?: boolean;
  /**
   * Gap between top-level children. Defaults to the original flat rhythm
   * (spacing.l) so existing screens are unaffected. Screens built around the
   * Section primitive (see Section.tsx) should pass spacing.xxl here for
   * section-level rhythm — content *within* a Section stays tight, so
   * hierarchy reads from spacing alone.
   */
  contentGap?: number;
  /**
   * Defaults to true (unchanged behavior everywhere): the root pads for the
   * top safe area before any content renders. Set false only when the first
   * child is meant to bleed edge-to-edge under the status bar/notch (e.g. a
   * full-width hero image) — that child is then responsible for its own
   * safe-area-aware internal padding.
   */
  topInset?: boolean;
  /** Outer horizontal inset. Defaults to spacing.xl (unchanged everywhere else). */
  horizontalInset?: number;
  /**
   * Keyboard-aware scrolling, for screens whose content must stay readable
   * while a keyboard is open.
   *
   * **Opt-in, so no existing screen changes behaviour.** It matters on forms
   * where the thing you need to see sits *below* the field you are typing
   * into — the peptide calculator being the case that made it necessary. It
   * adds three things: a tap outside a field dismisses the keyboard instead
   * of being swallowed, dragging the scroll view dismisses it too, and enough
   * extra bottom padding that the last content can be scrolled clear of the
   * keyboard rather than being permanently trapped behind it.
   */
  keyboardAware?: boolean;
}>;

/**
 * Every screen's root now follows the active theme (app-wide visual
 * consistency pass) — the earlier `themed` opt-in prop is gone. It existed
 * only because the clean redesign was scoped to Home, so the rest of the app
 * had to stay pinned to the light background; with the whole app on the
 * theme system, an opt-out would just be a way to leave a screen broken in
 * dark mode. Light mode is unaffected: `surfaces.background` resolves to the
 * same warm cream `palette.background` these screens already used.
 */
export function Screen({
  children,
  scroll = true,
  dockClearance = false,
  contentGap = spacing.l,
  topInset = true,
  horizontalInset = spacing.xl,
  keyboardAware = false,
}: Props) {
  const insets = useSafeAreaInsets();
  const { surfaces } = useTheme();
  const baseBottomPadding = dockClearance ? DOCK_CLEARANCE : insets.bottom + spacing.xxl;
  // Roughly a numeric keypad's height, so the foot of the content can always
  // be scrolled above the keyboard rather than sitting under it.
  const bottomPadding = keyboardAware ? baseBottomPadding + KEYBOARD_CLEARANCE : baseBottomPadding;
  const paddingTop = topInset ? insets.top : 0;
  const rootBackground = surfaces.background;

  if (!scroll) {
    return (
      <View style={[styles.root, { paddingTop, paddingBottom: bottomPadding, backgroundColor: rootBackground }]}>
        {children}
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop, backgroundColor: rootBackground }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { gap: contentGap, paddingBottom: bottomPadding, paddingHorizontal: horizontalInset },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps={keyboardAware ? 'handled' : undefined}
        keyboardDismissMode={keyboardAware ? 'interactive' : undefined}
      >
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {},
});

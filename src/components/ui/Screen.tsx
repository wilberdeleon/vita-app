import type { PropsWithChildren, ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DOCK_CLEARANCE, palette, spacing } from '../../theme/tokens';
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
  /**
   * Unset by default (unchanged everywhere else — root stays palette.
   * background). When provided, renders behind the scroll content as a
   * fixed, non-scrolling layer filling the whole screen (e.g. the Home
   * dashboard's mountain background), and the root's own background color
   * is dropped in favor of it so nothing shows through at the edges.
   */
  background?: ReactNode;
  /** Outer horizontal inset. Defaults to spacing.xl (unchanged everywhere else). */
  horizontalInset?: number;
  /**
   * Defaults to false (unchanged everywhere else — root stays the fixed
   * light `palette.background`). Set true to use the active theme's
   * surface background instead, so the root flips between warm cream and
   * near-black with Light/Dark/System (founders, 2026-07-18 clean
   * redesign) — currently only the Home dashboard opts in.
   */
  themed?: boolean;
}>;

export function Screen({
  children,
  scroll = true,
  dockClearance = false,
  contentGap = spacing.l,
  topInset = true,
  background,
  horizontalInset = spacing.xl,
  themed = false,
}: Props) {
  const insets = useSafeAreaInsets();
  const { surfaces } = useTheme();
  const bottomPadding = dockClearance ? DOCK_CLEARANCE : insets.bottom + spacing.xxl;
  const paddingTop = topInset ? insets.top : 0;
  const rootBackground = background ? 'transparent' : themed ? surfaces.background : palette.background;

  if (!scroll) {
    return (
      <View style={[styles.root, { paddingTop, paddingBottom: bottomPadding, backgroundColor: rootBackground }]}>
        {background}
        {children}
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop, backgroundColor: rootBackground }]}>
      {background}
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { gap: contentGap, paddingBottom: bottomPadding, paddingHorizontal: horizontalInset },
        ]}
        showsVerticalScrollIndicator={false}
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

import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DOCK_CLEARANCE, palette, spacing } from '../../theme/tokens';

type Props = PropsWithChildren<{
  /** Scrollable by default; set false for fixed layouts (e.g. barcode scanner). */
  scroll?: boolean;
  /** Reserve space for the floating dock. On for dock tabs, off for stacked screens. */
  dockClearance?: boolean;
}>;

export function Screen({ children, scroll = true, dockClearance = false }: Props) {
  const insets = useSafeAreaInsets();
  const bottomPadding = dockClearance ? DOCK_CLEARANCE : insets.bottom + spacing.xxl;

  if (!scroll) {
    return <View style={[styles.root, { paddingTop: insets.top }]}>{children}</View>;
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }]}
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
    backgroundColor: palette.background,
  },
  content: {
    paddingHorizontal: spacing.xl,
    gap: spacing.l,
  },
});

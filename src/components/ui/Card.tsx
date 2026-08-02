import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { palette, radii, shadows, spacing } from '../../theme/tokens';

type Props = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
}>;

/** Base card surface style — the single source of truth for card background, radius, and shadow. Reused by PressableCard so every tappable card matches every static one exactly. */
export const cardSurfaceStyle: ViewStyle = {
  backgroundColor: palette.card,
  borderRadius: radii.card,
  padding: spacing.l,
  ...shadows.card,
};

export function Card({ children, style }: Props) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: cardSurfaceStyle,
});

import type { PropsWithChildren } from 'react';
import type { AccessibilityRole, StyleProp, ViewStyle } from 'react-native';
import { cardSurfaceStyle } from './Card';
import { PressableScale } from './PressableScale';

type Props = PropsWithChildren<{
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
}>;

/**
 * A Card surface with the app's standard press-scale feedback — for tappable
 * cards (e.g. Journey Preview, future Meals Preview). Shares cardSurfaceStyle
 * with Card so a pressable card and a static card are visually identical,
 * differing only in touch behavior.
 */
export function PressableCard({ children, onPress, disabled, style, accessibilityLabel, accessibilityRole }: Props) {
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      style={[cardSurfaceStyle, style]}
      pressedScale={0.98}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
    >
      {children}
    </PressableScale>
  );
}

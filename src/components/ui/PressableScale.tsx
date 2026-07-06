import { useRef, type PropsWithChildren } from 'react';
import { Animated, Pressable, type StyleProp, type ViewStyle } from 'react-native';

type Props = PropsWithChildren<{
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Scale while pressed. Keep subtle. */
  pressedScale?: number;
}>;

/** Light press animation shared by tappable components — subtle spring scale. */
export function PressableScale({ children, onPress, disabled, style, pressedScale = 0.97 }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const springTo = (toValue: number) =>
    Animated.spring(scale, { toValue, useNativeDriver: true, speed: 40, bounciness: 5 }).start();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => springTo(pressedScale)}
      onPressOut={() => springTo(1)}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

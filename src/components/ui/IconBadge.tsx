import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { palette } from '../../theme/tokens';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  size?: number;
};

/** Icon inside a soft tinted circle — leading element of rows and cards. */
export function IconBadge({ icon, color = palette.primary, size = 36 }: Props) {
  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: `${color}1A` }]}>
      <Ionicons name={icon} size={size * 0.5} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

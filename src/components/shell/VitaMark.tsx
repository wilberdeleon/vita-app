import Svg, { Circle, Path } from 'react-native-svg';
import { palette } from '../../theme/tokens';

type Props = {
  size?: number;
  color?: string;
};

/**
 * The official VITA mark — mountain range inside a circle (brand sheet,
 * July 2026). Vector reproduction of the approved logo; do not restyle.
 */
export function VitaMark({ size = 24, color = palette.ink }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx={50} cy={45} r={29} stroke={color} strokeWidth={4} fill="none" />
      <Path d="M15 78 L36 49 L44 58 L55 39 L64 50 L71 44 L86 78 Z" fill={color} />
    </Svg>
  );
}

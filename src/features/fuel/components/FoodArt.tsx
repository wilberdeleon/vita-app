import Svg, { Circle, Path } from 'react-native-svg';
import { ART_VIEWBOX, FOOD_ART, type ArtKey } from '../foodArt';

type Props = {
  art: ArtKey;
  size: number;
  color: string;
};

/**
 * Renders one VITA food drawing.
 *
 * Stroke weight scales with the drawn size rather than staying fixed, so a
 * 20pt row icon and a 34pt hero icon carry the same optical weight instead
 * of the small one turning into a smudge. The ratio matches the outline
 * icons the rest of the app uses.
 */
export function FoodArt({ art, size, color }: Props) {
  const shapes = FOOD_ART[art];
  const strokeWidth = (ART_VIEWBOX / size) * 1.35;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${ART_VIEWBOX} ${ART_VIEWBOX}`}>
      {shapes.map((shape, index) =>
        'path' in shape ? (
          <Path
            key={index}
            d={shape.path}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <Circle
            key={index}
            cx={shape.circle.cx}
            cy={shape.circle.cy}
            r={shape.circle.r}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
          />
        ),
      )}
    </Svg>
  );
}

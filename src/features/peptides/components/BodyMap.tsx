import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';
import {
  siteKeyLabel,
  sitesForView,
  type BodyView,
  type InjectionSiteKey,
} from '../../../lib/peptides';
import { palette, spacing } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

type Props = {
  view: BodyView;
  selected?: InjectionSiteKey;
  onSelect: (key: InjectionSiteKey) => void;
};

const WIDTH = 200;
const HEIGHT = 400;
/** Apple's minimum comfortable touch target, in the same units as the figure. */
const MIN_TOUCH = 44;

/**
 * Where each selectable zone sits, in SVG user units.
 *
 * Ellipses rather than traced anatomy: the point is to say *roughly here on
 * your body*, and a precise outline would imply a precision about placement
 * that VITA has no business implying.
 *
 * **Authored in front-view coordinates, which are a mirror.** VITA's user is
 * the person being injected, not a clinician facing a patient, so *your left*
 * is on the left of the screen — the side your left hand is on when you look
 * down at yourself. Medical illustration uses the opposite convention because
 * its reader is standing opposite the body; ours is inside it.
 */
const ZONES: Record<InjectionSiteKey, { cx: number; cy: number; rx: number; ry: number } | null> = {
  // Spaced so the three abdominal zones read as three places rather than one
  // smudge, and sat over the belly rather than the ribs.
  'abdomen-left': { cx: 81, cy: 170, rx: 8, ry: 18 },
  'abdomen-center': { cx: 100, cy: 173, rx: 8, ry: 18 },
  'abdomen-right': { cx: 119, cy: 170, rx: 8, ry: 18 },
  'thigh-left': { cx: 84, cy: 252, rx: 13, ry: 32 },
  'thigh-right': { cx: 116, cy: 252, rx: 13, ry: 32 },
  'upper-arm-left': { cx: 54, cy: 120, rx: 8, ry: 26 },
  'upper-arm-right': { cx: 146, cy: 120, rx: 8, ry: 26 },
  'glute-left': { cx: 86, cy: 188, rx: 12, ry: 17 },
  'glute-right': { cx: 114, cy: 188, rx: 12, ry: 17 },
  custom: null,
};

/**
 * The same zone seen from behind.
 *
 * Turning around swaps which side of the screen your left is on, so the back
 * view is the front mirrored. Deriving it means the two views cannot drift
 * apart, and it is the reason glutes are authored in front coordinates for a
 * region only ever drawn on the back.
 */
function zoneFor(key: InjectionSiteKey, view: BodyView) {
  const zone = ZONES[key];
  if (!zone) return null;
  return view === 'back' ? { ...zone, cx: WIDTH - zone.cx } : zone;
}

/**
 * A stylized human figure with tappable injection zones.
 *
 * **Original artwork, drawn as primitives.** No traced illustration and no
 * external asset — a head, a torso, four limbs, deliberately neutral: no
 * gender, no musculature, no medical-textbook detail. It exists to answer
 * "which part of me is that?" faster than a list of words can, and nothing
 * more.
 *
 * **Every zone is styled identically.** No colour scale, no green or red, no
 * ordering, no marking of a site as due or spent. A body map is the easiest
 * place in this whole feature to accidentally imply a recommendation, so the
 * only visual state a zone has is *selected* — in VITA's peptide purple,
 * which carries no safety meaning anywhere else in the app either.
 *
 * The figure is never the only way to choose: the selector pairs it with a
 * text list, so nobody has to hit a shape to record where they injected.
 */
export function BodyMap({ view, selected, onSelect }: Props) {
  const { surfaces, scheme } = useTheme();

  const bodyFill = scheme === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)';
  const bodyStroke = surfaces.border;
  const zoneFill = scheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const zoneStroke = scheme === 'dark' ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.14)';

  const zones = sitesForView(view);

  return (
    <View style={styles.wrap}>
      <Svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        {/* The figure itself — decorative, and hidden from assistive tech,
            which reads the zones instead. */}
        <G accessible={false}>
          <Circle cx={100} cy={32} r={18} fill={bodyFill} stroke={bodyStroke} strokeWidth={1} />
          {/* Torso: shoulders tapering through the waist to the hips. */}
          <Path
            d="M100 56 C118 56 129 63 132 78 L126 172 C125 194 121 210 100 210 C79 210 75 194 74 172 L68 78 C71 63 82 56 100 56 Z"
            fill={bodyFill}
            stroke={bodyStroke}
            strokeWidth={1}
          />
          {/* Arms held clear of the torso, so an upper-arm zone is visibly on
              the arm rather than blurring into the shoulder. */}
          <Path
            d="M68 66 C54 72 47 92 47 114 L50 178 L62 177 L60 114 C60 98 64 82 72 72 Z"
            fill={bodyFill}
            stroke={bodyStroke}
            strokeWidth={1}
          />
          <Path
            d="M132 66 C146 72 153 92 153 114 L150 178 L138 177 L140 114 C140 98 136 82 128 72 Z"
            fill={bodyFill}
            stroke={bodyStroke}
            strokeWidth={1}
          />
          {/* Legs */}
          <Path d="M76 208 L72 300 L76 386 L91 386 L94 300 L99 210 Z" fill={bodyFill} stroke={bodyStroke} strokeWidth={1} />
          <Path d="M124 208 L128 300 L124 386 L109 386 L106 300 L101 210 Z" fill={bodyFill} stroke={bodyStroke} strokeWidth={1} />
        </G>

        {zones.map((key) => {
          const zone = zoneFor(key, view);
          if (!zone) return null;
          const active = selected === key;
          return (
            <Ellipse
              key={key}
              cx={zone.cx}
              cy={zone.cy}
              rx={zone.rx}
              ry={zone.ry}
              fill={active ? `${palette.peptide}33` : zoneFill}
              stroke={active ? palette.peptide : zoneStroke}
              strokeWidth={active ? 2 : 1}
            />
          );
        })}
      </Svg>

      {/*
       * Touch targets as real views on top of the drawing, rather than
       * pressable SVG shapes. Two reasons: SVG primitives cannot carry an
       * accessibility role or selected state, and a rectangle sized to a
       * finger — at least 44pt, whatever the ellipse beneath it looks like —
       * means nobody has to pixel-hunt an arm.
       */}
      {zones.map((key) => {
        const zone = zoneFor(key, view);
        if (!zone) return null;
        const halfWidth = Math.max(zone.rx, MIN_TOUCH / 2);
        const halfHeight = Math.max(zone.ry, MIN_TOUCH / 2);
        return (
          <Pressable
            key={key}
            onPress={() => onSelect(key)}
            accessibilityRole="button"
            accessibilityLabel={siteKeyLabel(key)}
            accessibilityState={{ selected: selected === key }}
            style={[
              styles.hit,
              {
                left: zone.cx - halfWidth,
                top: zone.cy - halfHeight,
                width: halfWidth * 2,
                height: halfHeight * 2,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.s,
    width: WIDTH,
    height: HEIGHT + spacing.s * 2,
    alignSelf: 'center',
  },
  hit: {
    position: 'absolute',
  },
});

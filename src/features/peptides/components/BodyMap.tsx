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
const HEIGHT = 420;
/** Apple's minimum comfortable touch target, in the same units as the figure. */
const MIN_TOUCH = 44;

/**
 * The figure, as path data.
 *
 * Drawn to roughly seven-and-a-half heads, with a real shoulder line, a waist
 * that narrows and hips that flare — the proportions that make a silhouette
 * read as a person rather than as stacked primitives. Curved throughout: the
 * straight-edged limbs of the first version are what made it look like a
 * developer's SVG demo rather than a drawing.
 */
const HEAD = { cx: 100, cy: 38, rx: 19, ry: 23 };

const TORSO =
  'M94 56 C94 70 92 77 86 81 C75 86 68 94 67 107 ' +
  'C66 127 72 147 76 164 C71 177 68 190 68 202 ' +
  'C69 213 75 220 85 222 L115 222 C125 220 131 213 132 202 ' +
  'C132 190 129 177 124 164 C128 147 134 127 133 107 ' +
  'C132 94 125 86 114 81 C108 77 106 70 106 56 Z';

const ARM_LEFT =
  'M62 100 C54 104 48 114 47 128 C46 148 46 166 48 186 ' +
  'C49 204 51 220 52 235 C52 240 57 242 60 240 C63 238 64 234 63 229 ' +
  'C62 214 61 198 61 180 C61 160 62 142 64 126 C65 116 67 108 71 103 Z';

const ARM_RIGHT =
  'M138 100 C146 104 152 114 153 128 C154 148 154 166 152 186 ' +
  'C151 204 149 220 148 235 C148 240 143 242 140 240 C137 238 136 234 137 229 ' +
  'C138 214 139 198 139 180 C139 160 138 142 136 126 C135 116 133 108 129 103 Z';

const LEG_LEFT =
  'M69 204 C65 230 67 256 71 282 C73 304 72 326 73 348 ' +
  'C73 366 74 382 75 396 C75 401 80 403 84 401 C87 399 88 395 88 390 ' +
  'C88 374 89 358 90 342 C91 320 93 300 96 280 C99 254 100 234 100 216 Z';

const LEG_RIGHT =
  'M131 204 C135 230 133 256 129 282 C127 304 128 326 127 348 ' +
  'C127 366 126 382 125 396 C125 401 120 403 116 401 C113 399 112 395 112 390 ' +
  'C112 374 111 358 110 342 C109 320 107 300 104 280 C101 254 100 234 100 216 Z';

const FIGURE = [TORSO, ARM_LEFT, ARM_RIGHT, LEG_LEFT, LEG_RIGHT];

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
 *
 * Sized generously and then **clipped to the silhouette**, so a zone fills its
 * part of the body instead of sitting on top of it. Centres are spaced so no
 * two zones overlap, which would make one place ambiguous to tap.
 */
const ZONES: Record<InjectionSiteKey, { cx: number; cy: number; rx: number; ry: number } | null> = {
  'abdomen-left': { cx: 81, cy: 176, rx: 7.5, ry: 14 },
  'abdomen-center': { cx: 100, cy: 178, rx: 7.5, ry: 14 },
  'abdomen-right': { cx: 119, cy: 176, rx: 7.5, ry: 14 },
  'thigh-left': { cx: 80, cy: 258, rx: 12, ry: 30 },
  'thigh-right': { cx: 120, cy: 258, rx: 12, ry: 30 },
  'upper-arm-left': { cx: 55, cy: 145, rx: 6.5, ry: 24 },
  'upper-arm-right': { cx: 145, cy: 145, rx: 6.5, ry: 24 },
  'glute-left': { cx: 84, cy: 196, rx: 15, ry: 18 },
  'glute-right': { cx: 116, cy: 196, rx: 15, ry: 18 },
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
 * **A solid silhouette, with no outlines anywhere** (slice 3.8B). The figure
 * is assembled from overlapping shapes, and stroking them drew a seam through
 * every join — a line across the hips where the legs met the torso, a collar
 * under the head. One flat fill makes the overlaps invisible and the figure
 * read as a single form. `ClipPath` was tried first and did not apply on
 * device, so zones fit by geometry rather than by masking.
 *
 * **Zones are unstroked fills** for the same reason. An outlined ellipse reads
 * as a sticker on a drawing; a soft patch of lighter fill reads as part of the
 * body. Each one is sized to sit inside the limb it marks.
 *
 * **Every zone is styled identically.** No colour scale, no green or red, no
 * ordering, no marking of a site as due or spent. A body map is the easiest
 * place in this whole feature to accidentally imply a recommendation, so the
 * only visual state a zone has is *selected* — in VITA's peptide purple,
 * which carries no safety meaning anywhere else in the app either.
 *
 * The figure is never the only way to choose. Since 3.8B the fast path is a
 * flat list of every site and this is the optional visual aid beside it.
 */
export function BodyMap({ view, selected, onSelect }: Props) {
  const { surfaces, scheme } = useTheme();

  const dark = scheme === 'dark';
  /**
   * Solid ink plus a group opacity, never per-shape alpha.
   *
   * The figure is built from overlapping shapes, and translucent fills
   * *accumulate* where they overlap — which drew a bright band across the
   * hips where the legs met the torso and a notch under the chin. Compositing
   * the group once and fading the result makes every join invisible.
   */
  const ink = dark ? '#FFFFFF' : '#111114';
  const bodyOpacity = dark ? 0.1 : 0.14;
  const zoneFill = dark ? 'rgba(255,255,255,0.14)' : 'rgba(17,17,20,0.11)';

  const zones = sitesForView(view);

  return (
    <View style={styles.wrap}>
      <Svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        {/* The figure — decorative, and hidden from assistive tech, which
            reads the zones instead. One flat fill, no strokes: the shapes
            overlap, and any outline would draw a seam through every join. */}
        <G accessible={false} opacity={bodyOpacity}>
          <Ellipse cx={HEAD.cx} cy={HEAD.cy} rx={HEAD.rx} ry={HEAD.ry} fill={ink} />
          {FIGURE.map((d) => (
            <Path key={d} d={d} fill={ink} />
          ))}
        </G>

        {/* Zones as soft patches on the body rather than rings drawn over it,
            each sized to sit inside the limb it marks. */}
        <G accessible={false}>
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
                fill={active ? `${palette.peptide}59` : zoneFill}
              />
            );
          })}
        </G>

        {/* A marker at the centre of the chosen zone — on a narrow limb the
            patch alone is a subtle change, and this is unmistakable. */}
        {zones.map((key) => {
          const zone = zoneFor(key, view);
          if (!zone || selected !== key) return null;
          return (
            <Circle
              key={`marker-${key}`}
              cx={zone.cx}
              cy={zone.cy}
              r={4}
              fill={palette.peptide}
              stroke={surfaces.background}
              strokeWidth={2}
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

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

/** The coordinate space every path and zone below is authored in. */
const VIEW_W = 200;
const VIEW_H = 420;

/**
 * Drawn slightly larger than it is authored.
 *
 * Three abdominal targets cannot each be 44pt wide across a 64-unit torso, so
 * once the overlap was fixed the only honest way to grow them was to grow the
 * whole figure. An eighth again buys back real millimetres everywhere without
 * making the body broad, which the founder explicitly did not want.
 *
 * 1.125 rather than a rounder-looking 1.15 because it is 9/8, and therefore
 * exact in binary — so rectangles authored to share a boundary still share it
 * after scaling. At 1.15 two such edges landed 1.4e-14pt apart: invisible on
 * screen, and a genuine overlap as far as the collision test was concerned.
 */
const SCALE = 1.125;
const WIDTH = VIEW_W * SCALE;
const HEIGHT = VIEW_H * SCALE;
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
  'M60 100 C52 104 46 114 45 128 C44 148 44 166 46 186 ' +
  'C47 204 49 220 50 235 C50 240 55 242 58 240 C61 238 62 234 61 229 ' +
  'C60 214 59 198 59 180 C59 160 60 142 62 126 C63 116 65 108 69 103 Z';

const ARM_RIGHT =
  'M140 100 C148 104 154 114 155 128 C156 148 156 166 154 186 ' +
  'C153 204 151 220 150 235 C150 240 145 242 142 240 C139 238 138 234 139 229 ' +
  'C140 214 141 198 141 180 C141 160 140 142 138 126 C137 116 135 108 131 103 Z';

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
  'upper-arm-left': { cx: 53, cy: 145, rx: 6.5, ry: 24 },
  'upper-arm-right': { cx: 147, cy: 145, rx: 6.5, ry: 24 },
  'glute-left': { cx: 84, cy: 196, rx: 15, ry: 18 },
  'glute-right': { cx: 116, cy: 196, rx: 15, ry: 18 },
  custom: null,
};

/**
 * Where each zone can be *tapped*, as an explicit rectangle in the same
 * authored front-view coordinates as `ZONES`.
 *
 * **Authored as a partition, not inflated per zone** (slice 3.8C). The
 * previous version padded every zone independently to 44pt — `max(rx, 22)` —
 * which sounds right and was badly wrong: the three abdominal zones sit 19
 * units apart, so their 44pt boxes overlapped by 25pt, and the later sibling
 * won the tap. Tapping the dead centre of *Left Abdomen* selected *Center
 * Abdomen*; tapping the centre of *Center Abdomen* selected *Right Abdomen*.
 * Left Abdomen could not be reached from the figure at all. That, not target
 * size, was why the map felt unreliable.
 *
 * So the rectangles are now laid out together and **never overlap**. Vertical
 * bands separate arms from abdomen from thighs; within a band, boundaries sit
 * at the midpoint between neighbouring zone centres, which is where a tap
 * genuinely becomes ambiguous.
 *
 * **Where anatomy forbids 44pt, height compensates for width.** Three
 * abdominal targets cannot each be 44pt wide across a 64-unit torso without
 * colliding, and a collision is worse than a narrow target — a narrow target
 * is merely fiddly, a colliding one selects the wrong site. Those zones are
 * 20–28 wide and 70 tall instead. Arms and thighs clear 44 in both axes.
 *
 * The SVG is rendered at its viewBox size, so one unit is one point.
 */
const HIT_AREAS: Record<
  InjectionSiteKey,
  { x: number; y: number; width: number; height: number } | null
> = {
  'upper-arm-left': { x: 16, y: 100, width: 46, height: 100 },
  'upper-arm-right': { x: 138, y: 100, width: 46, height: 100 },
  'abdomen-left': { x: 62, y: 146, width: 28, height: 70 },
  'abdomen-center': { x: 90, y: 146, width: 20, height: 70 },
  'abdomen-right': { x: 110, y: 146, width: 28, height: 70 },
  'thigh-left': { x: 54, y: 218, width: 45, height: 86 },
  'thigh-right': { x: 101, y: 218, width: 45, height: 86 },
  'glute-left': { x: 66, y: 170, width: 33, height: 48 },
  'glute-right': { x: 101, y: 170, width: 33, height: 48 },
  custom: null,
};

/**
 * A zone's touch rectangle **in points**, mirrored for the back view exactly
 * as the art is. Returned already scaled, so callers and tests reason about
 * the size a thumb actually meets rather than about authored units.
 */
export function hitAreaFor(key: InjectionSiteKey, view: BodyView) {
  const area = HIT_AREAS[key];
  if (!area) return null;
  const x = view === 'back' ? VIEW_W - area.x - area.width : area.x;
  return {
    x: x * SCALE,
    y: area.y * SCALE,
    width: area.width * SCALE,
    height: area.height * SCALE,
  };
}

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
  return view === 'back' ? { ...zone, cx: VIEW_W - zone.cx } : zone;
}

/** A zone's drawn ellipse, mirrored for the back view. Exported for tests. */
export function visibleZoneFor(key: InjectionSiteKey, view: BodyView) {
  const zone = zoneFor(key, view);
  if (!zone) return null;
  return {
    width: zone.rx * 2 * SCALE,
    height: zone.ry * 2 * SCALE,
  };
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
  /**
   * Three levels, and they have to stay three levels in both themes.
   *
   * Silhouette → unselected zone → selected zone. Founder QA found the
   * middle level almost invisible in Light mode: a zone at 0.11 over a body
   * at 0.14 is a step of about four percent of ink, which survives a design
   * review on a bright screen and disappears on a real one. Light is now
   * roughly as separated as Dark already was, and the selected purple is
   * strengthened there too, since purple over a pale body reads weaker than
   * the same purple over a dark one.
   */
  const ink = dark ? '#FFFFFF' : '#111114';
  const bodyOpacity = dark ? 0.1 : 0.13;
  const zoneFill = dark ? 'rgba(255,255,255,0.14)' : 'rgba(17,17,20,0.24)';
  const selectedFill = dark ? `${palette.peptide}59` : `${palette.peptide}80`;

  const zones = sitesForView(view);

  return (
    <View style={styles.wrap}>
      <Svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}>
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
                fill={active ? selectedFill : zoneFill}
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
       * pressable SVG shapes: SVG primitives cannot carry an accessibility
       * role or selected state.
       *
       * One Pressable per zone, so assistive technology sees exactly one
       * element per site — the rectangle is bigger than the art, not a second
       * thing to land on.
       */}
      {zones.map((key) => {
        const area = hitAreaFor(key, view);
        if (!area) return null;
        return (
          <Pressable
            key={key}
            onPress={() => onSelect(key)}
            accessibilityRole="button"
            accessibilityLabel={siteKeyLabel(key)}
            accessibilityState={{ selected: selected === key }}
            style={[styles.hit, { left: area.x, top: area.y, width: area.width, height: area.height }]}
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

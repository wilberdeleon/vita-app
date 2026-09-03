import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import { motion, palette } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import { useReducedMotion } from '../../../theme/useReducedMotion';

type Props = {
  /** 0..1, already clamped by the caller. */
  progress: number;
  /** Rendered width in points. Height follows the vessel's aspect ratio. */
  width?: number;
  /** Spoken name. The percentage is appended automatically. */
  accessibilityLabel?: string;
};

/* ── the silhouette ────────────────────────────────────────────────────── */

/** The coordinate space the vessel is authored in. */
const VIEW_W = 120;
const VIEW_H = 260;
const CX = VIEW_W / 2;
/** Half-width of the widest part of the body, in authored units. */
const MAX_HALF = 46;

/**
 * Half-width as a fraction of `MAX_HALF`, from the mouth (`t = 0`) to the
 * base (`t = 1`).
 *
 * **A vessel, deliberately not a bottle.** A narrow mouth, a shoulder that
 * opens into a straight body, and a base that draws in very slightly. That is
 * enough for the eye to read "something you drink from" without it becoming a
 * *particular* thing you drink from — no cap, no threads, no neck ring, no
 * label panel, and no measurement marks of any kind. The founder ruling this
 * shape has to satisfy is that the object shows **percentage of the user's
 * goal**, and a recognisable branded bottle would quietly assert a capacity
 * the app does not have: VITA's goal is whatever the user chose, in whichever
 * of four units they think in.
 *
 * The flat segments at each end (`RIM_END`, `HEEL_END`) exist for a
 * construction reason as much as a visual one — the rounded corners at the
 * mouth and base are only true corners if the silhouette is vertical where
 * they start. Without them the outline kinks where the round meets the curve.
 */
const RIM_END = 0.07;
const SHOULDER_END = 0.30;
const HEEL_START = 0.855;
const HEEL_END = 0.93;
const MOUTH = 0.58;
const BODY = 1;
const BASE = 0.92;

/** Hermite smoothstep — zero slope at both ends, so segments meet without a crease. */
function smoothstep(x: number): number {
  return x * x * (3 - 2 * x);
}

/** Half-width in authored units at `t`, where 0 is the mouth and 1 the base. */
export function halfWidthAt(t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  if (clamped <= RIM_END) return MAX_HALF * MOUTH;
  if (clamped < SHOULDER_END) {
    const k = smoothstep((clamped - RIM_END) / (SHOULDER_END - RIM_END));
    return MAX_HALF * (MOUTH + (BODY - MOUTH) * k);
  }
  if (clamped < HEEL_START) return MAX_HALF * BODY;
  if (clamped < HEEL_END) {
    const k = smoothstep((clamped - HEEL_START) / (HEEL_END - HEEL_START));
    return MAX_HALF * (BODY + (BASE - BODY) * k);
  }
  return MAX_HALF * BASE;
}

const R_TOP = 11;
const R_BOT = 16;
/**
 * Enough samples that the shoulder reads as a curve rather than a chamfer.
 *
 * The sides are straight segments between samples, so this is the only thing
 * standing between a bottle and a faceted polygon. The first device render of
 * this component used 44 and the shoulder and heel were visibly chamfered —
 * about ten segments had to carry the whole shoulder curve. 120 costs one
 * longer path string, generated once at module load.
 */
const SAMPLES = 120;

/**
 * The vessel outline, generated once from `halfWidthAt`.
 *
 * Generated rather than hand-authored so the *drawing* and the *geometry* can
 * never disagree: the surface line's width at a given fill level is read from
 * the same function that drew the sides, so the waterline always meets the
 * wall exactly. A hand-authored bezier would look identical and would drift
 * the moment either was touched.
 */
function buildVesselPath(): string {
  const yTop = 0;
  const yBot = VIEW_H;
  const wTop = halfWidthAt(0);
  const wBot = halfWidthAt(1);

  const right: string[] = [];
  const left: string[] = [];
  for (let i = 0; i <= SAMPLES; i += 1) {
    const y = R_TOP + ((VIEW_H - R_BOT - R_TOP) * i) / SAMPLES;
    const w = halfWidthAt(y / VIEW_H);
    right.push(`L ${(CX + w).toFixed(2)} ${y.toFixed(2)}`);
    left.unshift(`L ${(CX - w).toFixed(2)} ${y.toFixed(2)}`);
  }

  return [
    `M ${CX - wTop + R_TOP} ${yTop}`,
    `L ${CX + wTop - R_TOP} ${yTop}`,
    `Q ${CX + wTop} ${yTop} ${CX + wTop} ${yTop + R_TOP}`,
    ...right,
    `Q ${CX + wBot} ${yBot} ${CX + wBot - R_BOT} ${yBot}`,
    `L ${CX - wBot + R_BOT} ${yBot}`,
    `Q ${CX - wBot} ${yBot} ${CX - wBot} ${yBot - R_BOT}`,
    ...left,
    `Q ${CX - wTop} ${yTop} ${CX - wTop + R_TOP} ${yTop}`,
    'Z',
  ].join(' ');
}

const VESSEL = buildVesselPath();

/**
 * A visible sliver once anything is logged.
 *
 * Carried over from `WaterLevelPanel`, for the same reason it exists there: a
 * 2% day and an empty day must not look identical, because "I have had
 * something today" is exactly what the object is for.
 */
const MINIMUM_VISIBLE_FILL = 0.03;

/**
 * The settle, after a rise.
 *
 * Liquid that stops dead at its new level reads as a bar chart. A small
 * overshoot and a quick return is the whole of the effect — it is the
 * waterline itself moving, not a wave drawn on top of it, so there is no
 * simulation, no particles, and nothing that keeps moving once it has come to
 * rest. It fires only when the level *rises*, because that is the only moment
 * anything was actually poured.
 */
const SETTLE_OVERSHOOT = 0.018;
const SETTLE_MS = 240;

/** Sampled waterline widths, so the surface line always meets the wall. */
const LINE_STOPS = 21;
const LINE_INPUT: number[] = [];
const LINE_OUTPUT: number[] = [];
for (let i = 0; i < LINE_STOPS; i += 1) {
  const f = i / (LINE_STOPS - 1);
  LINE_INPUT.push(f);
  // f is filled fraction measured from the base, so t is measured from the mouth.
  LINE_OUTPUT.push(2 * halfWidthAt(1 - f));
}

/**
 * VITA's hydration object (Sprint 5 slice 5.1).
 *
 * **It shows a percentage, not a volume.** The fill is `progress` — how far
 * through *your* goal you are — and nothing about the drawing claims to be a
 * container of any particular size. That is the founder ruling, and it is what
 * lets the same object serve a goal of three cups and a goal of two litres.
 * The audit that preceded this slice recorded the older objection to a vessel
 * — that a drawn container implies a fixed capacity — and this is the answer
 * to it: no markings, no branded form, no unit anywhere on the object.
 *
 * ## How it is drawn, and why that way
 *
 * Four stacked layers, and **no SVG clip path anywhere:**
 *
 * 1. the empty vessel, a filled silhouette at low alpha;
 * 2. the liquid — the *same* silhouette, filled in water blue, inside a
 *    bottom-anchored view whose height animates. That view clips
 *    rectangularly with `overflow: 'hidden'`, so the visible liquid is the
 *    vessel shape intersected with everything below the waterline;
 * 3. the surface line, whose width is read from `halfWidthAt` so it always
 *    spans exactly the vessel's interior at that height;
 * 4. the rim and edge, stroked over the liquid so the vessel keeps its
 *    outline when full.
 *
 * Layer 2 is the load-bearing decision. The obvious implementation is an SVG
 * `ClipPath` around an animated `Rect`, and it is the one this component
 * deliberately does not use: `BodyMap` records that `ClipPath` "was tried
 * first and did not apply on device", and a hydration object that renders as
 * a blue rectangle on a real iPhone is a worse outcome than a slightly less
 * elegant implementation. Rectangular `overflow: 'hidden'` is what
 * `WaterLevelPanel` already animates against, on device, founder-approved.
 *
 * It also animates better. The clip-path version has to re-render the SVG on
 * every frame; this one animates two layout values and leaves the vector art
 * alone.
 *
 * ## What it deliberately does not do
 *
 * No wave simulation, no perpetual motion, no particles, no splash. The object
 * is still when the day is still and moves only when the number changes —
 * `motion confirms, it never decorates`. And it stays **Water's**: it is not a
 * `ProgressObject`, it takes no colour or shape props, and Peptides and Fuel
 * do not inherit it. Features are allowed to look different now; that is the
 * point of the sprint.
 */
export function WaterVessel({ progress, width = VIEW_W, accessibilityLabel = 'Hydration' }: Props) {
  const { scheme } = useTheme();
  const reducedMotion = useReducedMotion();

  const clamped = Math.max(0, Math.min(1, progress));
  const level = clamped > 0 ? Math.max(MINIMUM_VISIBLE_FILL, clamped) : 0;
  const complete = clamped >= 1;
  const percent = Math.round(clamped * 100);

  const height = (width / VIEW_W) * VIEW_H;
  const scale = width / VIEW_W;

  const fill = useRef(new Animated.Value(0)).current;
  const completion = useRef(new Animated.Value(0)).current;
  /** What the level was last time, so a rise can be told from a correction. */
  const previousLevel = useRef(0);

  useEffect(() => {
    const previous = previousLevel.current;
    previousLevel.current = level;

    if (reducedMotion) {
      // Land on the value. Never a shorter version of the same animation, and
      // no settle — the app-wide rule `useReducedMotion` exists to enforce.
      fill.setValue(level);
      return;
    }

    const rise = Animated.timing(fill, {
      toValue: level,
      duration: motion.duration.progress,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // animates height
    });

    // Falling is a correction, not a pour. It just moves.
    if (level <= previous) {
      rise.start();
      return;
    }

    const peak = Math.min(1, level + SETTLE_OVERSHOOT);
    Animated.sequence([
      Animated.timing(fill, {
        toValue: peak,
        duration: motion.duration.progress,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(fill, {
        toValue: level,
        duration: SETTLE_MS,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start();
  }, [fill, level, reducedMotion]);

  useEffect(() => {
    const toValue = complete ? 1 : 0;
    if (reducedMotion) {
      completion.setValue(toValue);
      return;
    }
    Animated.timing(completion, {
      toValue,
      duration: motion.duration.state,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [completion, complete, reducedMotion]);

  const dark = scheme === 'dark';
  /**
   * Each theme gets its own numbers rather than one value that "works in
   * both". Three prior bugs in this codebase came from a single colour
   * inverting its own hierarchy across themes — the pale progress track that
   * read as complete on black, `BodyMap`'s zone that vanished in light, and
   * `waterSoft` outshining today's column in the week strip.
   */
  const emptyFill = dark ? 'rgba(255,255,255,0.05)' : 'rgba(17,17,20,0.045)';
  const liquidFill = dark ? 'rgba(47,128,237,0.46)' : 'rgba(47,128,237,0.42)';
  /**
   * The meniscus, and the single most important colour on the object.
   *
   * The first device render used `palette.water` for both the body and this
   * line, and the result read as a flat blue block rather than as liquid —
   * the founder constraint the vessel most has to clear is "not cartoonish",
   * and an undifferentiated fill is what makes a drawn container look like a
   * toy. A clearly lighter line at the surface is what reads as a *surface*.
   * It is also what makes a 3% day legible at all.
   */
  const surfaceLine = dark ? '#8FC0F7' : palette.water;
  const edgeStroke = dark ? 'rgba(255,255,255,0.22)' : 'rgba(17,17,20,0.16)';
  /**
   * A second hairline just inside the first, at roughly half its strength.
   *
   * The whole of the depth treatment. Two edges a hair apart read as a wall
   * with thickness where one edge reads as a sticker, and it costs one more
   * stroked path. Deliberately *not* a gloss highlight, a specular band or a
   * blurred layer: the object has to stay minimal and health-tech, and a
   * shiny bottle is the fastest way to make it look like a toy.
   */
  const innerStroke = dark ? 'rgba(255,255,255,0.10)' : 'rgba(17,17,20,0.07)';

  const fillHeight = fill.interpolate({ inputRange: [0, 1], outputRange: [0, height] });
  /**
   * The waterline stops just short of the rim.
   *
   * At exactly 100% a line anchored to `fillHeight` sits half outside the
   * mouth and reads as a cap sitting on top of the bottle — visible in the
   * first device render. Three points of clearance keeps a full vessel
   * looking full rather than lidded.
   */
  const linePosition = fill.interpolate({ inputRange: [0, 1], outputRange: [0, height - 3] });
  const lineWidth = fill.interpolate({
    inputRange: LINE_INPUT,
    outputRange: LINE_OUTPUT.map((w) => w * scale),
  });
  // The waterline is meaningless at zero and would sit on the base as a
  // solid bar — the "empty vessel" reading the panel it replaces avoids.
  const lineOpacity = fill.interpolate({
    inputRange: [0, MINIMUM_VISIBLE_FILL, 1],
    outputRange: [0, 1, 1],
  });

  return (
    <View
      style={{ width, height }}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: percent, text: `${percent} percent of goal` }}
    >
      {/* 1 — the empty vessel */}
      <Svg width={width} height={height} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} style={StyleSheet.absoluteFill}>
        <Path d={VESSEL} fill={emptyFill} />
      </Svg>

      {/* 2 — the liquid, clipped by an animated rectangular window */}
      <Animated.View style={[styles.window, { height: fillHeight }]}>
        <View style={{ position: 'absolute', bottom: 0, left: 0, width, height }}>
          <Svg width={width} height={height} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}>
            <Path d={VESSEL} fill={liquidFill} />
          </Svg>
        </View>
      </Animated.View>

      {/* 3 — the surface. A bright line is what makes a small amount legible. */}
      <Animated.View style={[styles.lineRow, { bottom: linePosition, opacity: lineOpacity }]}>
        <Animated.View style={[styles.line, { width: lineWidth, backgroundColor: surfaceLine }]} />
      </Animated.View>

      {/* 4 — rim and edge, over the liquid so the outline survives a full vessel */}
      <Svg
        width={width}
        height={height}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        <G transform={`translate(${CX} ${VIEW_H / 2}) scale(0.972) translate(${-CX} ${-VIEW_H / 2})`}>
          <Path d={VESSEL} fill="none" stroke={innerStroke} strokeWidth={1} />
        </G>
        <Path d={VESSEL} fill="none" stroke={edgeStroke} strokeWidth={1.5} />
      </Svg>

      {/*
       * Completion: the vessel's own edge turns gold.
       *
       * Blue is the feature and gold is VITA, so a met goal is marked in the
       * brand colour rather than in more of the same blue — but as the
       * vessel's *own* outline, not as a halo around it. The first device
       * render drew an outset ring at `scale(1.05)`, and the top of that ring
       * fell outside the viewBox and was clipped, leaving gold down the sides
       * and nothing across the shoulder. Stroking the existing path needs no
       * room and cannot clip.
       *
       * It fades in over 180ms and then stops. No confetti, no burst, no
       * streak — the object settles into a finished state, which is what
       * "mature" has to mean here.
       */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: completion }]} pointerEvents="none">
        <Svg width={width} height={height} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}>
          {/* 1.5 rather than 1.75 — the first device render read a touch
              insistent, and the instruction when completion feels strong is
              to reduce it rather than to add anything. */}
          <Path d={VESSEL} fill="none" stroke={palette.gold} strokeWidth={1.5} />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  window: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  lineRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  line: {
    height: 2.5,
  },
});

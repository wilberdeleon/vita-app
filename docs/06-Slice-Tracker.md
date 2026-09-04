# VITA — Slice Tracker

Single source of truth for current development progress.

Every slice moves through the ten-step lifecycle defined in the Build Handbook:
objective → scope → build → self-review → audit → fix → founder review → approval → docs → merge/deploy.

---

## Sprint 0 — Visual Foundation — ✅ Complete

Scope amended by founders (July 2026): build the real application layouts from
the approved VITA UI reference with realistic placeholder data — not empty
placeholders. Auth + Supabase stay as architecture only; business logic and
live data connect in later sprints.

**Corrected 2026-07-09:** this table previously showed 0.2–0.12 as still "Founder review" while the "Completed Slices" section below claimed 0.2–0.10 were approved and the Changelog described 0.11–0.12 as already shipped — three inconsistent sources. Resolved per the founders' Sprint 0 completion decision (Vita HQ Roadmap, 2026-07-09): all of Sprint 0 is approved.

| # | Slice | Objective | Status |
|---|-------|-----------|--------|
| 0.1 | Repository scaffolding | Approved architecture created in `wilberdeleon/vita-app` | ✅ Approved |
| 0.2 | Theme + UI primitives | Tokens from UI reference; core component kit | ✅ Approved |
| 0.3 | Shell + navigation | Floating dock, route groups, auth gate, Supabase client architecture | ✅ Approved |
| 0.4 | Dashboard (Home) | Greeting, summary, quick stats, journey, meals | ✅ Approved |
| 0.5 | Fuel + Food Log flow | Hub + 8 flow screens incl. static barcode mock | ✅ Approved |
| 0.6 | Water flow | Log summary + add (cups/ounces) | ✅ Approved |
| 0.7 | Peptide flow | Log summary + add + examples | ✅ Approved |
| 0.8 | My Journey | Overview / Weight / Photos tabs, charts, 8-stage system | ✅ Approved |
| 0.9 | Atlas + Settings | Purple WIP experience; settings shell | ✅ Approved |
| 0.10 | Verification + docs | Simulator verification, documentation updates | ✅ Approved |
| 0.11 | Official branding + greeting | Brand palette, VITA mark on Home/sign-in, app icon + splash, time-of-day greeting | ✅ Approved |
| 0.12 | Sprint 0.1 global polish | Domain color hierarchy, dock refinement, logo scale, shadows/type, subtle motion | ✅ Approved |

Status legend: ⬜ Planned · 🟡 In Progress / In Review · ✅ Complete

---

## Completed Slices

- 0.1–0.12 — Sprint 0 Foundation, full application shell (approved July 2026)

---

## Sprint 1 — Dashboard — ✅ Complete (see closing summary below)

Two prerequisite decisions are resolved (founders, 2026-07-09): VITA supports Light + Dark via semantic design tokens, and Settings stays permanently in the top-right corner, never the dock.

**Restructured 2026-07-09 (founders):** Slice 1 (Dashboard Layout) was scoped as page structure only — hierarchy, spacing, scroll — not component styling. Founders split the original "Dashboard Layout" slice's card-positioning work out into its own dedicated slice, **Dashboard Components**, inserted as Slice 2: reusable card/container primitives (shadows, radius, press feedback) built once, before any section's actual content. Remaining slices renumbered accordingly (9 slices total, was 8).

**Health Metrics content locked (founders, 2026-07-09):** Steps, Water, Meals Logged, Sleep. **Peptides is explicitly excluded** from the primary Dashboard metrics. *Resolved — note retired 2026-08-21:* the mock data no longer carries a Peptides metric. `features/dashboard/mock.ts` now lists Steps · Water · Workouts · Sleep · Streak, so there is nothing left to update here.

**Slice 1.3 design revision (founders, 2026-07-10):** after initial build, founders replaced the generic Ionicons sun/moon badge with a bespoke **`TimeOfDayIllustration`** component — a circular-cropped landscape mark (layered mountains, small reflective lake) with one fixed composition, recolored across four states (morning/afternoon/evening/night) and ready for both light/dark color schemes. Existing greeting time-detection logic, minute re-evaluation, greeting copy, and card layout/dimensions were explicitly preserved — only the icon badge was replaced. New files: `src/components/ui/TimeOfDayIllustration.tsx`. Additive-only change to `src/features/dashboard/greeting.ts` (new `illustration` field; the three original fields' computation is untouched). **Not yet founder-tested in Expo Go — do not treat as fully approved until visually confirmed.** Artwork corrected 2026-07-10 against the founders' actual concept reference (sun nestled into a soft rolling ridge, moon floating free with a few stars, foreground pine silhouettes, gradient sky/lake) — the first pass was built from the written brief alone before the reference image was received. Same file only (`TimeOfDayIllustration.tsx`); geometry still identical across all four states, still no dark-mode-specific composition.

**Slice 1.3 final artwork swap (founders, 2026-07-11):** the procedural SVG (both the written-brief version and the corrected-against-reference version) was rejected as "a crude placeholder" not matching the approved illustration's premium quality. Replaced with the four founder-approved PNG assets directly — `TimeOfDayIllustration` now renders a static `Image` per period instead of drawing anything. New assets: `assets/illustrations/time-of-day/time-of-day-{morning,afternoon,evening,night}.png` (1254×1254, verified valid PNGs). `TimeOfDayIllustration.tsx` rewritten: all SVG/palette/gradient/star code removed, `period`-based API unchanged, 56px circular crop unchanged (still via wrapping `View` + `overflow: hidden`, since the source PNGs are opaque squares, not pre-cropped). **The `scheme` prop was dropped** — only one approved asset per period exists (no separate dark-mode artwork), so a non-functional prop would have been misleading; re-add it if/when dark-specific assets are ever approved. `greeting.ts`, `GreetingCard.tsx`, `dashboard.tsx` untouched — no consumer passed `scheme`, so this is not a breaking change to any call site. **Still not founder-tested in Expo Go.**

**Slice 1.3 hero supersession (founders, 2026-07-18):** the 56px circular badge + separate white greeting card is retired entirely, replaced by an approved Production Reference — a full-width hero image (~40% of viewport height) behind the VITA logo, settings gear, and greeting text, fading into the dashboard's off-white background. `GreetingCard.tsx` and `TimeOfDayIllustration.tsx` deleted (zero remaining references, confirmed by grep before removal); `greeting.ts` simplified back to `{ period, label }` (the `icon`/`illustration` fields existed only to feed the now-deleted badge). New: `src/features/dashboard/components/DashboardHero.tsx`, four assets at `assets/illustrations/hero/hero-{morning,afternoon,evening,night}.png` (853×1844, verified valid PNGs, used unmodified per Founder's Principle 15 / Asset Reference rules). New dependency: `expo-linear-gradient` (top scrim + bottom fade; not previously installed, resolved to SDK-54-compatible `~15.0.8` via `expo install`). Two shared primitives gained opt-in, backward-compatible props rather than being forked: `Screen` gained `topInset` (default `true`, unchanged everywhere; `false` on Dashboard only, so the hero bleeds under the status bar) and `ScreenHeader` gained `tone` (default `'dark'`, unchanged everywhere; `'light'` on Dashboard only, for the logo/gear over the image) — verified via `grep` that no other screen passes either prop, so Fuel/Journey/Atlas/Water/Peptides/Settings are unaffected. All four time periods verified via a temporary forced-period override + `npx tsc --noEmit` per period (then removed); `npx expo install --check` confirms `expo-linear-gradient` is compatible (flags an unrelated pre-existing `expo` patch-version lag, not touched). **Still not founder-tested in Expo Go — this is the item requiring visual approval.**

**Slice 1.3 hero framing correction (founders, 2026-07-18):** the first hero pass relied on a bare centered `resizeMode="cover"` at ~40% viewport height, which over-showed sky/clouds relative to the mountain. Corrected: hero grown to 70% viewport height; `DashboardHero.tsx` now renders an explicitly sized/positioned `Image` (1.5× width-zoom, aspect-ratio-preserved, no distortion) with a computed vertical translate anchoring the source's mountain-core fraction (~40% down, verified by visually inspecting all four assets) to ~45% of the hero height — same two constants for all four periods, since the composition is identical across them. Bottom fade shortened from 40% to 15% of hero height (the source art already fades toward white on its own past ~68%; this only guarantees a clean color seam). Greeting text moved from bottom-anchored to top-anchored, directly under the header, over the sky band, so it doesn't sit over the mountain's face. Hero gained a small `-16` bottom margin so the first dashboard card tucks slightly into the fade. Headline/subline copy itself was **not** changed — founders referenced new period-specific copy (an evening example) but only gave that one; flagged back to them rather than inventing morning/afternoon/night text. Also flagged: the night asset's moon sits upper-left, near where the greeting text now sits — same crop applies to all four by design, unavoidable without breaking composition consistency. `npx tsc --noEmit` clean. **Still pending Expo Go visual approval.**

**Slice 1.3 continuous-environment + per-period focal framing (founders, 2026-07-18):** the single universal crop cut off the sun/moon — the celestial elements sit at very different source positions per asset (morning/evening sun ~(0.14, 0.42); night moon ~(0.23, 0.18); afternoon has none) that a mountain-centered crop couldn't also satisfy. `DashboardHero.tsx` now defines a per-period `FOCAL_BOXES` region (verified by visually inspecting all four assets) and fits it to the viewport via `scale = min(scaleForWidth, scaleForHeight)`, so scale/translation are period-specific but still computed from live window dimensions (responsive, not fixed pixels). Fade height is also per-period (17% morning/evening, 20% afternoon, 9% night) — sized to start just past each period's focal-box end so it never covers the mountain, sun, or moon. `palette.background` (`#F6F5F2`→`#F6F4EF`) and `palette.card` (`#FFFFFF`→`#FCFBF8`) updated in `theme/tokens.ts` — global semantic-token changes (not a Dashboard-only hardcode), flagged explicitly since they affect every card app-wide, chosen because the shift is subtle (1–3 unit nudge) and directly requested ("use existing tokens, don't invent disconnected colors"). Hero's bottom overlap increased `-16`→`-32`. `npx tsc --noEmit` clean. **Still pending Expo Go visual approval.**

**Slice 1.3 hero copy/typography refinement (founders, 2026-07-18):** strictly scoped to text — image framing, fade, scale, overlap, and colors from the prior two revisions are untouched (verified line-by-line). `greeting.ts`'s `LABELS` changed from "Good morning" etc. to "Morning"/"Afternoon"/"Evening"/"Night" (hour logic unchanged). `DashboardHero.tsx`: three-level editorial hierarchy replaces the greeting-card copy — uppercase kicker label (13px/600/+1.4 tracking/85% opacity), dominant headline "Build with intention." (52px/800/54 line-height/-0.5 tracking, exact wording preserved, natural two-line wrap), uppercase supporting line "YOUR DAY, YOUR DIRECTION." (11px/500/+1.6 tracking/70% opacity). Headline/subline are now constant across all four periods rather than data-driven — `DashboardHero` still receives the `headline`/`subline` props from `dashboard.tsx` for API stability but no longer renders them; formally removing that now-dead plumbing (`mock.ts`/`api.ts`/`types.ts`) is flagged as a follow-up outside this revision's explicit scope. `npx tsc --noEmit` clean. **Still pending Expo Go visual approval.**

**Slice 1.3 "Mountain World" — continuous glass environment (founders, 2026-07-18):** the biggest structural change to Sprint 1 so far — the Home screen is no longer "hero image, then a page." The mountain background is now a **fixed, full-screen layer** (`MountainBackground.tsx`) rendered behind `Screen`'s `ScrollView` rather than scoped to an initial hero fold; all dashboard content (Today's Summary, Health Metrics, Current Journey, Today's Meals, the floating dock) scrolls over it as **frosted glass** via a new reusable primitive, `GlassSurface` (`components/ui/GlassSurface.tsx` — real native blur via `expo-blur`, a tint overlay, subtle border, soft shadow, four variants: `subtle`/`standard`/`strong`/`navigation`; semantic tokens in `theme/tokens.ts` as `glass`/`glassShadow`).

Same-composition constraint respected: `MountainBackground` reuses the exact same per-period `FOCAL_BOXES` regions approved in the prior revision (sun/moon positions unchanged), but retargeted to fill the *full* window height instead of a 70%-tall hero — `FOCAL_TARGET_Y` recalculated (0.45→0.315) to keep the mountain landing at roughly the same physical screen position now that the fill target grew, rather than let it drift lower. The bottom fade-to-solid-color is removed entirely (no longer a "hero ends here" concept); only a top scrim remains, for header/greeting legibility.

**Shared-component risk, handled the same way as every prior extension:** `DailyProgressCard`, `ListRow`, `StatBar`, and `SectionHeader` are used by Fuel/Settings/Water/Peptides/Journey too. Each gained an opt-in prop defaulting to today's exact behavior — `surface?: 'card'|'none'` (DailyProgressCard, ListRow), `light?: boolean` (StatBar), `tone?: 'dark'|'light'` (SectionHeader) — verified via `grep` that no screen besides `dashboard.tsx` passes any of them. `FloatingDock` (shared across all four tabs) now renders glass *only* when the active route is `dashboard`; Fuel/Journey/Atlas keep the unmodified solid white pill.

Variant assignment: Today's Summary/Health Metrics → `standard`, Current Journey → `subtle`, Today's Meals → `strong` (one glass panel for the whole list, not one per row — keeps blur-layer count down), dock → `navigation`.

New files: `components/ui/GlassSurface.tsx`, `features/dashboard/components/MountainBackground.tsx`. New dependency: `expo-blur` (~15.0.8). `palette.background`/`palette.card` untouched from the prior revision. `npx tsc --noEmit` clean; `npx expo install --check` reports `expo-blur`/`expo-linear-gradient` compatible (same unrelated pre-existing `expo` core patch-lag as before, not touched). **Still pending Expo Go visual approval** — this is the largest change yet with zero visual verification possible on my end; Android blur performance in particular is unverified.

**Slice 1.3 three-step refinement — extended assets, breathable glass, copy (founders, 2026-07-18):**

*Step 1 — retuned `MountainBackground.tsx` for the founders' vertically extended replacement assets.* The new assets fill their full 853×1844 frame (no more baked-in white fade eating ~32% of the height) and are aspect-matched to modern iPhones to within 0.5%. The per-period focal-box zoom math the short assets required is removed entirely — replaced with a plain full-bleed cover and a single `TOP_CROP_BIAS` (0.25) that only matters on squatter devices (SE-class), biasing the crop to keep sky rather than foreground. Verified focal positions in the new assets stay as documentation comments. Same filenames, same `require()` paths, per the founders' instruction — no reference changes needed.

*Step 2 — spacious/rounded glass layout pass.* New tokens: `spacing.huge` (40, section-to-section rhythm) and `radii.glassTile/glassMedium/glassLarge` (26/28/30). `Screen` gained an opt-in `horizontalInset` prop (responsive 24/28px, default unchanged everywhere else). `Section`'s internal header→panel gap (Dashboard-only component) increased 8→12. Panel padding increased throughout (26px major panels, 20px Health Metrics, 20/14px meal rows — the last two only reachable via each component's existing opt-in "light/none" mode, so Fuel/Settings/Peptides are unaffected). Health Metrics stayed **one glass panel** with spacious per-metric zones and subtle dividers, not four separate tiles — four `BlurView`s would cost noticeably more for a section read as one group. Today's Meals gained increased row spacing plus subtle hairline separators. The floating dock's padding/icon-label gap/bottom clearance only changed in its glass (Home-only) branch — the solid dock on Fuel/Journey/Atlas is byte-identical to before, verified via `grep`.

*Step 3 — copy-only.* Greeting label "Morning"/"Afternoon"/"Evening"/"Night" → "Good morning"/"Good afternoon"/"Good evening"/"Good night" (renders uppercase via existing `textTransform`, so "GOOD MORNING, WILBER" etc. with zero style changes). Headline and supporting line copy untouched.

All three steps: `npx tsc --noEmit` clean, `npx expo install --check` clean (same pre-existing unrelated `expo` patch-lag), verified via `grep` that no screen besides `dashboard.tsx` consumes any new opt-in prop, no temporary overrides left in the codebase. **Still pending Expo Go visual approval.**

**Slice 1.3 readability/hierarchy polish pass (founders, 2026-07-18):** eight focused refinements, no concept changes. (1) Hero copy block moved +36px lower (`marginTop` 12→48, header/logo untouched) so it sits below the Morning/Evening sun-glow band. (2) Section rhythm 40→32px (`spacing.xxxl`); the one-pass-old `spacing.huge` token deleted (no other consumer). (3) Meal rows tightened: vertical padding 14→10, row gap 16→12 — separators/data/interactions unchanged. (4) New `ProgressRing` primitive (`components/ui/ProgressRing.tsx`, react-native-svg — already a dependency, none added): 56px/6px-stroke circular indicator, `palette.primary` arc, percent centered; wired into `DailyProgressCard` via new opt-in `percentDisplay: 'text'|'ring'` (default `'text'` — Fuel's two usages pixel-identical), Dashboard passes `'ring'`; static, the horizontal bar remains the animated element. (5) Health Metrics hierarchy: icons 20→22, values 13/500→15/600, labels 11→10/500. (6) Journey progress bar 6→8px. (7) Glass content tints lightened ~10% relative — subtle 0.40→0.36, standard 0.50→0.45, strong 0.58→0.53; `navigation` deliberately untouched because the dock's approved tint is locked by the same pass. (8) Dock untouched this pass. Validation: tsc clean, expo check clean (same pre-existing `expo` patch-lag), no temp overrides, `percentDisplay` unused outside `dashboard.tsx`. **Pending Expo Go visual approval — Morning/Evening hero-copy readability is the specific thing to check.**

**Slice 1.3 stronger correction (founders, 2026-07-18, after Expo Go review found the polish pass too subtle and the copy still colliding with sun/moon):** (1) hero copy offset is now **per-period** (`GREETING_OFFSET` in `DashboardHero.tsx`: morning 216 · afternoon 48 · evening 244 · night 96 — left-aligned, type styles unchanged, header untouched; morning/evening drop the block below the sun-glow band onto the darker valley, night clears the moon). (2) Section gap 32→**24** (`spacing.xxl`). (3) Today's Meals: row vertical padding 10→**6**, row gap 12→**8**, panel vertical padding 26→**16** via a new `paddingVertical` override on `GlassSurface` (defaults to `padding`; no other surface affected) — computed ≈−21% panel height. (4) Glass tints, second cut: subtle 0.36→**0.30**, standard 0.45→**0.38**, strong 0.53→**0.46**, `navigation` still locked at 0.55. (5) Today's Summary ring untouched, as approved. Validation: tsc clean, expo check clean, no temp overrides, dock byte-identical. **Pending Expo Go approval — morning/evening copy now sits mid-screen over the mountain body's left flank; that placement is the judgment call to verify.**

**Slice 1.3 surface-composition redesign (founders, 2026-07-18, after Expo Go review found every section using the same dark full-width rounded-slab silhouette):** diagnosed as a composition problem, not a spacing/opacity problem — addressed by giving each section a distinct glass treatment and shape instead of tuning the same shape further.

- **Today's Summary** → new **`premium`** glass variant (warm brown-black tint `rgba(40,32,24,0.34)`, warm highlight `rgba(255,220,180,0.10)`, blur 35) — the one hero card. Calorie headline bumped 17→**26px/700** (ring mode only, via `DailyProgressCard`'s existing `percentDisplay` gate). Macros gained a subtle inset background (`rgba(255,255,255,0.05)`, radius 14) via a new opt-in `StatBar` `inset` prop, default false — Fuel's macro rows unaffected.
- **Health Metrics** → **four separate glass tiles** (`subtle` variant, new `radii.glassTile` 26→**20**), replacing the single shared panel from two passes ago. Responsive: one row of 4 at ≥380pt width, 2×2 wrap below. Deliberate performance tradeoff (four `BlurView`s vs. one) — flagged before implementing, the founders reviewed the one-panel version and want the tiles anyway.
- **Today's Meals** → **each meal is now its own glass card** (`subtle` variant, new `radii.glassRow` 22, 12px gap), replacing the single enclosing `strong`-variant panel — the mountain now shows through between meals rather than only around one block. `ListRow`'s `surface="none"` padding zeroed (each row's own `GlassSurface` now owns padding, avoiding double-padding).
- **Current Journey** → left on `subtle` (lightest tier), padding trimmed 24→20, row margin 16→12 — explicitly not redesigned, per the founders' instruction.
- **Dock** → untouched, verified.

New: `components/ui/ProgressRing.tsx`'s sibling change is `glass.premium` in `theme/tokens.ts`; `GlassSurface`'s `GlassVariant` union gains `'premium'`; top highlight strip 1→2px universally (minor, harmless). Files: `theme/tokens.ts`, `GlassSurface.tsx`, `ListRow.tsx`, `DailyProgressCard.tsx`, `StatBar.tsx`, `QuickStatsRow.tsx` (rewritten), `JourneyCard.tsx`, `dashboard.tsx`. `npx tsc --noEmit` clean, `npx expo install --check` clean (same pre-existing `expo` patch note), verified via `grep` that no other screen consumes any new prop/variant and the dock's tint is unchanged. **Pending Expo Go visual approval.**

**Slice 1.3 Today's Summary "Daily Portrait" redesign (founders, 2026-07-18) — scoped to Today's Summary only, everything else on Home preserved as-is.** New dedicated `features/dashboard/components/HomeSummaryCard.tsx` (not a mode of the shared `DailyProgressCard` — that component, and `StatBar`, were **reverted** to their pre-Home-conditional-prop form in the same change, since Fuel was their only remaining real consumer; verified by `grep` that Fuel's two call sites never referenced the removed props). Layout: "TODAY" kicker → row (120px/10px-stroke ring with 32px/700 percentage + "COMPLETE" sublabel, left; static editorial message + two-column calorie pair with a 1px divider, right) → three macro rows (label / thin 5px track / gram value / percent, spacing-only separation, no dividers or inset cards — an explicit reversal of the previous pass's macro-inset treatment, which this redesign's spec called for). Ring narrows to 100px/8px under 380pt width; all other typography uses existing tokens unchanged across breakpoints. Typography audit: confirmed **zero custom fonts anywhere in the app** (`grep`'d for `fontFamily`/font loading, found none) — every numeral uses the platform system font via the existing `typography` token scale (`display` for the ring %, `title` for the calorie pair, `caption`/`captionMedium`/`micro` for supporting values) — no one-off sizes introduced. `ProgressRing` extended with optional `sublabel`/`labelStyle`/`sublabelStyle` (backward compatible, still only consumer is this card). No new dependency. Card outer size/position/radius/blur/border/shadow unchanged, per instruction. `npx tsc --noEmit` clean, `npx expo install --check` clean (same pre-existing `expo` patch note), Fuel's two `DailyProgressCard` call sites unaffected, no temp overrides. **Pending Expo Go visual approval.**

| # | Slice | Objective | Status |
|---|-------|-----------|--------|
| 1.1 | Dashboard Layout | Overall layout, content hierarchy, section spacing, responsive behavior, scroll | ✅ Approved |
| 1.2 | Dashboard Components | Reusable card/container primitives — shadows, radius, press feedback — for all sections to build on | ✅ Approved |
| 1.3 | Greeting Card | Dynamic greeting, motivational message, time-of-day behavior, polish | ✅ Approved (superseded by the clean redesign below) |
| 1.4 | Today's Summary | Calories, macro progress (protein/carbs/fat), progress calculations | ✅ Approved (superseded by the clean redesign below) |
| 1.5 | Health Metrics | Steps, Water, Workouts, Sleep, Streak — reusable metric tiles | ✅ Approved (superseded by the clean redesign below) |
| 1.6 | Journey Preview | Current Journey card, progress bar, current week, CTA into Journey | ✅ Approved (superseded by the clean redesign below) |
| 1.7 | Meals Preview | Meal cards, icons, calories, empty states, tap interactions | ✅ Approved (superseded by the clean redesign below) |
| 1.8 | Floating Navigation | Existing 4-tab dock only (Home/Fuel/Journey/Atlas) — active states, blur/material, animations, polish. Settings excluded per placement decision. | ✅ Approved |
| 1.9 | Dashboard Polish | Loading states, animations, micro-interactions, accessibility, performance, Light + Dark verification | ✅ Approved (theme system + final density/audit pass) |

---

## Sprint 1 — Dashboard — ✅ Complete (2026-08-02)

**The original granular 1.3–1.7 slice plan above was superseded mid-sprint by a full design pivot**, documented in the long narrative above this table: the "Mountain World" photo-background concept (built and iterated across ~10 rounds) was abandoned entirely once the founders supplied real Light + Dark mockups declared "the new foundation, not another iteration." Everything that plan's slices were meant to cover (greeting, today's summary, health metrics, journey preview, meals preview) shipped as part of that redesign instead of as separate numbered slices — hence marking 1.3–1.7 approved-via-supersession rather than backfilling a slice-by-slice history that doesn't match how the work actually happened.

**What shipped, in build order:**
1. **Theme system** — real Light/Dark/System theming (`ThemeProvider.tsx`, `useTheme()`), replacing the light-only stub. Every Home surface (`GlassSurface`, `Screen`, the floating dock) reads from it; Settings' Appearance row is now a functional picker.
2. **Clean Home redesign** — flat card-based layout replacing the photo-background hero: `HomeHeader`, health metrics as floating tiles, meal rows, Current Journey with the 8-stage system (promoted to `src/lib/journeyStages.ts` so Journey and Home share one source).
3. **Today's Summary simplification** — dropped the three-metric row (consumed/remaining/streak) for one primary metric (calories remaining) beneath the goals row; goals row itself simplified from boxed tiles to plain icon/label/status-dot columns.
4. **Journey and Macros split** into two separate cards, each with one clear purpose, instead of one combined card.
5. **Health Metrics** — Day Streak added as a 5th tile, centered beneath the primary four rather than left-aligned.
6. **Final audit and cleanup (2026-08-02)** — removed dead code accumulated across the redesign's many iterations: unused `radii.glassMedium` token, unused `surfacesFor()` helper, `ListRow`'s unused `surface` prop, `Screen`'s unused `background` prop (both left over from the abandoned photo-hero era), dead `DashboardData.headline`/`subline` fields, and the unused `expo-linear-gradient` dependency (also installed for the abandoned hero). Full findings in `docs/07-Audit-Log.md`.

**Validation:** `npx tsc --noEmit` clean, `npx expo install --check` clean, Metro bundle verified with zero errors at each stage. Sprint 1 is founder-approved in Expo Go.

**Next: Sprint 2 — Fuel.** Reprioritized ahead of Journey (the official roadmap's original Sprint 2) per founder direction 2026-08-01/02 — see `docs/Vita HQ/01 Vision/Roadmap.md` for the flagged sequencing note. Fuel inherits the theme system and card/spacing/typography language established in this sprint rather than building its own.

---

## App-Wide Visual Consistency Pass — ✅ Complete (2026-08-16)

**Not a sprint and not a feature pass** — a design-system migration run between Sprint 1 and Sprint 2, founder-approved after Expo Go review on a physical iPhone. Merged to `main` as `ec6d2cc`.

**The problem.** Sprint 1 built the theme system but scoped it to Home. Home read `theme.surfaces` (light/dark pairs) while every other screen imported the flat, light-only `palette` object directly — so the rest of the app was *structurally incapable* of rendering dark and had visibly drifted from Home's design language. This migrated them onto the same system.

**What changed:**
1. **`tokens.ts`** — added `surfaces.track` (light `#EFEDE9` / dark `rgba(255,255,255,0.12)`) so segmented controls, steppers, and inert wells stop pinning a light gray.
2. **`Screen`** — dropped the `themed` opt-in prop; every screen root now follows the active theme. The prop only existed because the redesign was Home-scoped, and keeping it would just be a way to leave a screen broken in dark mode.
3. **Primitives made theme-aware** — `Card`/`PressableCard` (`cardSurfaceStyle` became the `useCardSurfaceStyle()` hook, plus a hairline border in both themes), `ListRow`, `Chip`, `SegmentedTabs`, `TextField`, `Stepper`, `SectionHeader`, `ScreenHeader`, `DailyProgressCard`, `StatBar`. `Chip`/`SegmentedTabs` now resolve their own neutral fill per theme — brand ink is invisible on a near-black track.
4. **Screens migrated** — Fuel + all sub-routes (Food Log, Log Food, Add Manually, Search, Recent, Favorites, Food Detail), Journey (Overview/Weight/Photos + `LineChart`/`WeightBars`), Atlas, Settings, Water, Peptides, sign-in.

**Deliberately unchanged:** `ProgressBar`'s pale track (it *is* the approved Home treatment — see `docs/05-Design-System.md`), the Barcode Scan screen (an inherently dark camera mock), and the `cardWarm` brown "Visual Progress" card (a deliberate accent surface).

**Functional parity — nothing changed behaviorally.** Verified mechanically rather than by eye: every JSX text node and string literal across all 32 changed files is identical before/after (the only new literals are `'dark'` scheme checks), and every `onPress`, `router.push/back`, `onChange`, `chevron`, accessibility prop, and route declaration is unchanged. No route added or removed (23, unchanged); no mock, `api.ts`, or `types.ts` file touched.

**Home is visually unchanged.** No file under `src/features/dashboard/` was modified. `dashboard.tsx` changed by one line (removing the now-nonexistent `themed` prop, which resolved to the same value). Each shared component Home uses was traced to resolve identically — Home passes `tone` explicitly to `ScreenHeader`/`SectionHeader`, which short-circuits ahead of the new theme default, and in light mode `surfaces.text` *is* `palette.text`.

**Validation:** `npx tsc --noEmit` clean · `--noUnusedLocals --noUnusedParameters` clean · `npx expo install --check` clean · iOS Metro bundle exported with zero errors (post-merge bundle hash byte-identical to the pre-merge build, confirming the fast-forward introduced no drift) · founder-approved in Expo Go on device.

**Deferred:** theme preference persistence — `ThemeProvider` holds `mode` in `useState`, so the Appearance choice resets on cold restart. No `AsyncStorage`/`SecureStore` in the project yet. Not started here; needs its own slice.

**Next: Sprint 2 — Fuel.** Not started.

---

## Sprint 2 — Fuel — ✅ Complete (started 2026-08-17 · audited 2026-08-21 · founder device QA passed and merged to `main` 2026-08-21)

Branch `sprint-2-fuel`. Founder-authorized 2026-08-17 against the approved Sprint 2 Fuel plan. Architecture principle the founders approved explicitly: **prove the nutrition engine before introducing external providers**, so the core loop is testable before a single network call exists.

| # | Slice | Objective | Status |
|---|-------|-----------|--------|
| 2.1 | Nutrition Foundation | Model, pure calculations, persistence behind a repository, `NutritionProvider`; Fuel reads real state | ✅ Approved |
| 2.2 | Core Logging | Manual food → custom food → entry → meal → daily totals; delete + Undo | ✅ Approved |
| 2.3 | Food Detail + Servings | Serving selector, fractional quantity, meal assignment, Add to Log; dark-mode progress-track correction | ✅ Approved |
| 2.4 | Edit + Delete | Edit route reusing `PortionEditor`; delete + Undo preserved | ✅ Approved |
| 2.5 | Home Synchronization | Home nutrition on the shared engine; Home's rendering provably unchanged | ✅ Approved |
| 2.6 | Provider Layer + Search | USDA + Open Food Facts adapters, normalization, dedupe, ranking, cache, debounced search | ✅ Approved — USDA key now configured; both providers verified live 2026-08-21 |
| 2.7 | Recent + Favorites | History-derived recents, persisted favorites keyed by `vitaId` | ✅ Approved |
| 2.8 | Barcode Scanner | `expo-camera`, VITA overlay, permission states, scan lock, OFF→USDA chain | ✅ Approved — pipeline verified live; **live camera detection still needs a physical iPhone** |
| 2.9 | Fuel Visual Refinement | Fuel landing rebuilt as a nutrition command centre: ring + remaining summary, direct Log Food / Scan, inline meals with per-meal Add Food, compact Hydration/Peptides, Calories terminology | ✅ Approved |
| 2.10 | Restaurant Provider Research | FatSecret Basic evaluated as a restaurant/branded source: cost, quota, auth, coverage, storage terms | 🔬 **Research COMPLETE — integration DEFERRED** (see below) |
| 2.11 | Water Wiring | Water on the same engine; UI untouched | ↪️ **Superseded — moved to Sprint 3** |
| 2.12 | Polish & Audit | Empty/loading/error review, Light/Dark sweep, full verification | ✅ **Done as the Sprint 2 closeout audit** |

**Renumbered 2026-08-21.** The Fuel Visual Refinement slice was recorded on 2026-08-18 as a late-Sprint-2 slice without a number (`docs/04-Master-Roadmap.md`). The founders opened it after 2.8 rather than after Edge Cases & Polish, so it takes 2.9 and the three remaining **unstarted** slices shift by one. Nothing already built was renumbered.

**Status of 2.11 and 2.12 reconciled 2026-08-21** (both rows previously read ⬜ Planned inside a sprint that had already closed and merged, which read as unfinished Sprint 2 work):

- **2.11 — Water Wiring is superseded, not skipped.** The 2026-08-21 roadmap reorder moved Water + Peptides to Sprint 3, and wiring Water to a real engine is that sprint's own work — Sprint 3 slice 3.2 (Water Domain + Persistence), which builds Water its own domain rather than attaching it to the nutrition engine. Water's Sprint 2 treatment was exactly what the Fuel plan promised: entry points preserved, fixtures untouched, nothing removed. No Water code shipped in Sprint 2 and none was expected to.
- **2.12 — Polish & Audit was executed as the Sprint 2 closeout audit** (commit `71333ad`), written up below under "Sprint 2 closeout audit — 2026-08-21". It covered the empty/loading/error review (which found and fixed the Favorites false-empty state), the verification run, and the doc reconciliation. What it did *not* do is add a committed test suite — recorded as an open finding in `docs/07-Audit-Log.md` and carried into Sprint 3 slice 3.1.

### Slice 2.1 — Nutrition Foundation 🟡

**Objective:** replace Fuel's presentation-only nutrition with a real engine — one shared source of truth that persists, survives a restart, and is ready for Home to read in slice 2.5. No external providers, no logging UI yet.

**What the audit found, and what it means.** Fuel and Home each carried an independent nutrition fixture. Both showed `1267 / 2000 kcal`, but Fuel's meals summed to 1250 and Home's to 1740 — neither reconciled with its own headline. `Macro` and `MacroSummary` were field-for-field identical types in two features. Fuel said `'Snack'`, Home said `'Snacks'`, and `restaurantIconFor()` only mapped the singular, so Home's slot would have returned `undefined` had it ever called it. There was no persistence anywhere in `src/` — no `AsyncStorage`, no `SecureStore`, no `expo-sqlite` — and not a single `fetch()`.

**New — `src/lib/nutrition/`.** In `lib/`, not `features/fuel/`, because both Fuel and Dashboard consume nutrition and features never import each other (CLAUDE.md rule 4) — the same promotion `journeyStages.ts` received.

- `model/types.ts` — `VitaFood`, `ServingOption`, `NutritionFacts`, `FoodEntry`, `NutritionTargets`, `MealSlot`, `FoodSource`, `DEFAULT_TARGETS`
- `model/nutrition.ts` — pure: `scaleNutrition`, `addNutrition`, `sumEntries`, `groupByMeal`, `summarizeMeals`, `dailyTotals`, `remaining`, `progress`, `percent`, `roundForDisplay`
- `model/dates.ts` — local-calendar log dates (`toLogDate`, `todayLogDate`, `isValidLogDate`)
- `model/mealSlots.ts` — canonical meal icons + `defaultMealForTime()` (moved from `features/dashboard/mealIcons.ts`)
- `model/macros.ts` — the three macros defined once, theme-free, keys chosen to match the color token names
- `data/` — `FoodLogRepository` interface, AsyncStorage implementation, namespaced `vita:v1:` keys
- `state/` — `NutritionProvider` (Context + `useReducer`, mirroring `ThemeProvider`; no state library added) and `useDailyNutrition()`

**Three decisions worth recording.** (1) **Entry nutrition is snapshotted**, already multiplied by quantity, so a later provider correction never rewrites January's log and daily totals stay a pure sum with no async. (2) **Persisted data is validated on read** — `NaN`, corrupted records, and entries whose `logDate` contradicts their storage key are dropped rather than repaired, because a guessed value in a food log is worse than a missing one. (3) **Optional nutrients stay absent when absent** through scaling and addition, so "unknown sodium" never becomes "0 mg sodium".

**Deleted.** `FUEL_TODAY` (contradictory totals; its water/peptide counts also duplicated fixtures those features already owned — the Fuel hub now reads `getWaterToday()`/`getPeptideToday()` directly at the route level, which is composition, not a cross-feature import). `Macro`, `FuelToday`, `LoggedMeal` from `features/fuel/types.ts`. `getFuelToday()` from its api. `features/dashboard/mealIcons.ts` — grep confirmed nothing under `src/features/dashboard/` imported it; only Fuel's two screens did.

**Changed.** `src/app/_layout.tsx` mounts `NutritionProvider` above the router. `(tabs)/fuel.tsx` and `fuel/log.tsx` render real state with a designed empty state and an em-dash placeholder during hydration — showing a real `0` that jumps to `1,267` a frame later would read as data loss. New `EmptyState` primitive (19 total).

**Deviation from the approved plan, flagged:** the plan put `isFavorite` on `VitaFood`. Implemented instead as a separate favorites store keyed by `vitaId`, resolved at read time (slice 2.7). A denormalized mutable flag on a cached food is a staleness bug waiting to happen; the behavior the founders asked for — favorites working identically regardless of source — is unchanged.

**Validation.** `npx tsc --noEmit` clean · `--noUnusedLocals --noUnusedParameters` clean · `npx expo install --check` clean · iOS Metro bundle exported with zero errors (3.27 MB, 1363 modules) · run in Expo Go on the iOS Simulator and confirmed by screenshot: Fuel renders `0 / 2,000 kcal · 0%`, macros `0/160g · 0/214g · 0/64g`, the empty state, and `Food Log 0 / 4 logged`, with Water and Peptides still on their own fixtures as intended.

**Not yet proven.** The persistence **write** path is unexercised end-to-end — nothing in the app can create an entry until slice 2.2. Hydration (read) is confirmed working. Do not treat "logging survives a restart" as verified until 2.2 demonstrates it.

**Found, not fixed — needs a founder decision.** With real data, an empty day shows every progress bar as a solid near-white track in dark mode, which reads as *100% complete* rather than 0%. The cause is the deliberately theme-invariant `ProgressBar` track (`palette.track`), approved 2026-08-16 as decision (3) precisely because changing it would change Home. It was harmless while the fixtures always showed partial progress. It is not harmless now. Flagged rather than changed, since the founders locked it. Also noted: a pre-existing `[Layout children]: No route named "(auth)"` warning in `src/app/_layout.tsx` (the route is `(auth)/sign-in`), unrelated to this slice.

### Slice 2.2 — Core Logging 🟡

**Objective:** make the write path real. Create a reusable custom food, log it to a meal, see every total move, remove it, undo the removal — all persisted. This is the slice that proves the engine 2.1 built.

**What shipped.**

- **Custom foods (My Foods).** `CustomFoodRepository` alongside `FoodLogRepository`, both satisfied by one `NutritionRepository` implementation. A custom food is a *definition*; the log is a record of eating it — so logging the same breakfast every day creates one food and many entries, never a duplicate food per log. `saveCustomFood` replaces by `vitaId` rather than appending, so a future edit updates the food instead of spawning a near-duplicate.
- **Factories** (`model/foods.ts`, pure): `createCustomFood`, `createEntry`, `servingLabel`, `entryServingLabel`, `newId`. A food typed in by hand and a food from a provider produce the identical `VitaFood`, which is what keeps Favorites, Recents, and Food Detail source-agnostic later.
- **Manual entry is real.** `manual.tsx` was nine uncontrolled inputs discarding everything on Save. It is now a controlled form: name, optional brand, serving size + unit, the four required macros, a collapsible "More nutrition" group (saturated fat, fiber, sugar, sodium), and a meal picker seeded from the time of day. Save is disabled until valid. Saving creates the food, logs one serving, shows a confirmation toast with Undo, and returns to the Food Log.
- **Food Log is real.** Meal-grouped sections with per-entry rows, per-meal calorie subtotals, an explicit remove control on each row, and delete-with-Undo.
- **`Toast` primitive** (20 total) — the confirmation surface. Not a modal and not a success screen: logging is meant to take seconds, and a screen to dismiss after every banana turns two taps into three. Carrying Undo also removes the need for a confirm dialog in front of a destructive action, which is both faster and kinder than asking "are you sure?" every time.
- **`Button` gains `disabled`** (backward compatible; `PressableScale` already supported it).

**Decisions worth recording.** (1) **Blank ≠ zero.** `parseAmount` returns `null` for an empty field, so an omitted sodium is stored as absent rather than `0 mg` — entering 0 g of fat is a fact, leaving it blank is not. (2) **The four macros are required, everything else optional** — the founder-stated minimum, without forcing a full nutrition label. (3) **Delete has no confirm dialog**, because Undo makes it reversible; a gate in front of a reversible action is friction without safety. (4) **Only meals with entries are rendered** in the Food Log — four headings over one entry turns a short log into a mostly blank screen, and the meal is chosen when the food is added, so an empty slot here is not a control.

**Also corrected:** the Food Log screen's header said "Log Food", which is what `/fuel/add` is called. It now says "Food Log".

**Validation.** `tsc --noEmit` clean · `--noUnusedLocals --noUnusedParameters` clean · `expo install --check` clean · iOS bundle exported with zero errors (3.29 MB) · **driven end-to-end in Expo Go on the simulator**: created "Protein Oats" (1 serving, 300 kcal / 24P / 40C / 7F, Breakfast) → Food Log showed `1 / 4 logged`, `300 / 2,000 kcal · 15%`, macro bars at 24/160g, 40/214g, 7/64g, and a `BREAKFAST · 300 KCAL` section → **killed Expo Go and relaunched: the entry survived**, and the Fuel hub showed the same numbers → deleted the entry (totals fell to 0 immediately) → Undo restored it.

**Persistence is now proven end-to-end**, closing the gap flagged in slice 2.1.

**One change made during verification:** the Undo toast window was 4.2s. A first Undo attempt missed it — that was a slow test rather than a defect, but 4.2s is genuinely tight for an action the user has to notice, read, decide on, and reach. Raised to 6s for toasts carrying an action; plain acknowledgements stay at 2.6s.

**Still open from slice 2.1, unchanged:** the theme-invariant progress track still reads as a full bar at 0% in dark mode. Confirmed light-mode-only during this slice's verification — in light mode the pale track reads correctly as empty. Founder decision.

### Slice 2.3 — Food Detail + Servings 🟡

**Objective:** make Food Detail the reusable decision point between a food *definition* and a food *log entry* — serving, quantity, meal — with nutrition recalculating live before anything is committed.

**Food Detail consumes only the normalized model.** Nothing on the screen knows whether a food was typed in by hand, came from the interim fixture catalog, or (later) from USDA, Open Food Facts, FatSecret, or a barcode scan. That is the point of normalizing at the provider boundary rather than in the screen.

To make that true today rather than aspirationally, the placeholder catalog got its own adapter (`features/fuel/fixtureCatalog.ts`) — a provider adapter in miniature, mapping `FoodItem` → `VitaFood`. Search, Recent, and Favorites now render normalized foods too. `FoodSource` gains an interim `'vita-fixture'` member so those foods carry honest provenance instead of masquerading as user-created; both the adapter and that member are deleted in slice 2.6 with nothing downstream changing. `features/fuel/api.ts` was removed — fully superseded.

**Built for the edit flow, not just for adding.** `PortionEditor` (serving + quantity + meal) is its own component precisely because editing an existing entry needs the same three controls and the same arithmetic. Building it inline would have guaranteed a second, subtly different editor in slice 2.4.

**Calculation is not duplicated.** The screen calls `nutritionForServing()` from the engine; the only screen-local logic is which serving is selected. Display rounding moved into a new `model/format.ts` — `formatCalories` (whole numbers), `formatAmount` (one decimal only when there is one), `formatServingCount`, `pluralizeUnit`. Half of 7 g fat renders as `3.5g`, not `4g`, because rounding that would be a visible lie at exactly the moment the user is checking the math.

**Other changes.** `Stepper` gains `step`, `formatValue`, and a `quantize()` guard — floating-point steps otherwise drift 1.5 into 1.4999999999999998 after a few presses, which would then be *stored*. `FoodRow` lost its heart: it had no `onPress` and toggled nothing, the same deceptive-control problem as the barcode mock's gallery button. It returns as a working control in slice 2.7. Search/Recent/Favorites gained real empty states.

**Manual flow restored to the intended architecture.** Slice 2.2 logged directly from the form as the shortest path to proving the write path. It now creates the food and hands off: `Add Manually → save custom food → Food Detail → serving/quantity/meal → Add to Log`. Navigation uses `replace`, not `push`, so backing out of Food Detail returns to the Log Food picker rather than a filled-in form that would create a second copy of the same food.

### Progress-track correction (founder-approved refinement, 2026-08-17)

**Refines, not reverses, the 2026-08-16 decision** that kept `ProgressBar`'s track deliberately theme-invariant. That decision was sound while every bar was fed by a fixture showing partial progress. Once real logging arrived, an empty day rendered a near-white bar on a near-black card — reading as *100% complete* rather than 0%. The founders reclassified this as a usability defect rather than an aesthetic preference and approved a minimal correction.

**The change is one line:** the track resolves through `surfaces.track` instead of the `palette.track` literal. **Light mode is byte-identical** — `lightSurfaces.track` *is* `palette.track` (`#EFEDE9`), the same value the literal held. Only dark changes, to `rgba(255,255,255,0.12)`.

**Home verified in dark mode.** All three of Home's `ProgressBar` consumers were checked on device: `JourneySection` (gold journey bar), `MacroRow` (protein/carbs/fat rows), and `MetricTile` (the 3px accents under Steps/Water/Workouts/Sleep/Streak). Every bar reads correctly, and Home is more legible than before — the near-white tracks had been competing with the content they sat under. No file under `src/features/dashboard/` was modified.

**Validation.** `tsc --noEmit` clean · `--noUnusedLocals --noUnusedParameters` clean · `expo install --check` clean · iOS bundle exported with zero errors · grep confirms no new component reads a raw `palette` surface value.

**Driven end-to-end in Expo Go on the simulator:**
- Manual → Food Detail handoff works; the meal picker is gone from the form and the button reads "Save & Continue".
- **Quantity math, all four cases exactly as specified:** 0.5 → `150 kcal / 12g / 20g / 3.5g` · 1 → `300 / 24 / 40 / 7` · 1.5 → `450 / 36 / 60 / 10.5` · 2 → `600 / 48 / 80 / 14`. The kicker pluralizes correctly (`0.5 SERVINGS`, `1 SERVING`).
- **Two meals:** Breakfast 1 serving (300 kcal) + Lunch 2 servings (600 kcal) → `BREAKFAST · 300 KCAL`, `LUNCH · 600 KCAL`, day total `900 / 2,000 kcal · 45%`, macros `72 / 120 / 21`. Subtotals and macros reconcile with the grand total exactly.
- **Persistence:** killed Expo Go and relaunched — both entries survived with correct quantities, meals, and the `2 × 1 serving` label.
- **Themes:** Light and Dark both correct on Food Detail, Food Log, and Home.

**Not yet true, by design:** Home's nutrition still comes from its own fixture (`733 calories remaining`, `107 / 160g` protein) and therefore does **not** agree with Fuel's real totals. Home Integration is slice 2.5. Fuel-internal consistency — day total vs. meal subtotals vs. macros — is verified above.

**Serving selection is architecturally present but visually unexercised:** custom and fixture foods each carry exactly one serving today, so `PortionEditor` correctly renders no picker. The multi-serving branch ships with real provider foods in slice 2.6 and has not been seen on screen yet.

### Slice 2.4 — Edit + Delete 🟡

**Objective:** correct an existing log entry — serving, quantity, meal — without creating duplicate data or breaking totals.

**One editor, not two.** The edit route reuses `PortionEditor`, `NutritionSummary`, `NutritionDetailList`, `nutritionForServing()`, and the shared formatters. This is exactly why `PortionEditor` was extracted in slice 2.3 rather than built inline: the add and edit flows must never drift apart on serving arithmetic, and two editors would have guaranteed that they eventually did.

**Entry identity is preserved.** Editing calls `updateEntry(id, changes)` with only the mutable fields — `meal`, `serving`, `nutrition`. `id`, `logDate`, `loggedAt`, and `foodRef` are untouched, so an edited entry is still the same eating event rather than a delete-and-recreate. That matters once sync and history exist. `logDate` is structurally unchangeable: `updateEntry`'s type is `Partial<Omit<FoodEntry, 'id' | 'logDate'>>`, so a date can't be reassigned by accident.

**The food definition is never touched.** Editing an entry to 2 servings does not rewrite "Protein Oats" to 600 kcal per serving. Verified on device: after editing one entry through 2 servings → 0.5 servings → a meal move, reopening the editor still resolves 300 kcal / 24g / 40g / 7g per serving from the definition.

**New pure helpers** (`model/foods.ts`): `servingFromEntry()` reconstructs a one-serving option from an entry by dividing its snapshot back out by quantity; `editableServings()` picks what to offer in three cases — the food resolves and a serving matches (offer the food's set), the food resolves but nothing matches (keep the entry's own serving first so the stored value is never silently rewritten), or the food is gone entirely (the entry's own serving is all there is). **This is the snapshot design paying off:** an entry stays fully editable after its custom food is deleted or a provider result falls out of cache.

**Entry point.** Tapping a log row opens the editor — the interaction the row's card styling already implies. No chevron was added: value + delete + chevron is three trailing elements competing in one row. The one-tap `×` delete from slice 2.2 is untouched, and the editor carries a secondary "Remove from log" for parity.

**Cancel is safe by construction.** The editor holds serving/quantity/meal in local state and writes nothing until Save, so backing out cannot partially persist.

**Test results — all seven pass, driven on device:**

| Test | Result |
|---|---|
| A — Quantity edit, 1 → 2 servings | 600 kcal, 48/80/14; day total 300+600 → 1,200. **One entry, no duplicate.** |
| B — Fractional edit, 2 → 0.5 | 150 kcal, 12/20/**3.5**; centralized rounding intact. Also proves per-serving nutrition was correctly recovered from a 2-serving snapshot. |
| C — Meal move, Breakfast → Lunch | Breakfast section disappeared, `LUNCH · 750 KCAL` absorbed both entries, **daily total unchanged at 750** with identical macros. |
| D — Cancel | Changed 1 → 2, backed out; stored entry still 1 serving / 300 kcal. Repeated later in light mode with the same result. |
| E — Persistence | Killed Expo Go and relaunched; edited values (0.5 × 1 serving, Lunch) survived. |
| F — Delete + Undo | Entry removed, totals fell immediately; Undo restored it **in its original position** with identical serving label, quantity, meal, and nutrition. |
| G — Permanent delete | Deleted, let the 6s window expire, killed and relaunched — still gone (600 kcal, one entry). |

**Static.** `tsc --noEmit` clean · `--noUnusedLocals --noUnusedParameters` clean · `expo install --check` clean · iOS bundle exported with zero errors · grep confirms no new raw light-only `palette` surface reads. Light and Dark both verified on the new screen.

**Flagged, not expanded (per the scope instruction):** the editor seeds `meal` from the entry rather than `defaultMealForTime()` — confirmed on device (Lunch stayed selected at 2:19 AM, when the time-of-day default would have been Breakfast). Two things the architecture *could* support but that were deliberately left out: editing an entry's **date** (no history UI exists yet, and it would need a date picker), and stamping an **`editedAt`** timestamp (useful for future sync conflict resolution, but it changes the persisted shape and belongs with the Supabase work).

**Unchanged and still true:** Home's nutrition remains its own fixture, so Home ↔ Fuel totals still disagree. That is slice 2.5.

### Slice 2.5 — Home Synchronization 🟡 — **one source of truth achieved**

**The architecture milestone this sprint was built for.** Daily nutrition now has exactly one owner. `src/lib/nutrition` holds the entries; `useDailyNutrition()` derives totals; Fuel and Home both read that and nothing else. The contradictory fixtures the Sprint 2 audit opened with — Fuel's meals summing to 1250, Home's to 1740, both printing `1267` — no longer exist anywhere in the codebase.

**What changed on Dashboard — three files, no components.**

- `types.ts` — `calories` and `mealSlots` removed from `DashboardData`. `MealSlot` is now a **re-export of the canonical `src/lib/nutrition` type** rather than a redeclaration, so `'Snack'` vs `'Snacks'` cannot drift apart again: there is one definition. `CalorieSummary`/`MacroSummary`/`MealSlotSummary` stay, documented as **view models** — see the note below.
- `mock.ts` — the `calories` block and the four fake `mealSlots` deleted. The nutrition goal pillar's `complete` becomes a placeholder, recomputed from real data.
- `(tabs)/dashboard.tsx` — assembles those view models from `useDailyNutrition()`.

**No file under `src/features/dashboard/components/` was modified** — verified as byte-identical to the approved commit `1a9dec9`, not asserted.

**On `MacroSummary`, which the audit flagged for removal — kept, deliberately.** Its duplicate partner was Fuel's `Macro`, and that was already deleted back in slice 2.1, so nothing in `src/lib/nutrition` now carries this shape. Fuel's own progress bars want a different one (`{ label, valueLabel, progress, color }`). Inventing a shared display type that suits neither, and editing a locked Dashboard component to adopt it, would buy no data-integrity gain — **the data is already single-source; only the render shape is local.** Flagged rather than silently kept.

**Goal pillars stay honest.** Only the *nutrition* pillar is recomputed. Water, Movement, and Recovery have no feature behind them yet and keep their fixture values, so "N of 4 goals complete" doesn't quietly become a nutrition-only number. Visible effect: Home now reads **2 of 4** on an empty day, where the fixture always claimed 3 of 4.

**Nutrition completion semantics — needs founder confirmation.** "Complete" is currently `caloriesConsumed >= calorieTarget`. That is a product choice, not a derived fact; a range-based definition ("within 10% of target") or a macro-aware one are equally defensible.

**Calories remaining** derives from `target − consumed` and floors at zero — the pre-existing `HomeSummaryCard` behavior, unchanged, and consistent with the engine's `remaining()`. Going over target reads as 0 remaining rather than a negative number, matching the no-guilt-mechanics rule.

**Empty day needs no new empty state.** All four meal rows always render — Home's approved presentation — so an empty day is four honest zero rows. Multiple foods in one meal aggregate to a total plus a count (`1200 kcal • 2 logged`), which is the existing `MealRow` behavior; Fuel's Food Log remains the per-entry view.

**Code audits (all clean).** No cross-feature imports · no remaining nutrition fields in `dashboard/mock.ts` · `getDashboard()` supplies only non-nutrition data · `'Snack'` singular appears only inside explanatory comments · no new light-only `palette` surface reads.

**Test results — all seven pass, driven on device:**

| Test | Result |
|---|---|
| A — Empty day | Fuel `0 / 2,000`; Home **2,000 remaining** (was a hardcoded `733`), macros 0, four zeroed meal rows, **2 of 4** goals |
| B — Add Breakfast 300 | Both surfaces 300; Home 1,700 remaining, protein 24/160g, `Breakfast 300 kcal • Logged` — **no restart** |
| C — Add Lunch 600 | Day 900 in both; Breakfast 300, Lunch 600; macros 72/120/21 identical on both |
| D — Edit 1 → 2 bowls | Both jump to 1,200; Home 800 remaining, protein 96/160g |
| E — Move Breakfast → Lunch | Home: Breakfast 0, `Lunch 1200 kcal • 2 logged`; **daily total unchanged**, macros unchanged |
| F — Delete / Undo | Delete propagated (Home 1,400 remaining); Undo restored (Home still 1,400 — a failed undo would have read 2,000) |
| G — Relaunch | Fuel `600 / 2,000`, macros 48/80/14; Home 1,400 remaining, protein 48/160g — exactly consistent |

Incidentally confirmed during Test A: the day rolled from 17 → 18 August and yesterday's entries correctly did not appear as today's.

**Static.** `tsc --noEmit` clean · `--noUnusedLocals --noUnusedParameters` clean · iOS bundle exported with zero errors.

**Dependency note, not caused by this slice:** `expo install --check` now reports `expo@54.0.36 → ~54.0.37` and `expo-constants@18.0.13 → ~18.0.14`. `package.json` and the lockfile are byte-identical to commit `1a9dec9` — these are patch releases Expo published upstream. Nothing is broken and no SDK change is involved. Left untouched pending founder direction.

**What is still honestly mock on Home:** Journey, steps, sleep, workouts, streak, the water quick-stat, and the Water/Movement/Recovery goal pillars. None of them compete with the nutrition domain.

### Slice 2.6 — Provider Layer + Real Search 🟡

**The fixture catalog is gone.** `features/fuel/fixtureCatalog.ts`, `mock.ts`, `types.ts`, and the interim `'vita-fixture'` source member are all deleted, and Search, Food Detail, and Edit kept working without a single change to their logic. That was the point of the abstraction, and it held.

**Cost: $0, zero billing risk.** USDA is free (CC0, no paid tier exists). Open Food Facts is free and needs no key. Full comparison table in the slice-2.6 checkpoint.

**Architecture.** Adapters in `src/lib/nutrition/providers/` are the only files that know a provider's response shape. Verified by grep: no `fetch(` outside that directory, and no `source === 'usda'`-style branching anywhere in `src/app`, `src/features`, or `src/components`.

**Two real bugs caught by real data**, both worth recording:

1. **GTIN leading zeros.** The unit checks (20 assertions, run standalone) caught that a barcode passed through a JSON *number* loses its leading zero — UPC-A `028400157827` arrives as 11 digits and was being rejected as a non-standard length. That is exactly the mismatch the module exists to prevent. Fixed by accepting any 8–14 digit run and padding to 14.
2. **Double-counted portion labels.** Provider serving labels are full phrases ("1 bar (68 g)"), not unit nouns, so the existing `formatServingCount(quantity, unit)` rendered **"1 1 SERVING (68 G)"**. Replaced with `formatPortion(quantity, label)`, which multiplies instead — "2 × 1 bar (68 g)" — matching the convention log rows already used. Adapters now keep `unit` a countable noun and the descriptive phrase in `label`.

**Open Food Facts search endpoint changed mid-slice.** The legacy `cgi/search.pl` worked, then began returning HTTP 503 under repeated use. Switched to **Search-a-licious**, which OFF's current docs point to for full-text search. Tradeoff, documented rather than hidden: Search-a-licious does not index serving fields at all (confirmed — 43 fields, none serving-related), so OFF search results offer only the honest 100 g baseline. Label servings remain available from the product endpoint that `lookupBarcode` uses. Enriching an opened result from that endpoint is a recommended follow-up.

**Verified on device (Open Food Facts):** searched `clif bar` → real results with brand, serving label, and calories, exact-name matches ranked first → opened "Clif Bar Cool Mint Chocolate" → Food Detail rendered `368 kcal · 14.7g / 63.2g / 8.8g` with no provider-specific code → logged to Breakfast → Fuel showed `968 / 2,000` alongside an existing custom-food entry (368 + 600, macros reconciling) → killed and relaunched → entry persisted and **Home read 1,032 remaining**, exactly consistent.

**Provider failure isolation proved itself twice, live:** USDA is unconfigured (no key) and search still returned Open Food Facts results throughout; and when OFF 503'd, the error state, Retry button, and dev-only diagnostics (`openfoodfacts: bad-response @ search`) all rendered correctly — a category and a stage, never a key.

**Search behavior.** 350 ms debounce; minimum query length **2** (one character matches nearly everything and wastes a call against OFF's documented 10 searches/minute); `AbortController` plus a run-sequence guard so a slow earlier response can never overwrite a newer one; 6 s per-provider timeout.

**BLOCKED: USDA is unverified.** The adapter is written and type-checks, but no request has ever been made because there is no key. It cannot be verified until the founder registers one — instructions in the checkpoint.

**Static.** `tsc --noEmit` clean · `--noUnusedLocals --noUnusedParameters` clean · iOS bundle exported with zero errors · `src/features/dashboard/` byte-identical to `dbe0c91` · dead `formatServingCount`/`pluralizeUnit` removed rather than left behind.

**Dependency note, still not caused by this slice:** `expo-constants@18.0.13 → ~18.0.14` remains flagged upstream. Untouched per the founder's lock.

### Slice 2.7 — Recents + Favorites 🟡

**Recents have no storage of their own.** The log already holds the truth — a food is recent precisely because the user logged it — so a parallel "recents" list would only be a second thing that can disagree with the first. The reserved `vita:v1:recents` key was **deleted** rather than filled. `useRecentFoods` reads the most recent days of log keys, collapses to one row per `vitaId` (entries arrive newest-first, so the first occurrence is already the latest use), and caps the result.

**Limits:** 30 days scanned, 25 rows shown. One storage key per day is what makes the scan cheap — only those days are read, and keys are enumerated and sorted rather than walked date by date, because gaps are normal and walking would read nothing on every skipped day.

**History is self-sufficient.** New pure `foodFromEntry()` rebuilds a usable `VitaFood` from an entry's snapshot alone — name, brand, provenance, and the serving actually used. A recent food stays loggable with the provider cache expired, the custom food deleted, or the device offline. No API call, nothing fabricated. Opening the Recents screen also re-seeds the food cache from history, so tapping a recent always resolves in Food Detail.

**This paid off visibly during verification:** a food logged from the retired `vita-fixture` catalog — a source that no longer exists in the codebase after slice 2.6 — still rendered and remained loggable, rebuilt entirely from its entry snapshot.

**Favorites** are keyed by `vitaId`, never by a search-result object reference, so favoriting once persists across every surface and every encounter. Stored newest-first, which gives the Favorites screen a deterministic order with no sort at render time.

**Provider-aware storage, provider-independent presentation.** `PERSISTABLE_SOURCES` gates whether a favorite may retain the food *definition*: `usda` (CC0), `openfoodfacts` (ODbL — retaining individual user-chosen records on-device is ordinary API use; share-alike attaches to *publishing* a derived database), and `vita-custom`. **`fatsecret` is deliberately excluded** — its caching and storage terms differ and are unverified, so a favorite from it will store identity only and resolve the definition live. The row renders identically either way, and a stored definition is dropped on read if its source is no longer permitted, so a terms change takes effect without a migration.

**The heart returned** in `FoodRow` (Search, Recents) and in Food Detail's header via a new optional `action` slot on `ScreenHeader` — additive and ignored when `settings`/`close` are set, so every existing screen renders unchanged. State comes from the shared store, which is why the surfaces agree without any of them refreshing or knowing about each other.

**Test results — all eight pass, driven on device:**

| Test | Result |
|---|---|
| A — Custom recent | Custom food appears in Recents; survived repeated kill/relaunch |
| B — External recent | Open Food Facts food appears and stayed usable after relaunch **with no re-search and no network call** |
| C — Recent dedup | Logged the same food twice → still exactly one row |
| D — Favorite custom | Persisted across kill/relaunch |
| E — Favorite external | Persisted, and opened from its stored definition after a full restart |
| F — Unfavorite | Removed from Food Detail; Favorites and the Recents heart both updated |
| G — Cross-surface | Favorited in Recents → Food Detail heart already filled → unfavorited there → Recents reflected it. In live search the favorited entry showed filled while a **near-identical result from a different brand entry showed hollow** — proving identity keying, not name matching |
| H — Re-log | Opening a recent and logging moved it to the top; still one row, totals updated |

**Static.** `tsc --noEmit` clean · `--noUnusedLocals --noUnusedParameters` clean · iOS bundle exported with zero errors · no provider branching in Recents/Favorites UI · no fixture resurrection · no separate recents persistence · only normalized `VitaFood` is persisted, never a raw provider payload · no cross-feature imports · `src/features/dashboard/` byte-identical to `2fe86a4`.

**Known limitation:** two rows can legitimately share a name — the fixture-era "Protein Oats (bowl)" and the custom "Protein Oats (1 serving)" are genuinely different definitions with different `vitaId`s and different servings. Dedup is by identity, not by name, which is correct: merging them would hide a real distinction.

**USDA remains unverified** pending the optional free key. Not a failure of this slice — the adapter, configuration, docs, and failure isolation are all in place, and search runs on Open Food Facts alone.

### Slice 2.8 — Barcode Scanner 🟡

**Camera.** `expo-camera@~17.0.10`, the SDK 54-compatible version — installed with `npx expo install`, **no SDK change** (`expo` stays `~54.0.36`). Works in Expo Go with no development build and no Xcode. `app.json` gains the `expo-camera` plugin with a camera-permission string so a future dev build is correct; Expo Go uses its own string, which is why the on-device prompt reads "Expo Go would like to access the Camera".

**Scan types** restricted to `upc_a`, `upc_e`, `ean13`, `ean8` — the grocery formats. Narrowing the set stops the detector firing on QR codes and shipping labels that are never food. Detected values go through the existing `normalizeGtin()`; grep confirms no second normalization anywhere.

**The scan lock is a `ref`, not state.** `onBarcodeScanned` fires many times per second while a code stays in frame. A `useState` flag is not sufficient — React batches, so several callbacks slip through before the re-render lands, each firing its own lookup and its own navigation. The ref flips synchronously on the first detection; `onBarcodeScanned` is additionally detached while a lookup runs, as a second guard. A value that isn't a usable GTIN is ignored **without** locking, so a stray label doesn't dead-end the scanner.

**Lookup runs sequentially**, unlike text search. A GTIN is an exact identity: the first trustworthy match is the answer, so asking every provider would only spend rate-limited quota. Open Food Facts goes first (barcode-native, one O(1) product endpoint); USDA is an optional fallback and is **skipped silently when unconfigured** rather than reported as a failure.

**USDA barcode has a caveat worth recording:** FoodData Central has no barcode endpoint, so a GTIN query is a fuzzy full-text search that returns near-misses. Every candidate is re-checked against its own `gtinUpc` through `normalizeGtin`, and only an exact GTIN identity is accepted — a scan must return *that* product or nothing.

**A real bug the live API caught.** Open Food Facts answers an unknown barcode with **HTTP 404**, not a 200 carrying `status: 0`. Left to the generic handler that surfaced as a lookup *error* — which would have told the user to retry something that can never succeed, instead of offering manual entry. A 404 on the product endpoint is a definitive answer and now maps to "not found". This is exactly the not-found-vs-error distinction the slice brief called for, and it would have shipped wrong.

**Pipeline verified against the live API** (10 assertions, standalone runner):

- UPC-A `722252387530` and EAN-13 `0722252387530` both resolve, and produce the **same `vitaId`** — barcode identity is representation-independent.
- The resolved product carries a **real label serving ("68 g")**, not just the 100 g baseline — the OFF *product* endpoint has serving data that Search-a-licious lacks, which is the 2.6 tradeoff paying off here.
- Four macros present, barcode normalized to 14 digits, provenance `openfoodfacts`.
- A genuinely unknown barcode returns **`not-found`, not `error`**.
- Junk input returns `not-found` **without making a request**.

*Aside worth knowing:* several "obviously fake" codes (`9999999999994`, `0123456789012`, `1111111111116`) are **real community records** in Open Food Facts. A valid GTIN is not automatically food, and the database is not automatically empty — which is why §18's rule matters and why the not-found test had to use a code verified absent.

**Verified on the simulator:** permission-undetermined state (icon, explanation, "Allow camera", "Search instead") · the OS prompt · **denied** state switching copy to "Camera access is off" with "Open Settings" · granted → live scanner with orange corner brackets, instruction, close and torch controls · torch toggle reflecting on/off.

**NOT verified — needs a physical iPhone.** The iOS Simulator has no camera, so the narrow path **camera detection → `handleScan` → `normalizeGtin` → lookup** has never executed against a real barcode. Everything either side of it is verified: the lookup chain against the live API above, and Food Detail → log → Fuel/Home → Recents → Favorites → relaunch, all unchanged and already proven for Open Food Facts foods in slices 2.3–2.7. Device tests C, D, E, F, G, H, J remain for the founder.

**Static.** `tsc --noEmit` clean · `--noUnusedLocals --noUnusedParameters` clean · iOS bundle exported with zero errors · no provider branching in UI · no duplicate barcode normalization · no gallery control · SDK unchanged · `src/features/dashboard/` byte-identical to `c61f92e`.

### USDA verification — ranking fix (2026-08-19)

Real FoodData Central responses were inspected before the founder's key arrived, using `DEMO_KEY` — api.data.gov's documented public test key, rate-limited to 30 requests/hour. Not a fabricated credential and never written to `.env`; used only to validate response shapes against the adapter's assumptions.

**Every field assumption from slice 2.6 is correct.** `fdcId`, `dataType`, `description`, `brandName`/`brandOwner`, `gtinUpc`, `servingSize`/`servingSizeUnit`, `householdServingFullText`, and `foodNutrients[].nutrientId`/`.value` all appear as the adapter expects, and nutrients are confirmed **per 100 g** across data types. Foundation and SR Legacy records carry **no serving data at all**, so they correctly fall back to the honest 100 g serving the adapter already builds. No normalization bug.

**A real ranking bug, though.** Searching a bare generic term returned branded junk first:

- `banana` → a **peanut butter spread named "BANANA"** (312 kcal) above "Bananas, raw" (89 kcal).
- `egg` → three separate Branded products named **"EGG"** above "Eggs, Grade A, Large".

Cause: `exactName` (+45) fired on any record whose name equalled the query, and USDA serves lab composition data and manufacturer labels from the same endpoint with no distinction in the flat per-provider quality score.

**Three changes, all provider-independent:**

1. **`VitaFood.dataQuality`** — an optional 0–100 per-record trust signal. Adapters translate whatever their source knows about record quality into this one number; ranking reads only this and falls back to the provider's flat base. USDA maps FDC data types (Foundation/SR Legacy 95, Survey (FNDDS) 82, Branded 78); Open Food Facts uses a flat 70, since it exposes no per-record verification signal.
2. **`exactNameBranded` (+15 instead of +45)** when a branded product's name matches but the query never mentioned the brand. Naming the brand restores the full bonus, so "clif bar" still works.
3. **A capped extra-word penalty** (−2/word, max −8), so "Bananas, raw" beats "Bananas, dehydrated, or banana powder". The cap matters: uncapped it inverted a quality tier, pushing the canonical-but-verbose "Eggs, Grade A, Large, egg whole" below the composite dish "Egg burrito".

**Verified against a real saved USDA payload** (25 results for `egg`), run offline so no quota was spent re-testing. Before: `EGG`, `EGG`, `EGG`. After: `Eggs, Grade A, Large` ×3, then egg breads, then composite dishes, with branded demoted. GTIN (20 assertions) and barcode-pipeline (10 assertions, live) suites both re-run and still pass.

**Verified with the founder's real key (2026-08-19).** See "USDA live verification" below.

### USDA live verification — a second bug, and the reliability fix

**The `dataType` query parameter is unreliable and has been removed.** Measured, not assumed:

| Request shape | Success rate |
|---|---|
| `&dataType=Foundation%2CSR%20Legacy%2CBranded%2CSurvey%20%28FNDDS%29` | **5 / 10** |
| identical query, no `dataType` | **10 / 10** |

api.data.gov's edge intermittently answers the filtered form with a bare nginx `400 Bad Request`. It was silently costing USDA results on roughly half of all searches — the first live run returned USDA data for only **one of four** test queries (`egg`), with `banana`, `chicken breast`, and `rice` all falling back to Open Food Facts alone. Failure isolation worked exactly as designed, which is precisely why the problem was invisible from the UI.

Filtering moved client-side into `toVitaFood`, which drops any record whose `dataType` isn't in the allowlist. Costs nothing: the same four types come back unfiltered (verified across several queries), and *ranking* — not filtering — is what keeps generic foods above branded ones now. All four queries returned USDA results afterwards.

**A third fix: the `hasCompleteMacros` bonus was removed.** It awarded +6 to records carrying fiber and sugar values, which rewards *food type*, not data quality — bread has both, an egg genuinely has neither. It was pushing "Bread, egg" above "Eggs, Grade A, Large" for the query `egg`. Per-record trust belongs in `dataQuality`, where a provider can speak to it honestly.

**Normalization confirmed correct against real responses.** Names, source, source id, brand (`brandName` falling back to `brandOwner`), GTIN normalized to 14 digits, and the four macros all populate as designed. Label servings scale correctly from per-100 g data — real examples observed: `2 Tbsp` → 100 kcal, `1 cup` → 200 kcal, `0.25 cup` → 160 kcal. Foundation and SR Legacy records carry no serving data and correctly fall back to the honest 100 g serving. USDA's ALL-CAPS branded descriptions are title-cased; mixed-case names are left alone.

**Search results after all three fixes:**

- `banana` → Bananas, raw (89 kcal) · Bananas, overripe, raw · Bananas, dehydrated — generic first, branded below. ✅
- `chicken breast` → three USDA generic chicken-breast records, branded below. ✅
- `egg` → Eggs, Grade A, Large (white / whole / yolk). ✅
- `rice` → "Rice crackers" first. ⚠️ **Known limitation, not a logic bug:** USDA's canonical white-rice record is named "Rice, white, long-grain, regular, raw, enriched", so a short prefix match outranks it. Deliberately not tuned around — chasing a perfect #1 for every query against one database's naming conventions is what the "no ML ranking, keep it deterministic" instruction rules out.

**Failure isolation verified live, all four cases:** both providers healthy → 42 results from both · invalid key → USDA `auth/403`, Open Food Facts still returned 17, search did not fail · key unset → USDA silently skipped, not even attempted · key restored → both back. `.env` was never modified; the test overrode the variable in its own process only.

**Not verified: the in-app UI walkthrough for a USDA-sourced food.** The screen-control tooling disconnected mid-session, so the simulator could be screenshotted but not driven. The app boots clean with the key loaded. Everything downstream of the provider layer is provider-independent (grep confirms zero source branching in `src/app`, `src/features`, `src/components`) and was fully verified for Open Food Facts foods in slices 2.6–2.7, so USDA foods traverse the identical path — but that specific walkthrough is the founder's to run.

### QA repair — barcode misidentification + favorite discoverability (2026-08-19)

Physical-device QA on Expo Go found two real product defects. Not a slice; a repair checkpoint.

**Barcode returned an unrelated product.** A Kroger water bottle resolved as "Hillshire Farm Beef Smoked Sausage" — and a *second, different* bottle produced the *same* wrong result. That signature is the clue: fuzzy provider matching would have produced two different wrong answers, so the fault was stale state, not the provider.

**Root cause:** `/fuel/food/[id]` is a single route, and navigating from one food to another updates `params` **without remounting**. Food Detail seeded its resolved food with a `useState` initializer, which runs only on first mount, so `resolved` held whichever food opened the screen first — forever. Worse, the async fallback was guarded by `if (food) return`, and `food` was truthy (the stale one), so it never re-read. Every subsequent food showed the first one. The same defect class was present in `/fuel/entry/[id]`, where a second entry would inherit the first one's quantity and meal.

Fixed by storing the async result **with the id it belongs to** and discarding it when the route param differs, plus an effect that re-seeds portion state when the food identity changes.

**Provider hardening (required regardless).** Open Food Facts' barcode lookup now independently re-normalizes the *returned* product code and rejects anything that isn't an exact GTIN identity match. USDA's fuzzy-search fallback was already strict; the check is now explicit, skips records with no `gtinUpc` rather than treating them as near-misses, and both providers emit a dev-only mismatch diagnostic (provider, requested GTIN, returned GTIN — never a key).

**A second, separate bug found while tracing:** the barcode chain was running **USDA first**, contradicting both the documented design and the founder's stated order. USDA has no barcode endpoint, so every scan spent a fuzzy full-text request that would essentially never match before Open Food Facts did the real work. Barcode order is now explicit (`BARCODE_PROVIDER_ORDER`) rather than inherited from registration order, which only text search is indifferent to.

**Cache audit: cache did not contribute.** Every food-cache key is `vitaId`-scoped (`vita:v1:cache:food:openfoodfacts:<code>`), the query cache is a separate in-memory map keyed by query string, and the two cannot collide. Verified by test: two different barcodes back-to-back return their own products, and re-scanning the first returns the first again.

**Verified against live providers** (6 assertions): the real Kroger Purified Drinking Water barcode `0011110043436` resolves to *Kroger Purified Drinking Water*, its returned GTIN equals the scanned GTIN, and it is not a sausage · a different barcode returns a different product · re-scanning the first returns the first · the UPC-A form resolves to the same `vitaId` as the EAN-13 form · an unknown barcode returns honest not-found rather than a wrong food.

**Favorite controls were present but undiscoverable.** The heart shipped in slice 2.7 on search rows, Recents rows, and the Food Detail header — and does render — but drawn as a bare outline in `surfaces.textTertiary` (45% white on a dark card) it read as decoration, and QA never found it. That is a real product failure, not a misunderstanding. The row heart now sits on a faint circular surface with a border so it reads as a button, and the unfavorited outline moved from tertiary to secondary. The Food Detail header heart stays plain, where position alone makes it a control.

**Still unverified this session:** tap isolation (heart toggles without opening Food Detail) and the cross-surface sync walkthrough. Nested `Pressable` wins the touch by React Native's responder rules, so the behavior should be correct, but the screen-control tooling was disconnected and the simulator could be screenshotted, not driven.

### QA round 2 — barcode instrumentation, favorite surfaces, post-log navigation (2026-08-19)

**Barcode: NOT signed off.** The founder rescanned on device after `779b0ab` and still saw the wrong product. The previous root-cause conclusion was **wrong in scope**: the stale-`useState` bug was real and is fixed, but it was not needed to explain the report. Two bottles of the *same* Kroger product share one UPC, so "two bottles, same wrong result" is exactly what a single bad lookup of a single barcode looks like.

What was ruled out this round, with evidence:
- **Open Food Facts data is not mislabelled.** Every Hillshire Farm record sits under GS1 prefix `00445003…`; Kroger's is `0011110…`. No Kroger-prefix code maps to Hillshire.
- **Food Detail cannot substitute a food.** Both resolution paths (`findFood`, `readCachedFoodSync`) are exact `vitaId` lookups, and after the `779b0ab` fix the async path is discarded when the route param differs.
- **Cache cannot collide.** Keys are `vitaId`-scoped; the query cache is a separate map.
- **The provider chain is correct**, re-verified live: the real Kroger barcode returns Kroger, a different barcode returns its own product, re-scanning returns the original, UPC-A and EAN-13 share a `vitaId`, unknown returns not-found.

**The gap is that no test ever used the founder's actual bottle.** The standalone suite used a Kroger barcode found by searching Open Food Facts, not the value the camera produced. So a dev-only trace now records the whole chain — `camera.raw`, `camera.type`, `normalized`, `lookup.status`, `provider`, `food.name`, `food.returnedGtin`, `food.vitaId`, `navigate.href`, `detail.routeParam`, `detail.resolvedId`, `detail.renderedName` — to the console and to an on-screen panel on Food Detail (`BarcodeTracePanel`, `__DEV__` only, no credentials). One physical scan will say exactly where Kroger becomes Hillshire. **Remove the panel once signed off.**

**Favorite surfaces added** (same 2.7 repository, no new state): a heart on every **logged food row** in the Food Log, and one in the **Edit Entry header**. Both build their `VitaFood` from the entry's own snapshot via `foodFromEntry()`, so favoriting something already logged costs no provider request and works with the cache expired or offline. Favoriting from Edit Entry acts on the food identity only — serving, quantity, meal, and the eating event are untouched.

**Post-log navigation fixed.** Logging could leave four screens stacked (Fuel → Log Food → Search → Food Detail), and the user pressed Back repeatedly to escape. `Add to Log` now calls `router.dismissAll()`, popping everything above the tab navigator in one step and landing on Fuel with the entry and totals already rendered — guarded by `canDismiss()` with a `replace('/fuel')` fallback for a deep link straight to the screen. No duplicate Fuel root: the tab screen is revealed, never pushed. Save and Delete in Edit Entry use `router.back()`, returning to the Food Log they came from rather than stacking a second copy.

**Not verified this session:** anything requiring taps. The screen-control tooling stayed disconnected, so the simulator could only be screenshotted. The build boots clean with zero bundle errors.

### Slice 2.9 — Fuel Visual Refinement 🟡

The slice recorded on 2026-08-18 as founder direction — *"too basic, too bulky, overusing large numbers, filling space because space exists"* — built against a founder-supplied concept reference. **Presentation and information architecture only.** No provider, search, ranking, dedupe, barcode, logging, editing, favorite, persistence, or theme behavior was changed, and no mock nutrition data was introduced anywhere.

**The structural decision.** The previous screen's problem was not its spacing, it was its *containers*: four features rendered as four full-width cards of equal visual weight, with the day's actual food hidden behind a row labelled "Food Log". Fuel now reads as one vertical narrative — status, action, content, secondary — and the load-bearing change is that **meals are rows in a single panel, not four cards.** An untouched Lunch costs one 56pt row instead of a card with its own border, shadow, and padding, which is what frees the space for the foods a person actually ate.

**New information hierarchy.**

1. **Header** — `Fuel` with the current log date beneath it (`formatLogDateLong`), settings gear unchanged in its permanent top-right slot.
2. **Summary** (`FuelSummaryCard`) — a calorie ring (eaten) beside the headline that decisions are actually made on (remaining), a progress bar, `N% of 2,000 Calories`, then the three macro bars below a hairline. One card, one statement.
3. **Primary actions** (`FuelQuickActions`) — a filled **Log Food** card ("Search, scan, or add") beside **Scan Barcode** ("Quick scan a product"). Both open the routes that already existed; the primary reads as primary through fill, not through size.
4. **Today's Meals** (`TodayMealsPanel`) — all four canonical slots as rows in one panel, meals with entries expanded by default, `+ Add food` per meal, and a compact `View all` to the full Food Log.
5. **Secondary trackers** (`FuelTrackerCard` ×2) — half-width Hydration and Peptides modules. Their proportion is what says "secondary"; nothing else has to.

**Meal color language** (`features/fuel/mealAccent.ts`) — Breakfast sunrise yellow (`palette.carbs`), Lunch midday orange (`palette.primary`), Dinner sunset red-orange (`palette.fat`), Snacks neutral sage (`palette.sage`) with a plain utensils glyph and no time-of-day signal. **Deliberate deviation from the reference:** the concept shows Snacks in purple, but purple is a locked domain color (Atlas and peptides, Sprint 0.1) and the Peptides module sits directly below — a purple Snacks row would read as a peptide entry. Every value used is an existing brand or macro token; no new hex was invented. Ionicons has no sunrise/sunset glyph, so Breakfast and Dinner use the closest stock equivalents tinted warm, same approximation Home already documents.

**Meal-specific logging.** `+ Add food` on a meal deep-links the *existing* flow with that meal attached — `/fuel/add?meal=Lunch` → Search / Scan / Manual / Recents / Favorites → Food Detail — and Food Detail seeds its meal from the parameter instead of the time of day. Implemented as a forwarded route parameter validated by a new `parseMealSlot()` in the nutrition domain, not as new state: an unrecognized value falls back to the existing default, and the meal picker stays visible and editable. This changes what is *preselected*, never what is possible. The MealSlot architecture is untouched.

**Calories terminology.** `kcal` is gone from user-facing copy: Fuel summary, Food Log, meal subtotals, food rows, logged rows, the Add-to-Log toast, `NutritionSummary`, and the manual-entry field label now read `Calories` or `cal`. Home's meal rows were included — a four-character copy change with no layout or structural effect — because leaving `552 kcal` on Home beside `552 cal` on Fuel would be a visible inconsistency in one app. **Internal naming was not touched:** `NutritionFacts.calories`, `MealSlotSummary.kcal`, and Open Food Facts' `energy-kcal_100g` are unchanged, because this was a copy audit, not a rename.

**Everything preserved and verified present:** shared nutrition domain · USDA · Open Food Facts · search aggregation, normalization, ranking, dedupe · barcode scanning with strict GTIN validation · the dev-only barcode trace panel (**kept — the Kroger issue is not signed off**) · custom and manual foods · Food Detail · portions and quantity · meal assignment · daily logging · edit · delete + Undo · Recents · Favorites and their persistence · favorite-from-logged-row · Home ↔ Fuel synchronization · date awareness · persistent state · provider failure isolation · Light/Dark/System · Expo Go on SDK 54.

**Files.** New: `components/ui/ProgressRing.tsx` (SVG ring on the existing `react-native-svg` dependency), `features/fuel/mealAccent.ts`, and `features/fuel/components/{FuelSummaryCard,FuelQuickActions,TodayMealsPanel,MealFoodRow,FuelTrackerCard}.tsx`. Changed: the Fuel tab route (rewritten), the five logging routes and `FoodRow` (meal forwarding + copy), `food/[id]` (meal preselection + copy), `ScreenHeader` (optional `subtitle`, unset everywhere else so no existing header shifts), `dates.ts` (`formatLogDateLong`), `mealSlots.ts` (`mealSlotIcon` removed — no remaining caller once meals got icon *and* accent together; replaced by `parseMealSlot`), and copy-only edits to `LoggedEntryRow`, `NutritionSummary`, `log.tsx`, `manual.tsx`, and Home's `MealRow`.

**Verification.** `npx tsc --noEmit` and `npx tsc --noEmit --noUnusedLocals --noUnusedParameters` both clean. `npx expo export --platform ios` succeeds (1403 modules). Rendered in Expo Go on the iOS Simulator in **both an empty day and a populated day** — ring, remaining figure, macro fills, meal color progression, expanded Breakfast with two foods, per-meal subtotals, and compact empty rows all confirmed against the reference.

**Not verified this session — same tooling gap as the previous two QA rounds.** The simulator MCP refuses to attach (it reports Xcode "not selected" even though `xcode-select -p` already resolves to `/Applications/Xcode.app/Contents/Developer`), and `osascript` has no assistive access, so the simulator can be screenshotted and deep-linked but **not tapped or scrolled**. Everything below the fold — the Hydration/Peptides row's full extent and its dock clearance — is therefore confirmed only by the portion visible on screen, and every tap-dependent path (meal preselection end to end, favorite toggling from a meal row, edit, delete + Undo, the barcode flow) is reasoned-and-typechecked, not exercised. These need the founder's physical iPhone.

### Slice 2.9b — Fuel polish + barcode QA (2026-08-21)

Founder approved the `dee1ddf` redesign and locked its layout. This is the follow-up polish pass over four areas, plus the still-open barcode defect. **No structural change to the approved Fuel screen.**

#### Calories and macro semantics

`cal eaten` → **`Calories consumed`**, kept alongside `Calories remaining`; compact row values still abbreviate (`105 cal`). The ring label moved from *inside* the ring to directly beneath it — "Calories consumed" is wider than the ring's inner diameter, and shrinking approved copy to fit would have been the wrong trade. That is the only layout change on the locked screen.

Macros now read as progress toward **the user's configured targets**: `Protein Goal · 30 / 160 g`, with Carbs and Fat carrying no verb because their targets are neither floors nor ceilings — labelling them either way would be VITA inventing dietary advice. Nothing warns, reddens, or changes state at 100%. `StatBar` stacks label above value: side by side they shared one ~93pt column on an SE-class screen, which fitted "Protein" but not "Protein Goal". The same labels are used on the Food Log so the two surfaces cannot describe identical numbers differently.

#### Food image loss — root cause found, in the founder's own data

**`parseCustomFoodShape()` in `asyncStorageRepository.ts` rebuilt `VitaFood` field by field and never copied `imageUrl`.** It is the only path by which a stored food comes back, so a field missing from that object literal is a field silently deleted on read. `restaurant` and `dataQuality` were being lost the same way.

Three things compounded it:

1. **The loss became permanent, not just per-read.** `toggleFavorite` writes `favoritesRef.current` — which after a load holds *parsed* favorites. So the next favorite toggle rewrote every favorite in its stripped form, erasing the image from storage for good.
2. **The stripped copy shadowed an intact one.** `findFood()` checks favorites before the provider cache, so once a food was favorited its image-less definition won over the cached copy that still had the image.
3. **`FoodEntry` had nowhere to keep an image**, so `foodFromEntry()` — which builds the food for a logged row's heart — could never produce one.

Proof from the simulator's existing QA data, same `vitaId`, before any fix: cached copy `imageUrl = …/front_en.15.200.jpg`, favorited copy `imageUrl = undefined`.

**Fixes.** The read path now preserves `imageUrl` (validated as http(s) — a stored image reference is the one persisted value handed straight to a network-loading view), `restaurant`, and `dataQuality`. `FoodEntry` gained an `imageUrl` snapshot field, denormalized for the same reason `name`/`brand` already are, and carried by `createEntry` → storage → `parseEntry` → `foodFromEntry`. A logged food's picture now comes from its own snapshot with no lookup, no cache read, and no network from a list row. No second image system, no UI-side patch.

**Verified on device:** favorite written with an image → full relaunch → cold load from storage → Favorites and Food Detail both render the real product photograph.

#### Contextual food visuals — architecture, not artwork

`features/fuel/foodVisual.ts` resolves one visual in three tiers: **real provider image → VITA category visual → generic treatment**. `FoodAvatar` renders it, and Fuel's meals, Search, Recents, Favorites, Food Detail, and Edit Entry all call it — no screen classifies for itself. `ListRow` gained a `leading` slot so a row can show a photograph instead of a glyph.

24 categories with conservative, order-sensitive whole-word matching. Order is the design: `bowl` before `burrito` before `chicken` so "Chicken Burrito Bowl" resolves to its form rather than its first ingredient; `salad` before `chicken`; `dessert` before `chips` so a chocolate chip cookie is not a crisp. Ambiguous names return `food` rather than guess — "Big Mac" is a burger to a person and nothing to a keyword matcher, and brand rules would be a list that never ends.

**Artwork is explicitly NOT done.** Ionicons has ~12 food glyphs, so several categories share one and are separated only by accent color; `banana` currently renders an apple. The durable part is the taxonomy — custom VITA artwork replaces the `icon`/`color` pair in `CATEGORY_VISUALS` and nothing else changes. Category is carried on the returned visual even when an image wins, so a caller can tint or label by category regardless of which tier answered.

#### Kroger barcode — root cause identified upstream, NOT fixed

**The previous round's conclusion was wrong.** It recorded "Open Food Facts data is not mislabelled — every Hillshire Farm record sits under GS1 prefix `00445003…`; Kroger's is `0011110…`". That was reasoned from a prefix sample, not verified.

Querying Open Food Facts directly for `brands_tags=hillshire-farm` returns, as its first result:

```
0011110816405  |  BEEF SMOKED SAUSAGE  |  Hillshire Farm  |  categories: Sausages
```

`0011110` is **The Kroger Co.'s** GS1 company prefix. The record's front image is a photograph of a Hillshire Farm sausage package, and its nutriments are sausage data (128 kcal/100 g, 2.3 g carbs). So there is an Open Food Facts record filed under a **Kroger-prefix barcode** carrying **Hillshire Farm sausage** name, brand, imagery, and nutrition.

That single record explains the symptom exactly and explains why every VITA-side defence passes: the product endpoint returns precisely the code that was requested, so strict GTIN identity verification *correctly* confirms it. USDA has no record for that GTIN, so cross-checking would not have caught it either (verified: 0 candidates).

**This is upstream data corruption, not a client bug** — and no client logic can distinguish "correct" from "unrelated" when the database itself is wrong, because the client has no ground truth. Claiming a fix would be dishonest.

**Still required:** the founder's actual scanned value. The trace now captures the full chain — `camera.raw`, `camera.type`, `camera.digits`, `normalized`, `gtin.checkDigit`, `off.requested`, `off.returnedCode`, `off.returnedName`, `off.returnedBrand`, `off.identity`, `usda.requested/candidates/identity`, `navigate.href`, `detail.*`, `log.foodRef`, `log.snapshot*`, `edit.*` — and renders on **both** Food Detail and Edit Entry, since the wrong product has now been seen on both. One scan confirms or refutes `00011110816405` in a single screenshot.

The GS1 mod-10 check digit is now recorded (`isValidGtin` existed but had **no caller**) and deliberately **not enforced**: the symbology validates its own check digit in hardware, so a failure would more likely mean our parsing is wrong than the scan is, and blocking the primary flow on an unproven theory is the wrong trade while the cause is still unconfirmed.

**Barcode status: OPEN.** Not fixed, not worked around. Nothing was hardcoded, special-cased, renamed, or text-matched.

### Slice 2.9c — Fuel final visual polish + barcode recovery (2026-08-21)

Founder approved and **locked** the Fuel redesign. Structure untouched; this is detail polish over three device-QA findings.

#### Contextual food visuals were confidently wrong — root cause

The resolver architecture was sound; **the pictures it pointed at were not**. Two mappings did the damage:

- **The generic fallback was itself a specific food.** `food` → `fast-food-outline`, which draws a **burger and a drink**. Any food VITA could not classify — most foods — was therefore drawn as a burger. Five other categories (`burger`, `taco`, `burrito`, `sandwich`, `fries`) shared that same glyph, so they were indistinguishable from each other *and* from "unknown".
- **`banana` → `nutrition-outline`, which draws an apple.** So did `fruit`, `oatmeal`, and `bread`.

Classification was largely fine — `Banana nut` already resolved to `banana`. Ionicons simply has no banana, taco, or burrito, and its one general food glyph is a burger. **A wrong picture is worse than no picture**, which is what made this worse than the generic fallback it replaced.

#### Fix: a real VITA illustration set

`features/fuel/foodArt.ts` — **14 hand-drawn shapes** on a 24×24 grid, rendered through `react-native-svg` (already a dependency; no new package, no raster assets): banana · apple · egg · burger · pizza · taco · burrito · chips · bottle · coffee · drumstick · bread · bowl · utensils. Outline only, uniform stroke, round joins, single color so one drawing serves Light and Dark. Stroke weight scales with render size so a 20pt row icon and a 34pt hero carry equal optical weight.

Drawn, reviewed as rendered images, and revised: the first taco was indistinguishable from the bowl, the first drumstick read as a rattle, the first burrito as a sticking plaster. All three were redrawn and re-rendered at true list size before shipping.

**The generic is now a fork and knife** — "food, unspecified", which cannot be mistaken for a particular dish. That is the entire requirement for a fallback and exactly what the burger failed.

**Categories with no honest drawing point at the generic rather than borrowing another food's picture**: `fries`, `smoothie`, `dessert`, and `snack` resolve to utensils, because a bag of crisps is not a portion of fries and a protein bar is not a cookie. Shared drawings are used *only* where genuinely correct — a bowl serves oatmeal, pasta, rice, and salad honestly.

#### Classifier tightening

Whole-word matching kept, plus: a tolerated regular plural (`(?:s|es)?`) after "Blueberries" fell through to generic; and a deliberately tiny **branded-term list** checked ahead of the keyword rules, because nothing in "Big Mac" means burger and the founders named it as required behavior. Twelve entries, household names only, documented as an exception list rather than a strategy.

All 40 founder-named cases verified programmatically against the real compiled module: banana / banana nut / banana nut bread · eggs · hamburger / cheeseburger / Big Mac / Whopper · pizza · taco · burrito · Hot Cheetos / Doritos / potato chips · water · coffee · apple / orange / blueberries · chicken · steak · unknown → generic. Provider image beats category in every case; non-http image references are ignored.

#### Calorie ring

The identity returns **inside** the ring: `2,326` with `Calories` beneath it, within the circle. The label only needs to name the unit — the ring is what communicates consumption — and that is what makes it fit where "Calories consumed" did not.

**Over-target is now stated rather than hidden.** Past the target the right-hand figure switches from what is left to what is over — `326 · Calories over` instead of a flat `0 remaining`, which discards the only number still worth reading. Ring, bar, and percentage switch to amber together (one state change, not three competing colors); **amber, not red — information, not a verdict.** Ring and bar cap at 100% so the geometry stays honest while the percentage keeps counting (`116% of 2,000 Calories`). New `over()` and `caloriesOver` in the nutrition domain, alongside the existing floored `remaining()` whose no-guilt rationale is now stated in terms of both.

Macro structure unchanged.

#### Barcode: "Not the right product?"

Shown **only** on a Food Detail reached from the scanner, with origin carried as a route parameter (`?from=scan`) — never inferred from the provider, since an Open Food Facts result arrives from ordinary Search just as often. Opens a native action sheet (`ActionSheetIOS`, `Alert` on Android) offering **Search for food · Scan again · Add manually · Report incorrect product**, each routing into a flow that already exists. Nothing here logs food and nothing duplicates an existing path.

A subtle `Source: Open Food Facts` line sits under the brand on barcode-originated detail only — it is what makes a report actionable, and Open Food Facts requires attribution wherever its data is shown.

**Reporting is honestly incomplete.** There is no backend, so nothing is transmitted and the dialog says so in as many words, then shows the barcode, the displayed identity, and the source so the founder can act on it by hand. Claiming a report had been filed would be worse than not offering the option — the user would stop looking for another way to fix it. **Deferred capability: incorrect-product report submission.**

Exact GTIN lookup is untouched: correct record, or honest not-found. No Kroger special case, no prefix heuristics, no fuzzy replacement, no silent substitution.

#### Trace panel removed

The on-screen debug block is gone from both Food Detail and Edit Entry, and `trace.ts` is now console-only — a debug panel does not belong in founder QA once it has done its job. The `traceBarcode` console log stays: it costs nothing and still tells the whole story when a scan misbehaves. "Not the right product?" is now the user-facing answer to a wrong result.


### Slice 2.10 — Restaurant Provider Research (FatSecret) 🔬 research complete, integration deferred

**Founder decision, 2026-08-21: defer FatSecret to late-stage / pre-launch provider selection.** Research is finished and sufficient; implementation does not proceed. **Restaurant coverage is NOT delivered** — no adapter, no Edge Function, no credentials, no attribution UI, no persistence change. `fatsecret` stays out of every persisted-definition allowlist, exactly as slice 2.7 left it.

**What the research established** (full findings, with quotes and sources, in `docs/07-Audit-Log.md`, 2026-08-21):

- Basic is **genuinely free** — self-signup, no credit card, **5,000 calls/day**, US dataset. **Premier Free** (unlimited calls, verification required) may be open to start-ups under $1M revenue and funding.
- Restaurant coverage exists: `food_brands.get` accepts `brand_type` of `"manufacturer"`, `"restaurant"`, or `"supermarket"`, and `foods.search` returns `food_type` of `Generic` or `Brand` with `brand_name`. Actual per-chain coverage is unproven without a live key.
- Attribution is required, and reaches beyond the app UI into the **App Store / Google Play listing**.

**Why it is deferred — two blockers.**

1. **Storage policy vs. VITA's snapshot architecture.** The Developer Terms require removing or re-requesting any Content not explicitly storable indefinitely **within 24 hours**. The indefinitely-storable list is identifiers only (`food_id`, `serving_id`, `food_category_id`, and similar). Nutrition values, food names, brand names, serving descriptions and image URLs are not on it. `FoodEntry` stores every one of those permanently and deliberately — that is *why* Fuel and Home render totals with no lookup, no async, and no loading state, and why a logged day stays truthful after a provider revises a food.
2. **Server-side authentication.** FatSecret binds OAuth 2.0 tokens to an IP allowlist (up to 15 addresses on Basic). Supabase's own documentation states Edge Functions **cannot** provide static egress IPs; the documented workaround is a paid static-IP proxy, which reintroduces the cost the project rule forbids. OAuth 1.0 two-legged signing may be exempt, but that rests on community reports rather than documentation.

**The founders' ruling: VITA's architecture wins.** Offline nutrition history, permanent `FoodLogEntry` snapshots, historical consistency, immediate Fuel/Home rendering, and the existing Favorites and Recents architecture are not weakened to accommodate one external provider. **No compromise workaround was built** — no ID-only favorites, no re-fetching history, no temporary shim. Snapshots are not redesigned during Sprint 2.

**Reconsidered only if** FatSecret confirms in writing that logged nutrition may persist in a user's own diary · or VITA deliberately designs a compliant alternative near launch · or a different provider becomes the preferred restaurant source.

Launch-gated follow-up and the eight unresolved questions to put to FatSecret: `docs/04-Master-Roadmap.md` → **Launch readiness follow-ups**.


### Sprint 2 closeout audit — 2026-08-21

Audited the integrated system as it exists at `1f9b172`, not the previous PASS reports.

**Verdict: CONDITIONAL PASS.** Every automated and logic-level check passes; what remains is founder physical-device QA and one known upstream data defect that no client change can close.

**Executed verification** (there is no committed test suite — see the finding below, so this was run against the real compiled modules rather than asserted):

- `npx tsc --noEmit` and `npx tsc --noEmit --noUnusedLocals --noUnusedParameters` — both clean.
- `npx expo export --platform ios` — succeeds.
- **61 assertions** across GTIN normalization and check digits, nutrition arithmetic (remaining/over/progress/percent/rounding, partial optional nutrients, per-meal summarization), log dates, the `createEntry → foodFromEntry` snapshot round-trip including image persistence, meal-slot parsing and time defaults, display formatting, and the food-visual resolver's three tiers across fourteen representative foods — **all pass**.
- **6 dedupe/ranking assertions** — same GTIN merges across providers; a branded restaurant item does **not** merge with a generic; a >5% calorie gap keeps same-named foods separate; ranking is deterministic regardless of provider arrival order.
- **Live provider run** against USDA and Open Food Facts: `big mac` → *Big Mac (McDonalds)* first; `banana` → *Bananas, raw* first; `chipotle chicken bowl` → *Chipotle Chicken Bowl* first. Barcode `0011110043436` → *Kroger Purified Drinking Water* with the returned GTIN matching; an invalid code → honest `not-found`. Aborting mid-flight settles both providers as `aborted` rather than surfacing partial results.

**A ranking "defect" was raised and then withdrawn on evidence.** A synthetic case suggested a generic USDA *Hamburger* could outrank *Big Mac — McDonald's*. Against the live providers it does not — USDA's own branded record wins the query, and the synthetic scenario (a Foundation-quality "Hamburger" returned for `big mac`) does not occur. **No ranking change was made**, per the instruction not to tune ranking without a real deterministic defect.

**Defect found and fixed:** the Favorites screen rendered its empty state before storage hydrated, so a user with saved favorites was briefly told they had none. Recents and Food Log already guard this and Fuel's summary holds an em dash for the same reason; Favorites now shows a spinner while `status === 'loading'`. One-screen fix, matching the existing pattern.

**Clean on inspection:** zero `TODO`/`FIXME`/`HACK` in `src/` · no `vita-fixture` outside a historical comment · no singular `'Snack'` type · no user-facing `kcal` (only the internal `MealSlotSummary.kcal` field, deliberately unrenamed) · every `console.*` guarded by `__DEV__` · no debug/trace panel in the UI · **zero provider-specific branching in any UI layer and zero raw provider fields outside adapters** · no duplicate nutrition arithmetic outside the domain · every UI and Fuel component consumed · no unused dependency added · `.env` untracked and ignored, no secret in any tracked file · no screenshots, exports, or QA seed data tracked.

**Known-stale statuses corrected in this pass:** slices 2.1–2.9 were still marked "pending founder review" after the founders declared them approved; 2.6 still said USDA was blocked on a key that is now configured and returning results.

**Open findings carried forward, not fixed:**

| Finding | Why not fixed here |
|---|---|
| **No committed test suite.** Sprint 2 shipped a substantial pure-logic domain — GTIN, nutrition arithmetic, dedupe, ranking, classification — with no `jest`/`vitest` and no test files. The 67 assertions above were run ad-hoc and are not repeatable in CI. | Adding a test framework is a dependency and a slice of its own, not closeout scope. **Recommended as the first task of Sprint 3.** |
| **Kroger barcode** still resolves to Hillshire Farm sausage. Root cause is an upstream Open Food Facts record filed under Kroger's company prefix. | No client-side rule can detect a database that is wrong about itself. The `Not the right product?` recovery is the shipped answer; the upstream correction needs founder authorization. |
| `expo@54.0.36` / `expo-constants@18.0.13` are one patch behind the SDK 54 expectation. | Patch drift inside SDK 54, not an SDK upgrade — but it is still a dependency change with regression risk and no demonstrated need, so it is reported rather than applied. |
| `src/lib/nutrition/index.ts` re-exports ~23 symbols used only inside the domain. | Deliberate domain API surface; trimming is churn with no functional benefit. Observation only. |

**Not verifiable in this environment:** every tap-dependent path. The simulator MCP refuses to attach (it reports Xcode "not selected" although `xcode-select -p` already resolves correctly) and `osascript` has no assistive access, so screens can be rendered, deep-linked, and screenshotted but **not driven**. Add-to-log, edit, delete + Undo, favorite toggling, meal preselection end-to-end, the action sheet, and live camera detection are typechecked and reasoned but not exercised. **This is the whole of the outstanding QA and it needs the founder's iPhone.**

---

## Sprint 3 — Water + Peptides — ✅ COMPLETE (merged to `main` 2026-09-01, `2bac43b`)

**Opened 2026-08-22.** Branch `sprint-3-water-peptides`, cut from `main` at `4ab32c5`. Founder-authorized against the approved Sprint 3 Planning & Architecture Audit; all three entry conditions met (device QA accepted · Sprint 2 merged · branch cut). Scope and the preserved Water/Peptide direction live in `docs/04-Master-Roadmap.md` → Sprint 3.

**Slice plan approved by the founders 2026-08-21.** Two changes from the illustrative plan recorded in the roadmap: the test harness folds into 3.1 rather than being deferred, and **the calculator moves ahead of peptide logging** — logging records a dose, so building it before the dose math exists would mean building it twice.

| # | Slice | Objective | Status |
|---|-------|-----------|--------|
| 3.1 | Shared Daily Foundation + Test Harness | Promote the shared date/id/key/storage primitives; stand up the first committed test suite. No behavior change | ✅ Approved |
| 3.2 | Water Domain + Persistence | Hydration model, unit normalization, repository, provider; water that actually saves | ✅ Approved |
| 3.3 | Water Goal + Logging Experience | User-set goal, entry-local units, today's editable log, delete + Undo | ✅ Approved |
| 3.4 | Water Visual Refinement + Fuel/Home Integration | Water-level panel, 7-day volume strip, Home water tile and goal pillar on real state | ✅ Approved |
| 3.5 | Peptide Definitions, Catalog + User Setup | Definition/Setup models, catalog, Custom, setup lifecycle | ✅ Approved |
| 3.5A | Expanded Peptide Library + Research Details | 71-entry catalog, aliases, blends, compound types, research reference pages | ✅ Approved |
| 3.5B | Final Peptide Catalog + Detail Polish | 72 entries, research-area taxonomy, category selector, structured detail presentation | ✅ Approved |
| 3.6 | Dose / Unit Calculator | Pure bidirectional syringe-units ⇄ mass conversion, fully tested | ✅ Approved |
| 3.7 | Peptide Logging + History | Log entry with snapshot fields, history by date, edit/delete | ✅ Approved |
| 3.8 | Injection Site Tracking | Site taxonomy, body-outline picker, accessible fallback, recency from the user's own log | ✅ Approved |
| 3.8A | Injection Site UX + Interactive Body Map | Flat site taxonomy with Center Abdomen, SVG body map, Tools redesign, 3.8 migration on read | ✅ Approved |
| 3.8B | Injection Site Visual + Selection Polish | One-tap canonical site list, body model as optional aid, redrawn silhouette, Site Reference rewrite | ✅ Approved |
| 3.8C | Body Map Tapability + Light Mode Contrast | Non-overlapping touch partition, 9/8 scale-up, three-level Light-mode contrast | ✅ Approved |
| 3.9 | Peptides Routine + UX Integration | Add to Routine, needs-setup/active/inactive, routine detail, daily Taken/Skipped, removal preserving history, Fuel on real state | ✅ Approved |
| 3.9A | Routine UX Simplification + Interactive Schedule + Catalog Expansion | MG-only vial, Preferred Unit removed, interactive week strip, 96-entry catalog, punctuation-insensitive search | ✅ Approved |
| 3.9B | Daily Peptide UX + Navigation Corrections | Routine Amount, two-tap Taken, Monday–Sunday week, reminder config, PT-141 display fix | ✅ Approved |
| 3.10 | Sprint 3 Audit + Closeout | Integrated audit, edge cases, device QA, doc reconciliation | ✅ Approved |
| 3.10A | Final Audit Resolutions + Closeout | Dead dose helpers removed, MG-only vial everywhere, VIAL/ROUTINE/NOTES hierarchy, Today/Active deduplication | ✅ Approved |

**Statuses reconciled at closeout (slice 3.10A).** The table had drifted: 3.6, 3.7 and 3.8 still read ⬜ Planned although all three shipped, and 3.8A–3.8C and 3.9A still read *pending founder review* after the founders had approved them on device — 3.8C explicitly ("Slice 3.8 is now complete and locked", slice 3.9 authorization) and 3.9A by way of 3.9B, which supersedes it and is approved. Every Sprint 3 slice through 3.10 is now marked to match what the founders actually said. **Every Sprint 3 slice is now founder-approved, and the sprint is merged into `main` (`2bac43b`, 2026-09-01).**

**Founder decisions recorded at approval** (full text in the approved planning report): water goal is established by the user on first use with **fl oz** as the US-English default display unit, never presented as a medical recommendation · Water owns its own preferences and Settings (**Sprint 4** since the 2026-09-01 reorder; Sprint 7 when this was decided) will read that same source rather than duplicating it · water history stays inline, no analytics section · fixed quick-add presets, no customization yet · restrained vertical-fill progress visual · a **12–20 entry** peptide catalog carrying name, classification, and broad category only · **no educational prose in Sprint 3** · only the peptide itself is a required setup field · one calculator surfaced in two places · restrained front/back body outline with a list fallback · inactive setups hidden but reachable, and **deactivation never deletes history** · Peptides does not go on Home; Water may · peptides purple stays.

**Two language rules the founders set for this sprint.** The model must not carry a field named `typicalDose` or anything else implying VITA supplies a medically appropriate amount — if repeat-logging convenience is ever needed, it uses neutral user-owned framing such as *last logged amount*, and only when a slice actually requires it. And schedules read **"Scheduled today"**, never "Due today": VITA reflects what the user entered. No missed-dose language, no adherence percentages, no streak punishment, no treatment recommendations.

### Slice 3.10A — Final Audit Resolutions + Closeout 🟡

**Objective:** implement the founder's rulings on the four findings slice 3.10 referred rather than decided, verify the separately-approved roadmap is intact, and close Sprint 3 from an engineering standpoint.

---

**Referral #1 — `doseConsistencyNotes`: removed.** The founder's rule was *prefer deleting truly dead code over preserving speculative helpers*, and it applied to more than the one function that was referred. `doseConsistencyNotes` had zero production consumers — but so did `calculateConcentration`, `calculateAmountFromUnits` and `calculateSyringeUnitsForMass`, all orphaned by the same change: slice 3.6D replaced the dose input with the automatic reference and left the forward, reverse and convenience conversions with nothing calling them. Keeping one and deleting its three siblings would have been arbitrary, so all four went, with the `DoseConsistencyNote` type. 80 lines of source and 16 tests. **No UI behaviour changed, because none of it was reachable from a screen** — and nothing is lost: the reverse conversion is four lines against `calculateSyringeUnits` on the day a surface actually needs it. What remains in `dose.ts` is exactly what the app calls: `calculateSyringeUnits` and `unitConversionReference`.

**Referral #2 — the vial is milligrams everywhere.** The standalone calculator's mg/mcg vial toggle is gone; it now reads `Vial Amount (MG)`, the same question in the same words as Routine Setup. The reasoning the old code documented — *nothing here is saved, so a mistaken unit is disposable* — was the thing the audit disputed and the founder ruled on: the mistake is not visible. A vial entered as mcg produces a table that looks entirely coherent and is wrong by a factor of a thousand, and the user acts on the number rather than on whether it was stored.

**The Custom Amount keeps mg and mcg**, deliberately. That is the amount being converted, not the vial size, and micrograms are an ordinary way to state it — `5 MG / 2 ML` with a `500 mcg` custom amount still reads `= 20 units`, which is the founder's own worked example.

Removing a control means removing everything that pretended it still existed: the `vialUnit` state, its conversion callback, the `MassUnit`/`MASS_UNITS`/`convertAuthoredAmount`/`SegmentedTabs`/`View` imports, three unreachable styles, and — the one that mattered — **a test that had been silently passing without testing anything.** `reads an mcg-authored vial at a legible scale` opened with a guard that early-returned when no vial-unit control was present. That was true on the setup form already and became true everywhere once the toggle went, so the test ran, asserted nothing, and counted as green. It is rewritten against a path that still exists: a 0.5 mg vial in 2 mL is 250 mcg/mL, one whole milligram would be 400 units, and the reference correctly drops to `0.05 mg = 20 units`.

**Referral #3 — VIAL / ROUTINE / NOTES.** Seven section headers became three. `Schedule`, `Reminder` and `Start date` are now field-weight labels *inside* ROUTINE, and `Unit conversion` is a field-weight label *inside* VIAL rather than a heading competing with it. The weight difference is the whole mechanism: group headings are uppercase micro-type in tertiary grey; these are sentence-case `captionMedium` in secondary — the same weight as `Vial Amount (MG)` and `Amount (MG)`, so they read as fields of the group above them. **Nothing was removed**, which a test asserts by naming all seven controls; a second test pins the heading list as exactly `['VIAL', 'ROUTINE', 'NOTES']`.

**Referral #4 — Today and Active never show the same routine twice.** A routine surfaced in Today no longer also appears under Active. This is **presentation filtering and nothing else**: membership is decided by setup id against what Today already renders, and `routineState` is neither read nor written — a test asserts the routine is still `active` on disk after being hidden from the Active list, because a screen that deduplicated by pausing something would be a far worse bug than the duplication it set out to fix.

The consequences were checked rather than assumed. As Needed routines are never in Today, so they always appear under Active — the one place they can be reached. Routines with no schedule at all likewise. A *paused* daily routine is not active, so it is never deduplicated against Today and stays under Inactive. Needs Setup is untouched. And the Active empty state now counts Today: without that, a user with a single daily routine would have been told **"Nothing active right now"** directly beneath the routine the screen was asking them to record.

---

**Validation.** `npm test` — **1093/1093** pass across 40 suites (1075 → 1093: 26 added, 16 removed with the dead helpers, 8 net) · `npx tsc --noEmit` — clean · `npx tsc --noEmit --noUnusedLocals --noUnusedParameters` — clean · dead-`StyleSheet`-key sweep — clean · dead-component sweep — clean · stale-reference sweep for the removed toggle, the removed helpers, Preferred Unit, `setup/new` and `peptides/api` — clean · `npx expo export --platform ios` — succeeds · `npx expo install --check` — reports only the `expo@54.0.36` / `expo-constants@18.0.13` patch drift carried since Sprint 2 · **no notification dependency exists**, still asserted by test.

**Boundary audit.** Zero-diff against `2c5a2d8` on nutrition, Fuel, Home, Atlas, Journey, `BodyMap`, `SiteSelector`, the site taxonomy, all catalog content, and the whole of Water — this slice touched none of them, so 3.10's Water waterline fix and 3.8C's body map stand exactly as approved.

**Device QA — eight screenshots, all inspected.** Seeded five routines covering every case the deduplication has to get right: one daily (Today), one scheduled Friday (Active), one As Needed (Active), one needs-setup, one paused daily (Inactive). On device: **Retatrutide appears once**, under TODAY; BPC-157 shows `Fri` and Ipamorelin shows `As needed`, both under ACTIVE; Bremelanotide stays under NEEDS SETUP; Tirzepatide stays under INACTIVE despite being a daily routine, because it is paused. Reseeded with a single daily routine — the case the founder objected to — the screen is now one card, no ACTIVE section at all, and **no "Nothing active right now"**. Routine Setup reads VIAL → *Unit conversion* → ROUTINE → *Schedule* → *Reminder*, with the two group headings visibly louder than the field labels. The calculator shows a full-width `Vial Amount (MG)` with no toggle, and the Custom Amount keeps its mg/mcg control. All verified in Light and Dark; no theme regression.

**Founder storage** was backed up before seeding and restored byte-identically; **zero QA keys remain.**

**One visual observation, not changed.** The `1 mg = 10 units` headline is the largest element on Routine Setup. That is the approved slice 3.6D design — *the answer is the only large text on the card* — and it now sits inside VIAL rather than competing with it, which is what §10 asked for. Raised only so it is a noticed choice rather than an unnoticed one.

**Not verified, unchanged limitation:** tap-driven paths on the simulator. Every interaction claim rests on route-level tests that drive the real handlers.

### Slice 3.10 — Sprint 3 Audit + Closeout ✅

**Objective:** inspect the whole of Sprint 3 as if it were about to ship to a real person — not "do the tests pass", but *does this make sense, is anything confusing, ugly, redundant, unfinished, or quietly wrong* — fix what is safely Sprint-3-scoped, and decide whether the sprint can close.

**Nine defects fixed, four findings referred to the founder, one release gate recorded.** Full detail for every one is in `docs/07-Audit-Log.md`; this entry records what changed and why the audit found it when the suites did not.

---

**The two findings the test suite could not have caught.**

The first was arithmetic that only misbehaves when *rendered*. `unitConversionReference` could emit two rows that display identically — `1 mcg = 50 units` sitting directly above `1 mcg = 100 units` — because micrograms round to whole numbers and the row ladder starts at half the primary amount. A sweep across realistic vial and volume pairs found 38 reachable cases. Every one of them is behind the standalone calculator's mcg vial toggle; the milligram path that every setup form uses has none. The fix is a display-integrity rule in the model rather than a patch in the view: **no two rows may read the same**, whatever they are underneath. The founder's approved `0.5 / 1 / 2 / 3 / 4 / 5 mg` ladder is pinned by a test so the guard can never quietly drop a row from the path people actually use.

The second was found by sampling pixels. On a brand-new device with no goal set, a **solid blue waterline drew across the bottom of the Water panel**. The fill animates to a height of zero correctly, but its 2pt surface line is anchored to the top of that zero-height box, so it painted at the card's edge. The component's own documentation says the panel must never show an empty vessel, because *"you have not chosen a goal"* is not a statement about how much you have drunk — and it was showing one to every first-time user. No test rendered it; code review would not see it. It took a screenshot and a pixel scan.

---

**A test was holding a defect in place.** Slice 3.9A removed the Preferred Unit control and left its explanatory sentence on screen — *"How amounts are shown for this peptide. A display preference, not a recommended amount."* — floating between the conversion table and the Routine header, describing a control nobody could see. `SetupForm.test.tsx` asserted that copy was **present**. Written when the control existed, never revisited, and green ever since. The sentence is gone and the assertion is inverted: what the form must not do is explain a control it does not have.

**Storage formats had leaked onto a summary screen.** The routine detail rendered the reminder as `09:00` and the start date as `2026-08-24` — the strings they are persisted as, in an app that otherwise speaks `9:15 AM` and written dates. Two shared formatters now sit in `lib/daily`: `formatTimeOfDay` and `formatLogDateWithYear`. Both are hand-written for the same reason their siblings are — Hermes' `Intl` support varies by platform and engine build, and a header that silently falls back to `2026-08-24` on one device is not worth the dependency. The year is the point of the second one: a routine's start date is often months old, and `formatLogDateLong` omits it.

**Three surfaces disagreed about how to name the same things.** "Edit Routine" opened a screen titled *Setup*. The standalone calculator asked for `Vial Amount (mg)` and `Bacteriostatic Water / Reconstitution (mL)` while Routine Setup asked for `Vial Amount (MG)` and `Reconstitution Volume (ML)` — the 3.9A copy fix landed on one surface and never reached the other. And the setup form itself carried `Amount (mg)` four lines beneath `Vial Amount (MG)`. The convention is now stated rather than assumed, and pinned by tests: **a configuration field label caps its unit — `(MG)`, `(ML)` — and every displayed value stays lowercase — `2 mg`, `20 units`, `1.2 mL`.** The screen is retitled *Routine Setup*, which is what the row that opens it promises.

**Dead code from the 3.9 redesign.** `PeptideRowPanel.tsx` and `VialSummary.tsx` had zero references anywhere, tests included — both orphaned when the routine screens replaced the old Active/Inactive lists. Four files carried unused `StyleSheet` keys, which `--noUnusedLocals` cannot see. Both sweeps are now scripted and run as part of validation.

**Two smaller corrections.** The setup screen rendered the catalog category exactly as authored while every other surface title-cased it, so one compound read *Melanocortin agonist* here and *Melanocortin Agonist* one screen back. And the Schedule segmented control was the only one on the form without a `groupLabel`, so assistive technology announced four unattached buttons instead of four choices of schedule.

---

**Water finally has route-level tests.** Its units, totals, goals, entries, week and provider were all thoroughly covered, and **no test had ever rendered a Water screen.** That is precisely the gap that let PT-141 ship broken in 3.9A: `searchCatalog` was correct, had 92 passing tests, and the screen showed users a compound they did not recognise. `src/features/water/__tests__/WaterRoutes.test.tsx` drives the real routes — add a drink, set a goal, two taps recording two drinks, save disabled with nothing entered, a load failure surfacing rather than reading as an empty day, and the midnight boundary leaving yesterday alone. It is also what caught the waterline bug.

**The founder's §26 snapshot regression is now written out literally.** Setup at 20 MG in 2 ML, log 2 mg → 20 units, then reconstitute the same vial in 1 ML. The old record must still read `2 mg · 20 units`, must keep the site it was recorded at, and must not be rewritten on disk merely by opening the history screen — with the counterpart assertion that the setup *does* now show the new relationship, so the change took effect where it should. This existed for the edit path; it did not exist for the plain display path.

**Test total: 1029 → 1075.**

---

**Four findings referred rather than fixed, deliberately.**

`doseConsistencyNotes` is written, documented, tested — and wired to nothing. It detects an amount larger than the whole vial, which is the signature of a typo in one of the two numbers every syringe figure is derived from. It was orphaned by 3.6D when the dose input became an automatic reference. Wiring it would be useful; doing so during a closeout would be adding new visible behaviour to a form the founder has just approved, which is the scope creep §48 warns against.

The standalone calculator still offers a mg/mcg vial toggle that Routine Setup deliberately lost in 3.9A. The code documents a considered counter-argument — the calculator persists nothing, so a mistaken unit is "visible and disposable". The audit's disagreement is that it is *not* visible: the table looks coherent either way, and the user acts on the number rather than on the saved state. But reversing a documented deliberate decision inside a closeout is the founder's call, not the auditor's. The duplicate-row defect it enabled is closed independently, at the model level.

Routine Setup presents **seven** section headers where §13 describes three. Each arrived with the slice that added its field; nothing is wrong individually, and together the form reads longer and more administrative than it is. Folding Schedule, Reminder and Start Date under ROUTINE is a form redesign, and the standing rule is not to redesign without approval.

A single active routine **appears twice on the Peptides home screen** — once under TODAY, once under ACTIVE. By design: TODAY answers *what do I do now*, ACTIVE is the roster. With five routines it reads correctly; with one it is the same name twice. §7 asked directly whether these lists are too repetitive, so it is raised with a recommendation rather than changed unilaterally.

---

**One release gate, recorded explicitly.** The 96 peptide entries have never had expert review. The automated tests enforce *structure and internal consistency* — unique ids and aliases, no shared prose between similar compounds, no dosing or protocol language anywhere, every time-sensitive development stage dated and sourced. **None of that is a check on whether a sentence is medically accurate, and it must not be mistaken for one.** Before public release this content requires real content, medical and legal review appropriate to a consumer health product. It is not a Sprint 3 blocker.

---

**Boundary audit.** Zero-diff held on nutrition, Fuel, Home, Atlas and Journey. `BodyMap`, `SiteSelector` and the site taxonomy are untouched — 3.8C stands as approved, and its light-mode contrast was re-verified on device. The 3.5D catalog content lock held: `src/lib/peptides/data/definitions` has no diff. Water's only source change is the waterline fix, which is an audit finding rather than a feature.

**Validation.** `npm test` — 1075/1075 pass across 40 suites · `npx tsc --noEmit` — clean · `npx tsc --noEmit --noUnusedLocals --noUnusedParameters` — clean · dead-`StyleSheet`-key sweep — clean · dead-component sweep — clean · `npx expo export --platform ios` — succeeds · `npx expo install --check` — reports only the pre-existing `expo@54.0.36` / `expo-constants@18.0.13` patch drift carried since Sprint 2, unchanged and still awaiting a founder decision.

**Device QA.** Nineteen screenshots captured on a booted iPhone 17 Pro against seeded state — three routines in three different states, four administrations with site snapshots, five routine-day statuses including a deliberate skip and two days left unanswered, and six days of water — then re-captured with all Sprint 3 keys cleared for the empty-state pass, in both Light and Dark. Every one was inspected. The founder's storage manifest was backed up before seeding and restored byte-identically afterwards; **zero QA keys remain**.

**What device QA actually proved.** The reminder now reads `9:00 AM` and the start date `24 August 2026`. The setup screen is titled *Routine Setup*, its category reads *Melanocortin Agonist*, and the orphaned Preferred Unit sentence is gone. The calculator asks for the vial in the same words Routine Setup does. The catalog header reads `CATALOG · 96`. History preserves authored units — the 2.5 mg override day still says `2.5 mg · 25 units`. Light-mode body-map contrast from 3.8C holds. And the Water panel draws no waterline without a goal, while still drawing it at 44% with one.

**Not verified, unchanged limitation:** tap-driven paths on the simulator. Every interaction claim in this slice rests on route-level tests that drive the real `onPress` and `onChangeText` handlers, not on device taps.

### Slice 3.9B — Daily Peptide UX + Navigation Corrections 🟡

**Objective:** founder device QA rejected 3.9 on two hard defects and several usability problems. The routine architecture is correct and unchanged; this fixes what was reported.

---

**PT-141 was never missing, and the 3.9A fix was only half of it.** The entry has always existed as **Bremelanotide** with `PT-141` as an alias. 3.9A fixed punctuation matching so `PT141` would resolve — genuinely necessary — and shipped 92 passing tests. Every one of those tests called `searchCatalog` directly, a pure function that was working perfectly. **The screen was never exercised.** Searching `PT-141` returned exactly one row, and that row said:

> **Bremelanotide** · Approved · *Melanocortin Agonist*

The words the user typed appeared nowhere. Someone searching a name they know, shown a compound they don't recognise, reasonably concludes it is absent. **The defect was in the result, not the search.**

**The row now shows the alias that matched** — `Bremelanotide` / *PT-141 · Melanocortin Agonist*. General, not a special case: `Ozempic` surfaces Semaglutide, `Mod GRF 1-29` surfaces CJC-1295. With no query the first alias shows, so browsing works too. Exactly one alias, because an earlier version listed every alias beside the category and truncated mid-word — which is why aliases were removed from the row in the first place, and how this defect was created.

**A route-level regression now drives the real screen**: type into the actual field, read the actual list, tap the actual row, confirm the detail page. `searchCatalog` tests can no longer pass while the screen is broken.

**Add to Routine now names its destination.** `dismissAll()` pops to the root of whatever navigator it finds — outside the Peptides stack that meant landing on Fuel. `router.navigate('/peptides')` is deterministic however the catalog was reached.

---

**Routine Setup is the one hard step; the daily flow reads it.** This is the product change. `routineAmount` stores what the user says they usually use — canonical micrograms plus the authored pair, like the vial — and the Taken sheet is seeded from it. **Never prefilled from the catalog, a protocol, or anyone else's number.**

**Taken is now effectively two taps.** The amount reads as settled (`2 mg · 20 units · From your routine`) with a single *Change* affordance; the time is filled with the current local time; site and notes are optional. A text field sitting open invites retyping something already correct.

**Changing today's amount never writes back to the routine**, and **changing the routine never rewrites history**. Both pinned. A log recorded at 1 mg stays 1 mg forever.

**Time defaults to now and stays editable** — nobody should type the current time, but someone logging at 5pm what they took at 9am must be able to say so.

**The week is a real Monday-to-Sunday calendar.** The rolling window produced *Friday → Saturday → Sunday → Monday*: chronologically correct, unreadable as a calendar, and rejected on sight. Monday-first with date numbers, plus `‹ This week ›` navigation — two arrows and a label, not a calendar screen. Forward is disabled at the current week; a week that has not happened is not offered.

**Colour added, carrying nothing alone.** Taken is peptide purple with a tick; skipped is **amber** with a dash; nothing recorded is a grey outline. **Amber, never red** — skipping on purpose is a choice, not a failure, and red is what this app uses for real errors. A named `routineSkipped` token reuses the existing amber hex rather than inventing a colour. Today is marked by weight, never by the status palette, because colouring it purple would say something was recorded.

**Reminder configuration is stored, not scheduled.** Off by default; On exposes a local `HH:MM`. **No OS notification is registered in this slice** — a test asserts no notification dependency exists. Persisting now means a later slice delivers reminders without a migration. Neutral wording: *Reminder*, never *dose reminder*.

**Routine detail re-tiered again** — Amount, Schedule and Reminder lead; vial preparation is a secondary *Preparation* card; **Edit Routine** replaces *Edit Setup* and sits with Pause and Remove under Actions.

**Deviation, flagged for the founder:** §30 asked for "a blue treatment aligned with the Peptides visual language" for Taken. Peptides' established domain colour is **purple** (`#7C3AED`) and blue (`#2F80ED`) is **Water's** domain colour — using it would signal the wrong feature. Taken uses peptide purple. Say the word and it becomes blue.

**14 new tests, 1029 total** — the real-screen PT-141 path, named navigation, routine amount seeding and canonicalisation, today-only override, historical integrity across a routine change, the local-time default and its correction, reminder default/persistence, the absence of notification dependencies, Monday-first ordering, today marking, and week navigation including the disabled forward edge.

**Verified on device, Light and Dark.**

**Boundary audit:** Water, nutrition, Home, `BodyMap`, `SiteSelector`, the site taxonomy, the log model and all catalog *content* have a zero-line diff — the only catalog change is how a row displays. No notifications, no Food Scanner, no Supabase. Slice 3.10 has not started.

### Slice 3.9A — Routine UX Simplification + Interactive Schedule + Catalog Expansion 🟡

**Objective:** founder QA confirmed the routine mental model is correct and left nine issues. This slice fixes them, and expands the catalog. The routine architecture from 3.9 is untouched.

---

#### Routine UX

**Add to Routine lands on Peptides.** It used to call `back()`, which returned the user to the catalog list — where they had *been*, not where the thing they just added now lives. Dismissing the whole catalog stack puts Today, Needs setup, Active and Inactive in front of them with the new routine visible.

**The vial is milligrams only.** Vials are labelled in mg — nobody reads *10000 mcg* off one — and the toggle offered a choice whose wrong answer was **catastrophic and invisible**: a vial entered as mcg is off by a factor of a thousand, and every syringe number derived from it is wrong in the same direction. Removing the choice removes the failure.

**Nothing changed underneath.** `amountMcg` is still canonical and `authored` still records mg. A **legacy setup authored in mcg is converted for display, not reinterpreted**: the field is derived from canonical micrograms, so `5000 mcg` reads as `5` rather than becoming a five-gram vial on the next save. Pinned by a regression test and verified on device.

**The standalone calculator keeps its mg/mcg toggle**, and that is deliberate. It is a scratch surface where nothing is saved, so a mistaken unit is visible and disposable; Setup is configuration that persists. The tests were re-scoped rather than deleted.

**Reconstitution reads as one idea.** `Bacteriostatic Water / Reconstitution (mL)` put two names for the same number in a single line. Now **Reconstitution Volume (ML)** with *Bacteriostatic water added to the vial.* underneath.

**Preferred Unit is gone from the UI.** It asked, up front and out of context, a question that only matters at the moment an amount is recorded — where the mg/mcg toggle still sits, beside the number being typed. The stored value is preserved for backward compatibility and defaults to mg for new routines.

**Recording an amount still supports mg and mcg.** Removing the vial and preference toggles did not remove unit choice from the number the user actually records, which is a different question.

**The week strip is a control, not decoration.** Every cell is a real button showing **weekday, date number and status** — `F 21 ○` — because `F S S M T W T` could describe any week in history. Tapping opens a compact day sheet stating what the schedule said and what was answered, with Mark Taken, Mark Skipped or Clear Status as appropriate.

**Selection and status are styled apart.** The open day is marked by its ring; whether it was taken is carried by the glyph and fill. Sharing one treatment would make a selected day look taken.

**Future days are informational.** Marking tomorrow taken would let the app hold a confirmed administration that has not happened. The rolling seven-day window ends today, so the case cannot arise; the sheet still handles it explicitly rather than relying on that.

**Correcting a past day asks for the time.** Today's time is genuinely known — it is now. A past day's is not, and stamping one in silently would put a precise claim into a health record that nobody made, so the field appears exactly when the answer stops being obvious.

**One source of truth.** The strip writes through the same provider operations the Today card uses. There is no calendar-specific state.

**Week navigation was deliberately deferred.** A fixed rolling seven-day window answers "how has this week gone?" without becoming a second screen, and §46 permitted deferring it. Reported rather than silently dropped.

**Routine detail re-tiered.** Edit Setup is a row with a chevron inside the Setup card, not a full-width purple button competing with Taken and Skipped for the eye — changing a vial is occasional, answering today is the daily act. Preferred unit is gone from the summary with its control.

**Taken is no longer pre-selected.** A filled Taken button read as *already taken* before anyone touched it — the most consequential possible misreading on the screen. Both actions are outlined; the accent is carried by Taken's label alone. **This was fixed twice**: the first pass corrected the home card and missed the routine screen, which draws its own buttons. Found by inspecting a screenshot, and the test now covers both surfaces.

**Defensive footer removed from Peptides.** The boundary is stated where it is load-bearing — on the catalog pages that describe compounds, and on Injection Sites. A third voice under a list of the user's own routines made the screen read as nervous about itself.

---

#### Catalog

**The reported gap was not a missing entry.** PT-141 was already in the catalog as **Bremelanotide**, with `PT-141` and `Vyleesi` as aliases. Search compared raw strings, so `PT141` matched nothing — a **search defect wearing a catalog defect's clothes**. Queries and aliases are now compared with punctuation and spacing stripped, so `PT-141`, `PT141` and `pt 141` are one query. Adding a second PT-141 entry would have created a duplicate and left the real bug in place.

**72 entries → 96.** Twenty-one definitions and three blends added. Of the founder's 38 high-priority candidates, **21 were already present** — including Melanotan I and II, Sermorelin, GHRP-2, GHRP-6, Hexarelin, IGF-1 LR3, HGH Fragment 176-191, Thymosin Alpha-1, LL-37, ARA-290, Oxytocin, Humanin, Follistatin-344, Tesofensine, Survodutide, Mazdutide, VIP, Gonadorelin and Thymulin. The audit ran first, so nothing was duplicated on the assumption it was missing.

**Added:** the thirteen Khavinson bioregulators (Thymalin, Thymogen, Vilon, Cortagen, Cartalax, Vesugen, Bronchogen, Livagen, Pancragen, Prostamax, Testagen, Ovagen, Chonluten), plus PEG-MGF, FOXO4-DRI, AICAR, P21, PE-22-28, Setmelanotide, Eloralintide and Orforglipron. Three blends: Tesamorelin + Ipamorelin, MOTS-c + NAD+ + 5-Amino-1MQ, and Thymosin Alpha-1 + Thymalin.

**Status is assigned accurately, not defaulted to *Research*.** Setmelanotide is an **approved medication** — saying otherwise would be a factual error in the direction that matters. Orforglipron is phase 3 and Eloralintide phase 2, both dated and sourced because pipeline facts expire. AICAR is recorded as a **small molecule**, not a peptide, as is Orforglipron.

**Every entry was written separately.** This family is the easiest in the catalog to cross-contaminate — short, similarly named, sharing a template — and a copied paragraph with one organ swapped would look completely plausible and be wrong. A test asserts no two catalog overviews are identical, and named pairs (Bronchogen/Chonluten, Cortagen/Cartalax, P21/PE-22-28, MGF/PEG-MGF, Thymalin/Thymogen) are checked individually.

**Accuracy over count.** Where the specific amino-acid sequence or tissue association could not be stated with confidence, the entry describes what the compound *is associated with in its literature* rather than asserting a sequence. Nothing was added purely to raise the number.

**An existing test had a false positive.** The storefront sweep did a substring match for `cart`, which fires on **Cartalax** — a real compound whose name contains those letters. It now matches word boundaries. A check that fails on a legitimate compound name is a check that gets silenced rather than fixed.

**No existing entry received substantive copy changes.** The approved 3.5D content for the original 72 is untouched.

**96 new tests, 998 total** — catalog integrity (unique ids and names, alias collisions in both directions, valid areas, dated and sourced time-sensitive stages, resolvable blend components, no duplicate blend component-sets, no dosing content), punctuation-insensitive search, every added compound reachable and tagged, contamination pairs, and the combined catalog → routine regression proving a newly added compound joins the routine through the same path with no duplicate shell.

**Verified on device, Light and Dark.** Setup showing a legacy mcg vial as `5` MG, the interactive strip with dates, the day sheet, `PT141` resolving to Bremelanotide, and both Taken buttons corrected.

**Boundary audit:** Water, nutrition, Home, `BodyMap`, `SiteSelector`, the injection-site taxonomy, the log model and the calculator core all have a zero-line diff. No reminders, no Food Scanner, no Supabase. Slice 3.10 has not started.

### Slice 3.9 — Peptides Routine + UX Integration 🟡

**Objective:** replace *browse → Track this peptide → long Setup form → Save → open → Log Peptide → another form* with a model people already hold: peptides are **added to a routine**, and adding, configuring, tracking daily, pausing and removing are separate acts.

**Three saved founder requirements close here** — CTA discoverability, Display Name removal, and Remove from Routine.

---

**Routine state is persisted, not inferred.** `PeptideSetup.routineState` is `needs-setup | active | inactive`. The old `active: boolean` could not express *added but not configured yet*, which is the whole reason the old flow forced a form up front. It survives as a derived legacy mirror — written on every save so a pre-3.9 build still reads the store, never branched on.

**`needs-setup` and `inactive` are not merged**, and that was the point of separating them: one means "I added this and haven't configured it", the other "I configured this and deliberately paused it". A list that conflates them tells someone their brand-new peptide is switched off.

**Removed is not a state.** A removed routine is simply no longer in the store. A tombstone would mean every list, count and lookup had to remember to exclude it, and the one that forgot would resurrect it.

**Legacy migration is by `active`, never to `needs-setup`.** Before 3.9 the only way a setup could exist was to have been created through the full form, so every stored one is configured *by definition* — including a pre-filled-pen user with no vial, whose missing vial data is a legitimate setup rather than an incomplete one. Nothing is rewritten on disk; the mapping happens on read, so a store still being written by an older build keeps working. Pinned by tests against the real parser rather than an in-memory double, which would have proved nothing.

---

**The daily model, and the one rule it exists to protect.** A schedule is a plan; a `PeptideLogEntry` is a fact; a **routine day status** is the user's answer about a planned day. Nothing converts a plan into an administration, in either direction.

**`unconfirmed` is the absence of a record, not a value.** This is the load-bearing design decision. If "no response" were storable, something would eventually have to decide *when* to write it — midnight, on read, on app open — and every one of those answers quietly converts silence into an assertion. Instead: a day the user answered has a record, a day they did not has nothing. `ROUTINE_DAY_STATES` is `['taken', 'skipped']` and a test asserts `isRoutineDayState('unconfirmed')` is false, so the state cannot be reintroduced by accident.

**Taken writes the log first and the status only if that succeeded.** A status saying *taken* with no administration behind it is the only genuinely corrupt state this feature can reach — a confirmed dose in the calendar that appears nowhere in history. If the write fails, the optimistic entry is rolled back out of memory and no status is written, so the day stays honestly unanswered.

**`linkedLogId` is what makes undo safe.** Only the administration a *Taken* created is removed with it, by id. A manual log has no status pointing at it and can never be swept up — someone who typed three entries by hand and then untaps Taken keeps all three. Pinned by tests.

**Skipped never creates an administration**, and never asks why.

**Persistence:** `vita:v1:peptides:routine:log:<YYYY-MM-DD>` on the shared day-keyed store, a sibling domain of the log store. The prefixes are disjoint — neither store can enumerate the other's days. Parsing is defensive in the same way logs are: a status whose own date contradicts its storage key is dropped rather than trusted, and a malformed `linkedLogId` drops the link while keeping the answer.

---

**Add to Routine is lightweight and immediately visible.** Tapping it creates a shell in `needs-setup`, toasts, and returns — no form. The CTA sits directly under the compound's name, above claims, mechanisms, studied-for, targets, status and sources; a test asserts its index precedes the first research heading, because *position* was the entire defect. It is state-aware: **Add to Routine** → **Finish Setup** → **View Routine**, so a tap always names the next real step.

**One current routine per definition.** `addToRoutine` returns the existing routine in any state rather than creating a second. The `setup/new` route was **deleted**: a second entry point that created setups directly was a hole in that guarantee.

**Saving Setup is what activates a routine** — no separate Activate button. Editing an already-configured routine keeps whatever state it had, so saving never quietly un-pauses something.

**Opening a routine no longer opens a form.** The new routine screen answers what people actually arrive with: today's status and actions, a human-readable schedule (`Mon, Wed, Fri`), a seven-day strip, recent history, a compact setup *summary* (`20 mg vial · 2 mL reconstitution`), then Edit Setup, Pause and Remove. The full form lives behind **Edit Setup**.

**Removing preserves everything.** Logs, injection-site history and recorded day statuses are all untouched — history resolves names through each log's own `definitionId` against the compiled catalog, so nothing becomes an *Unknown Peptide*. The confirmation says so out loud, because "remove" in a health app reads as "delete my records", and someone who believes that keeps a routine they no longer want just to be safe. Re-adding creates a fresh shell; the old history stays as separate historical records rather than being silently resurrected.

**The status strip carries shape and text, never colour alone** — ✓ taken, – skipped, ○ nothing recorded, blank for a day the schedule does not cover. Deliberately not a tick-and-cross: a cross reads as *wrong*, and skipping on purpose is not wrong. Every cell has an accessible sentence naming the date and state.

**No scoring of any kind.** No adherence, no compliance, no streak, no percentage, no "missed". A test sweeps the rendered home screen for all of them, and another sweeps the domain's exported names.

---

**Display Name is gone from the UI and preserved on disk.** A routine is named by its definition — one thing, one name. The stored value round-trips through the form invisibly: `applySetupChanges` deletes any key passed as `undefined`, so emitting nothing would have erased what an old setup was called the first time its owner edited anything else.

**Fuel now runs on real state.** The `getPeptideToday` shim — which told every user `1 of 3 logged` forever, describing a feature that did not exist and a goal VITA has never had — is **deleted**. The tile reads administrations actually recorded today, falls back to how many routines are scheduled, and draws no progress, because there is no target to divide by. It remains a summary and a door; Fuel grows no routine widget of its own.

**Manual logging is untouched** and reachable from the routine screen as *Add Log* — backdated entries, unscheduled administrations, As Needed routines, corrections and multiple administrations in a day all still need it. The 3.8C injection-site UX is reused verbatim in the Taken flow.

**66 new tests, 887 total**, across routine state and its transitions, legacy migration through the real parser, the state-aware CTA and its position, Display Name removal and preservation, daily status in every combination, Taken/log transaction integrity including a forced storage failure, undo semantics against manual logs, the strip's states, the routine screen, needs-setup, and the full eleven-step removal-preservation flow.

**Verified on device, Light and Dark.** One visual defect found by inspecting screenshots and fixed: the Taken sheet's amount field was collapsed to a sliver because the unit toggle had no width constraint. Add Peptide was also moved below the routine lists, where it no longer interrupts the scan.

**Boundary audit:** Water, nutrition, Home, the 72-entry catalog content, the calculator domain, `BodyMap` and `SiteSelector` all have a zero-line diff. No Supabase work. Slice 3.10 has not begun.

### Slice 3.8C — Body Map Tapability + Light Mode Contrast 🟡

**Objective:** founder QA on 3.8B was positive overall — **the body model is approved as a visual direction** — with two usability faults left: zones were hard to tap reliably, and in Light mode they were too faint against the silhouette. A narrow corrective slice. The site model, silhouette, taxonomy, fast list and copy are untouched.

**The tapping problem was a defect, not ergonomics.** Every zone was padded to 44pt *independently* — `max(rx, 22)` — which sounds correct and is wrong the moment two zones are closer together than 44pt. The three abdominal zones sit 19 units apart, so their boxes overlapped by 25pt and the later sibling won the tap:

| tap | selected |
|---|---|
| dead centre of **Left Abdomen** | Center Abdomen |
| dead centre of **Center Abdomen** | Right Abdomen |

**Left Abdomen could not be reached from the figure at all.** Upper arms also overlapped the abdomen, and the two glutes overlapped each other. Enlarging the targets further would have made it worse, not better.

**Touch areas are now authored as a partition.** Explicit rectangles, laid out together, that never overlap in either view. Vertical bands separate arms from abdomen from thighs; inside a band, boundaries sit at the midpoint between neighbouring zone centres — where a tap genuinely becomes ambiguous. Mirrored for the back view by the same rule as the art, so a back-view tap cannot land on the wrong glute.

**Where anatomy forbids 44pt, height compensates for width.** Three abdominal targets cannot each be 44pt wide across a 64-unit torso without colliding, and **a collision is worse than a narrow target** — a narrow target is fiddly, a colliding one records the wrong site. Those are 23–32pt wide by 79pt tall. Arms (52×113) and thighs (51×97) clear 44 in both axes; glutes are 37×54.

**The figure is drawn 9/8 larger**, which grows every target by the same eighth without making the body broad — the founder explicitly did not want a cartoonishly wide figure, so the invisible rectangles do most of the work. **1.125 rather than a rounder 1.15 because it is exact in binary**: at 1.15, two rectangles authored to share a boundary landed 1.4e-14pt apart — invisible on screen, and a real overlap as far as the collision test was concerned.

**Small silhouette spacing, as permitted:** arms moved 2 units further from the torso. Nothing else about the figure changed.

**Light mode contrast rebuilt as three levels.** A zone at 0.11 ink over a body at 0.14 is a step of about four percent — it survives review on a bright screen and vanishes on a real one. Now silhouette 0.13 → zone 0.24 → selected purple at 0.50 alpha, so unselected zones are plainly visible and the selection is unmistakable. **Dark mode is unchanged** apart from its selected-purple constant being pulled into the same theme-aware pair; its silhouette and zone values are byte-identical.

**No colour that means anything**, still: no green, no red, no scale, no ordering, nothing marked due, spent or safe.

**Accessibility unchanged in shape:** one `Pressable` per zone, so assistive technology sees exactly one element per site — the rectangle is bigger than the art, not a second thing to land on. A test counts host elements per label and fails on duplicates.

**10 new tests, 821 total** — pairwise non-collision in both views, every zone centre resolving to itself and nothing else, the three abdominal targets adjacent with no gap and no overlap, arms and thighs ≥44 in both axes, the anatomy-bound zones documented as narrow-but-tall, every target strictly larger than the art it covers, mirroring, and one accessible node per zone.

**Verified on device, Light and Dark:** front and back in both themes, Left Abdomen selected in Light, Right Thigh selected in Dark, and the selector sheet confirming that the taller figure did not push **Use Right Thigh** below the fold.

**Untouched:** taxonomy, log model, history behaviour, Site Reference copy, the fast site list, the calculator, Water, Fuel, Home, and all 3.9 scope.

**Boundary audit:** everything outside `BodyMap.tsx` and its tests has a zero-line diff.

### Slice 3.8B — Injection Site Visual + Selection Polish 🟡

**Objective:** founder QA found 3.8A's functionality substantially improved but did not approve it. This is the corrective polish pass — make everyday selection much faster, keep the figure as an optional aid, raise its visual quality, and rewrite the reference copy so it reads like product rather than notes. **Slice 3.8 remains unapproved until 3.8B passes founder device QA.**

**The list is the fast path; the figure is the optional one.** 3.8A put a full anatomical model between the user and a choice they already knew. Logging is done in a hurry, standing up, several times a week. Tapping the row now opens a flat list of all ten canonical sites and **one tap records it** — no region-then-side, no confirm step, no figure in the way. Two taps total from the log form.

**The region → laterality workflow is gone.** Asking for *Abdomen* and then *Left* is a reasonable way to model a body and a poor way to choose from ten known places. `SITE_PICKER_ORDER` lists every site as its own row, ordered top-of-body down and grouped by region so it scans without headings. The order carries **no preference** — it is anatomy, not a ranking — and `custom` sits last because it is the escape hatch, not the least advisable choice. A test asserts the bare region headings no longer appear anywhere in the picker.

**`View Body Model` sits under the list**, reachable from both New Log and Edit Log — never only through Settings → Tools. It answers a genuinely different question, *which one is that?*, and someone who wants it should not have to leave the form.

**One component, two contexts.** `BodyMap` is unchanged between logging and Tools; only what wraps it differs. From a log it is a picker that returns a site; from Tools it is a lens onto history that records nothing. There is no second implementation.

**Nobody wonders whether the tap registered.** Selecting a zone highlights it, names it under the figure, and the confirm button reads **Use Left Abdomen** rather than a bare *Done*. Opening the model from a log that already has a site opens on that site's view with it already highlighted and already confirmable.

**The silhouette was redrawn.** Roughly seven-and-a-half heads, a real shoulder line, a waist that narrows, hips that flare, and arms held clear of the torso so an upper-arm zone is visibly on an arm. The straight-edged limbs of 3.8A were what made it read as a developer's SVG demo.

**Three rendering defects found by inspecting screenshots, not by tests:**

1. **`ClipPath` did not apply on device.** Zones were meant to be clipped to the silhouette so each took the shape of its limb. It rendered unclipped — ellipse outlines crossing the body edges. Replaced with geometry: each zone is sized to sit inside the limb it marks, verified on screen.
2. **Translucent overlapping shapes accumulated alpha**, drawing a bright band across the hips where the legs met the torso and a notch under the chin. Fixed by filling with solid ink inside a group that carries the opacity — the group composites once, so joins are invisible.
3. **The arms sat almost inside the torso**, leaving a sliver of gap, and the arm zones bled across the boundary. Torso narrowed, arms moved outward; the gap is now unambiguous at a glance.

**Zones are unstroked fills.** An outlined ellipse reads as a sticker on a drawing; a soft patch of lighter fill reads as part of the body. The selected zone adds a purple fill and a centre marker, because on a narrow limb the patch alone is too subtle a change.

**Still no colour that means anything.** No green, no red, no scale, no ordering, nothing marked due, spent, or safe. The only visual state a zone has is *selected*, in peptides purple.

**Front / back mirroring is unchanged and still pinned.** The figure remains a self-view — your left on the left of the screen — with the back view derived as a mirror.

**Tools → Injection Sites re-tiered**: title, one-line subtitle, the body as the focal point, per-zone history only when a zone is selected, compact Recent Sites, then Site Reference. It no longer reads as a text page with a diagram inserted into it.

**Site Guide → Site Reference**, rewritten flat and clinical: *Front abdominal area.* · *Upper portion of the leg.* · *Upper portion of the arm.* · *Gluteal area on the back of the body.* · *Use a custom label for another location.* **Other** gained an entry, so the custom option is no longer the one choice with nothing explaining it.

**Safety copy reduced to one line, stated once:** *For tracking and anatomical reference only.* A test asserts it appears exactly once. The boundary is real and is stated — repeating it under every block made the screen read as nervous, and nothing on it offers advice to disclaim.

**Removed as dead:** `SITE_GROUPS` and `siteShortLabel`, both of which existed only for the two-step chip picker.

**12 net new tests, 811 total** — several 3.8A tests were rewritten rather than added, since the interaction they drove no longer exists. New coverage: every canonical site listed and recordable in one tap, no region headings, single-tap commit with no confirmation, the current value marked on reopen, clear, custom, the mandatory log → body model → confirm → save → persisted route flow, editing through the model with the existing value highlighted, and the boundary line appearing exactly once.

**Verified on device, Light and Dark:** the fast list, the log form with a site recorded in §20's order, the body model on Front and Back with a selection, Tools unselected, Tools with a zone selected showing its history, and Site Reference. Migrated 3.8 records still read *Left Abdomen* and *Right Glute*, and the authored *Left Hip* is unchanged.

**Still prohibited, and still absent:** recommended next site, rotation schedule, site-rest timers, over-use warnings, adherence.

**Untouched 3.9 scope:** Add to Routine, Needs Setup, Taken / Skipped, routine calendar, Track CTA discoverability, Display Name removal, Remove Setup.

**Boundary audit:** Water, Fuel, Home, nutrition, `package.json`, `supabase/`, the 72-entry catalog, the calculator core (`dose.ts`, `units.ts`, `UnitConversion.tsx`) and the log snapshot model (`logs.ts`) all have a zero-line diff.

### Slice 3.8A — Injection Site UX + Interactive Body Map 🟡

**Objective:** fix the two things founder QA rejected in 3.8 — injection-site selection that never appeared in the Log Peptide flow actually being used, and a standalone Injection Sites tool that was mostly text where a body was wanted. **Slice 3.8 remains unapproved until this passes founder device QA.**

**The reported defect, and what it actually was.** The founder's screenshot showed **New Setup**, not Log Peptide. Site selection was never on New Setup and does not belong there — a setup is configuration, a site is something that happened — so nothing was added to that screen. What was missing was a way to *reach* the log form after creating a setup: New Setup dismissed back to the list, leaving the new peptide's Log screen several taps away. Creating a setup now routes straight to it, and the exact founder path is pinned by a route-level test rather than a component test, because a component test would have passed on the broken build.

**A flat taxonomy replaces region-plus-side.** 3.8 modelled a broad region and a side, which could not express **Center Abdomen** — a site the founder uses — and left `abdomen` + `none` ambiguous between *the middle* and *I didn't say*. Every site is now one canonical key: three abdominal, two thigh, two upper arm, two glute, plus `custom`.

**3.8 records are migrated on read, never rewritten on disk.** A log stored as `abdomen` + `left` resolves to *Left Abdomen* exactly as a new one does. The one place a stored label is deliberately overridden is here: 3.8 generated labels in a format that no longer exists (`Abdomen · Left`), and leaving them verbatim put two spellings of one place side by side in the same list. **Authored** text is still sacred — a custom site typed as *Left Hip* stays *Left Hip* forever. Confirmed on device against seeded legacy records.

**New — `BodyMap`.** An original SVG figure drawn as primitives: head, torso, arms, legs, deliberately neutral, no gender, no musculature, no medical-textbook detail. **No external or copyrighted artwork, and no traced illustration.** Zones are ellipses rather than traced anatomy, because the claim being made is *roughly here on your body* and a precise outline would imply a precision about placement VITA has no business implying.

**Every zone is styled identically.** No colour scale, no green or red, no ordering, no marking of a site as due, spent or safe. The only visual state a zone has is *selected*, in peptides purple — a colour that carries no safety meaning anywhere else in the app. A body map is the easiest surface in this feature to accidentally imply a recommendation.

**The figure is a self-view, and this is a deliberate decision.** *Your left* sits on the **left of the screen** — the side your left hand is on when you look down at yourself. Medical illustration uses the opposite convention because its reader stands opposite the patient; VITA's reader is the person being injected. The back view is the front **mirrored**, derived rather than authored, so the two cannot drift apart.

**A real defect found by comparing screenshots, not by a test:** before that mirroring, Left Abdomen and Left Glute both rendered on the same side of the screen — wrong under *either* convention. Now pinned by two tests asserting relative zone positions, so a future refactor cannot silently flip it.

**Touch targets are real views over the drawing**, not pressable SVG shapes. SVG primitives cannot carry an accessibility role or selected state, and every zone gets at least a 44pt box whatever the ellipse beneath it looks like, so nobody pixel-hunts an arm.

**The map never becomes the only path.** The selector pairs the figure with the same choices as text chips, and either records the identical canonical site. That list is not an accessibility afterthought — it is faster for someone who already knows the site they want, and it is the path VoiceOver can use with confidence.

**Still never preselected.** The field starts empty every time, including when a previous site exists. The last site is shown as a line of context — *Last recorded · Center Abdomen* — because filling the field in with it would turn a record into a suggestion.

**Tools → Injection Sites, rebuilt around the figure.** The map is the hero; tapping a zone reports that zone's history (*Last recorded {date} · N logs*, or *No history recorded here* — plainly, never styled as available). Recent sites aggregate across every peptide, because that is how sites are actually used. The site guide is four lines, not four paragraphs. Tapping a zone here records nothing; the screen is a lens onto history, not a logging surface.

**31 new tests, 799 total.** Covering the expanded taxonomy, 3.8 records migrating on read with generated labels restated and authored labels preserved, the route-level regression for the founder's exact path, per-zone history, the empty-zone case, the front/back mirror convention, and the existing prose and export sweeps extended to the new surfaces.

**Verified on device, Light and Dark:** the Log Peptide screen showing the Injection Site row with last-recorded context, the selector sheet on Front with Left Abdomen selected on the figure and in the chips simultaneously, the sheet on Back with Left Glute correctly mirrored, and Tools → Injection Sites both unselected and with a zone selected showing its history — including migrated legacy records reading *Left Abdomen* and a preserved custom *Left Hip*. Three visual defects were found by inspecting those screenshots and fixed: the legacy label format, colliding abdomen zones on a poorly proportioned figure, and the front/back mirror.

**Still prohibited, and still absent:** recommended next site, rotation schedule, site-rest timers, over-use warnings, adherence. The export-name sweep still fails on *recommend*, *suggest*, *next*, *rotate*, *avoid*, *due* or *safe*.

**Still open, unchanged and untouched by this slice:** the **Track this peptide** CTA discoverability item, the approved removal of **Display Name (Optional)** from Peptide Setup, and **Remove Setup preserving history** — all 3.9.

**Boundary audit:** Water, Fuel, Home, nutrition, `package.json`, `supabase/`, the 72-entry catalog, the calculator core and the log snapshot model all have a zero-line diff.

### Slice 3.8 — Injection Site Tracking 🟡

**Objective:** let a user record where an administration happened, see what they have used recently, and stop having to remember it. **Not** to tell anyone where to inject.

**The line this slice does not cross.** There is no recommended site, no next site, no rotation algorithm, no colour coding of good and bad, and no "safe to use again". VITA stores what the user says and can tell them what they did before; deciding where to inject is theirs. A test enumerates the domain's exports and fails on any name containing *recommend*, *suggest*, *next*, *rotate*, *avoid*, *due* or *safe* — the guarantee is structural, not a habit.

**Taxonomy, deliberately shallow.** Abdomen · Thigh · Upper Arm · Glute · Other, with Left / Right / Center where sides mean anything. Subdividing the abdomen into quadrants would be precision nobody asked for and a selector nobody wants to scroll.

**The site is a snapshot on the log entry**, like the dose conversion beside it. `label` is written once at record time, so a custom site typed as "Left Hip" still reads "Left Hip" years later rather than being re-derived into "Custom · Left". A custom label wins outright and forces `side: 'none'` — "Left Hip · Right" would be nonsense.

**Additive, with no migration.** Entries written before 3.8 have no site and load unchanged. A **malformed** site drops the site and keeps the entry: a log whose amount and time are intact is still a true record, and discarding it because one optional field rotted would destroy more than it protects.

**Optional at every step.** Saving is never blocked on a site. The picker sits after the amount so anyone who does not track sites scrolls straight past, and logging stays open → type → save.

**Never preselected — the decision this slice turns on.** A previous site is shown as `Last recorded · Abdomen · Left` and the field itself stays empty. Prefilling it would turn a record into a suggestion: the user would be accepting VITA's answer rather than stating their own. Pinned by test, on the picker and after save.

**Two-step picker** (region, then side) built on React Native's own `Modal`, matching `CategorySelector`. Five options then three, rather than a combinatorial grid. Every option is styled identically, on purpose.

**History integration** keeps rows two lines whether or not a site exists — the site shares the time line rather than adding a third, because a list that grows taller for every optional field becomes a table. Editing prefills the site, can change it, and can clear it; **changing where it happened never touches what was drawn**, since those are independent facts about one event. Undo restores the site with the rest of the record.

**Tools → Injection Sites** aggregates across every peptide, because that is how sites are actually used — someone rotating locations does it across whatever they are taking, not per compound. Recent records name their own compound, resolved from the compiled catalog rather than the setup, so history stays readable for inactive setups and survives the Remove Setup action planned for 3.9. A plain **Sites used** tally follows, and a **Site guide** explains the four anatomical words in one sentence each, with no needle angle, depth, technique or compound-specific guidance.

**Body diagram: deferred, deliberately.** §26 makes it optional and secondary, and the founder did not require one. A stylized silhouette with tappable regions is a real graphics project, and its only advantage over a five-item list is aesthetic — while its risk (regions reading as recommended or discouraged) runs directly against this slice's central constraint. Reliable tracking, a clean selector, history and Tools were the stated priorities and all four shipped. Recorded as a candidate if selection ever proves to be the friction.

**45 new tests, 768 total.** Covering labels and laterality, custom labels surviving storage, pre-3.8 entries loading, malformed sites dropping without taking the log, edit/clear/Undo, several sites in one day, last-recorded skipping entries that recorded none, cross-peptide aggregation ordering, inactive-setup history, and two prose sweeps asserting no recommendation language reaches the screen.

**Verified on device**, Light and Dark: the picker sheet, an optional and empty site field with last-recorded context beneath, history rows with and without sites, and the Tools screen showing cross-peptide history, counts and the guide.

**Carried forward to 3.9/3.10, all three still open and unimplemented:** (A) **Track this peptide** CTA discoverability on long detail pages; (B) removal of **Display Name (Optional)** from Peptide Setup; (C) a deliberate **Remove Setup** action that preserves historical log entries.

**Tools is a growing utility destination** — Peptide Calculator, Injection Sites, and a recorded future candidate for food/product scanning. Not surfaced on Dashboard; that remains a separate roadmap idea.

**Boundary audit:** Water, Fuel, Home, nutrition, `lib/daily`, `package.json`, `supabase/`, the 72-entry catalog and the calculator all have a zero-line diff.

### Slice 3.7 — Peptide Logging + History 🟡

**Objective:** turn a peptide setup into real tracking. Record an administration, keep it as a historical fact, and show it back.

**The rule the whole slice is built around: a log entry is a snapshot, never a view.** Someone who logged 2 mg from a 20 mg / 2 mL vial drew 20 units that day. Reconstitute the next vial with 1 mL and the *same* 2 mg becomes 10 units — but the syringe already pushed held 20, and the record must still say so. Recomputing history from the current setup would quietly rewrite what happened, which is the difference between a health record and a spreadsheet formula.

**`PeptideLogEntry`** carries everything needed to render it years from now: the amount as authored *and* in canonical micrograms, the local calendar day, the exact instant, optional notes, and a `calculationSnapshot` holding the vial, water, graduation density and the resulting units and volume. `definitionId` is denormalised beside `setupId` so an entry can still name its compound independently.

**The snapshot is absent when the setup had no vial or water** — a normal state, not a failure. Someone using a pre-filled pen has nothing to reconstitute, and logging is never blocked on calculator information. Those entries simply have no unit line; there is deliberately no `— units` placeholder, which would imply a number went missing.

**Editing keeps the entry's own context.** Correcting 2 mg to 1 mg on a log from a 20 mg / 2 mL vial recomputes against *that* vial, not today's. An entry that never had a snapshot does not acquire one by being edited — gaining a conversion months later, from a vial that may not be the one it came from, would be an invention rather than a correction.

**Persistence** is day-partitioned on the shared `createDayKeyedStore`, the same shape water entries and the food log use: `vita:v1:peptides:log:<YYYY-MM-DD>`. A log grows without limit and the day is the unit that is read and written together. `parseLogEntry` receives the day it was read from, so an entry whose own `logDate` contradicts its key is dropped rather than double-counted.

**The provider keeps a bounded window** — 60 days — rather than eagerly loading all history forever, and reads older days on demand. It also gained a **day rollover**, because administrations are day-keyed where setups never were: an entry made at 00:05 must land on the right day without an app restart.

**Routes:** `/peptides/setup/[id]/log` to record, `/peptides/setup/[id]/history` for the full list, `/peptides/log/[id]` to read, edit or delete one. The entry detail is keyed by the entry rather than nested under its setup, because an entry is a durable record in its own right — it survives deactivation, and any history row can link straight to it.

**Fast by default.** Open a setup, tap **Log Peptide** (first action on the screen, above configuration), type an amount, save. Date and time default to now and are editable in place through VITA's existing text-plus-chip pattern rather than a custom calendar. The amount unit is seeded from `preferredDoseUnit`; **the amount itself is never prefilled** — not a scheduled figure, not the last thing logged, not a typical one.

**Scheduled and logged stay separate concepts.** A row on the Peptides screen now says "Logged today" or "Logged 2× today" from real entries — a plain fact about what was recorded, never that something was due, missed, or expected. There is no adherence percentage, streak, or compliance score anywhere, by design.

**Delete asks, then offers Undo anyway**, reusing Water's toast. Between a confirmation and a reversal, the reversal is what actually protects someone who meant to tap the row above; `restoreLog` puts the record back with its original id and timestamps rather than creating a copy.

**A real defect found in device QA and fixed:** the edit form initialised its date from `loggedAt.slice(0, 10)` — the **UTC** slice of the ISO string. An 8:30 PM administration stores as the next day in UTC, so the editor opened showing tomorrow's date and would have moved the entry on save. Now derived through `toLogDate`, and pinned by two tests. This is exactly the trap the shared date model exists for, and it took a screenshot to see it.

**Shared helpers promoted** to `lib/daily`: `formatClockTime`, `toTimeInput`, `fromDateAndTime`. Features cannot import each other, so Water's local `timeLabel` stays where it is — folding it in belongs to a slice already touching Water.

**80 new tests, 723 total.** The mandatory regression is pinned literally: log 2 mg from 20 mg / 2 mL, change the setup to 1 mL, and the old entry still reads 20 units. Also covered — mg/mcg normalisation, authored-unit preservation, missing snapshots, multiple entries per day, ordering, day filtering, cross-midnight edits, Undo fidelity, and read-time validation dropping malformed records without repairing them.

**Verified on device**, Light and Dark: the setup screen with Log Peptide and Recent Logs, the log form, day-grouped history newest-first with `500 mcg` preserved as written, the entry detail with its Conversion Used block, and "Logged 2× today" on the Peptides list.

**Still open, both recorded and unresolved:** the **Track this peptide** CTA discoverability item, and the approved removal of **Display Name (Optional)** from Peptide Setup — both 3.9/3.10 polish.

**Product decisions taken:** inactive setups keep full history and can still be logged if the user opens them deliberately, but are never surfaced as active logging prompts. Undo was implemented rather than deferred, since the Toast already supported it. `PeptideLogEntry` is left extensible for slice 3.8's injection sites with **no speculative nullable field** — adding one later is purely additive.

**Boundary audit:** Water, Fuel, Home, nutrition, `package.json`, `supabase/`, the 72-entry catalog and the calculator core all have a zero-line diff. `lib/daily` gained three additive helpers and nothing else.

### Slice 3.6E — Calculator Polish + Custom Conversion 🟡

**Objective:** the automatic conversion model is approved; this finishes it. Professional casing, one compact custom converter for amounts the generated table cannot reach, and the vial unit toggle corrected.

**Field labels are Title Case; section metadata stays uppercase.** `Vial Amount (mg)`, `Bacteriostatic Water / Reconstitution (mL)`, `Display Name (Optional)`, `Custom Amount`, `Date (YYYY-MM-DD)` — against the established `VIAL` / `UNIT CONVERSION` / `PREFERRED UNIT` metadata style. Sentence case and title case no longer mix inside one form. Scientific casing is untouched: `mg`, `mcg`, `mL`, `U-100`, `GHK-Cu`, `MOTS-c` all render exactly as authored, protected by `formatLabel`'s existing rule.

**The automatic reference is unchanged and remains primary.** 20 mg / 2 mL still shows `1 mg = 10 units` with its table, before anything else is entered.

**Custom Conversion**, for what the table cannot cover. A generated reference around a low-mass vial lists single micrograms while a user may be thinking in hundreds; sending them to a second calculator for that would be absurd. One field plus a mg/mcg toggle, and the answer inline: `= 20 units`.

It is deliberately **subordinate**: inside the same card, below a hairline, under a micro heading matching the table's own column labels — not a second card and not a peer section. The founder's objection to three previous designs was an input taking over the page.

| Property | Behaviour |
|---|---|
| Starts | blank; nothing pre-filled, nothing suggested |
| Optional | blank shows no error, and the reference above is unaffected |
| Output | syringe units only — no second mass card |
| Persistence | none; state is local to the component, so `Save setup` cannot see it |

**The vial unit toggle now converts instead of reinterpreting** — the defect flagged at the end of 3.6C. `20 mg` becomes `20000 mcg`, not `20 mcg`. This one **persists**, so a test asserts the emitted canonical `amountMcg` is byte-identical across a switch and a round trip: reinterpreting would have changed a saved vial by a factor of a thousand.

**One shared helper**, `convertAuthoredAmount()` in `model/units.ts`, now serves all three toggles (vial inline, vial standalone, custom amount). It rewrites only a *complete* number — `Number('1.')` is `1`, so parsing alone would turn someone half-way through typing "1.5" into "1000" — and runs only on an explicit toggle press, never while typing.

**The custom unit is seeded from the vial once, then independent.** Toggling the vial cannot silently reinterpret something already typed below it, the same separation applied to preferred unit in 3.6C.

**Helper copy tightened**: the standalone intro now reads *"Enter your vial amount and reconstitution volume to view the U-100 unit conversion."*

**28 new tests, 643 total.** Both surfaces run the same parameterised suite: automatic reference regression, custom mg and mcg conversion, an amount the table never reaches, custom unit round-trip, vial toggle round-trip with no drift, half-typed text preserved, blank staying silent, invalid input never producing NaN, fractional units, results past a full barrel with no advice, Done accessory on all three fields, and canonical-persistence equivalence.

**Verified on device**, Light and Dark: standalone 20 mg / 2 mL with `2 mg → 20 units` and `200 mcg → 2 units`, and inline on a 50 mg / 5 mL GHK-Cu setup with its compound name casing intact.

**Still open:** the peptide detail **Track this peptide** CTA discoverability item.

**Boundary audit:** Water, Fuel, Home, nutrition, `package.json`, `supabase/`, the 72-entry catalog and the research components all untouched. No logging, no injection sites.

### Slice 3.6D — Automatic Unit Conversion 🟡

**Objective:** delete the amount input. The vial and the water already determine the entire relationship between mass and syringe units, so asking for a third number made the user do arithmetic before VITA would do arithmetic for them.

**What was wrong with 3.6/3.6B/3.6C.** All three kept a target-amount field, and each revision refined a question that should not have been asked. A user holding a reconstituted vial does not want to be interrogated; they want to know what the marks on the syringe are worth. That is a property of the vial, not of an intention.

**The whole interaction is now two numbers in, a reference out.**

```
Vial amount        10 mg
Reconstitution      1 mL
──────────────────────────
UNIT CONVERSION
1 mg = 10 units
Concentration · 10 mg/mL

AMOUNT      SYRINGE UNITS
0.5 mg              5 units
1 mg               10 units
2 mg               20 units
3 mg               30 units
4 mg               40 units
5 mg               50 units
Using U-100 · 100 units/mL
```

No Amount field, no mg/mcg toggle inside the conversion, no Calculate button, no result waiting on a third input.

**`unitConversionReference()` is a new pure function** in `model/dose.ts`, built on the existing `resolveConcentration` so there is still exactly one place the arithmetic lives. Values are always derived; nothing in the founder's examples is hard-coded.

**The headline picks its own scale.** One whole authored unit wins whenever it is legible — "1 mg = 10 units" is the sentence people repeat to themselves, and opening on "0.5 mg = 5 units" would be equivalent and harder to carry. Only when that lands outside a readable band (1–100 units) does it fall back to a ladder and choose the candidate nearest a comfortable mid-barrel reading. A 5000 mcg vial in 2 mL headlines **500 mcg = 20 units**, because "1 mcg" there is four hundredths of a syringe mark.

**Rows are the primary amount × 0.5, 1, 2, 3, 4, 5**, which reproduces the founder's worked table exactly for 10 mg / 1 mL and stays sensible elsewhere. Rows that would exceed twice a full barrel are dropped; the primary always survives, so the reference can never come back empty.

**No row is recommended, and none can be.** Nothing is highlighted, reordered by desirability, or described as typical, standard or starting. The table is a ruler — the user reads the line they need, and VITA does not point at one. A test sweeps the rendered screen for that vocabulary.

**Deleted:** `DoseCalculatorPanel`, `DoseResult`, their tests, and every trace of *Amount* / *Amount being used* / *Amount to convert* and the amount unit selector. `calculateSyringeUnits` and `calculateAmountFromUnits` stay in the domain — the reference is built from the former, and the latter is the inverse that keeps the forward maths honest.

**Unchanged:** inline placement directly beneath the Vial section, derivation from live draft state with no Save required, the standalone Tools calculator (now two inputs, not three), the U-100 assumption with no capacity selector, the Done accessory on both numeric fields, and `Save setup` persisting nothing from the conversion.

**37 tests, 615 total.** Both surfaces run the same parameterised suite, and the founder's mandatory sequence is pinned: type `10` and `1` → **1 mg = 10 units**; change water to `2` → **1 mg = 20 units**; change vial to `20` → **1 mg = 10 units**, with nothing else ever entered.

**Verified on device**, Light and Dark: inline at 10 mg / 1 mL and 10 mg / 2 mL, and the standalone tool at 20 mg / 2 mL, each matching the founder's expected output exactly.

**This design is materially easier to trust than its predecessors**, because there is nothing to type beyond the vial — the failure mode that broke 3.6 (a keyboard hiding a result the user was mid-way through producing) no longer has an input to hide behind. Founder confirmation on a real iPhone is still the acceptance gate.

**Still open:** the peptide detail **Track this peptide** CTA discoverability item.

**Boundary audit:** Water, Fuel, Home, nutrition, `package.json`, `supabase/` and the 72-entry catalog untouched. No logging, no injection sites.

### Slice 3.6C — Final Unit Calculator UX Correction 🟡

**Objective:** one simplification, from founder device review of 3.6B. The calculator answers a single question — *given this concentration and this amount, how many syringe units is that?* — and the interface should say nothing more than that.

**Syringe units are the only output.** The domain still normalises to micrograms internally, but micrograms never surface as a *result*. No second mcg figure, no `1 unit = X mcg`, no units → mass converter, no quick-reference table. Every extra output would be another number competing to be the one the user acts on, and only one of them is drawn into a syringe. `calculateAmountFromUnits` stays in the domain, tested and unused by any screen — it is the inverse that keeps the forward maths honest, not a feature.

**Result hierarchy rebuilt** so units are the only large number. Volume moved out from under the headline into the supporting block:

```
CALCULATED SYRINGE AMOUNT
20 units                        ← the only display-size text
─────────────────────────
Equivalent volume · 0.2 mL
Concentration · 10 mg/mL
2 mg = 0.2 mL = 20 units        ← quieter still
Using U-100 · 100 units/mL
```

**Renamed.** *Amount being used* → **Amount**; section header *Calculator* → **Unit calculator**. Shorter, neutral, and it still says whose number it is: the user supplies it, VITA converts it.

**Switching mg ⇄ mcg now converts rather than reinterprets.** `2 mg` becomes `2000 mcg` and the answer does not move; `500 mcg` becomes `0.5 mg`. This is the single most dangerous thing the screen could get wrong — reinterpreting would shift the amount by a factor of a thousand while the digits sat still — so it is pinned by a round-trip test in both directions.

Two guards on that conversion:

- **Only a complete number is rewritten.** `Number('1.')` is `1`, so parsing alone would turn someone half-way through typing "1.5" into "1000". A `/^\d*\.?\d+$/` check means blank or mid-typing text is left exactly as it is.
- **It is a single explicit action on press**, not an effect reacting to state, so there is no loop, no bouncing value, and no cursor fighting the user.

**Preferred unit now seeds the calculator once and then lets go.** Previously the amount unit read the setup's display preference on every render, so changing *Preferred unit* lower down the form silently reinterpreted an amount already typed above it. They are separate concepts — the same correction the founder made about Water's display unit in slice 3.3 — and a test pins it.

**Unchanged and re-verified:** inline placement directly under the Vial section; calculation from live draft state with no Save required; the section staying visible with a helper line when the vial is incomplete; blank staying quiet; the U-100 assumption with no capacity selector; the Done accessory on all three numeric fields; the standalone Tools calculator; the removed setup-specific route; and `Save setup` persisting no calculator state.

**10 new tests, 625 total.** The additions cover unit-switch conversion in both directions, the round trip, blank and half-typed text, preferred-unit independence, clearing and re-entering the amount, and three assertions that no mcg output or reverse conversion exists on screen.

**Verified on device**, Light and Dark: standalone 20 mg / 2 mL / 2 mg → **20 units**, standalone 5 mg / 2 mL / 500 mcg → **20 units** with concentration correctly shown as `2.5 mg/mL` in the vial's own unit, and the inline surface reading NAME → VIAL → **UNIT CALCULATOR** → PREFERRED UNIT.

⚠️ **Typing is still proven by tests rather than by hand** — engineering has no tap or type access to a simulator, so founder confirmation on a real iPhone remains the acceptance gate.

**Observation, not changed:** the *vial* unit toggle still reinterprets rather than converts, because it feeds a value that gets **saved**, and changing that touches 3.5 persistence behaviour the founder did not ask to revisit. Worth a decision in the Peptides polish pass.

**Still open:** the peptide detail **Track this peptide** CTA discoverability item.

**Boundary audit:** three files changed, all under `src/features/peptides`. `model/dose.ts` has a zero-line diff. Water, Fuel, Home, nutrition, `package.json`, `supabase/` and the 72-entry catalog untouched. No logging, no injection sites.

### Slice 3.6B — Inline + Standalone Peptide Calculator 🟡

**Objective:** put the calculator where people actually need it, and make the number pad dismissible. Founder device QA on 3.6 showed the design was wrong, not just the implementation — the only way to reach a calculator was through a peptide setup you had already created, and iOS's decimal pad has no return key, so the keyboard could not be put away.

**The design error 3.6 made.** A calculator that requires you to first create and save a tracked peptide is a calculator you cannot use with a vial in your hand. Working out how many units to draw is a *question*, not a *record*.

**Two surfaces, one calculator.**

| Surface | Where the vial comes from |
|---|---|
| **Inline**, in the peptide setup form | the live draft text in the fields above it |
| **Standalone**, Settings → Tools → Peptide Calculator | its own fields; no peptide, definition or setup involved |

`DoseCalculatorPanel` is the single component behind both, so they cannot drift in arithmetic, wording, validation or layout. The surfaces differ *only* in where the vial numbers originate.

**The inline calculator works before anything is saved.** It reads the draft values in the form — type `20 mg`, `2 mL`, `2 mg` and the answer appears, with no Save, no navigation and no persisted setup. Changing the vial, the water or the unit recalculates immediately.

**Placement** follows the founder's hierarchy exactly: NAME → VIAL → **CALCULATOR** → PREFERRED UNIT → SCHEDULE → START DATE → NOTES → Save. Directly under the vial it depends on, not buried at the bottom.

**The amount is owned by the panel and never leaves it.** Neither host can read it, which makes "the calculator persists nothing" a structural fact rather than a rule to remember: `Save setup` cannot capture the amount because it cannot see it. A test asserts the form's `onChange` payload never contains it.

**The section stays visible when the vial is incomplete**, with one line — *"Add vial amount and reconstitution volume above to calculate syringe units."* Hiding it would leave a user unaware the calculator exists.

**Keyboard, the defect that broke 3.6.** iOS's `decimal-pad` has no return key. New `NumericField` + `NumericKeyboardAccessory` put a **Done** bar above the pad via `InputAccessoryView` (iOS-only, guarded; Android's pad has its own dismiss). One accessory per screen, shared by every numeric field through a single `nativeID`. `Screen` gained an **opt-in** `keyboardAware` prop — taps outside a field dismiss instead of being swallowed, dragging dismisses, and extra bottom padding lets the foot of a form clear the keyboard. Opt-in on purpose: no existing screen changes behaviour.

**Old surface removed.** `/peptides/setup/[id]/calculator` and its "Dose / unit calculator" button are gone. Inline covers the in-context case and Tools covers the standalone one; a third destination would have been duplicate navigation for no gain. Deleting the route also removes the `[id]/` directory that sat beside `[id].tsx`.

**Tools** is a new Settings destination for utilities that stand on their own — things you use once and walk away from, without tracking or saving anything. Deliberately not a fifth dock tab. **Built to grow, not padded**: slice 3.8's injection-site work is the obvious next tenant, and there are no placeholder rows in the meantime, because a dead button is worse than a short list.

**Accessibility.** `PressableScale` now announces `accessibilityRole="button"` whenever it has an `onPress` — the app-wide gap recorded in 3.6A, fixed here because §36 needed it. `SegmentedTabs` gained an optional `groupLabel`: a screen with three identical mg/mcg toggles gave a screen-reader user three indistinguishable "mg" buttons, and they now read "Vial unit, mg" and "Amount unit, mg". `ListRow` passes an `accessibilityHint`.

**37 new interaction tests, 615 total.** These are the coverage that was missing: they start from an empty form and type into fields located by accessibility label in the rendered tree, rather than handing a component values the UI would have had to produce. Both surfaces are driven through the same suite — the founder's four pinned cases, live recomputation, validation, the consistency note, keyboard wiring, and the Tools route.

**Verified on device**, Light and Dark: standalone blank state, standalone 20 mg / 2 mL / 2 mg → **20 units**, inline in a saved setup → **20 units**, and the Tools list. **The remaining gap is honest**: typing itself is proven by the interaction tests, not by a device, because tapping and typing are still unavailable from the engineering environment. Founder confirmation on a real iPhone is the acceptance gate.

**Still open:** the peptide detail **Track this peptide** CTA discoverability item, unchanged from 3.6A.

**Boundary audit:** Water, Fuel, Home, nutrition, `src/lib/daily`, `package.json`, `supabase/` and the 72-entry catalog content all have a zero-line diff. No logging, no injection sites.

### Slice 3.6A — Calculator Real-Interaction Hotfix 🔴 BLOCKED

**Slice 3.6 is not approved.** Founder device QA (2026-08-25): the calculator does not work through the real app.

**Blocked on reproduction, not on effort.** The authorization requires the defect to be reproduced through real interaction (§3) and makes real-interaction acceptance QA mandatory (§13). Neither is currently possible from the engineering environment:

| Path | Result |
|---|---|
| `Claude_Code_iOS_Simulator` control | Returns "Xcode is installed but not selected" — **spurious**: `xcode-select -p` already resolves to `/Applications/Xcode.app/Contents/Developer`. A known false failure in this project. |
| Screen control of the Simulator app | Access requested and **declined**. |
| `autoFocus` to raise the keyboard without a tap | Software keyboard never appeared — the simulator has a hardware keyboard attached. |

No fix was committed. Guessing at a repair for an unreproduced defect is what §4 forbids, and shipping one would risk a second failed review.

**What was ruled out**, tap-free, before stopping:

- **Route registration.** Both `/(vita)/peptides/setup/[id].tsx` and `/(vita)/peptides/setup/[id]/calculator.tsx` are present in the compiled iOS bundle. `[id].tsx` and the `[id]/` directory coexisting is *not* a collision.
- **Setup screen reachability.** `/peptides/setup/<id>` renders the full edit form on device.
- **Calculator route reachability.** `/peptides/setup/<id>/calculator` renders correctly on device with a seeded setup.
- **Provider scope.** `PeptideProvider` is mounted at `app/_layout.tsx`, above every peptide route.
- **Entry-point href.** `router.push(\`/peptides/setup/${encodeURIComponent(setup.id)}/calculator\`)`; `newId()` produces `setup_<base36>` with no characters that affect path segmentation.
- **Persistence.** `SetupForm.emit()` always emits the complete object, so a partial edit cannot drop the vial; `applySetupChanges` only deletes keys actually present in the patch, so saving an untouched form is a no-op.

**The real process failure, and it is mine.** Slice 3.6 reported "verified on device" for six cases. Every one of those screenshots was taken with the amount **hardcoded into `useState`**. The single screenshot taken with the real empty initial state showed no result, correctly, and was read as the pristine state. **Typing was never exercised on a device — only `onChangeText` called directly from a test, which is the same call React Native makes and therefore proves nothing about whether a user can reach it.** That is the coverage blind spot that let 605 passing tests coexist with a non-functional feature.

**Leading hypothesis, unconfirmed: keyboard handling.** The app has **no keyboard handling anywhere** — no `KeyboardAvoidingView`, no `keyboardShouldPersistTaps`, no dismiss affordance, in any screen. Every other input screen in VITA is *type, then tap a button*, where a covered lower half is an annoyance. The calculator is the only screen where the thing you need to read appears **below** the field you are typing into and **only while** you are typing. On a shorter device than the test simulator, the result card would sit under the keyboard, and the feature would read as completely dead. This is consistent with every piece of evidence — a real user fails, tests pass, hardcoded values render fine — but it is a hypothesis, not a diagnosis, and it was not committed as a fix.

**What is needed to close this:** either device-interaction access for engineering, or, from the founder — what appeared on screen after typing (a wrong number, no result, an error, a blank screen, or the "Add your vial details first" state), which device, and whether the tracked setup had a vial amount and reconstitution volume saved.

**Recorded this slice:** the peptide detail **CTA discoverability** item (§21–24) — on long compound pages *Track this peptide* is only reachable after scrolling past all research content. Documented in Vita HQ as an open Peptides final-polish requirement, deliberately not resolved here.

**No source code changed.** Diagnostic instrumentation used during investigation was reverted; 605 tests and both typechecks are green at `c073da8`.

### Slice 3.6 — Dose / Unit Calculator 🟡

**Objective:** convert an amount the user has chosen into the number of units they draw into a syringe. Deterministic arithmetic and nothing else. No logging, no injection sites, no catalog changes.

**The boundary, stated once and enforced structurally.** VITA converts; the user decides. Every mass on this screen originates from something the user typed — the vial and water from their saved setup, the amount from the field in front of them. `model/dose.ts` is pure and lives outside every screen precisely because arithmetic that cannot reach state cannot quietly acquire an opinion, and no function in it has a "recommended" or "typical" input to supply one.

**Canonical arithmetic**, micrograms throughout, matching the rest of the peptide domain:

```
concentrationMcgPerMl = vialAmountMcg / reconstitutionMl
volumeMl              = amountMcg / concentrationMcgPerMl
syringeUnits          = volumeMl * unitsPerMl

amountMcgFromUnits    = (syringeUnits / unitsPerMl) * concentrationMcgPerMl
```

Both directions share one `resolveConcentration()`, which is what makes the inverse a genuine inverse rather than a second hand-written formula that agrees by coincidence — asserted by a round-trip test over sixteen vial/amount combinations rather than against restated literals.

**`DoseCalculationResult` is a discriminated union**: either every field is meaningful or none is. A failure carries no numbers at all to misread. Nine typed reasons distinguish *missing* from *invalid*, because a blank field is a normal first-open state and a negative vial amount is not.

**Full precision internally, rounded once at the edge.** `formatSyringeUnits` shows `20 units`, `2.5 units`, and `13.3 units` for a third of a vial — never `13.333333333333`. `formatVolume` allows three decimals because `0.025 mL` is a real quantity in this domain and two would flatten it. Formatting never mutates the calculation, which is pinned by test. Rounding earlier is how a calculator ends up disagreeing with itself between two screens.

**V1 assumes U-100 · 100 units/mL** and says so beside every result, as context rather than a warning. **No syringe-capacity selector** — 0.3 mL, 0.5 mL and 1 mL syringes are all U-100, and the control conflating the two was removed in 3.5B and does not come back. `unitsPerMl` stays on the setup model, defaulted to 100, so another graduation density needs no migration; a test proves a `unitsPerMl: 50` setup changes the *reading* (10 units) while the volume stays 0.2 mL.

**Route:** `/peptides/setup/[id]/calculator`, reached from a "Dose / unit calculator" button on the setup screen. Its own route rather than another section on the form, because editing a setup and converting an amount are different jobs with different lifetimes — one persists, one does not — and folding the second in would make Save feel like it saved the amount too.

**Setup-prefilled, derived every render.** Vial, water and graduation density come from `useResolvedSetup`; concentration is recomputed rather than cached, so changing the water volume and reopening gives the new answer. Verified on device: 10 mg / 1 mL → **20 units**, reseeded to 10 mg / 2 mL → **40 units** with the concentration line moving 10 → 5 mg/mL.

**Incomplete setups are refused, never guessed.** Without a vial amount or a reconstitution volume the screen shows a neutral state and an Edit setup action. A fabricated "10 mg / 1 mL" default would produce a confident, wrong number for someone whose vial is neither — the single worst thing this screen could do — and a test asserts no units or concentration render in that state.

**Result hierarchy:** setup summary → Amount Being Used → the answer → the working → U-100 context. One number dominates, because the syringe units are the only figure anyone acts on. The working is shown from the same `DoseCalculation` object the headline uses, so the explanation cannot drift from the answer: `10 mg/mL · 2 mg = 0.2 mL = 20 units`.

**Nothing is persisted.** The amount lives in component state and dies with the screen. A test asserts the repository receives zero writes across typing, switching units, and retyping. Storing it would turn an ephemeral conversion into something that looks like a saved plan.

**Reverse conversion — function and tests now, UI deferred.** `calculateAmountFromUnits` is implemented and tested, including the two founder examples (20 units → 2 mg; 20 units → 500 mcg on a 5 mg / 2 mL vial). A mode switch is **not** in the V1 UI: the founder's primary flow is Amount → Units and the authorization explicitly permits deferring the surface if it would bloat the slice. Adding a second mode to a screen nobody has asked to reverse yet would trade the clarity of one obvious flow for an option.

**Data-consistency notes, not medical judgements.** An amount larger than the whole vial is arithmetically fine and is still calculated — `12 mg` on a 10 mg vial gives `120 units = 1.2 mL`. It gets one neutral line saying the amount exceeds what the setup records, because that usually means a typo in one of two fields the user entered. Deliberately absent: any notion of a large dose, a safe dose, a maximum, or splitting an injection. A test asserts none of *split*, *two injections*, *divide the dose*, *too much* or *maximum* appears.

**A real defect found while testing.** The shared `parseAmount` returns `null` for an empty field, `"0"` and `"abc"` alike — right for a form that only asks whether it has a usable number, wrong here, where a blank field must stay silent and a typed zero must say something. The screen now classifies the text before the domain sees it.

**Accessibility:** the result is one accessible node announcing "Calculated syringe amount: 20 units. Equivalent to 0.2 mL" rather than four disconnected stops; each summary row reads as "Vial, 10 mg"; the amount input names its current unit; the mg/mcg control announces selected state via `SegmentedTabs`; the U-100 line is ordinary text. The value is never carried by colour alone.

**Motion:** a 180 ms fade as the answer changes, through the shared `useReducedMotion()` added in Water, which lands on the final value directly. No number rolling.

**77 new tests, 605 total.** **Verified on device** in Light and Dark: 20 units, 40 units after a reconstitution change, 20 units from an mcg-authored vial, 2.5 units from 250 mcg (`0.025 mL`), 120 units with the over-vial note, and both incomplete states.

**Found and recorded, not fixed here:** the shared `Button` / `PressableScale` set no `accessibilityRole="button"`, so VoiceOver reads their label without announcing they are actionable. App-wide and pre-existing — out of this slice's boundary.

**Boundary audit:** every changed source file is under `src/lib/peptides`, `src/features/peptides`, or the peptide setup routes. Water, Fuel, Home, nutrition, `src/lib/daily`, `package.json`, `supabase/` and the **72-entry catalog content** all have a zero-line diff.

### Slice 3.5D — Plain-English Peptide Content Normalization 🟡

**Objective:** make every one of the 72 pages answer the question an ordinary person actually arrives with — *what is this supposed to do?* — within a few seconds. A content pass, not a redesign. No architecture reopened, no calculator, no logging, no injection sites.

**Why it exists.** 3.5C added the right sections; founder review on a real device found the copy inside them had overcorrected into defensiveness. The example given:

> **Body Composition** — *Animal research has examined whether it affects fat accumulation and body weight. There is no meaningful human evidence.*

Technically careful, and it never tells the reader what 5-Amino-1MQ is actually claimed to do. The limitation had become the sentence.

**The claim now leads; the qualifier follows — in the copy and on the page.** The evidence label moved out of the claim's title row and onto a quiet line under the summary, rendered by a new `formatEvidenceContext()` helper as `Evidence · Primarily preclinical`. Two changes, one principle: a heading that shares its line with "Mainly Preclinical Research" reads as a disclaimer with a title attached, and a summary that opens with what the evidence lacks never gets round to the claim.

| Before | After |
|---|---|
| *Body Composition* — Animal research has examined whether it affects fat accumulation and body weight. There is no meaningful human evidence. | **Fat & Body Composition** — Researchers have studied whether 5-Amino-1MQ can reduce fat accumulation and support a leaner body composition by changing how the body stores and burns energy. · *Evidence · Primarily preclinical* |

**The guardrails were inverted, not removed.** 3.5C's tests *required* every limited or preclinical claim to restate its own weakness in prose — which is what produced the copy above. Those two tests were replaced with their opposites: a claim may not **open** with what the evidence lacks, and it must contain at least one word of real effect vocabulary rather than only describing research activity. Prohibitions on recommendations, guarantees, dosing, protocols and hype are untouched.

**Evidence qualification is now a field, stated once.** A page already carries the level under every claim, in Research status, and in Development status. A test caps repeated limitation formulas at one per page and bans five retired phrases outright — *there is no meaningful human evidence*, *direct human evidence is limited*, *only animal studies exist*, *this has not been proven*, *more research is needed*.

**All 72 entries reviewed. 72 overviews rewritten or verified, ~40 claim sections written or rewritten, 6 mechanisms added, 58 of 72 entries now carry claims.** Jargon-first openings were replaced throughout — Adipotide, AOD-9604, ARA-290, Cerebrolysin, Dihexa, Epitalon, Follistatin-344, Gonadorelin, hCG, Humanin, IGF-1 DES/LR3, Kisspeptin-10, KPV, Larazotide, LL-37, MGF, Oxytocin, Pinealon, SS-31, Thymulin, Triptorelin, VIP and the rest.

**A new automated content audit** (`__tests__/consumerContent.test.ts`) enforces the floor rather than the style: every entry has an overview; it is at least 120 characters and at most 560; it must say why the compound is **tracked, researched or used**, not only what it is made of; claim titles may not be generic ("Metabolic Effects") or named after a receptor or enzyme; mechanisms must actually explain their own acronyms; and a compound with mechanisms must also have a plain claim, so jargon is never the only description.

**That audit found nine real content gaps** the eye had missed — CagriSema, CJC-1295 with DAC, IGF-1 DES, IGF-1 LR3, Oxytocin, Semax + Selank, Sermorelin, Thymosin Beta-4 and Thymulin all described *what they were* without ever saying what they were for. **Pentadeca Arginate had no overview at all** and had been shipping as a title with a regulatory line under it.

**Required rewrites delivered.** 5-Amino-1MQ now opens on fat metabolism and body composition and explains NNMT as "an enzyme that helps decide how cells process energy and nutrients" — a reader no longer needs to search for the term. Glutathione moved from "a naturally occurring tripeptide… central to cellular redox balance" to an antioxidant the body makes for itself, with four claims covering antioxidant protection, liver function, cellular balance and skin, and oxidative stress explained as reactive molecules building up faster than the body clears them.

**Technical accuracy is layered, not lost.** Claims are plain; How It Works keeps the scientific terms and explains them; Targets keeps the receptor and enzyme names verbatim. Both audiences are served by different sections rather than one compromise register.

**Blends explain why they are grouped without inventing blend-level evidence.** GLOW now says it combines compounds researched around skin quality, collagen and tissue repair, and states once that evidence for the named blend is limited because the research concerns its components. No blend gained a claim.

**Development-status styling confirmed neutral.** Discontinued, Phase 3 and FDA Approved all render in the same Peptides accent. No red, no green, no celebration — the text says what the status is; colour does not judge it. Nothing in 3.5C's status architecture changed: `lastUpdated`, source-backed time-sensitive stages, and the ban on predicted approval all stand.

**Contamination protection expanded** — Tirzepatide may not be described as Retatrutide or carry triple-agonist language, GHK-Cu may not carry pigmentation content, 5-Amino-1MQ must state it is not a peptide, and Glutathione must explain itself beyond "oxidative stress". The general sweep gained a fourth legitimate relationship: an entry whose own **aliases** declare the link (Pentadeca Arginate is sold as "BPC-157 arginate").

**Page length was held.** Overviews are capped by test at 560 characters, claims at 300, mechanisms at 400. Longer was not the goal; clearer was.

**Also fixed:** three definition files carried a literal `\u2019` escape left over from 3.5C tooling. They rendered correctly but were inconsistent source, and are normalised to the real character.

**17 new tests, 528 total.** **Verified on device** across 5-Amino-1MQ, Glutathione, Retatrutide, Semaglutide, Tirzepatide, Semax, Selank, GHK-Cu, BPC-157, MOTS-c, Melanotan II, Bremelanotide, GLOW and IGF-1 DES, in Light and Dark.

⚠️ **All research content remains engineering-authored and has not had medical or legal review.** Open Question #17 stays open, and plain-English effect language raises rather than lowers the value of that review.

**Boundary audit:** every changed source file is under `src/lib/peptides` or `src/features/peptides`. Water, Fuel, Home, nutrition, `src/lib/daily`, `package.json` and `supabase/` have a zero-line diff.

### Slice 3.5C — Plain-English Claims, Mechanisms + Development Status 🟡

**Objective:** make the detail pages answer the question an ordinary reader actually arrives with — *what is this supposed to do, and how far along is it?* — without VITA ever recommending anything. 3.5B fixed how the pages looked; this fixes what they say. No calculator, no logging, no injection sites.

**Why it exists.** After 3.5B a page could be simultaneously accurate and useless. "Inhibits nicotinamide N-methyltransferase" is correct and answers nothing; "Not FDA-approved" is true of roughly the whole catalog and says nothing about whether a compound is in Phase 3 or was abandoned in 2008. Both were founder observations from real-device review.

**Two new content sections.**

| Section | Answers | Shape |
|---|---|---|
| **Research claims** | *what* is it researched or commonly claimed to do | short labelled blocks, each with **its own** evidence label |
| **How it works** | *how* — the pathway, explained rather than recited | plain title, quiet target subtitle, one or two sentences |

**The evidence label sits on each claim, not on the page.** One compound can have strong human evidence for one effect and vendor folklore for another. A single page-level badge would launder the second into the first, so `ResearchClaim` carries its own `evidenceLevel` and a test rejects any claim without one. A claim marked `limited` must additionally qualify itself *in words* — "commonly discussed… although direct human evidence is limited" — because a reader who skips a small grey badge should still not be misled. Preclinical claims must attribute themselves to animal or laboratory work, and `approved-use` is reserved by test for compounds that actually hold an approval.

**Development status replaces the regulatory binary.** A new `DevelopmentStatus` records a typed `stage` (approved · submitted · phase 3/2/1 · early human · preclinical · not in clinical development · discontinued · unknown), a display `label`, a `summary`, an optional `nextMilestone`, `lastUpdated`, and its own `references`. The section heading switches to **Approval status** for approved medications. Sermorelin now reads *Discontinued — withdrawn from the US market in 2008 by the manufacturer; a commercial withdrawal, not an FDA safety action and not a rejected application*, which is the distinction the old one-line status could not make.

**A stated plan is rendered as a plan.** "Lilly has said it plans to submit retatrutide to the U.S. FDA in Q1 2027" is a fact about a company's announcement. "Approval expected Q1 2027" would be a prediction VITA has no standing to make, and a content test fails the build on *will be approved*, *approval expected*, *awaiting approval*, *guaranteed*, *FDA denied*, *FDA rejected*, and *refused approval*.

**Time-sensitive facts were researched, not recalled, and carry a date.** Pipeline claims for compounds in active development were verified against current sources rather than authored from model memory, and every stage that can change (submitted, phase 1–3, discontinued) is required by test to carry both `lastUpdated` and references. **This is maintenance debt by design** — a phase stated without a date asserts permanent truth about something that changes, and these entries need periodic re-checking. Approved medications are additionally forbidden from carrying a clinical phase, and `stage: 'approved'` is reserved for `approved-medication`.

**Cross-compound contamination is now caught by test, not by eye.** The founder flagged Semax being described with Semaglutide's content — an error invisible to anyone who does not already know both compounds. Pinned: Semaglutide must contain GLP-1/metabolic content and **must not** contain BDNF, cognitive, nootropic or Semax content; Semax must contain cognitive/stroke content and **must not** contain GLP-1, incretin, obesity or type-2-diabetes content; Retatrutide must describe agonism at all three receptors; Cagrilintide must be an amylin analog and must not name Retatrutide; GLOW must remain a blend of GHK-Cu, BPC-157 and TB-500. Above those specifics sits a **general sweep**: no entry's overview may name an unrelated catalog compound, with three legitimate relationships excluded — itself, a blend naming its own components, and a derivative whose name already contains the parent's (N-Acetyl Selank Amidate). Anything else must explicitly distinguish the two, as Thymosin Beta-4 does from TB-500.

**Blends still do not inherit their components' claims.** Summing component effects would manufacture a claim about the *blend* out of evidence that exists only for its parts. GLOW, KLOW, BPC-157 + TB-500, Semax + Selank and CJC-1295 + Ipamorelin carry no claims at all, asserted by test; CagriSema does, being a manufacturer combination evaluated as one formulation.

**Two rendering defects found in device QA and fixed.** Tesamorelin headed a mechanism **"GHRH receptor"** with **"GHRH Receptor"** repeated directly beneath it, and the incretin pages headed theirs **"GLP-1"** over **"GLP-1 Receptor"** — the exact recitation this slice exists to remove. Both were fixed at the content level (*"Prompting your own growth hormone"*, *"Feeling full after a meal"*, *"Energy burn and the liver"*, *"Knowing you have eaten enough"*, *"Supporting neuron growth"*) **and** structurally: `Mechanisms` now drops a subtitle that only repeats its title, and a content test forbids any mechanism title that is contained in its own target. The reverse direction stays legal — "Blocking the NNMT enzyme" over "NNMT" is a sentence, not a recitation.

**Sections appear only when populated.** A compound with nothing to say renders no heading, not an empty one. N-Acetyl Selank Amidate is verified on device as a deliberately short page: About, Research status, Sources, Track. Padding it with confident filler would be worse than the gap.

**50 new tests, 510 total.** Including the first tests to render the detail route itself — `expo-router` mocked, real `PeptideProvider`, real `ThemeProvider` — because every one of these sections sits below the fold and the simulator cannot be scrolled without taps.

⚠️ **All research content remains engineering-authored and has not had medical or legal review** — Open Question #17 stays open, and the time-sensitive pipeline entries add a recurring maintenance obligation on top of it.

**Verified on device** across Retatrutide, Sermorelin, Tesamorelin, Semax, 5-Amino-1MQ and N-Acetyl Selank Amidate, in Light and Dark. **Boundary audit:** every changed file is under `src/lib/peptides`, `src/features/peptides`, or the peptide detail route. Water, Fuel, Home, nutrition, `src/lib/daily` and `package.json` have a zero-line diff.

### Slice 3.5B — Final Peptide Catalog + Detail Polish 🟡

**Objective:** the last catalog/detail refinement before the calculator, from founder review on a real device. The verdict was that the structure is right but the detail pages read like raw database output rather than a consumer health product. Visual bones kept intact; presentation professionalised.

**Professional casing, one layer not 71 edits.** `formatLabel()` applies title casing at render time — `type 2 diabetes` → **Type 2 Diabetes**, `other cardiometabolic conditions` → **Other Cardiometabolic Conditions**. **The rule is inverted from an ordinary title-caser**: a token that already contains a capital is scientifically cased on purpose and is left exactly as written. That single rule protects GLP-1, GIP, MC1R, hCG, MOTS-c, c-Met, GHS-R1a, NAD+, GHK-Cu and every future one — where a generic `toTitleCase()` would have produced "Glp-1 Receptor" and "Mots-C" and needed an exception list nobody would maintain. Minor words stay lowercase mid-phrase ("Diagnostic Assessment of Growth Hormone Secretion"); hyphenated words capitalize both halves. Evidence labels were re-cased to match: **Approved for Clinical Use · Studied in Human Clinical Trials · Early Human Research · Mainly Preclinical Research · Limited Direct Research**.

**Structured Studied For / Targets / Aliases.** The dot-separated run — `obesity and weight management · type 2 diabetes · other cardiometabolic conditions` — is now compact informational tags. **Deliberately not buttons**: these are facts, and exposing five static values as five controls would make a screen reader announce a do-nothing button five times. Each group is **one** accessible element reading "Studied for: Obesity & Weight Management, Type 2 Diabetes, …". Visually quiet — hairline border and surface fill rather than filled pills, so informational content never carries the weight of a primary action.

**Blend page restructured** to Components → About → **Formulation** → Research Status → **Research Context** → Sources. The formulation caveat is a fact about the *name* and the evidence caveat is a fact about the *research*; merging them into one paragraph was part of what made these pages long. **A real duplication was found and removed in review**: the About paragraph still restated "formulations vary between suppliers" directly above the new Formulation section that says exactly that. All four vendor blends had that sentence trimmed.

**Research-area taxonomy** — twelve areas: Weight & Metabolic · Cognitive · Sleep · Growth Hormone · Recovery · Sexual Health · Aesthetics · Mitochondrial · Longevity & Aging Research · Immune & Inflammation · Endocrine · Other. Typed, structured, never parsed from prose. **Assigned in one auditable table** (`data/definitions/researchAreas.ts`) rather than inline across six files, because a taxonomy is only useful if it is consistent and consistency cannot be reviewed when the assignments are scattered. A test asserts every catalog id appears exactly once, so nothing can be added untagged.

**Counts** (72 entries, 25 multi-tagged): Weight & Metabolic 21 · Growth Hormone 17 · Endocrine 13 · Recovery 11 · Immune & Inflammation 9 · Cognitive 8 · Aesthetics 5 · Longevity & Aging 5 · Mitochondrial 4 · Sexual Health 4 · Sleep 1 · **Other 0**. Nothing was dumped into Other, and the largest bucket is 29% of the catalog — tests assert both (Other ≤ 2 entries, no area above 40%).

**Multi-tagging where several areas are genuinely true** — GHK-Cu is Recovery *and* Aesthetics, MOTS-c is Mitochondrial *and* Weight & Metabolic, Kisspeptin-10 is Sexual Health *and* Endocrine. Forcing one would make discovery worse and quietly assert a primary purpose the compound does not have.

**Category selector: one compact control, not a second chip row.** Twelve areas as chips would have doubled the header height and pushed the list off the first screen — the founder was explicit. The control is a single quiet pill stating the current selection ("All Categories" / "Cognitive"), turning purple when filtered, with a **one-tap Clear** beside it — without which clearing means reopening the sheet and hunting for "All Categories", three interactions to undo one. Options live in a bottom sheet built from React Native's own `Modal`; no dependency was added for one selector.

**Filtering composes** as `classification AND research area AND query`. Blends + Growth Hormone returns exactly the CJC pairing; Approved + Weight & Metabolic excludes Retatrutide because it is investigational; searching "ozempic" inside Cognitive correctly returns nothing. Custom definitions are excluded when any area filter is active — inventing an area for a name the user typed would be guessing on their behalf.

**Catalog rows carry one descriptor.** Category + aliases + mechanism produced `Pro-apoptotic peptidomimetic · FTPP · Prohibitin-targeting p…` — three facts competing for a space that fits one, truncating mid-word. Now just the formatted category: **Pro-apoptotic Peptidomimetic**. The detail page carries aliases with room to show them.

**New blend: CJC-1295 without DAC + Ipamorelin** — a GHRH analog alongside a ghrelin-receptor secretagogue, two different mechanisms. **The DAC-free variant is named explicitly**; a test asserts the blend references `catalog:cjc-1295-no-dac` and *not* the DAC form, because the two have very different durations and are never interchangeable. No amounts asserted, `blendCaveat` set, tagged Growth Hormone. Catalog is now **72 entries**.

**Syringe selection removed from setup** (founder decision). Users were being asked to choose U-100 / U-50 / U-40 when what they see on the box is a *capacity* — 0.3 mL, 0.5 mL, 1 mL — and those are different things: a 0.5 mL syringe marked to 50 units is still U-100. **V1 assumes the ordinary U-100 scale, 100 units per mL**, which slice 3.6 will state beside its result. The `unitsPerMl` field stays on the model, defaulted to 100 and preserved on existing setups, so another scale needs no migration. The concept was **not** removed — units are not a universal volume, and conflating them with capacity is what corrupts syringe arithmetic.

**A rendering defect found and fixed.** Four slice-3.5A summaries used markdown emphasis (`**not a peptide**`), which a React Native `<Text>` renders as literal asterisks. Removed, with a test asserting no markdown appears in any editorial string.

**Recorded for slice 3.6 (not implemented):** Vial Amount `10 mg` → Bacteriostatic Water / Reconstitution `1 mL` → **Amount Being Used** `2 mg` → Calculated Syringe Amount `20 units`, with context `10 mg/mL · 2 mg = 0.2 mL = 20 units` and the U-100 assumption stated. The amount **originates from the user**; VITA returns the arithmetic equivalent and never selects it. "Amount to Convert" remains acceptable if it reads better in the calculator itself.

**Schedule wording verified** — Daily · Selected days · Every X days · As needed, with "Repeat every [3] days" when selected. Model still `everyNDays`.

**Tests: 54 new, 460 total across 24 suites, all passing, zero warnings.** New `researchAreas` (13) — exhaustive assignment, valid values, no duplicates, the Other-is-empty and no-bucket-too-large checks, founder-named placements, and that area labels name research fields rather than outcomes. New `filtering` (13) — every combination of classification, area and query, plus clearing. New `format` (17) — casing rules and every scientific token that would break a naive title-caser. New `CategorySelector` (11, component) — the sheet, options, selected state, clear, and accessibility, **because none of it exists until a tap and the simulator cannot tap**. `catalogIntegrity` gained the CJC-blend and markdown checks.

**Validation.** `npm test` 460/460 · `tsc --noEmit` clean · `--noUnusedLocals --noUnusedParameters` clean · `expo export --platform ios` succeeds · `expo install --check` reports only the pre-existing Sprint 2 patch drift · **zero changes** under `src/lib/nutrition/`, `src/lib/water/`, `src/features/water/`, `src/app/(vita)/(tabs)/`, `src/features/dashboard/`, `src/features/fuel/`, or `supabase/`. Calculator audit: no `dose.ts`, no concentration or syringe math anywhere.

**Device QA:** Retatrutide (tags, casing, "Triple Agonist · GIP / GLP-1 / Glucagon") · Semaglutide in Light mode · GLOW's restructured sections · the new CJC + Ipamorelin blend · the 72-entry catalog with the compact category control and untruncated rows · Light and Dark. **Not physically exercised:** every tap — opening the category sheet, choosing an area, clearing it, searching, and tapping a source link. The sheet and filters are covered by the 24 component and filtering tests instead.

**Catalog, detail, and setup are now considered locked for Sprint 3**, ready for slice 3.6.

### Slice 3.5A — Expanded Peptide Library + Research Detail Refinement 🟡

**Objective:** a founder-directed refinement of 3.5, before the calculator. Substantially expand the catalog, support blends properly, make categories human-readable, add factual research-detail pages, and fix setup and schedule wording.

**Catalog: 18 → 71 entries**, assembled from six grouped definition files. The founder direction replaced the "12–20" cap: if a compound is commonly encountered in this ecosystem and its identity can be verified, VITA should be able to represent it — being investigational is a reason to *label* something accurately, not to leave it out.

**Compound type, separate from classification.** `CompoundType` (`peptide` · `protein` · `small-molecule` · `blend` · `other`) states what something **is chemically**; `classification` states what a regulator says. MK-677, 5-Amino-1MQ and Tesofensine are typed `small-molecule`; NAD+, Dihexa and Cerebrolysin are `other`; somatropin, hCG, dulaglutide and the IGF analogs are `protein`. **VITA lists them because people track them, and does not call them peptides because the tab is named Peptides.** The `peptide-drug` member from the founder's sketch was deliberately dropped — it would mix chemistry with regulatory standing, which `classification` already carries.

**Three previously-omitted compounds are now included.** Slice 3.5 left out Sermorelin, Bremelanotide/PT-141 and Thymosin Alpha-1 because one molecule carried both an approved-product name and a research-chemical name and there was no field to hold the nuance. `researchStatus` is that field: Sermorelin is `research-compound` with "previously FDA-approved as Geref and withdrawn from the US market in 2008"; Bremelanotide is `approved-medication` with "material sold as PT-141 by research suppliers is not the approved product"; Melanotan I is likewise approved as afamelanotide (Scenesse) with the same distinction stated. A test asserts each still carries its nuance.

**Aliases.** Brand names (Ozempic, Mounjaro, Vyleesi, Scenesse), development codes (LY3437943, MK-6024, BI 456906) and ecosystem synonyms (Mod GRF 1-29, Elamipretide, Epithalon, Ibutamoren). Searchable and displayed, because seeing "Ozempic" under "Semaglutide" is how someone confirms they found the right entry. Tests assert an alias never shadows another entry's primary name, is never shared between two entries, and never repeats its own.

**Compounds that are commonly conflated stay separate.** TB-500 and Thymosin Beta-4, and AOD-9604 and HGH Fragment 176-191, are distinct definitions whose summaries say "not the same molecule". Aliasing them together would erase a real chemical difference — the opposite of what a reference library is for.

**Blends are first-class.** Five: **GLOW** (GHK-Cu / BPC-157 / TB-500), **KLOW** (the same plus KPV), **BPC-157 + TB-500**, **Semax + Selank**, and **CagriSema**. Each carries a resolvable component list. **No vendor blend asserts amounts** — a test enforces `amount` and `unit` are undefined on all of them, because two suppliers selling "GLOW" may put quite different amounts in the vial and stating one ratio as the definition would invent a standard that does not exist. The detail page says so, and points the user at their own setup: *"Your own setup records what's in your vial."*

**Blend evidence is handled honestly.** `blendCaveat` renders "Research context here comes from the individual components. The combination itself may not have been studied as a single formulation." CagriSema deliberately omits it — a manufacturer combination evaluated as one formulation — and a test asserts the caveat is present on the vendor blends and absent there, so the flag keeps meaning something.

**"CLOW" was researched and deliberately not added.** GLOW and KLOW have transparent, self-consistent naming (G for GHK-Cu; K for KPV added to the same base) and no comparable established meaning for CLOW could be verified. It is most plausibly a variant spelling or mishearing of KLOW. Inventing a component list to fit a name is exactly what the blend rules forbid, and Custom already covers vendor-specific blends. A test asserts no CLOW entry exists.

**Human-readable categories.** Retatrutide now reads **"Triple agonist · GIP / GLP-1 / glucagon"** rather than "Investigational incretin agonist" — its regulatory standing is already carried by classification. Others: "Dual GIP / GLP-1 agonist", "GHRH analog", "Growth hormone secretagogue", "Copper peptide", "Mitochondrial peptide", "Melanocortin agonist", "Thymosin beta-4 fragment". **Both CJC-1295 variants were corrected from "Growth hormone secretagogue" to "GHRH analog"** — they act at the GHRH receptor, not the ghrelin receptor. A test pins that correction and confirms the genuine secretagogues still say so.

**Research detail pages** at `/peptides/catalog/[id]`. Hierarchy: name → classification chip and "Not FDA-approved" line for research compounds → category → Also known as → Components (for blends, each tappable through to its own page) → About → **Studied for** → Targets → Research status (evidence level plus plain-language status) → Sources → Track this peptide. **Regulatory status is one line, not the whole page** — the user's questions are what is this, what does it target, what has been studied, and how solid is the evidence.

**"Studied for", never "used for".** The distinction is the posture of the whole feature: the app reports what research has examined, not what people do with a compound or should.

**Evidence levels** — `approved-use` · `human-clinical` · `early-human` · `preclinical` · `limited` — described as facts about the *literature*, never verdicts on the compound. Tests assert no label contains "good", "safe", "effective", "recommended" or "risky"; that `approved-use` is reserved for approved medications; and that a caveated blend can never claim more than `limited`.

**Sources are pointers, not citations.** Every reference is a search URL into PubMed, ClinicalTrials.gov or Drugs@FDA. **A hand-written PMID or DOI naming the wrong paper is worse than no citation and would be undetectable from inside the app**, so none were written. A test restricts reference URLs to those three hosts and asserts none points at a vendor or storefront.

**Recommendation language is prevented mechanically.** `research.test.ts` fails the build on 23 forbidden phrases (recommended/starting/typical/standard/ideal/safest/optimal dose, "you should take", "best for", "stack with", "protocol", "cycle length"), on sales language, and — via regex over every string — on **any concrete dosing amount** (`\d+ ?(mg|mcg|iu|ml)`). A companion test asserts the amount rule did not accidentally ban describing what a molecule *is*, by confirming composition language ("amino-acid", "residues") still appears.

**⚠️ Content review is still owed.** All 71 entries and every summary are **engineering-authored and have not been through medical or legal review**. The content is written conservatively, sourced by pointer, and mechanically guarded — but Open Question #17 (b) and (c) remain open, and this is flagged in the code itself.

**Setup wording.** Reconstitution now reads **"Bacteriostatic water / reconstitution (mL)"** on screen while the model stays the generic `reconstitutionMl` — familiar language without assuming bacteriostatic water is the only possible diluent. Everything the founder reviewed and liked is unchanged: vial amount, reconstitution, syringe, preferred unit, schedule, start date, notes.

**"Every N days" → "Every X days".** Programmer language that had leaked onto a screen. The selected state now reads "Repeat every [3] days"; the model still says `{ kind: 'everyNDays', n: 3 }`, because internal code does not have to mirror the copy. "Days" also became "Selected days".

**Calculator preparation, without the calculator.** The setup inputs the arithmetic needs — vial amount (canonical mcg + authored pair), `reconstitutionMl`, and `syringe.unitsPerMl` — are clean and labelled, with the copy still explaining that syringe choice is graduation density and not capacity. **Recorded for 3.6: the user-supplied field is "Amount to convert", never "recommended dose"** — VITA returns the mathematical equivalent of a number the user supplied. No `dose.ts`, no conversion, no calculator route exists.

**Catalog discovery.** Search matches **name, aliases, and category** — "PT-141", "Ozempic", "Mod GRF 1-29" and "GLP-1" all find what they should. Filters are **All · Approved · Research · Blends**: regulatory and chemical, deliberately not goal-based, because "weight loss" or "muscle" as a primary taxonomy would turn browsing into a recommendation. Local and synchronous; no network, no dependency.

**Tests: 88 new, 405 total across 20 suites, all passing, zero warnings.** New `catalogIntegrity` (25) — compound types, alias collisions, alias searchability, conflated-compound separation, blend component resolution, no self- or blend-referencing components, no duplicate components, the no-amounts rule, filter behaviour, and group coverage. New `research` (19) — the content guardrails above. `catalog` (23) updated for the expanded library. `SetupForm` updated for the new wording.

**Validation.** `npm test` 405/405 · `npx tsc --noEmit` clean · `--noUnusedLocals --noUnusedParameters` clean · `npx expo export --platform ios` succeeds · `npx expo install --check` reports only the pre-existing Sprint 2 patch drift · **zero changes** under `src/lib/nutrition/`, `src/lib/water/`, `src/features/water/`, `src/app/(vita)/(tabs)/`, `src/features/dashboard/`, `src/features/fuel/`, or `supabase/`.

**Device QA** by deep link and seeded storage: the 71-entry catalog with filters and alias lines · **Retatrutide** rendering exactly the founder's specified presentation · **GLOW** with tappable components, the amounts-vary note and the blend caveat · **Semaglutide** as an approved medication with brand-name aliases and no research-compound status line · **Pentadeca Arginate** as the no-summary case, stating plainly that no reviewed summary exists rather than filling the space · Light and Dark.

**Not verified:** the tap path — searching, filtering, opening a detail page by touch, or tapping a source link.

**Peptides is still not feature-complete.** 3.6 (calculator), 3.7 (logging and history), 3.8 (injection sites) and 3.9 (polish, safety copy, Fuel integration) all remain.

### Slice 3.5 — Peptide Definitions, Catalog + User Setup 🟡

**Objective:** replace the Sprint 0 Peptides placeholder with a real persisted setup system — the first two layers of the approved three-part model. Administration logging (3.7), the dose calculator (3.6), and injection sites (3.8) are explicitly not in this slice.

**What the placeholder actually was.** `1 / 3 logged`, a "goal", and fixed Morning/Midday/Evening slots — none of which were real concepts. A peptide schedule is per-setup and often weekly; VITA never had a daily peptide goal to be at 1 of 3 of. `add.tsx` discarded everything typed, and `examples.tsx`'s rows called `router.back()` without selecting anything. All three screens are gone.

**Three concerns, three types.** `PeptideDefinition` (what the compound is) carries a name, a classification, a broad class label, and nothing else — no dosing, schedule, vial, or history fields. `PeptideSetup` (how this user tracks it) carries the configuration. `PeptideLogEntry` is deliberately absent; nothing was stubbed for it.

**There is no `typicalDose` and no equivalent.** Removed from the planning model by founder decision before implementation, and a provider test asserts a serialized setup contains none of *typical*, *recommended*, *standard*, *suggested*, or *dosage*. VITA has no basis for knowing an appropriate amount, and a field with that name would imply it did.

**The catalog: 18 entries, alphabetical.** Six approved medications (Dulaglutide, Liraglutide, Semaglutide, Somatropin, Tesamorelin, Tirzepatide) and twelve research compounds (AOD-9604, BPC-157, CJC-1295 with DAC, CJC-1295 without DAC, GHRP-2, GHRP-6, Ipamorelin, Melanotan II, Retatrutide, Selank, Semax, TB-500). Each carries only a name, a classification, and a compound-class label.

**The classification rule, applied conservatively.** `approved-medication` means the active ingredient has an FDA-approved product in the United States; everything else here is `research-compound`, including compounds in active trials and compounds approved abroad but not in the US. **Where US status could not be stated with confidence, the compound was omitted rather than guessed at** — Sermorelin (a withdrawn approval now supplied through compounding), Bremelanotide / PT-141 (one molecule sold both as an approved product and as a research chemical), and Thymosin Alpha-1 (approved elsewhere, not the US). Omission is not a judgement about a compound; it means the file will not assert a status it cannot support. All three remain addable through Custom, which carries no regulatory claim at all. A test pins those omissions so they are not quietly added back.

**Categories are compound-class labels, not effect claims** — "GLP-1 receptor agonist", "Growth hormone secretagogue", "Research peptide". Standard nomenclature used to tell similar entries apart (the two CJC-1295 variants). **Flagged for founder review:** if even a class label reads as too close to mechanism, it is a one-line change to drop the field. A test forbids 24 substrings including *dose*, *recommend*, *typical*, *protocol*, *popular*, *best*, *fat loss*, *muscle*, *benefit*, and *helps*, and caps category length at 40 characters with no sentences.

**Custom** definitions are stored separately from setups under their own key, so one custom compound can back several setups and survives deleting any of them. They are always `classification: 'custom'` — and the repository **refuses to read back any stored definition claiming another classification**, so a hand-edited store cannot relabel a research compound as approved. Approval status is asserted by the compiled catalog and nowhere else.

**Setup: only the compound is required.** Display name, vial amount and unit, reconstitution volume, syringe density, preferred dose unit, schedule, start date, and notes are all optional. A GLP-1 pen user reconstitutes nothing and is not made to answer vial questions to record that they track something. Nothing is pre-filled with a plausible number, because a pre-filled vial size would be VITA suggesting an answer.

**Vial amounts store both representations** — canonical micrograms plus the authored `{amount, unit}` pair, on the same principle as water entries. **Syringes are modelled as `unitsPerMl`, not capacity**, with a caption saying so in words: a 0.5 mL syringe marked to 50 units is still U-100, and modelling capacity is the classic way to get syringe arithmetic wrong before the calculator ever sees it.

**Schedules** support daily · selected weekdays · every N days · as needed, all optional, all user-owned. Labels read "Daily", "Mon, Wed, Fri", "Every 3 days", "As needed" — **and a test asserts no label can contain *due*, *missed*, *overdue*, *adherence*, *streak*, or *skipped***. `isScheduledOn` returns `false` for an every-N-days schedule with no start date rather than inventing an anchor. No notifications, no scoring.

**Active and inactive.** Deactivation is a state change that keeps every field; a test confirms notes and start date survive it. Inactive setups leave the primary list and appear in their own section, reactivatable in one tap. "Nothing active right now" is a distinct state from "No peptides added yet" — having only inactive setups is not the same as having none.

**Orphaned setups** — a setup whose definition no longer resolves — are kept out of both lists, counted internally, and **left untouched in storage**. Silently re-pointing one at another compound would be the single genuinely destructive option available, since the setup would then claim to track something the user never chose.

**Read-time validation** follows the philosophy nutrition and water established, and is stricter here because these values feed the dose calculator in 3.6 where a plausible-but-wrong number is worse than a missing one. Identity fields (id, definitionId, both preferences, active, timestamps) void the whole record; malformed optional fields are dropped individually so losing a notes field does not lose the configuration. Zero and negative vial amounts, reconstitution volumes, and syringe densities are rejected, as are impossible start dates. Reading never rewrites storage.

**Deferred, and documented rather than silently skipped:** the `preferredEntryMode` control. The value is stored (defaulting to `'mass'`) so slice 3.6 has real data, but exposing a mass-versus-syringe-units choice before a calculator exists would offer a mode that cannot be expressed for a setup with no vial data. Slice 3.6 surfaces it.

**Start date is a validated text field**, not a native picker. No date-picker dependency exists in the project, and adding a native one for one optional field in one slice is not a trade worth making — the field is validated with the hardened `isValidLogDate` (so `2026-02-30` is refused) and paired with a "Today" shortcut. A polished picker is a reasonable later refinement.

**Fuel was deliberately not wired.** Slice 3.9 owns that integration. The three Sprint 0 fixture files were collapsed into one clearly-marked compatibility shim (`src/features/peptides/api.ts`) with its unused exports removed and its values left byte-identical, so **`fuel.tsx` has a zero-line diff**. The shim's `1 of 3 logged` describes a feature that does not exist and is recorded as known, scheduled debt — the same way Home's water fixture was carried between slices 3.2 and 3.4.

**Accessibility.** Classification is spelled out as a word, never encoded in colour alone, and the chip announces the full form ("Research compound", not "Research"). **Research is not styled as a warning** — it is a factual category, and alarm-red would both misrepresent it and train users to ignore the colour. Rows announce name, classification, category, and schedule together. Weekday chips carry the full weekday name, because "Mon" is fine to read and poor to hear — `Chip` gained an optional `accessibilityLabel` for it. Search, every form field, and every unit control name their purpose and units. No icon-only unlabelled controls.

**Tests: 119 new, 360 total across 18 suites, all passing, zero warnings.** `catalog` (22) — mostly negative assertions: no dosing or effect language anywhere, only permitted fields, stable semantic ids, no duplicates, alphabetical ordering, no `custom` classification in a built-in, and the deliberate omissions. `units` (17) — exact power-of-ten conversion, round-trips, and the prototype-chain guard that bit the water domain. `schedule` (26) — all four shapes, rejection of empty day sets, out-of-range days, duplicates, and intervals below two, plus the no-obligation-language assertion. `repository` (26) — round-trips, restart, key isolation from Water and Nutrition, and one case per corruption class. `provider` (19) — empty state, catalog and custom setups, optional-field absence, editing in place, clearing a field, deactivate/reactivate, alphabetical ordering, orphan handling, and failure messaging. `SetupForm` (19, component) — the schedule, start-date, vial, and framing controls, **because they sit below the fold on a scrolling screen the simulator cannot scroll**.

**Validation.** `npm test` 360/360 · `npx tsc --noEmit` clean · `--noUnusedLocals --noUnusedParameters` clean · `npx expo export --platform ios` succeeds · `npx expo install --check` reports only the pre-existing Sprint 2 patch drift · **zero changes** under `src/lib/nutrition/`, `src/lib/water/`, `src/app/(vita)/water/`, `src/features/water/`, `fuel.tsx`, `dashboard.tsx`, `src/features/dashboard/`, or `supabase/`.

**Device QA by seeded storage and deep links**, since the simulator still cannot be driven. Verified: the empty state · four setups across catalog, custom, and inactive, with all three classification chips rendering distinctly and the custom definition resolving · the catalog with search, the Custom row, "Your peptides", and the alphabetical list · a fully configured setup seeding its form correctly (5 mg vial, 2 mL, U-100 selected, mcg preferred) · "Nothing active right now" with only inactive setups · Light and Dark · Fuel still rendering through the shim.

**Not verified:** the tap path — searching, selecting a catalog entry, creating a custom definition, saving a setup, editing one, or deactivating. Every transition is covered by provider and component tests, and every rendered state above is confirmed on device, but no human or tool has tapped these controls.

**Peptides is not feature-complete.** Slice 3.6 (calculator), 3.7 (logging and history), 3.8 (injection sites), and 3.9 (UX polish, safety copy, and Fuel integration) all remain.

### Slice 3.4 — Water Visual Refinement + Fuel/Home Integration 🟡

**Objective:** give the working Water system from 3.2–3.3 the visual intentionality VITA expects, add a compact recent-days view, and put Home on the same real state as Water and Fuel. The last Water-focused slice before Sprint 3 turns to Peptides.

**The primary visual: a water level, not a container.** The summary panel fills from the bottom as the day progresses — a low-alpha wash of the Water blue with a brighter 2px line at the surface. A bottle, a glass, or eight cup icons all imply a vessel of fixed size, and VITA's goal is whatever the user chose in whichever of four units they think in; a *level* has no implied capacity. Keeping the fill faint is what lets the text sit on top at normal contrast in both themes instead of needing its own treatment at every fill height, and the surface line is what makes a 5% day legible. A floor of ~4.5% fill means "I did drink something" never looks identical to "I drank nothing."

**One fact, one place.** The total is the only large figure on the screen. The remainder, the goal, and the percentage share one quiet line and one small control beneath it. There is no progress card, remaining card, goal card, or percentage card — the Design System's density rule (*size communicates importance, not availability*) is the whole argument.

**Motion.** The fill eases to its new height over 700ms (`Easing.out(Easing.cubic)`, matching `ProgressBar`'s existing vocabulary). Nothing loops, floats, bubbles, or celebrates. **Reduced Motion lands on the value directly** rather than playing a shorter animation, via a new shared `useReducedMotion()` in `src/theme/` — placed there because motion belongs to the design system and Sprint 8 will own the rest of it. `ProgressBar` now honors it too, which was a pre-existing gap that also benefits Fuel and Home.

**The seven-day strip shows volume, not goal attainment — a data-integrity decision, not a design one.** VITA stores one *current* goal as a preference and never snapshots what it was on a past day, so "you hit your goal on Tuesday" would be a claim the app cannot support. Columns are therefore scaled against the week's own biggest day. Days with nothing logged keep a flat trace rather than vanishing, because a gap is information and dropping it would silently compress the axis. Today is the full Water blue; past days are the same hue at 45% alpha — **not** `palette.waterSoft`, which is nearly invisible on a light card and *brighter* than today's column on a dark one, inverting the hierarchy in exactly one theme. No average, no streak, no trend, no interpretation.

**Home is on real state.** `dashboard.tsx` reads `useWaterToday()` and derives two things: the Health Metrics Water tile (the day's total in the user's own unit, with its accent bar showing progress only when a goal exists) and the Water goal pillar (`complete` only when the user has a goal *and* has reached it). The dependency runs one way — Water domain → Home; nothing in `src/lib/water` knows Home exists.

**`GoalPillar` was left alone deliberately.** It has no "unset" state, and adding one would have meant changing `HomeSummaryCard`'s rendering and the "N of 4" denominator — beyond the smallest compatible adjustment. An unset goal is simply not a met goal, so the pillar reads incomplete without inventing a target and without telling the user they failed something they never chose.

**Home navigation.** The Water tile now opens `/water`. `QuickStat` gained an optional `onPress` and `MetricTile` renders a labelled `Pressable` only when one is present — Steps, Sleep, Workouts, and Streak have no feature behind them and stay inert rather than navigating nowhere for the sake of visual consistency. `style` carries the grid's `flexBasis`, so it stays on the `Pressable` itself; putting it on an inner wrapper would leave the flex item with no basis and collapse the Health Metrics grid, which is also why this is a plain `Pressable` rather than `PressableScale`. A test pins that.

**No Water fixture data remains anywhere.** `DASHBOARD_FIXTURE`'s water quick-stat kept its presentation metadata (id, icon, color, label, position) but its `value` and `progress` are now an em dash and zero — deliberately implausible, so a failed override reads as "unknown" rather than quietly inventing a hydration figure. The water goal pillar's `complete` is `false` as a placeholder, the same treatment nutrition has had since slice 2.5. A repo grep confirms no live `5 / 8`, `goalCups`, or `WATER_TODAY` anywhere; the only remaining mentions are historical comments, and two stale doc examples in `FuelTrackerCard` and `ListRow` were updated.

**Two visual defects found and fixed during device QA.** The over-goal line read *"16 fl oz over Goal 64 fl oz"*, stacking two senses of "goal" into one phrase; the three states are now parallel — `23.1 fl oz to go · Goal 64 fl oz` / `Goal reached · 64 fl oz` / `16 fl oz over · Goal 64 fl oz`. And the panel reserved its full fill height even with no goal set, leaving a band of empty card that will never fill — the reserved height is now conditional.

**Accessibility.** The fill is marked decorative (`accessibilityElementsHidden`) because every figure it encodes is stated in the text beside it — assistive technology reads numbers, not a shape. The percentage control announces the full readout (`Daily goal 64 fl oz, 64 percent reached. Edit goal`). Each of the seven columns is one accessible element carrying **the full weekday name and the real amount** (`Today, Saturday, 40.9 fl oz`) — the single letters are ambiguous by construction (Tue/Thu, Sat/Sun), so seven unlabelled bars would be meaningless without sight. The Home tile announces `Water, 40.9 fl oz`.

**Dynamic Type.** Verified at `accessibility-extra-extra-extra-large`: the total shrink-fits to one line, "TODAY" wraps rather than clipping, the context line wraps freely, and the panel grows because its height is a minimum rather than a fixed value. Nothing clips.

**Tests: 30 new, 241 total across 12 suites, all passing — and the suite now runs with zero warnings.** `week.test.ts` (18) covers the seven-date window across month, year, and leap boundaries, gap retention, live-today override, relative share including the all-empty and corrupted-negative cases, label ambiguity, non-mutation, and an explicit assertion that **no goal-attainment field exists on the model**. `dates.test.ts` gained 12 for `shiftLogDate`/`logDateRange`/weekday helpers. The provider suite gained eight for exactly the fields Home consumes — empty day, preferred unit, never-complete-without-a-goal, unmet, exactly met, over, mixed units — plus the history window excluding today. A new `MetricTile.test.tsx` (6) verifies the Home tile itself, **because it sits below the fold on a scrolling Dashboard and the simulator cannot be scrolled without taps**. Teardown moved into `act`-wrapped `afterEach` hooks, eliminating 35 "not wrapped in act" warnings that would otherwise have trained people to stop reading test output.

**Validation.** `npm test` 241/241 · `npx tsc --noEmit` clean · `--noUnusedLocals --noUnusedParameters` clean · `npx expo export --platform ios` succeeds · `npx expo install --check` reports only the pre-existing Sprint 2 patch drift · zero changes under `src/lib/nutrition/`, `src/features/peptides/`, `src/app/(vita)/peptides/`, `fuel.tsx`, or `supabase/`; the only `src/features/fuel/` change is a one-line doc comment.

**Device QA by seeded storage and deep links**, since the simulator still cannot be driven. Verified: no goal + no logs · no goal + logs (total shown, no fill, no fabricated percentage) · goal + zero logs (`0 fl oz`, `64 fl oz to go`, `0%`, empty panel) · partial (`40.9 fl oz`, 64%, fill at 64%) · goal met · over goal (full fill, `122%`) · six mixed-unit entries still reading calm · a seven-day week with real gaps · Light and Dark · Home with water incomplete and with water complete · Fuel showing `64%`, matching Water exactly. **All three surfaces agree numerically on the same state.**

**Not verified:** the tap path — pressing Add Water, the goal row, a log row, delete, Undo, or the Home Water tile on a running build. Every one is covered by tests, and every rendered state above is confirmed on device, but no human or tool has tapped these controls. That needs the founder's iPhone.

**Water is feature-complete for Sprint 3**, pending the Sprint 3 audit in slice 3.10. That is a statement about this sprint's scope, not a claim that Water will never be refined again.

### Slice 3.3 — Water Goal + Logging Experience 🟡

**Objective:** turn slice 3.2's working engine into a complete workflow — set a goal, change it, choose a unit, log quickly, correct a mistake, delete with Undo. Functionality and interaction quality; the premium visualization, motion, the seven-day view, and Home integration remain slice 3.4's.

**Founder correction from 3.2, implemented.** Slice 3.2 temporarily made saving an entry in a different unit update the user's preferred unit. The founders separated the two concepts: **the unit a drink is logged in belongs to that drink; the display preference belongs to the user.** Logging 500 mL while your preference is fl oz now records 500 mL and leaves your preference at fl oz. `setUnit` is called from exactly one place — the explicit unit control on the goal screen — and `addEntry` never touches preferences. Pinned by four provider tests, including the founders' own scenario verbatim.

**A real defect this fix exposed and removed.** With `createWaterEntry`, `logDate` defaulted to *today* rather than to the calendar day of the entry's own `loggedAt`. Identical for a drink logged now — which is every drink the app logs — but incoherent for any other call: a timestamp from yesterday would be filed under today, and the repository rejects exactly that shape on read, so the entry would have been silently dropped later rather than refused at creation. `logDate` now derives from `loggedAt`. **Found by the test suite when the date rolled over mid-slice**, which is the second time the harness has caught something reasoning did not.

**First-use goal — VITA suggests nothing.** There is no default goal, no preset chips, and no placeholder number that could be read as a recommendation. A user with no goal sees `0 fl oz today`, *"Set a daily goal to track progress. Logging works either way,"* and a soft **Set a daily goal** button. **Logging is never gated on the goal** — a user can log for a week and decide their target afterwards, and the empty-goal state says so explicitly.

**Goal editing** is one restrained control: a `Daily goal · 64 fl oz ›` row inside the summary card, present only once a goal exists. It states the current value, which is what makes it discoverable, and it is a row rather than a settings panel because changing a goal is occasional.

**`/water/goal`** owns both the goal and the unit preference, because they are one thought — "my goal is 64 fl oz" decides the number and the unit together — and because a separate screen for one segmented control would be the settings panel this slice was told not to build. The unit control is the **explicit** preference control; a caption states that already-logged entries keep the unit they were entered in. The field is empty for a new user and pre-filled with their own previous goal for an existing one.

**Add Water** opens in the preferred unit and may be switched for that entry alone. Fixed per-unit quick-adds (fl oz 8/12/16/24 · cups 0.5/1/2/3 · mL 250/500/750/1000 · L 0.25/0.5/1/1.5), a custom field, a live preview, and a save button disabled until the amount parses. Changing the unit clears the amount — `16` means something very different in ounces and litres, and reinterpreting the digits would log a drink the user never chose. Validation rejects empty, zero, negative, non-numeric, and `Infinity`; it rejects nothing for being *large*, because this is a logging product, not a hydration prescription.

**Today's log** is rows in one panel with hairline dividers, per the Design System's conclusion from Fuel — a card per entry would be almost entirely padding around one short line. Each row shows **what the user typed** (`500 mL`, `1 cup`, `16 fl oz` side by side) and the time; the canonical millilitres are implementation detail and never appear. Newest first. The row body opens the editor; delete is an explicit trailing control, matching the Food Log.

**Editing** lives at `/water/entry/[id]` and reuses the same `AmountEditor` as Add, so the two cannot drift apart on parsing or unit behavior — the reasoning behind Fuel's single `PortionEditor`. `id`, `logDate`, and `loggedAt` are never touched: correcting an amount does not make it a different drink at a different time, and preserving the id keeps the entry in place instead of jumping to the end of the day. Amount and unit are recomputed **together** through `waterAmountChanges`, so the canonical value can never contradict its own label. Moving an entry to another day is deliberately not offered — that is a history editor, and nothing here needs one.

**Delete and Undo** use the existing Toast: the entry disappears, the total updates immediately, and `Removed · 16 fl oz` offers Undo for six seconds, restoring the exact entry to its original index. No confirm dialog — the action is reversible, so it does not need a gate in front of it.

**A second defect, found in device QA.** Opening `/water/goal` on a cold start showed an **empty** goal field for a user who already had a goal — the `useState` initializer captured `goal === null` because the provider was still reading storage, and never re-ran. "Edit my goal" silently became "retype my goal". Now seeded by effect once the goal arrives, with a `touched` flag so a late load cannot overwrite something the user has started typing.

**New files.** Routes: `water/goal.tsx`, `water/entry/[id].tsx`. Components (`src/features/water/components/`, recreated after 3.2 deleted the fixture layer): `AmountEditor`, `UnitSelector`, `WaterSummaryCard`, `WaterLogPanel`. Domain: `model/goals.ts` (`createWaterGoal`) and `waterAmountChanges` in `model/entries.ts`.

**Accessibility.** `Chip` and `SegmentedTabs` gained `accessibilityRole` and `accessibilityState.selected` — both signalled selection by fill color alone, which a screen reader cannot see; the change is additive and visually identical, and it benefits Fuel and Peptides too. `ProgressBar` gained an **optional** `accessibilityLabel` (unset everywhere it already existed) that also emits `accessibilityRole="progressbar"` and a 0–100 `accessibilityValue`; Water passes the full readout, and the card's text line carries the same figure so progress is never visual-only. Every icon-only control — delete, the goal row — has an explicit label naming its target (`Remove 16 fl oz`, `Daily goal 64 fl oz. Edit`). Entry rows announce amount and time together. `Chip` gained `hitSlop`, and the log row body carries a minimum height so short text still yields a comfortable target. The amount preview is exposed as text rather than as a decorative number.

**Theme.** All new surfaces resolve through `useTheme().surfaces`; the only fixed colors are `palette.water` (domain) and `palette.fat` (the destructive action and the error line). Verified in both Light and Dark on device.

**Tests: 32 new, 198 total across 10 suites, all passing.** A new `provider.test.tsx` (21) exercises `WaterProvider` through a real React render using **`react-test-renderer`, which `jest-expo` already provides** — no UI-testing stack was installed. It covers the preference/entry-unit separation four ways, goal create/edit/authored-pair/no-goal-is-valid/over-goal, update-in-place (same id, no duplicate, position preserved), delete → total → restore-to-index, and load/save failure messaging. `goals.test.ts` (6) pins that the factory has no default, no suggestion, and no rounding. `entries.test.ts` gained `waterAmountChanges` coverage plus the timestamp/log-date invariant.

**One dependency added:** `@types/react-test-renderer`, types-only and dev-only. `react-test-renderer` itself was already present.

**Validation.** `npm test` 198/198 · `npx tsc --noEmit` clean · `--noUnusedLocals --noUnusedParameters` clean · `npx expo export --platform ios` succeeds · `npx expo install --check` reports only the pre-existing Sprint 2 patch drift · zero changes under `src/lib/nutrition/`, `src/features/peptides/`, `src/app/(vita)/peptides/`, `src/features/dashboard/`, `dashboard.tsx`, or `supabase/`.

**Device QA across every required state**, by seeding storage and deep-linking, since the simulator still cannot be driven. No goal + no logs → empty state, goal invitation, Add Water available, no fabricated percentage. Goal + no logs → `0 fl oz`, `64 fl oz to go of 64 fl oz`, **empty track** reading honestly as zero. Goal + logs → `40.9 fl oz`, `23.1 fl oz to go`, three rows showing `500 mL` · `1 cup` · `16 fl oz`. Preference switched to mL → total became `1210 mL` and the goal displayed `1893 mL`, while **the same three rows still read `500 mL`, `1 cup`, and `16 fl oz`** — the authored snapshots untouched. Edit Entry opened on the cup entry seeded to **cups**, not the fl oz preference, with cup-appropriate quick-adds. Fuel showed `40.9 fl oz · 64%`, matching Water exactly. Light and Dark both verified.

**Not verified:** the tap path — pressing a quick-add, typing, saving, deleting, and pressing Undo on a running build. Every one of those transitions is covered by provider tests against a real React render, and every rendered state above is confirmed on device, but **no human or tool has tapped these controls.** That needs the founder's iPhone.

### Slice 3.2 — Water Domain + Persistence 🟡

**Objective:** replace Water's Sprint 0 fixture with a real, persisted, date-aware hydration domain. An engine slice — the goal experience is 3.3 and the progress visualization is 3.4, so the screens change only as much as proving the engine requires.

**What Water actually was.** Not "basic" — non-functional. `getWaterToday()` returned a frozen `{ cups: 5, goalCups: 8 }`, the Cups/Ounces toggle only swapped which array of chips rendered (no conversion existed anywhere), and **"+ Add Water" called `router.back()`**, discarding whatever the user had entered. Fuel's Hydration card and Home's water tile agreed with each other only because both read the same frozen constant.

**Shared-date hardening, folded into this slice.** `isValidLogDate` checked the shape of a `YYYY-MM-DD` string but not the calendar, so `2026-02-29`, `2026-04-31`, and `2026-13-01` all passed. Survivable while nothing produced such a value — `toLogDate` only emits real dates — but useless as a boundary against a corrupted record, which is the only job it has. It now round-trips the date through local component construction (`toLogDate(fromLogDate(v)) === v`), deliberately **not** `new Date('YYYY-MM-DD')`, which would reintroduce the UTC trap. **Compatibility is proven, not assumed:** a test asserts the hardened validator accepts every date `toLogDate` can produce across four years and two leap days, so no existing nutrition entry or storage key was invalidated. It also correctly rejects `1900-02-29` while accepting `2000-02-29`.

**New — `src/lib/water/`.**

| Module | What it is |
|---|---|
| `model/types.ts` | `VolumeUnit`, `WaterEntry`, `WaterGoal`, `WaterPreferences` |
| `model/units.ts` | Conversion constants, `toMl`/`fromMl`, display rounding, labels, `parseAmount` |
| `model/totals.ts` | `totalMl`, `goalMl`, `ratio`/`progress`/`percent`, `remainingMl`, `overMl`, `isGoalMet`, `sortByLoggedAt` |
| `model/entries.ts` | `createWaterEntry` — the one place both representations of an amount are written |
| `data/keys.ts` | Water's keys, built from the shared helpers |
| `data/WaterRepository.ts` | The persistence interface — the Supabase swap point |
| `data/asyncStorageRepository.ts` | AsyncStorage implementation, built on `createDayKeyedStore`, with read-time validation |
| `state/WaterProvider.tsx` | Context + reducer + shadow refs + optimistic commit + day rollover |
| `state/useWaterToday.ts` | The derived read model |

**Canonical unit: millilitres.** Conversion constants are exact by definition — 1 US fl oz = 29.5735295625 mL, 1 US cup = 8 fl oz, 1 L = 1000 mL — and `floz`/`cup` are explicitly **US customary**, so a future non-US locale adds members rather than silently changing what these mean. Arithmetic happens in mL; rounding happens only at the display boundary, and a rounded display value is never converted back into storage.

**Both representations are stored.** `amountMl` is canonical; `enteredAmount` + `enteredUnit` snapshot what the user actually typed, on the same principle as `FoodEntry.nutrition`. Someone who logs "16 oz" and later switches to millilitres still sees that they logged 16 oz, not a reconstructed 473 mL they never entered.

**The goal is stored as the pair the user authored,** not as millilitres — "8 cups" converted to 1892.7 mL and read back in cups risks displaying 8.0000001, and the goal is the one number a user set deliberately. **There is no default goal.** A missing goal is `null`, and every derived value (`progress`, `percent`, `remaining`) is honest about it. Inventing 64 oz to make the numbers non-null would be VITA issuing a hydration recommendation, which it does not do.

**Storage keys** — `vita:v1:water:log:YYYY-MM-DD`, `vita:v1:water:goal`, `vita:v1:water:prefs`, built through the shared `dayKey`/`singletonKey` helpers so they cannot drift from the rest of the app or collide with `vita:v1:foodlog:…`.

**Read-time validation** follows nutrition's philosophy exactly: malformed JSON and non-array payloads read as an empty day rather than crashing; a record is **dropped, never repaired**; `NaN`, `Infinity`, zero, and negative amounts are rejected; an unusable authored pair is rejected; an impossible calendar date is rejected; and an entry whose own `logDate` contradicts the key it was read from is rejected, which is what stops it being double-counted the moment its real day is opened. Reading is never a write — corrupt data stays on disk untouched rather than being silently rewritten.

**A real defect the tests caught before it shipped.** `isVolumeUnit` used `value in ML_PER_UNIT`, and `in` walks the prototype chain — so `'toString'` and `'constructor'` passed validation, then indexed the conversion table to a function and made `toMl` return `NaN`, poisoning the whole day's total. Now `Object.prototype.hasOwnProperty.call`. This is precisely the class of bug the slice 3.1 harness was introduced to catch.

**UI changes were kept to engine binding only.** Water's index shows the real total, the day's entries (read-only), and either goal progress or an honest "you haven't set a daily goal yet"; Add Water offers the four real units, fixed per-unit quick-adds, a bound custom field, and a save button that is disabled until the amount is valid. `CupsRow` was **deleted** rather than kept — an icon per cup cannot honestly represent a 500 mL or 16.9 oz entry, and it is already approved for replacement.

**Temporary behaviour, both resolved in slice 3.3 — retained here only as history.** (1) There was no way to set a goal in the app, so a real user saw the goal-not-set state; 3.3 ships the goal screen. (2) Saving an entry in a unit other than the current preference updated the display preference; **the founders rejected this as final behavior and 3.3 separated the two concepts.** Neither describes current behavior.

**Fuel integration.** `fuel.tsx` reads `useWaterToday()` instead of the deleted fixture. `FuelTrackerCard` was not touched — only the data flowing into it. With a goal set the card shows the total and a percentage; **without one it shows the total and omits the percentage entirely**, which is why that prop was already optional. `None logged` on an empty day. **Home was deliberately not wired — that is slice 3.4**, so Home's water tile and water goal pillar still read their Dashboard fixture.

**Fixtures removed:** `src/features/water/{types,mock,api}.ts` and `components/CupsRow.tsx`, after grep confirmed nothing imported them. **Peptide fixtures untouched** — they belong to slice 3.5.

**Tests: 100 new, 166 total across 8 suites, all passing.** `units` (31) — exact constants, every conversion pair, cross-unit equivalence, round trips across all four units, display precision per unit, label inflection, `parseAmount` rejecting empty/zero/negative/`NaN`/`Infinity`, and the prototype-chain case. `totals` (30) — empty day, no goal, zero and negative goals, over-goal, clamping, and an exhaustive check that `progress` never returns `NaN`/`Infinity` for any combination of total and goal. `repository` (31) — round trip, authored-pair preservation, restart, wholesale replacement, key removal on an emptied day, date isolation, entry/key date mismatch, unparseable JSON, non-array payloads, malformed records, `NaN`/`Infinity`/zero/negative amounts, impossible dates, malformed goal and prefs, no-rewrite-on-read, and isolation from the nutrition food log. `entries` (8) — both representations written, local-day derivation including a late-night drink, id uniqueness across 200 entries, and refusal to build an entry from a non-drink.

**Validation.** `npm test` 166/166 · `npx tsc --noEmit` clean · `--noUnusedLocals --noUnusedParameters` clean · `npx expo export --platform ios` succeeds (3.45 MB) · `npx expo install --check` reports only the pre-existing Sprint 2 patch drift · `git diff` confirms **zero changes** under `src/lib/nutrition/`, `src/features/peptides/`, `src/app/(vita)/peptides/`, `src/features/dashboard/`, `dashboard.tsx`, or `supabase/`.

**Verified on device, including the persistence paths taps cannot reach.** Because the simulator still cannot be driven — `xcode-select -p` resolves correctly yet the simulator integration reports it does not, the same false negative recorded since Sprint 2 — the app's real AsyncStorage store was seeded in the documented on-disk format (as a previous session would have written it) and the app relaunched. Results: a 16 fl oz entry and a 1 cup entry summed **cross-unit to `24 fl oz`**, with `40 fl oz to go of 64 fl oz` — correct to the millilitre. Entries rendered as **`16 fl oz` and `1 cup`**, their authored values, not converted millilitres. A deliberately corrupt `-250 mL` record and a record whose `logDate` claimed the previous day were **both dropped** — either surviving would have changed the visible total. Yesterday's seeded entry stayed intact under its own key while today was read repeatedly, and inspecting the store afterwards confirmed **the corrupt records were still on disk untouched** — read-time validation drops without repairing, on a real device. Removing the goal key produced `Logged today. You haven't set a daily goal yet.` with no progress bar, and Fuel's card dropped its percentage while keeping `24 fl oz`. A deliberately corrupted `{"unit":"gallons"}` preference fell back to fl oz without crashing. The simulator's storage was restored to its pre-test state afterwards.

**Not verified:** the tap path — choosing a quick-add, typing a custom amount, and pressing Add Water. The write side is covered by repository tests against a real AsyncStorage mock, and the read side is proven on device above, but **nobody has yet tapped Add Water on a running build**. That needs the founder's iPhone.

### Slice 3.1 — Shared Daily Foundation + Test Harness 🟡

**Objective:** promote the genuinely reusable daily/date infrastructure out of the nutrition domain and stand up VITA's first committed automated test suite — with the app behaving identically before and after. An enabling slice; nothing a user can see changes.

**Why it exists.** Two things were true after Sprint 2: the only correct local-calendar date model in the codebase lived inside `src/lib/nutrition`, where Water and Peptides could not reach it without importing the nutrition domain; and the Sprint 2 closeout audit's open finding — no committed tests — was about to be inherited by a sprint containing safety-adjacent dose arithmetic. Both are cheaper to fix before two new domains are built on top than after.

**New — `src/lib/daily/`.** The shared substrate for every date-keyed feature:

| Module | What it is |
|---|---|
| `dates.ts` | `LogDate` and the local-calendar date model — **moved from `nutrition/model/dates.ts`, logic byte-identical** |
| `ids.ts` | `newId(prefix)` — moved from `nutrition/model/foods.ts` |
| `keys.ts` | `NAMESPACE` plus `dayKey`/`dayKeyPrefix`/`singletonKey` |
| `guards.ts` | `isRecord`/`isFiniteNumber`/`isNonEmptyString`/`isPositiveNumber` |
| `storage.ts` | `readJson`/`writeJson`/`removeKey`/`allKeys`, with unparseable JSON treated as absent rather than thrown |
| `dayStore.ts` | `createDayKeyedStore<T>(domain, parse)` — one storage key per day, caller-supplied record parser |
| `useDayRollover.ts` | The `AppState → active` local-day rollover, generalized from `NutritionProvider` |

**Deliberately not here: a shared entry type.** A glass of water and a peptide administration have genuinely different shapes, and unifying them behind a type parameter would make both harder to read. Shared infrastructure ends where the domains begin.

**How nutrition compatibility was preserved.** `src/lib/nutrition/index.ts` re-exports every moved symbol under its original name, so its public API is unchanged and **no file under `src/features/` or `src/app/` was touched** — verified by `git diff --name-only`. Inside nutrition, seven files changed: five import-path rewrites, one `NAMESPACE` import, and the rollover swap. `model/foods.ts` re-exports `newId` rather than dropping it, so anything importing it from there still resolves.

**What was deliberately NOT retrofitted.** `NutritionRepository` still uses its own storage helpers and its own key builders rather than `dayStore` and the shared guards. It is approved, merged, and holds real user data; rewriting its storage layer to prove a new abstraction would be regression risk bought with no user-visible gain. Consolidation is a later opportunity, recorded rather than taken.

**Storage keys are a compatibility contract.** Only `NAMESPACE` moved out of `nutrition/data/keys.ts`; every key string it builds is unchanged, and `src/lib/daily/__tests__/keys.test.ts` now pins those exact strings — `vita:v1:foodlog:<date>`, `vita:v1:targets`, `vita:v1:myfoods`, `vita:v1:favorites`, `vita:v1:cache:food:<id>`. These name data already on users' devices; a change here would not throw, it would silently orphan a real food log.

**Test harness — the deferred stack decision, now made.** `jest` + `jest-expo` + `@types/jest`, installed with `npx expo install --dev` so the versions match SDK 54 (`jest-expo@~54.0.18`). **Dev dependencies only — nothing enters the app bundle and no native module was added**, so Expo Go compatibility is untouched. Config is `jest.config.js`, deliberately minimal: the Expo preset, a `__tests__/*.test.ts(x)` match, and source-only paths. Scripts: `npm test`, `npm run test:watch`. `jest-expo` was chosen over Vitest because it is Expo's own supported preset and leaves component testing available later without a second migration.

**62 tests across 4 suites**, all passing. `dates` (36) — formatting and padding, late-night local-calendar behavior, month/year boundaries, a leap day, the non-leap Feb 29 rollover, format-vs-calendar validation, rejection of non-strings, `todayLogDate` bracketed against a midnight crossing, and every month and weekday name. `keys` (11) — the nutrition key strings pinned, plus domain isolation. `guards` (11) — `NaN`/`Infinity`/`null`/array cases. `dayStore` (15) — round-trip, wholesale replacement, key removal on an emptied day, parser rejection including day-mismatch, unparseable JSON, newest-first history, gaps, `maxDays`, and cross-domain isolation.

**Every test is timezone-independent by construction.** Dates are built from local components and checked with local getters, so they pass identically in UTC, Los Angeles, and Auckland. The `new Date('YYYY-MM-DD')` UTC trap is expressed as a **round-trip property over 365 consecutive days** rather than as a direct comparison — asserting the trap directly would only fail in negative-offset timezones and pass everywhere else, which is exactly the machine-dependent test this suite should not contain. No DST-specific test was written; controlling the process timezone is a harness capability this slice did not need, and a fragile version of it would be worse than none.

**Validation.** `npm test` — 62/62 pass · `npx tsc --noEmit` — clean · `npx tsc --noEmit --noUnusedLocals --noUnusedParameters` — clean · `npx expo export --platform ios` — succeeds (3.43 MB bundle) · `npx expo install --check` — reports only the pre-existing `expo`/`expo-constants` patch drift carried from Sprint 2, unchanged here, with `jest-expo` not flagged · `git diff --name-only` — confirms zero files changed under `src/features/` or `src/app/`.

**Verified running in Expo Go on the iOS Simulator, and the run produced an unplanned end-to-end proof of the date model.** The first launch happened on a simulator whose clock still read **2026-08-21**: Fuel rendered `Friday, August 21` and loaded that day's real persisted food log — 2,326 Calories, Breakfast and Lunch populated, Big Mac and Bananas intact — which is direct evidence that **food data written before this slice still reads correctly after it**. The simulator was then rebooted, resyncing its clock to 2026-08-22, and the same build rendered `Saturday, August 22` with an empty day, `0 Calories`, and all four meal slots showing `No foods logged`. Same code, two device dates, the correct log for each. Home rendered correctly on the new date, and Fuel's Hydration (`5 of 8 cups · 63%`) and Peptides (`1 logged today`) modules still show their Sprint 0 fixtures exactly as before — the regression boundary held.

**Not verified:** tap-driven paths, unchanged from the standing limitation — the simulator can be deep-linked and screenshotted but not driven. No physical-device testing was performed in this slice, and none was needed: nothing user-facing changed.

---

## Sprint 4 — Settings + Tools Foundation — ✅ COMPLETE (opened and closed 2026-09-01)

**Opened 2026-09-01.** Branch `sprint-4-settings-tools-reference`, cut from `main` at `8b8ec8d`. Founder-authorized against the **Sprint 4 Planning & Architecture Audit** (`docs/Sprint-4-Planning-Audit.md`, planning commit `aa1c60a`), which the founders reviewed and approved.

**Founder decisions recorded at approval.** Tools are promoted out of Settings-owned route identity — a calculator is not a preference, and a later slice establishes the `/tools` architecture · any Settings row that visually promises navigation must actually work, and a nonfunctional row is removed rather than kept as a placeholder · Appearance must persist · Units becomes a real preference surface **without rewriting already-approved domain storage** · BMI is Sprint 4 but not slice 4.1 · Research Library *architecture* is approved, full health/reference content is not · **Food/Product Scanner scoring is not authorized — no VITA Score is to be invented** · Dashboard Tools shortcut deferred · OS notification delivery deferred · no account/profile/export systems built merely to populate Settings.

| # | Slice | Objective | Status |
|---|-------|-----------|--------|
| 4.1 | Settings Foundation | Honest Settings, persistent Appearance, real Units destination, accurate version | ✅ Approved |
| 4.2 | Tools & Reference Hub + route architecture | Promote Tools out of `/settings/`, establish the hub | ✅ Approved |
| 4.3 | Existing Tools integration / polish | Peptide Calculator and Injection Sites discoverability and consistency | ⏸️ **Deferred** — presentation work, awaiting the new visual language |
| 4.4 | BMI Calculator | Height/weight in, BMI and range out, neutral visual scale | ⏸️ **Deferred, not cancelled** |
| 4.5 | Research Library foundation | Content model, routes, content tests | ⏸️ **Deferred, not cancelled** |
| 4.6 | Product Scanner shared-data expansion | Never committed; scoring never authorized | ⏸️ **Deferred, not cancelled** |
| 4.7 | Sprint-wide integration / polish | — | ⏸️ Deferred |
| 4.8 | Sprint 4 audit + closeout | Folded into this closeout | ✅ Done |

**Slice 4.6 is deliberately not committed.** The founders' words: *"I would not promise 4.6 yet. We can reassess once 4.1–4.5 are real."*

### Slice 4.1 — Settings Foundation 🟡

**Objective:** turn Settings from a partially functional placeholder into an honest, persistent foundation — every visible row real, Appearance surviving a relaunch, Units a genuine destination — ready to receive the Tools & Reference entry in slice 4.2.

---

**The rule the slice is built on:** a row that shows a chevron opens something, or it is not on the screen.

**Five of eight rows failed that test**, all re-verified against source before anything was changed:

| Row | What it claimed | Disposition |
|---|---|---|
| Profile | A profile, over `AuthProvider`'s mock user (`Wilber` / `wilber@vita.app`) | **Removed** — no profile model exists |
| Notifications | Notification settings | **Removed** — `expo-notifications` is not a dependency; no delivery infrastructure exists |
| Units | `Imperial (lb, oz)` | **Replaced with a real screen** — see below |
| Privacy & Data | Privacy/data controls | **Removed** — no export, delete, or reset exists |
| Sign Out | A sign-out, in destructive red | **Removed** — `AuthProvider.signOut` is `async () => {}` |

None was rebuilt to preserve its row. Building a profile system, an auth session, or a notifications surface so that Settings looks fuller would be letting a screen's layout dictate the product roadmap — and the founder ruling was explicit that these return when they are real.

**The Units row was the most serious defect, because it was not empty — it was false.** VITA has never had pounds or mass ounces anywhere in the codebase; the only body-adjacent `MassUnit` is `'mg' | 'mcg'` and describes a peptide dose. Worse, the claim *contradicted a real preference*: Water genuinely stores a volume unit at `vita:v1:water:prefs`, so a user who had chosen millilitres was being told by Settings that they were on imperial units.

**Appearance now persists.** `ThemeProvider` held `mode` in `useState('system')` with no storage, so the only functioning preference in Settings was discarded on every relaunch. It now hydrates from and writes to a preference repository. Three behaviours matter and each is pinned by test: an explicit choice is restored, `system` is restored **as a live choice** and keeps following the device rather than freezing whatever it resolved to, and an unreadable or missing value falls back to System instead of falling through to light.

**Startup was the risk, and is handled deliberately.** Nothing renders until the stored appearance is known — the alternative is a visible flash where a user whose choice is Light on a Dark device sees the app paint dark and snap one frame later. The hold is bounded: `hydrated` is set in a `finally`, so a storage failure can never leave the app blank. A test asserts children still mount when the read throws.

**`src/lib/preferences/` — small on purpose.** Model, key, repository interface, AsyncStorage implementation, public API. It holds app-level preferences only: things more than one feature reads and no feature owns. It is not a settings framework, and Sprint 4 has real features left to build.

**The parser reads field by field, never all-or-nothing.** This is what makes the slice-4.4 extension point real rather than aspirational: a record written before a preference existed is missing that field, and one written by a later build carries fields this one does not know. Rejecting the whole record in either case would silently discard preferences the user did set. Each field independently falls back to its default; a test pins that an unknown key does not destroy a known one.

**Water's storage was not touched, by ruling and by design.** The Units screen writes through `useWater().setUnit` — the same call the Water goal screen makes, into the same `vita:v1:water:prefs` record. This is the founder ruling on Open Question #16 (closed 2026-08-21) honoured literally: Settings reads and writes Water's source rather than creating a second one that can disagree with it. **No migration was performed and none is needed.** Two stores behind one screen is the correct outcome, not a compromise — migrating already-approved domain storage for architectural tidiness would be risk bought with no user-visible gain.

**Only preferences with a real consumer appear.** The Units screen shows Water's four volume units and nothing else. Body weight and height belong to slice 4.4 and are deliberately absent — a preference a user can set and never observe is the same dishonesty as a row that navigates nowhere. The extension point is documented in `src/lib/preferences/model/types.ts`, not pre-built into the UI.

**Version is read from configuration.** `0.1.0 (Sprint 0)` was a hardcoded string three sprints stale — which is what hardcoded versions do. It now derives from `Constants.expoConfig`, appending a build number only when one is configured, so it can never read `1.0.0 (undefined)`. **No internal sprint names**: a user has no way to interpret them.

**One additive change outside Settings.** `UnitSelector` gained an optional `groupLabel`, passed through to `SegmentedTabs`. Without it a screen reader on the Units screen announces four bare unit names with nothing saying what they measure. Existing call sites are unchanged and pass nothing.

**Deliberately not done — the Tools entry.** Slice 4.2 owns the `/tools` route architecture and the "Tools & Reference" identity. 4.1 only guarantees the existing entry still works, and a test pins that it still pushes `/settings/tools`. The mild redundancy of a `Tools` section header above a `Tools` row is left for 4.2, which retitles that area anyway.

---

**Validation.** `npm test` — **1153/1153** pass across 43 suites (1093 → 1153: **60 added**, none removed) · `npx tsc --noEmit` — clean · `npx tsc --noEmit --noUnusedLocals --noUnusedParameters` — clean · `npx expo export --platform ios` — succeeds (3.86 MB bundle) · `npx expo install --check` — reports only the `expo@54.0.36` / `expo-constants@18.0.13` patch drift carried since Sprint 2, unchanged.

**Test coverage added — 60 tests across 3 suites.** `lib/preferences/__tests__/repository.test.ts` (24) — key namespacing, key isolation from Water's, the mode guard including prototype-chain strings, round trips, and every damaged-storage case degrading to a default rather than a wrong value. `lib/preferences/__tests__/provider.test.tsx` (13) — **every persistence test is written as a relaunch**, because the defect was a startup defect and toggling the control already worked; plus System still following the device after a relaunch, a throwing read, and a throwing write. `features/settings/__tests__/SettingsRoutes.test.tsx` (23) — real renders of the real routes.

**The honesty rule is enforced as an invariant, not a checklist.** One test walks every `ListRow` on the screen and asserts that anything drawing a chevron has an `onPress`, so a row added later cannot reintroduce the defect without failing. Separate tests pin the exact row list and the absence of each removed row by name.

**The single-source-of-truth claim is proven, not asserted.** A test changes the water unit on the Settings → Units screen, unmounts it, mounts the **Water screen** against the same provider, and reads `500 mL` off it. A second test confirms an already-logged `16 fl oz` entry still stores `enteredAmount: 16` / `enteredUnit: 'floz'` afterwards — the display preference re-reads history, it does not rewrite it.

**Boundary audit.** Six paths touched in total: `settings/index.tsx`, `settings/units.tsx` (new), `theme/ThemeProvider.tsx`, `features/water/components/UnitSelector.tsx` (one optional prop), `lib/preferences/` (new), `features/settings/__tests__/` (new). **Zero changes** to nutrition, Fuel, Home, Journey, Atlas, Peptides, the Peptide Calculator, Injection Sites, the body map, the peptide catalog, or any Water file other than the additive `UnitSelector` prop.

**No regressions.** The full pre-existing suite passes unchanged, including `WaterRoutes` (which exercises the goal screen's `UnitSelector`), `UnitConversion` (the Peptide Calculator and the Tools row), and `PeptideLogging`/`PeptideRoutines` (Injection Sites). `ThemeProvider` is mounted by all ten pre-existing route/component suites and every one still passes, which is the theme-regression check across Home, Fuel, Water, Peptides, the Calculator and Injection Sites.

**A pre-existing test-harness warning is unchanged and unrelated.** Real renders emit `You are trying to access a property or method of the Jest environment after it has been torn down` from `react-native/jest/setup.js`. The untouched `WaterRoutes` suite emits it 991 times on its own; the new Settings suite emits it for the same reason — the same harness. Not introduced here, and not a failure.

**⚠️ Not verified: on-device Light/Dark capture, and the relaunch scenarios on real hardware.** This was attempted and is blocked by the environment, not by the code: the simulator's Expo Go is **57.0.2**, SDK 54 requires **54.0.7**, and Expo CLI's offer to install the matching client cannot be answered without a TTY. The simulator was booted, deep-linked, screenshotted, and then shut down and Metro stopped, leaving the environment as found. **Every persistence and rendering claim above rests on route-level tests that drive the real handlers and mount the real screens** — but the four screenshots §29 asked for (Settings and Units, Light and Dark) were not captured, and the founder's device review should cover them along with the relaunch scenarios.

### Slice 4.2 — Tools & Reference Hub + Route Architecture 🟡

**Objective:** give Tools & Reference a real product identity and a clean route architecture — the destination stops being a Settings subfolder and becomes its own thing, with the two Sprint 3 tools moved under it unchanged.

---

**The route was the argument.** Slice 4.1 established that Settings shows only what is real; 4.2 addresses the other half of the founders' §22 concern — that a calculator is not a preference. The strongest available statement of that is the address itself, and `/settings/tools/peptide-calculator` said the opposite. A route is the plainest claim an app makes about what something *is*.

| Before | After |
|---|---|
| `/settings/tools` | `/tools` |
| `/settings/tools/peptide-calculator` | `/tools/peptide-calculator` |
| `/settings/tools/injection-sites` | `/tools/injection-sites` |

`src/app/(vita)/tools/` is a sibling of `settings/`, `water/` and `peptides/`, which is the repository's existing convention. **No `_layout.tsx` was added** — `(vita)/_layout.tsx` declares only `(tabs)` and every other route is implicit, exactly as Water, Peptides and Settings already are. **No route group** (`(tools)`): groups exist to share a layout without appearing in the URL, and here there is no layout to share and the segment is wanted in the URL.

**Legacy routes: removed entirely**, not redirected or wrapped. VITA has no public deep links to preserve and is under active development, so a duplicate route tree would be two screens to maintain and one of them dead. The `settings/tools/` directory is gone, including the now-empty folder. Two tests pin the removal from both ends: Settings never pushes anything containing `/settings/tools`, and the hub never pushes anything containing `/settings`.

**A dependency map was produced before anything moved** — nine references across six files, and **nothing outside Settings and the test suites referenced these routes at all**.

**The fast logging flow was the real risk, and it was never exposed.** `SiteSelector`'s *View Body Model* affordance reads like navigation and is not: it calls `setMode('map')` and renders `BodyMap` inline in the sheet. That was a deliberate slice-3.8 decision — *the figure did not go away, and is not buried in Settings* — and it means the everyday Taken flow has no dependency on the Tools route at all. Nothing in Peptides needed updating; **zero Peptides source files changed.**

**Grouped by TOOLS, not by domain.** The old header read `Peptides`, which was correct when every tool here was a peptide tool and becomes wrong the moment one is not — a BMI calculator is not a peptide tool and would force either a false grouping or a second header. The split the founders want visible is Tools versus Reference, so that is the split the headers carry. The icon-colour convention is now explicit: a tool takes the colour of the domain it serves (both current tools are peptide purple); a tool belonging to no domain takes the neutral treatment.

**There is deliberately no REFERENCE section.** The screen title is the founder-approved destination identity; an empty heading underneath it, or a disabled "Research Library — Coming Soon" row, would be exactly the placeholder UI the founders have twice rejected. Slice 4.5 adds one header and one row, which is why the TOOLS header is carried now rather than added later. A test asserts `TOOLS` is present and `REFERENCE` is not, and four more assert the hub advertises no BMI, no scanner, no Research Library, and no "Coming Soon".

**Visual pattern unchanged: `ListRow`.** Considered and rejected: a card grid, which with two items reads as a sparse dashboard rather than a list, and a `ToolRow` abstraction, which would wrap `ListRow` and add nothing — the planning audit's finding that one new component is the right number for this sprint still holds, and 4.2 adds zero.

**Copy.** Peptide Calculator: *"Vial and reconstitution to U-100 units"* — what it converts, with no dose framing. Injection Sites: *"Body map, site reference, and your history"* — names all three things it offers while implying no recommendation. Both fit `ListRow`'s single-line subtitle; the longer phrasing sketched in the authorization would have truncated at this width. A test asserts neither row's copy contains recommendation language.

**Settings keeps the entry and loses the misdirection.** The row is now titled **Tools & Reference** and pushes `/tools`. Its subtitle names the two tools that exist rather than the destination's full identity — *"Calculators and reference"* would advertise a Reference section that does not arrive until 4.5.

**One judgement call worth flagging for device review.** Settings now carries a `TOOLS & REFERENCE` section header above a single row also titled *Tools & Reference*. The header is load-bearing — it is what separates Tools from PREFERENCES, and dropping it would let the row read as a preference, which is the thesis of this slice inverted — but the repetition is visible, and it is the founders' call whether it reads as clear or as redundant on device.

---

**Validation.** `npm test` — **1174/1174** pass across 44 suites (1153 → 1174: **21 added** in a new hub suite, one pre-existing hub assertion relocated into it) · `npx tsc --noEmit` — clean · `npx tsc --noEmit --noUnusedLocals --noUnusedParameters` — clean · `npx expo export --platform ios` — succeeds · `npx expo install --check` — reports only the `expo@54.0.36` / `expo-constants@18.0.13` patch drift carried since Sprint 2, unchanged · stale-reference sweep for `settings/tools` — clean apart from one explanatory comment and two negative test assertions · empty-directory sweep — clean.

**Test coverage — `features/tools/__tests__/ToolsRoutes.test.tsx`, 21 tests.** The hub is titled for the destination rather than the route · it lists exactly `['Peptide Calculator', 'Injection Sites']` · it advertises no BMI, scanner, Research Library or "Coming Soon" · it renders no empty REFERENCE heading · the chevron-implies-a-destination invariant from 4.1 is enforced here too · every row has a title, subtitle and accessibility hint · both tools open at their canonical routes · neither the hub nor Settings pushes anything under `/settings` · back from hub and from each tool calls `router.back()` and pushes nothing. Both migrated tools are re-proven rather than assumed: the calculator still renders `Vial Amount (MG)` and `Reconstitution Volume (ML)`, still converts `20 mg / 2 mL` to `1 mg = 10 units`, and still offers **no vial unit toggle** (the 3.10A ruling, pinned across the move); Injection Sites still renders Front/Back, `RECENT SITES` and `SITE REFERENCE`, and still recommends nothing.

**The relocated assertion.** `UnitConversion.test.tsx` carried a small `Tools destination` block asserting the hub opened the calculator. It moved into the new suite and was expanded — it was a Tools-destination concern sitting in a suite about dose arithmetic. Net coverage rose; nothing was dropped.

**Boundary audit.** Changed: the three migrated route files (import depth only, contents otherwise untouched apart from the hub rewrite), `settings/index.tsx` (one row), and four test files (import paths and route assertions). **Zero diff against `87fbf02`** on nutrition, Fuel, Home, Journey, Atlas, Water, every `src/lib`, every `src/features` component including `SiteSelector`, `BodyMap` and `UnitConversion`, and both migrated tools' rendered output.

**⚠️ Not verified: on-device Light/Dark capture, for the second slice running, and the cause is now fully diagnosed.** Two independent blockers, neither in the code. The simulator's Expo Go is **57.0.2** while SDK 54 requires **54.0.7**, and the Expo CLI's offer to install the matching client cannot be answered without a TTY (`CI=1` and piped input both refused). The dev-client route around that — `expo run:ios`, which needs no Expo Go — is blocked because **CocoaPods is not installed**, and installing it is a system-level change requiring elevated permissions rather than an engineering decision. `/ios` and `/android` are gitignored, so a prebuild would have been safe to attempt had the toolchain allowed it. **This is simulator-only:** the founders' own iPhones run a matching Expo Go, which is how slice 4.1 was reviewed and approved on device. The four screenshots §27 asked for were not captured and belong to that review.

### Sprint 4 Closeout — Settings + Tools Foundation ✅

**Founder decision, 2026-09-01: Sprint 4 closes here, after slices 4.1 and 4.2, and is redefined as _Settings + Tools Foundation_.**

**This is an intentional endpoint, not an abandonment.** Both approved slices are foundation work — persistence, information architecture, and route identity — and none of it depends on how VITA looks. Everything remaining under the original Sprint 4 umbrella is **presentation-heavy**: a BMI result and its scale, a reference library's reading experience, a product-evaluation surface, a Dashboard affordance. The founders are about to define a new VITA visual and interaction language, and building those four surfaces first would mean designing them twice — once now, once again immediately afterwards. Deferring them is the cheaper and more coherent order of work, not a reduction in ambition.

The sprint delivered exactly the part that had to come first: **the architecture the deferred Tools will be built into.** `/tools` exists, the hub exists, Settings is honest and persistent, and a new tool is now a row and a route rather than a negotiation about where it belongs.

#### What Sprint 4 represents

**Settings foundation** — a persistent Appearance preference (System / Light / Dark); a real Units destination reading and writing Water's own `vita:v1:water:prefs`; every fake row removed (Profile, Notifications, Privacy & Data, Sign Out); an accurate version display; and an information architecture in which a visible row always does what it appears to do.

**Tools foundation** — a top-level `/tools` route identity; the Tools & Reference hub; canonical routes for the two Sprint 3 tools; Settings retained as the discovery entry point but no longer the owner of Tools' identity; and a structure that accepts new tools and a Reference section without redesign.

#### Deferred — not cancelled

| Work | Status |
|---|---|
| **BMI Calculator** | **Planned. Not cancelled.** Deferred until the new visual / interaction language exists, so it is designed correctly once rather than built and immediately redesigned. No implementation details are assigned here beyond that. |
| **Food / Product Scanner evolution** | Deferred. The Sprint 2 barcode scanner in [[Fuel]] is untouched and still works. Richer product analysis remains possible; **the scoring methodology remains unresolved and deliberately so — no VITA Score exists or is authorized.** |
| **Research Library / Reference** | Deferred. The concept stands: factual educational material on storage, handling, reconstitution basics, stability, and research/development status. Still gated on Open Questions #17. |
| **Dashboard Tools discoverability** | Deferred, as it has been at every decision point. Still a saved idea, still no authorized Dashboard card. |

#### Product boundary — restated, and narrowed

Earlier planning described dose-range and treatment-style content as available *with* founder authorisation plus medical, legal and content review. **That framing is withdrawn.** It described a gated future feature, and the founders do not want the feature.

**VITA does not provide recommended dosages, dose ranges, or treatment-style protocols — for research compounds or approved medications — and doing so is not a product direction.** What VITA does is unchanged and is the whole point: it helps users understand, calculate, organise and track information *they* enter. Factual reference material stays in scope, still behind the Open Questions #17 review gate.

Historical records that carry the older wording are left as written and marked superseded where they were being read as current. History is not rewritten.

#### Closeout verification

Documentation and status only — **no application source was changed in this closeout.**

`npm test` — **1174/1174** pass across 44 suites · `npx tsc --noEmit` — clean · `npx expo install --check` — only the `expo@54.0.36` / `expo-constants@18.0.13` patch drift carried since Sprint 2.

Regression suites run individually as well as together: Settings + Tools + preferences (82), Peptides including the calculator, Injection Sites and logging (336), Water including the unit-preference integration (171).

Scope verified by inspection: **no BMI source exists** (every `BMI` occurrence is a comment or a negative test assertion), **no Research Library source exists**, **`src/lib/nutrition` and `fuel/scan.tsx` are byte-identical to `main`**, `/tools`, `/tools/peptide-calculator` and `/tools/injection-sites` are present, and `src/app/(vita)/settings/tools/` is absent.

**One recorded follow-up, still open after the roadmap session.** Two source comments reference "slice 4.4" as BMI's home (`settings/units.tsx`, `lib/preferences/model/types.ts`). The roadmap-alignment session of 2026-09-01 was **documentation-only and changed no application source**, so the comments were deliberately left as they are. They remain accurate about *intent* and stale only about *numbering*: **BMI is still planned, deferred into the Sprint 5 identity work**, and no slice number is assigned to it yet — slice 5.6 is a candidate but the draft plan explicitly leaves open whether BMI earns its own adjacent slice. **Correct the comments in the first Sprint 5 slice that touches those files**, once BMI has a real slice number.

**The roadmap-alignment session ran on 2026-09-01, and no implementation followed it.** The founder-directed identity sprint is now on the roadmap as **Sprint 5 — VITA Identity & Interaction**, ahead of Journey; Journey / Weight is Sprint 6, Journey / Photos Sprint 7, Atlas Sprint 8, and the final polish sprint **Sprint 9 — Final Polish / Motion / Launch Experience**. See `docs/04-Master-Roadmap.md` and `docs/Sprint-5-Identity-Brief.md`.

---

## Sprint 5 — VITA Identity & Interaction — 🟡 IN PROGRESS (opened 2026-09-02)

**Opened 2026-09-02.** Branch `sprint-5-identity-interaction`, cut from `main` at merge commit `8dce19c` (Sprint 4 merged the same day). Founder-authorized against the **Sprint 5 Planning & Architecture Audit** (`docs/Sprint-5-Planning-Audit.md`, `7743443`), which the founders reviewed and approved, ruling on eleven decisions recorded in its §W.

**Objective:** make VITA feel unmistakably like VITA — establish the visual and interaction language before Journey is built in it.

**Scope character:** primarily presentation and interaction work. Sprint 4's Settings architecture, Appearance persistence, Units architecture, `/tools`, the Tools & Reference hub, the Peptide Calculator, Injection Sites, the Body Map / injection-site primitives, navigation foundations, domain logic, utilities, persistence and repositories are **preserved and not rebuilt**.

**Founder rulings at authorization** (full text in the planning audit §W). No single surface wins globally — direct-on-background is the default, opaque surfaces group only when content genuinely needs it, `GlassSurface` is a rare emphasis role, and feature-specific visual objects are preferred where the activity benefits; **card soup must not become glass soup** · the Water object shows **percentage of the user's goal**, never literal vessel capacity, with no capacity markings · **fixture Dashboard data does not survive the redesign**, and nothing is fabricated to populate a module · Tools gets a real destination on Home, but Home does not become a launcher · `expo-haptics` approved with a restrained vocabulary · **BMI is its own slice 5.8**, not part of Tools cleanup · rotation uses the existing shared `BodyMap`, with the Injection Sites Tool as the richest historical view · Water moves ahead of Dashboard.

| # | Slice | Objective | Status |
|---|-------|-----------|--------|
| 5.1 | VITA Design Language + Identity Prototype | Author the design language, build the minimal primitives it requires, and prove it in a coded prototype | 🟡 Identity direction founder-approved on device; polished in 5.1A, awaiting the 5.1A review that locks it |
| 5.1A | Identity Prototype Visual Polish | Quick-add layout, vessel refinement, liquid settle, hydration copy, CTA treatment | ✅ Founder-approved on device 2026-09-02 — **5.1 locked** |
| 5.2 | Interactive Water Experience | First complete feature in the new language — hydration object, quick-add sheet, haptics, history disclosure | ✅ Founder-approved on device 2026-09-03 |
| 5.2A | Water Custom Amount Keyboard Polish | A Done key for the number pad, and the press-opacity regression it exposed | ✅ Founder-approved · 5.2 closed |
| 5.3 | Dashboard Identity Redesign | Real data only, no generic slogans, action-first composition, Tools destination | 🟡 Data work approved; composition revised in 5.3A |
| 5.3A | Dashboard Composition + Customization | Denser composition, Quick Tools, Today's Schedule, Customize Home, dock contrast fix | 🟡 Implemented — awaiting founder device review |
| 5.4 | Peptides Home Redesign | Today as hero, completed settles in place, routines progressively disclosed | ⬜ Not started |
| 5.5 | Routine + Injection Site Experience | Immediate action dominant, shared `BodyMap` evolution, rotation visualization | ⬜ Not started |
| 5.6 | Tools Integration | Sprint 4's existing working Tools under the new language — behaviour frozen | ⬜ Not started |
| 5.7 | Motion + Microinteraction Unification | Unify the vocabulary once real features use it; close remaining reduce-motion gaps | ⬜ Not started |
| 5.8 | BMI Calculator | Built from scratch in the new system | ⬜ Not started |
| 5.9 | Founder Identity Audit | Real-device review, both themes, VoiceOver, reduce-motion | ⬜ Not started |

**Journey does not begin without explicit founder approval after 5.9.**

### Slice 5.1 — VITA Design Language + Identity Prototype 🟡

**Implemented 2026-09-02. Awaiting founder identity review — not approved.**

**The design language is authored** in `docs/05-Design-System.md` → *The VITA Design Language*: sixteen sections covering surface roles, feature colour, typography, spacing, radius, borders, interaction, motion, reduce motion, haptics, progressive disclosure, completion, empty states, feature-specific vs shared, the accessibility floor, and light/dark. `docs/Sprint-5-Migration-Guide.md` maps every remaining screen onto it so 5.2–5.8 are mechanical rather than exploratory.

**Four primitives, each solving a problem the audit measured — and no more.** The instruction was explicitly not to build a design system for its own sake.

- **`VitaSheet`** (`components/ui/VitaSheet.tsx`) — extracted, not invented. The audit found four hand-rolled `Modal` sheets in `features/peptides/components/`, two sharing a byte-identical backdrop and shell. Built on RN `Modal`; **no `@gorhom/bottom-sheet`**, which would have added Reanimated *and* Gesture Handler for snap points nothing needs. Backdrop, top radius, safe-area bottom, keyboard avoidance, optional head, three exits (backdrop, close, Android back), `accessibilityViewIsModal`, reduce-motion presentation.
- **`src/lib/haptics/`** — `expo-haptics@~15.0.8` behind `vitaHaptic(event)`. Four events: `selection` · `confirm` · `complete` · `warn`. Silent on failure, returns `void` so no caller can await a vibration.
- **`motion` tokens** (`theme/tokens.ts`) — `press` 90ms · `state` 180ms · `sheet` 260ms · `progress` 700ms, plus the shared press spring and scales. Replaces per-component literals (650ms in `ProgressBar`, 700ms in `WaterLevelPanel`, an undocumented spring in `PressableScale`). `progress` deliberately keeps the founder-approved feel rather than re-timing approved motion.
- **`PressableScale` evolved rather than replaced.** A new `VitaPressable` was considered and rejected — the existing component already had the call sites. It now honours reduce-motion (fading instead of scaling, so feedback survives without movement), reads its spring and scale from tokens, and takes an optional `haptic`. **This closes the largest remaining reduce-motion gap in the app across six call sites at once.**

**`WaterVessel`** (`features/water/components/WaterVessel.tsx`) — the identity object, and deliberately **Water-specific**. Not a `ProgressObject`, takes no colour or shape props, and Peptides and Fuel do not inherit it. An abstract vessel: narrow mouth, shoulder, straight body, slightly drawn-in base — no cap, no threads, no label panel, **no measurement marks of any kind**, because the fill is percentage of the user's chosen goal and a branded bottle would assert a capacity the app does not have.

Drawn as four layers with **no SVG clip path anywhere**: the silhouette is generated from a parametric `halfWidthAt(t)`, the liquid is the same silhouette inside a bottom-anchored view clipped rectangularly by `overflow: 'hidden'`, the waterline's width is read from the same function so it always meets the wall, and the edge strokes over the top. `ClipPath` was avoided on purpose — `BodyMap` records that it "was tried first and did not apply on device", and it also forces a per-frame SVG re-render. Rectangular clipping is what `WaterLevelPanel` already animates against, on device, founder-approved.

**Three defects were found on device and fixed before review**, which is what the prototype exists for:
1. the silhouette was visibly **faceted** — 44 polyline samples left about ten segments carrying the shoulder; now 120;
2. the primary action was a **full-width saturated blue slab** using the shared `Button` with `color={palette.water}` — the loudest thing on screen, and precisely what the founder colour rule forbids. Replaced with the app's **neutral** action, which is now the documented rule: the object carries the feature colour, the button does not;
3. the completion ring was drawn at `scale(1.05)` and **clipped at the top**, leaving gold down the sides and nothing across the shoulder. Completion now turns the vessel's own edge gold, which needs no room and cannot clip. The waterline also overshot the rim at 100% and now stops three points short.

**The prototype** (`src/app/(vita)/identity.tsx`) is `__DEV__`-gated, reachable from Settings → Development → Identity Prototype (also `__DEV__`-only) or by deep link to `/identity`. **Both are temporary and are removed in slice 5.9.** It holds every value in local `useState` — it does not read `useWater()`, write an entry, or touch a goal, so founder testing cannot contaminate real hydration data. A test asserts exactly that.

**`PressableCard` deleted** — zero call sites, confirmed before removal; the only remaining references were two doc comments, both updated.

**Production files touched, and why.** `theme/tokens.ts` (motion tokens, additive) · `components/ui/PressableScale.tsx` (reduce-motion + haptic, backward compatible) · `components/ui/index.ts` (exports) · `Card.tsx` / `GlassSurface.tsx` (**doc comments only** — recording that neither is the default surface) · `settings/index.tsx` (the `__DEV__` row) · `package.json` (`expo-haptics`). **No screen was redesigned.** `Card`'s 23 call sites, `SectionHeader`'s 28 and `ScreenHeader`'s 31 are untouched; migration happens in the slice that redesigns each screen.

**Zero changes under `src/lib/` domain code.** The only `src/lib/` addition is the new `haptics/` module.

**Validation.** `npm test` **47 suites / 1200 tests passing** (was 44 / 1174; +26 tests) · `npx tsc --noEmit` clean · `--noUnusedLocals --noUnusedParameters` clean · `npx expo install --check` reports only the two long-documented patch-drift items (`expo@54.0.36`, `expo-constants@18.0.13`), unchanged and untouched · iOS export succeeded, 3.87 MB, zero errors · rendered in Expo Go on the iOS simulator at 0 / 50 / 75 / 100% in **Dark**, and at 75% in **Light**, via a temporary initial-state override that was then removed (no override remains in the codebase).

**The Settings row-inventory test caught the new `__DEV__` row** — which is what that test exists for. It now asserts the shipping inventory (the four rows a real user can see) separately from the development row, so the guarantee that Settings shows nothing dead is intact.

**Founder device review, 2026-09-02: the identity direction is APPROVED.** Direct-on-background as the default, cards earning their use, glass as rare, feature-specific visual objects, restrained feature colour, the neutral primary action, one display-size subject per screen, `VitaSheet`, the `PressableScale` evolution, restrained haptics, the RN Animated motion foundation, reduce-motion support, and the vessel as a percentage-of-goal object with no capacity semantics all stand. **The concept is not reopened.** Several small visual refinements were requested and are slice 5.1A.

### Slice 5.1A — Identity Prototype Visual Polish ✅

**Implemented 2026-09-02. Awaiting founder device review — 5.1 is not formally locked until it passes.** Polish only: no concept was reinterpreted, no production screen was touched, and no dependency was added.

**Quick-add controls — the primary item.** They were narrow vertical pills with the number stacked over a compressed `FL OZ`, wasting the horizontal room the sheet had. Now **four equal-width controls across the sheet**, number and unit on one baseline (`8 oz`), number dominant, comfortable padding, 56pt minimum height. `oz` replaces `FL OZ`: the sheet is titled Add Water and every amount is a volume, so the longer form bought precision nobody needed at the cost of the layout.

**A real layout bug surfaced doing it.** `flex: 1` handed to `PressableScale` never reaches the row — that component applies `style` to its inner animated view — so the first render bunched all four controls into the left two-thirds of the sheet. The flex now lives on a wrapper. `MetricTile` records the same trap; this is the second time it has been hit.

**Four across is safe at the narrowest supported width.** At 320pt: 280 after the sheet's insets, less three 8pt gaps, is 64pt per control against roughly 46pt of content. The row is flex-based, so overflow is structurally impossible and only wrapping could break it — guarded by `numberOfLines`. **No 2×2 fallback was needed.** The narrowest simulator available in this environment is 390pt, so the 320pt case is arithmetic plus that guard rather than a screenshot.

**Vessel silhouette.** Subtle shape polish, not a redesign: a longer, more gradual shoulder (`SHOULDER_END` 0.28 → 0.30), a slightly earlier and deeper heel (`HEEL_START` 0.86 → 0.855, `BASE` 0.94 → 0.92) so the base draws in more deliberately, and a marginally softer rim (`R_TOP` 10 → 11). The corner-tangency invariant still holds at both ends, which the geometry tests assert.

**Depth.** One additional hairline just inside the outline at roughly half its strength. Two edges a hair apart read as a wall with thickness; one edge reads as a sticker. **Deliberately not** a gloss highlight, specular band or blur — a shiny bottle is the fastest way to make the object look like a toy.

**Liquid settle.** The waterline now overshoots its target by 1.8% and returns over 240ms, so liquid rises, settles and comes to rest. It is the waterline itself moving, not a wave drawn on top: no simulation, no particles, nothing perpetual. **It fires only on a rise** — a downward correction just moves — and **not at all under Reduced Motion**, which still lands directly on the value.

**Hydration copy** — the founder's Option C. `56%` then `28 oz to go · 64 oz goal`, two lines instead of three. The kicker `OF TODAY'S GOAL` and the trailing `Goal 64 fl oz` were saying the same thing twice and the vessel had already said it a third time. Both remaining *and* goal survive; only the redundancy went. At completion: `Goal reached · 64 oz`.

**Add Water CTA.** Pure white read stark and default-ish on device. Now a soft off-white in dark and the brand ink in light, with the `+` glyph in Water blue — the colour rule in miniature: the object and the accent carry the feature colour, the button does not. **Custom amount** was a soft blue slab, which made the *less* important control the most colourful thing in the sheet; it is now a neutral hairline secondary.

**Completion gold** reduced from 1.75 to 1.5 stroke — the instruction when completion feels strong is to reduce rather than to add.

**Untouched by 5.1A:** the surface-role and type-hierarchy demonstrations, the press/haptic demo and its feel, `VitaSheet`'s architecture, the prototype controls (still clearly marked `PROTOTYPE CONTROLS`, still dev-only, still not a production pattern).

**Validation.** `npm test` **47 suites / 1204 tests** (1200 → 1204; four new) · `tsc --noEmit` clean · `--noUnusedLocals --noUnusedParameters` clean · `expo install --check` unchanged (the same two long-documented patch-drift items) · iOS export clean · **no dependency added** · verified in Expo Go at 56% and 100% in Dark, 75% in Light, and with the sheet open — via temporary initial-state overrides that were then removed (none remain).

**Founder device review: approved. Slice 5.1 is locked** — the identity is the foundation the rest of Sprint 5 builds on.

### Slice 5.2 — Interactive Water Experience ✅

**Implemented 2026-09-03. Awaiting founder device review — not approved.** The first production feature in the Sprint 5 identity.

**What it replaced.** A summary `Card`, a full-width button that pushed an entire screen, a `Card` holding seven bars, and a `Card` holding the day's drinks — four stacked rounded rectangles down a scroll.

**The hierarchy now.** Vessel and day state direct on the background · a neutral primary action · seven days of context · today's drinks collapsed behind a one-line summary · goal editing as a quiet link. No card anywhere on the screen.

**Everyday logging is a sheet, and the old route is gone.** `AddWaterSheet` replaces `/water/add` — deleted rather than left reachable, because two ways to log one drink is the duplicate-flow problem and a screen nothing links to is the dead-row problem Settings had. Editing an existing drink keeps its own route: adding should be fast, amending should be deliberate. Also removed: `WaterLevelPanel`, `WaterLogPanel`, `WaterWeekStrip`, all superseded and all confirmed to have no remaining callers.

**Units.** All four (`floz` · `cup` · `ml` · `l`) were already in the domain; nothing was added and no conversion rule was invented. What is new is that **quick-add amounts adapt to the logging unit** — 8/12/16/24 oz · ½/1/1½/2 cups · 250/500/750/1000 mL · ¼/½/1/1½ L. Converting one canonical set four ways produces `0.35 cups`, which nobody taps. The presets live in `features/water/quickAdds.ts` as presentation config, deliberately not in the repository.

**The two unit concepts stay separate**, per §47 and the founders' 2026-08-22 ruling. The **display preference** lives in `vita:v1:water:prefs`, Settings → Units is its home, and the sheet never writes it. The **logging unit** belongs to one drink: the sheet opens in the preference, switching it logs that drink in that unit, and Water keeps rendering in the preference afterwards. The explanatory line appears only when the two differ. Reopening the sheet returns to the preference rather than remembering the last unit used — otherwise the sheet would accumulate a preference nobody set.

**States.** No goal → latent vessel, the day's real total as the headline, `Set a daily goal`; **no fake 0%**, and the vessel stops announcing itself as a progressbar because a percentage of nothing is not a number. Under → percentage plus `48 fl oz to go · 64 fl oz goal`. Met → `Goal reached · 64 fl oz`, gold vessel edge. Over → vessel stays full, line reads `72 fl oz · Goal 64 fl oz`.

**One accessibility decision worth recording.** The vessel now takes the *unclamped* ratio: the fill clamps so liquid never spills, but the announcement does not. A day at 112% draws full and says "112 percent of goal" — the same figure the screen shows. Clamping the spoken value told a screen-reader user 100% while the screen said 112%.

**History keeps its Sprint 3 semantics deliberately.** Slice 5.2 was asked to consider per-day goal progress and did not: VITA stores one *current* goal and never snapshotted past goals, so "you hit your goal on Tuesday" remains a claim the data cannot support. The columns still show volume relative to the week's own biggest day. **Only the presentation changed** — the strip lost its `Card`, which was spending a border, a shadow and 16pt of padding on seven thin bars. Still no score, streak, average or judgement.

**The one domain change, and why.** `WaterProvider.commit` — and therefore `addEntry`/`updateEntry`/`removeEntry`/`restoreEntry` — now resolves `boolean` instead of `void`. Nothing else about it moved: the write is still optimistic and a failure still keeps the optimistic state and sets the error message. The reason is concrete and was required by §19/§43: the screen fires a confirmation haptic and a toast on a successful log, and both would be lies after a failed write. Reading `error` from state cannot answer it — the value in the caller's closure predates the dispatch. A failed save now raises a `warn` haptic, says nothing was recorded, and leaves the sheet open with the amount intact.

**Frozen and untouched:** the repository, canonical millilitre storage, persistence keys, the goal model, day rollover, entry snapshots, unit conversion math, `useWaterToday`, `useWaterWeek`, `buildWaterWeek`, `AmountEditor` and the edit/goal routes.

**One visual correction found on device.** The sheet's unit selector was rendering its active segment as a saturated blue pill — the loudest thing on a surface whose subject is the amounts below it. `UnitSelector` gained an optional `tone`, and the sheet asks for neutral; every pre-existing caller is unchanged. This is the Design System's own rule for structural controls: *pass `activeColor` only for a domain flow.*

**Validation.** `npm test` **48 suites / 1232 tests** (1204 → 1232; +28) · `tsc --noEmit` clean · `--noUnusedLocals --noUnusedParameters` clean · `expo install --check` unchanged (the same two long-documented patch-drift items) · iOS export clean · **no dependency added** · rendered in Expo Go: no-goal state and the Add Water sheet in **Dark**, and the sheet in **Light**.

**Device coverage limit, stated plainly.** Goal-set, partial, met and over-goal states were verified by route tests that mount the real screen against the real provider, **not by screenshot** — this environment cannot tap the simulator and cannot seed hydration data, so those states were unreachable interactively. They are the first thing for founder review on a real device.

**Founder device review: approved.** Water is the first production feature in the Sprint 5 identity and it stands.

### Slice 5.2A — Water Custom Amount Keyboard Polish ✅

**Implemented 2026-09-03. Awaiting founder verification.** Closeout polish on one item, plus one regression it uncovered.

**The Done key.** iOS's decimal pad has no return key, so a focused custom-amount field left no obvious way to put the keyboard away. `NumericKeyboardAccessory` **already existed** — built in Sprint 3 after founder device QA found the identical problem on the peptide calculator — so this is reuse, not a new component and not a new dependency. `AddWaterSheet` now uses `NumericField` and renders the bar once while the custom field is on screen.

**Done dismisses and nothing else.** It does not save. The amount and the chosen logging unit both survive it, and `Log` remains the only control that writes an entry. Dismissal is not tied to validation: an invalid amount can still close the keyboard, and `Log` still refuses it.

**The accessory is neutral here.** Its Done label was hardcoded to peptide purple — correct-looking only because every caller until now happened to be a Peptides screen. `NumericKeyboardAccessory` gained an optional `tone`, defaulting to the existing brand purple so **the five Peptides call sites are untouched**; Water asks for neutral. Converging them belongs to 5.7.

**Keyboard dismissal on every exit.** Done, the close control, the backdrop, and a successful log all route through a single `close`/`log` path that dismisses first, so a number pad can never outlive the sheet.

**A correctness fix found while verifying unit switching (§7).** Switching units with a typed custom amount was carrying the number across — `16` in fluid ounces silently becoming `16` litres. That is the exact misinterpretation `AmountEditor` records its own guard against, and it was a defect introduced in 5.2. Changing the unit now clears a typed amount. Tapped quick amounts are unaffected, since they commit immediately.

**A regression fixed beyond the literal scope, and worth stating plainly.** Device verification showed the disabled `Log` button rendering at full strength. The cause was mine: slice 5.1 added the reduced-motion press fade by putting an `opacity` *after* the caller's `style` in the same array, which silently won. **Every disabled `Button` in the app — 23 files' worth of call sites — had looked enabled since 5.1 while still refusing taps.** `PressableScale` now multiplies the caller's opacity by the press fade rather than replacing it. A control that looks available and is not is a defect rather than a style preference, which is why this was fixed here rather than deferred despite the narrow authorization.

**Two findings reported, not fixed:** `TakenSheet` renders `NumericField` inside a `Modal` but never renders the accessory, so its Done bar has never appeared — for 5.5. And the accessory's brand-purple default should converge to neutral app-wide — for 5.7.

**Validation.** `npm test` **49 suites / 1245 tests** (1232 → 1245; +13) · `tsc --noEmit` clean · `--noUnusedLocals --noUnusedParameters` clean · `expo install --check` unchanged · iOS export clean · **no dependency added** · diff boundary: Water plus the two shared primitives named above.

**Device coverage limit, stated plainly.** The disabled-button fix was confirmed on device. **The accessory bar itself was not** — presenting the keyboard requires a tap this environment cannot perform, and `InputAccessoryView` inside a `Modal` is a combination no VITA screen has previously exercised. Its behaviour is covered by tests, but **whether the bar actually appears above the number pad is the one thing founder verification has to confirm.**

**Founder verification: passed. Slice 5.2 is closed.**

### Slice 5.3 — Dashboard Identity Redesign 🟡

**Implemented 2026-09-03. Awaiting founder device review — not approved.**

**A data-source audit came before any layout.** Of the fourteen things the old Home displayed, **six were fixtures**: steps (`6,842`), sleep (`6.4 h`), workouts (`1 / 3`), a streak (`12`), the entire Journey card, and the Movement and Recovery goal pillars — every one a plausible number shown to every user forever. The founder ruling settled it: real data or nothing. `features/dashboard/mock.ts`, `api.ts` and `types.ts` are deleted, and with them `HomeHeader`, `HomeSummaryCard`, `JourneyCard`, `MacrosCard`, `MacroRow`, `QuickStatsRow`, `MetricTile`, `MealRow` and `JourneySection`.

**Both slogans are gone and nothing replaced them.** `Build with intention.` was 34px/800 — the largest type in the app — for a line that said nothing about the user's day. The greeting stays, stays time-aware, and now sits at 26px above a quiet date line.

**The name moved to `useAuth()`.** It was a Dashboard-owned constant, which is a screen inventing a fact about the user; the auth provider is the app's identity boundary and becomes real when Supabase lands, with no change to Home.

**Three domains, three shapes.** Water is a ring, Peptides a tally of day marks, Fuel a horizontal bar. The old screen's five identical metric tiles are exactly what made unrelated things read alike; a person should be able to tell the domains apart without reading a word. Every figure comes from `useWaterToday()`, `useDailyNutrition()` and `usePeptides()` — the features' own engines — so Home cannot disagree with them and updates with no refresh or polling.

**The order is fixed, not adaptive.** Ranking domains by urgency was considered and rejected: deciding a dose outranks hydration today would require VITA to hold an opinion about which matters more, which is the first step toward the compliance semantics the product refuses. A stable order is also better to live with.

**Peptides wording carries Sprint 3's rules unchanged** — *scheduled* never *due*, an unanswered day stays unanswered and is never converted to skipped, and nothing is scored. Colour never carries state alone: the marks are decorative and the count says the same thing in words.

**Tools is discoverable without Home becoming a launcher** — one row, one destination, the two real tools named in the subtitle. No BMI, no Reference, no Coming Soon.

**Surfaces:** `GlassSurface` on Home **6 → 0**; `Card` **0 → 0**. Every module is a bordered surface or direct content, and the Tools row is a hairline. Glass returns to what the founder ruling reserved it for — the dock.

**Home surfaces actions; features own them.** *Add* opens `/water?add=1` and Water reads the param once as initial state; Water keeps sole ownership of logging, including goal-reached detection and failure handling. Rebuilding that on Home for one saved tap is the duplication the architecture rules forbid.

**One layout trap hit for the third time.** `flex: 1` handed to `PressableScale` never reaches the row, so the two modules first rendered at different widths. Wrapped, as in `MetricTile` and the 5.1A quick-adds. **5.7 should fix the primitive rather than the callers.**

**Reported, not fixed — a pre-existing dock defect.** `FloatingDock` gives the active Home tab `palette.ink` (`#1C1F1A`), which is very nearly invisible on the near-black dark background; the label is perfectly legible in Light. Confirmed on device in both themes. It is theme-parity failure on a founder-approved decision (*Home is navigation, neutral ink*), it lives in shared app shell rather than in Dashboard, and changing an approved colour decision is a founder call — so it is recorded here for 5.7 rather than changed.

**Validation.** `npm test` **49 suites / 1259 tests** (1245 → 1259) · `tsc --noEmit` clean · `--noUnusedLocals --noUnusedParameters` clean · `expo install --check` unchanged · iOS export clean · **no dependency added** · verified in Expo Go, Dark and Light.

**Device coverage limit.** Screenshots show the sparse first-run state, since this environment cannot seed Water, Fuel or Peptide data. Populated states — real hydration progress, a scheduled dose, meals logged — are covered by twenty route tests mounting the real screen over real providers, and are the first thing for founder review.

**Founder device review: the data work is approved, the composition is not.** Real-data-only, the fixture removal, the provider wiring, Tools integration and the slogan removal all stand. What was rejected was the shape — an oversized greeting, two large side-by-side boxes, and too much empty vertical space. Addressed in 5.3A.

### Slice 5.3A — Dashboard Composition + Customization 🟡

**Implemented 2026-09-03. Awaiting founder device review — not approved.** Composition only: **no fixture returned**, and every figure still comes from the feature that owns it.

**The greeting became an eyebrow.** `Good night, Wilber.` at 26px is now `GOOD NIGHT, WILBER` in small uppercase gold, with a factual line beneath it and a compact date chip beside it. The chip is deliberately inert and announced as text — VITA has no calendar destination, and styling a button that goes nowhere is the dead-affordance problem slice 4.1 cleaned out of Settings.

**The daily summary is facts or nothing.** `1 routine scheduled · 28 fl oz to go`, built from state the domains already hold. When there is nothing factual to say the line is absent rather than filled — and it is never a synthetic score, which is what the old `N of 4 goals complete` was.

**Three domains became horizontal strips**, roughly a third of the previous height, each keeping its own shape: Water a ring, Peptides a badge with an outstanding dot, Fuel a bar. Peptides also gained real usefulness — with exactly one thing outstanding it names the routine and its configured amount, which is the common case and the one where a name saves a tap.

**Density came from showing more of what is true**, never from padding: the height the strips freed went to **Quick Tools** (Peptide Calculator · Injection Sites · Food Scanner, all to real routes — `/fuel/scan` was read from the codebase, not guessed) and **Today's Schedule**.

**Today's Schedule carries no times, and that is the honest answer.** Routines schedule **by day**; a setup may hold an optional `reminder.timeLocal`, but that is a notification the user asked for, not when a dose is due, and putting it in a schedule column would quietly promote it into one. Rows show name, configured amount and the domain's own state label — including `No response`, kept verbatim per the Sprint 3 rule that absence of a response is not a response. Its only source is peptide routines, because that is VITA's only domain with a day attached: Water has a target not an appointment, Fuel has slots not times, and Movement has no domain at all.

**Movement is still absent — and is not offered as a hidden or disabled module.** An audit found no activity domain of any kind; the only `steps`/`workout` matches in `src/lib` are peptide research text. Listing it as unavailable would tease functionality that does not exist. It becomes a module the day a real source does.

**Customize Home** — a `VitaSheet` from a `•••` control beside Settings. Show, hide and reorder the five content modules; persists across relaunch under its own key `vita:v1:dashboard:layout`. **Reordering is move-up/move-down buttons, not dragging**: drag would mean adding `react-native-gesture-handler` *and* `react-native-reanimated` — two native dependencies — to move five rows, and a drag target is pointer-only until custom accessibility actions are built on top of it. Buttons work with every input method and announce exactly what they do.

**Why its own key rather than app preferences.** Two reasons. The preferences module's own rule is that it holds what *no single feature owns*, and Home owns this. More concretely, `PreferencesRepository.save()` writes the whole record and `ThemeProvider` calls it as `save({ themeMode })` — any field added alongside would be erased the next time someone changed their theme, which would mean editing founder-approved Sprint 4 code to carry a preference it has no reason to know about.

**A stored layout is treated as untrusted input**: unknown ids dropped, duplicates collapsed, modules missing from a saved order appended in default order (so a *new* module appears for existing users rather than vanishing), and an unusable order falling back to the default. Hiding everything is allowed and is not corruption — the header and the Customize control remain, so the choice is never a trap.

**The header is not customisable.** Branding, greeting, date and Settings orient the screen and one of them is the way out of it.

**Dock contrast fixed, as directed.** `FloatingDock` gave the active Home tab `palette.ink` — right in Light, very nearly invisible on the near-black dark background, so the selected tab was the hardest to see. Home's tint now resolves through the theme; Light is unchanged in practice (`surfaces.text` is a shade off the ink it replaces). Scope held to the defect: no other dock work.

**`ToolsRow` removed** — a Quick Tools section *and* a Tools row would be the duplication the authorization warned against. One quiet `All tools` link keeps `/tools` reachable, and Settings still lists it.

**Also fixed:** three strip details truncated mid-word on the first device render (`Add one to start…`, `No meals logg…`). Copy tightened, with the full wording kept in the spoken labels.

**`PressableScale`'s flex trap was not fixed** — it was hit again here (Quick Tools tiles) and worked around with wrappers. Changing a primitive used across ~10 files was judged the wrong risk to take inside a Dashboard slice; **it remains 5.7's.**

**Validation.** `npm test` **50 suites / 1287 tests** (1259 → 1287; +28) · `tsc --noEmit` clean · `--noUnusedLocals --noUnusedParameters` clean · `expo install --check` unchanged · iOS export clean · **no dependency added** · verified in Expo Go: Dark, Light, and the Customize sheet.

**Device coverage limit.** Screenshots are the first-run state — this environment cannot seed feature data or tap the simulator, so populated Home, a scheduled routine in Today's Schedule, and hide/reorder-then-relaunch are covered by 48 route tests and 15 layout tests rather than by screenshot.

**Still to verify — founder, on a real device:** whether Home now feels full without being cluttered, whether the greeting is subtle enough, whether Today's Schedule earns its place, and whether Customize Home feels intuitive.


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

**Health Metrics content locked (founders, 2026-07-09):** Steps, Water, Meals Logged, Sleep. **Peptides is explicitly excluded** from the primary Dashboard metrics — the current mock data (`features/dashboard/mock.ts`) still shows Peptides in that slot and needs updating when the Health Metrics slice is built.

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

## Sprint 2 — Fuel — 🟡 In Progress (started 2026-08-17)

Branch `sprint-2-fuel`. Founder-authorized 2026-08-17 against the approved Sprint 2 Fuel plan. Architecture principle the founders approved explicitly: **prove the nutrition engine before introducing external providers**, so the core loop is testable before a single network call exists.

| # | Slice | Objective | Status |
|---|-------|-----------|--------|
| 2.1 | Nutrition Foundation | Model, pure calculations, persistence behind a repository, `NutritionProvider`; Fuel reads real state | 🟡 Built, pending founder review |
| 2.2 | Core Logging | Manual food → custom food → entry → meal → daily totals; delete + Undo | 🟡 Built, pending founder review |
| 2.3 | Food Detail + Servings | Serving selector, fractional quantity, meal assignment, Add to Log; dark-mode progress-track correction | 🟡 Built, pending founder review |
| 2.4 | Edit + Delete | Edit route reusing `PortionEditor`; delete + Undo preserved | 🟡 Built, pending founder review |
| 2.5 | Home Synchronization | Home nutrition on the shared engine; Home's rendering provably unchanged | 🟡 Built, pending founder review |
| 2.6 | Provider Layer + Search | USDA + Open Food Facts adapters, normalization, dedupe, ranking, cache, debounced search | 🟡 Built (OFF verified; USDA blocked on founder key) |
| 2.7 | Recent + Favorites | History-derived recents, persisted favorites keyed by `vitaId` | 🟡 Built, pending founder review |
| 2.8 | Barcode Scanner | `expo-camera`, VITA overlay, permission states, scan lock, OFF→USDA chain | 🟡 Built (pipeline + states verified; live detection needs a physical iPhone) |
| 2.9 | Restaurant Coverage | Edge Function proxy + FatSecret adapter (founder-approved, gated on account setup) | ⬜ Planned |
| 2.10 | Water Wiring | Water on the same engine; UI untouched | ⬜ Planned |
| 2.11 | Polish & Audit | Empty/loading/error review, Light/Dark sweep, full verification | ⬜ Planned |

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

**Still pending the founder's key:** in-app USDA verification — live USDA + Open Food Facts aggregation, Food Detail, logging, Home sync, Recents, Favorites, and the failure-isolation toggle.

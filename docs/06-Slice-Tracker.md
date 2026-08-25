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

## Sprint 3 — Water + Peptides — 🟡 In Progress

**Opened 2026-08-22.** Branch `sprint-3-water-peptides`, cut from `main` at `4ab32c5`. Founder-authorized against the approved Sprint 3 Planning & Architecture Audit; all three entry conditions met (device QA accepted · Sprint 2 merged · branch cut). Scope and the preserved Water/Peptide direction live in `docs/04-Master-Roadmap.md` → Sprint 3.

**Slice plan approved by the founders 2026-08-21.** Two changes from the illustrative plan recorded in the roadmap: the test harness folds into 3.1 rather than being deferred, and **the calculator moves ahead of peptide logging** — logging records a dose, so building it before the dose math exists would mean building it twice.

| # | Slice | Objective | Status |
|---|-------|-----------|--------|
| 3.1 | Shared Daily Foundation + Test Harness | Promote the shared date/id/key/storage primitives; stand up the first committed test suite. No behavior change | ✅ Built — pending founder review |
| 3.2 | Water Domain + Persistence | Hydration model, unit normalization, repository, provider; water that actually saves | ✅ Built — pending founder review |
| 3.3 | Water Goal + Logging Experience | User-set goal, entry-local units, today's editable log, delete + Undo | ✅ Built — pending founder review |
| 3.4 | Water Visual Refinement + Fuel/Home Integration | Water-level panel, 7-day volume strip, Home water tile and goal pillar on real state | ✅ Built — pending founder review |
| 3.5 | Peptide Definitions, Catalog + User Setup | Definition/Setup models, catalog, Custom, setup lifecycle | ✅ Approved |
| 3.5A | Expanded Peptide Library + Research Details | 71-entry catalog, aliases, blends, compound types, research reference pages | ✅ Approved |
| 3.5B | Final Peptide Catalog + Detail Polish | 72 entries, research-area taxonomy, category selector, structured detail presentation | ✅ Built — pending founder review |
| 3.6 | Dose / Unit Calculator | Pure bidirectional syringe-units ⇄ mass conversion, fully tested | ⬜ Planned |
| 3.7 | Peptide Logging + History | Log entry with snapshot fields, history by date, edit/delete | ⬜ Planned |
| 3.8 | Injection Site Tracking | Site taxonomy, body-outline picker, accessible fallback, recency from the user's own log | ⬜ Planned |
| 3.9 | Peptides UX Polish, Safety Copy + Fuel Integration | Landing rebuild, disclaimer placement, Fuel Peptides card on real state | ⬜ Planned |
| 3.10 | Sprint 3 Audit + Closeout | Integrated audit, edge cases, device QA, doc reconciliation | ⬜ Planned |

**Founder decisions recorded at approval** (full text in the approved planning report): water goal is established by the user on first use with **fl oz** as the US-English default display unit, never presented as a medical recommendation · Water owns its own preferences and Sprint 7 Settings will read that same source rather than duplicating it · water history stays inline, no analytics section · fixed quick-add presets, no customization yet · restrained vertical-fill progress visual · a **12–20 entry** peptide catalog carrying name, classification, and broad category only · **no educational prose in Sprint 3** · only the peptide itself is a required setup field · one calculator surfaced in two places · restrained front/back body outline with a list fallback · inactive setups hidden but reachable, and **deactivation never deletes history** · Peptides does not go on Home; Water may · peptides purple stays.

**Two language rules the founders set for this sprint.** The model must not carry a field named `typicalDose` or anything else implying VITA supplies a medically appropriate amount — if repeat-logging convenience is ever needed, it uses neutral user-owned framing such as *last logged amount*, and only when a slice actually requires it. And schedules read **"Scheduled today"**, never "Due today": VITA reflects what the user entered. No missed-dose language, no adherence percentages, no streak punishment, no treatment recommendations.

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

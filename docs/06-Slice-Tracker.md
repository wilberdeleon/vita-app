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
| 2.2 | Core Logging | Manual food → entry → meal → daily totals, edit/delete | ⬜ Planned |
| 2.3 | Food Detail + Servings | Serving selector, fractional quantity, meal assignment, Add to Log, confirmation | ⬜ Planned |
| 2.4 | Edit + Delete | Edit route, delete with Undo, immediate recalculation | ⬜ Planned |
| 2.5 | Home Synchronization | Home nutrition on the shared engine; Home's rendering provably unchanged | ⬜ Planned |
| 2.6 | Provider Layer + Search | Adapters, normalization, dedupe, ranking, cache, debounced search | ⬜ Planned |
| 2.7 | Recent + Favorites | History-derived recents, persisted favorites, quick re-log | ⬜ Planned |
| 2.8 | Barcode Scanner | `expo-camera`, VITA overlay, permission states, scan lock, fallback chain | ⬜ Planned |
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

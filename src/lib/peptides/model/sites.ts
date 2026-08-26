/**
 * Injection sites — where an administration happened.
 *
 * **This is a record, not a recommendation.** Nothing here ranks sites,
 * proposes a next one, marks one as due or safe, or derives a rotation. VITA
 * stores where the user says they injected and can tell them what they did
 * before; deciding where to inject next is theirs, and a health app that
 * quietly starts advising on it has crossed a line it cannot uncross.
 *
 * **One canonical key per site** (slice 3.8A). The first version modelled a
 * broad region plus a side, which could not express *Center Abdomen* — a site
 * the founder uses — and left "abdomen + none" ambiguous between "the middle"
 * and "I didn't say". A flat key removes both problems: every recorded site
 * has exactly one identity.
 */

import type { PeptideLogEntry } from './types';

export const SITE_KEYS = [
  'abdomen-left',
  'abdomen-center',
  'abdomen-right',
  'thigh-left',
  'thigh-right',
  'upper-arm-left',
  'upper-arm-right',
  'glute-left',
  'glute-right',
  'custom',
] as const;
export type InjectionSiteKey = (typeof SITE_KEYS)[number];

/** Which silhouette a site is reachable from. `custom` is on neither. */
export type BodyView = 'front' | 'back';

const SITE_LABELS: Record<InjectionSiteKey, string> = {
  'abdomen-left': 'Left Abdomen',
  'abdomen-center': 'Center Abdomen',
  'abdomen-right': 'Right Abdomen',
  'thigh-left': 'Left Thigh',
  'thigh-right': 'Right Thigh',
  'upper-arm-left': 'Left Upper Arm',
  'upper-arm-right': 'Right Upper Arm',
  'glute-left': 'Left Glute',
  'glute-right': 'Right Glute',
  custom: 'Other',
};

/**
 * Where each site lives on the body map.
 *
 * Upper arms appear on both silhouettes because an arm is visible from either
 * side and hunting for the right view would be pointless friction. Glutes are
 * back-only for the obvious reason.
 */
const SITE_VIEWS: Record<InjectionSiteKey, readonly BodyView[]> = {
  'abdomen-left': ['front'],
  'abdomen-center': ['front'],
  'abdomen-right': ['front'],
  'thigh-left': ['front'],
  'thigh-right': ['front'],
  'upper-arm-left': ['front', 'back'],
  'upper-arm-right': ['front', 'back'],
  'glute-left': ['back'],
  'glute-right': ['back'],
  custom: [],
};

/** The grouped choices the text list offers, mirroring the map's regions. */
export const SITE_GROUPS: ReadonlyArray<{ region: string; keys: readonly InjectionSiteKey[] }> = [
  { region: 'Abdomen', keys: ['abdomen-left', 'abdomen-center', 'abdomen-right'] },
  { region: 'Thigh', keys: ['thigh-left', 'thigh-right'] },
  { region: 'Upper Arm', keys: ['upper-arm-left', 'upper-arm-right'] },
  { region: 'Glute', keys: ['glute-left', 'glute-right'] },
];

/** Short position words for the text list, where the region is already a heading. */
const SHORT_LABELS: Partial<Record<InjectionSiteKey, string>> = {
  'abdomen-left': 'Left',
  'abdomen-center': 'Center',
  'abdomen-right': 'Right',
  'thigh-left': 'Left',
  'thigh-right': 'Right',
  'upper-arm-left': 'Left',
  'upper-arm-right': 'Right',
  'glute-left': 'Left',
  'glute-right': 'Right',
};

export function siteKeyLabel(key: InjectionSiteKey): string {
  return SITE_LABELS[key];
}

export function siteShortLabel(key: InjectionSiteKey): string {
  return SHORT_LABELS[key] ?? SITE_LABELS[key];
}

export function sitesForView(view: BodyView): InjectionSiteKey[] {
  return SITE_KEYS.filter((key) => SITE_VIEWS[key].includes(view));
}

export function isSiteKey(value: unknown): value is InjectionSiteKey {
  return typeof value === 'string' && (SITE_KEYS as readonly string[]).includes(value);
}

/**
 * The site as recorded, stored on the log entry it belongs to.
 *
 * `label` is a **snapshot**, written once, for the same reason the dose
 * conversion is: a custom site typed as "Left Hip" must still read "Left Hip"
 * years later, not be re-derived from a taxonomy that has since changed —
 * which it now has.
 */
export type InjectionSiteSnapshot = {
  key: InjectionSiteKey;
  customLabel?: string;
  label: string;
};

export function siteLabel(key: InjectionSiteKey, customLabel?: string): string {
  const custom = customLabel?.trim();
  if (key === 'custom') return custom && custom.length > 0 ? custom : SITE_LABELS.custom;
  return SITE_LABELS[key];
}

export function createSiteSnapshot(
  key: InjectionSiteKey,
  customLabel?: string,
): InjectionSiteSnapshot {
  const custom = customLabel?.trim();
  return {
    key,
    customLabel: key === 'custom' && custom && custom.length > 0 ? custom : undefined,
    label: siteLabel(key, custom),
  };
}

/**
 * Broad anatomical descriptions, kept short for the compact guide.
 *
 * Where the words point on a body, and nothing else. No needle angle, no
 * depth, no technique, and nothing peptide-specific — "best for GLP-1" is
 * exactly the sentence this app must never write.
 */
export const REGION_DESCRIPTIONS: ReadonlyArray<{ region: string; description: string }> = [
  { region: 'Abdomen', description: 'Front torso, around the stomach.' },
  { region: 'Thigh', description: 'Upper leg, between hip and knee.' },
  { region: 'Upper Arm', description: 'Between shoulder and elbow.' },
  { region: 'Glute', description: 'Buttock area.' },
];

/* ── reading stored sites ──────────────────────────────────────────────── */

/**
 * Slice 3.8's shape, kept only so its records keep working.
 *
 * That version stored a broad `region` plus a `side`. Those entries are real
 * history and are never rewritten on disk — they are translated on read, so a
 * log recorded as `abdomen` + `left` now reads *Left Abdomen* exactly as a new
 * one would.
 */
const LEGACY_REGION_SIDE: Record<string, InjectionSiteKey> = {
  'abdomen:left': 'abdomen-left',
  'abdomen:right': 'abdomen-right',
  'abdomen:center': 'abdomen-center',
  'abdomen:none': 'abdomen-center',
  'thigh:left': 'thigh-left',
  'thigh:right': 'thigh-right',
  'upper-arm:left': 'upper-arm-left',
  'upper-arm:right': 'upper-arm-right',
  'glute:left': 'glute-left',
  'glute:right': 'glute-right',
};

/**
 * Validates a stored site, in either the current or the slice-3.8 shape.
 *
 * Returns `undefined` for anything malformed — which drops the site and keeps
 * the entry. A log whose amount and time are intact is still a true record of
 * an administration; discarding the whole thing because one optional field
 * rotted would destroy more than it protects.
 */
export function parseSiteSnapshot(value: unknown): InjectionSiteSnapshot | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return undefined;

  const record = value as Record<string, unknown>;
  const customLabel =
    typeof record.customLabel === 'string' && record.customLabel.trim().length > 0
      ? record.customLabel.trim()
      : undefined;
  const storedLabel =
    typeof record.label === 'string' && record.label.trim().length > 0 ? record.label : undefined;

  if (isSiteKey(record.key)) {
    return {
      key: record.key,
      customLabel: record.key === 'custom' ? customLabel : undefined,
      label: storedLabel ?? siteLabel(record.key, customLabel),
    };
  }

  // ── slice 3.8 records ──
  const { region, side } = record;
  if (typeof region !== 'string') return undefined;

  if (region === 'custom') {
    // The authored name is what history said; it stays exactly as written.
    const label = customLabel ?? storedLabel;
    if (!label) return undefined;
    return { key: 'custom', customLabel: label, label };
  }

  const key = LEGACY_REGION_SIDE[`${region}:${typeof side === 'string' ? side : 'none'}`];
  if (!key) return undefined;
  /**
   * The canonical label wins here, unlike everywhere else.
   *
   * A stored label is normally authoritative — it is what the user was shown.
   * But slice 3.8 wrote labels in a format that no longer exists ("Abdomen ·
   * Left"), and leaving those verbatim would put two spellings of the same
   * place side by side in one list. Only *authored* text is sacred, and this
   * label was generated, not typed.
   */
  return { key, label: siteLabel(key) };
}

/* ── reading history ───────────────────────────────────────────────────── */

/**
 * The most recently recorded site, or `undefined` if there is none.
 *
 * Offered purely as a memory aid — "where did I do it last?" — and never used
 * to preselect anything. Preselecting would make VITA's answer look like a
 * suggestion, which is exactly the inference this feature must not invite.
 */
export function lastRecordedSite(
  entries: readonly PeptideLogEntry[],
): { site: InjectionSiteSnapshot; entry: PeptideLogEntry } | undefined {
  for (const entry of entries) {
    if (entry.site) return { site: entry.site, entry };
  }
  return undefined;
}

/** Every entry that recorded a site, newest first, preserving input order. */
export function entriesWithSites(entries: readonly PeptideLogEntry[]): PeptideLogEntry[] {
  return entries.filter((entry) => entry.site !== undefined);
}

/** Every entry recorded at one exact site, newest first. */
export function entriesAtSite(
  entries: readonly PeptideLogEntry[],
  key: InjectionSiteKey,
  customLabel?: string,
): PeptideLogEntry[] {
  return entries.filter((entry) => {
    if (entry.site?.key !== key) return false;
    // Two different custom names are two different places.
    return key !== 'custom' || entry.site.label === customLabel;
  });
}

/**
 * Injection sites — where an administration happened.
 *
 * **This is a record, not a recommendation.** Nothing in this module ranks
 * sites, proposes a next one, marks one as due or safe, or derives a rotation.
 * VITA stores where the user says they injected and can tell them what they
 * did before; deciding where to inject next is theirs, and a health app that
 * quietly starts advising on it has crossed a line it cannot uncross.
 *
 * The taxonomy is deliberately shallow. Four broad regions plus an escape
 * hatch covers how people actually describe this to themselves; subdividing
 * the abdomen into quadrants would be precision nobody asked for and a
 * selector nobody wants to scroll.
 */

import type { PeptideLogEntry } from './types';

export const SITE_REGIONS = ['abdomen', 'thigh', 'upper-arm', 'glute', 'custom'] as const;
export type InjectionSiteRegion = (typeof SITE_REGIONS)[number];

/**
 * `none` is for a region where sides are meaningless or the user simply did
 * not record one — distinct from `center`, which is a positive statement.
 */
export const SITE_SIDES = ['left', 'right', 'center', 'none'] as const;
export type InjectionSiteSide = (typeof SITE_SIDES)[number];

/**
 * The site as recorded, stored on the log entry it belongs to.
 *
 * `label` is a **snapshot**, written once at save time, for the same reason
 * the dose conversion is: a custom site typed as "Left Hip" must still read
 * "Left Hip" years later, not be re-derived into "Custom · Left". History
 * says what the user said.
 */
export type InjectionSiteSnapshot = {
  region: InjectionSiteRegion;
  side: InjectionSiteSide;
  customLabel?: string;
  label: string;
};

const REGION_LABELS: Record<InjectionSiteRegion, string> = {
  abdomen: 'Abdomen',
  thigh: 'Thigh',
  'upper-arm': 'Upper Arm',
  glute: 'Glute',
  custom: 'Other',
};

const SIDE_LABELS: Record<InjectionSiteSide, string> = {
  left: 'Left',
  right: 'Right',
  center: 'Center',
  none: '',
};

export function regionLabel(region: InjectionSiteRegion): string {
  return REGION_LABELS[region];
}

export function sideLabel(side: InjectionSiteSide): string {
  return SIDE_LABELS[side];
}

/**
 * Plain anatomical descriptions, for the site guide.
 *
 * Where the words point on a body, and nothing else. No needle angle, no
 * depth, no technique, and nothing peptide-specific — "best for GLP-1" is
 * exactly the sentence this app must never write.
 */
export const REGION_DESCRIPTIONS: Record<InjectionSiteRegion, string> = {
  abdomen: 'The front of the torso, around the stomach area.',
  thigh: 'The upper leg, between hip and knee.',
  'upper-arm': 'The upper arm, between shoulder and elbow.',
  glute: 'The buttock, or gluteal area.',
  custom: 'Anywhere you would rather name yourself.',
};

/** Regions where left and right are meaningful choices. */
export function regionHasSides(region: InjectionSiteRegion): boolean {
  return region !== 'custom';
}

/**
 * Builds the display label once, at record time.
 *
 * A custom label wins outright — someone who typed "Left Hip" gets "Left Hip",
 * not "Other · Left Hip · Left". Anything else reads "Abdomen · Left", with
 * the side omitted when there is none rather than rendered as a dangling dot.
 */
export function siteLabel(
  region: InjectionSiteRegion,
  side: InjectionSiteSide,
  customLabel?: string,
): string {
  const custom = customLabel?.trim();
  if (region === 'custom') return custom && custom.length > 0 ? custom : REGION_LABELS.custom;
  const suffix = SIDE_LABELS[side];
  return suffix.length > 0 ? `${REGION_LABELS[region]} · ${suffix}` : REGION_LABELS[region];
}

export function createSiteSnapshot(
  region: InjectionSiteRegion,
  side: InjectionSiteSide,
  customLabel?: string,
): InjectionSiteSnapshot {
  const custom = customLabel?.trim();
  return {
    region,
    side: regionHasSides(region) ? side : 'none',
    customLabel: custom && custom.length > 0 ? custom : undefined,
    label: siteLabel(region, side, custom),
  };
}

export function isSiteRegion(value: unknown): value is InjectionSiteRegion {
  return typeof value === 'string' && (SITE_REGIONS as readonly string[]).includes(value);
}

export function isSiteSide(value: unknown): value is InjectionSiteSide {
  return typeof value === 'string' && (SITE_SIDES as readonly string[]).includes(value);
}

/**
 * Validates a stored site.
 *
 * Returns `undefined` for anything malformed — which drops the site and keeps
 * the entry. A log whose amount and time are intact is still a true record of
 * an administration; discarding the whole thing because one optional field
 * rotted would destroy more than it protects.
 *
 * A missing `label` is rebuilt rather than treated as corruption, so entries
 * written by any future shape still read correctly.
 */
export function parseSiteSnapshot(value: unknown): InjectionSiteSnapshot | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return undefined;

  const { region, side, customLabel, label } = value as Record<string, unknown>;
  if (!isSiteRegion(region) || !isSiteSide(side)) return undefined;

  const custom = typeof customLabel === 'string' && customLabel.trim().length > 0
    ? customLabel.trim()
    : undefined;

  return {
    region,
    side,
    customLabel: custom,
    label:
      typeof label === 'string' && label.trim().length > 0
        ? label
        : siteLabel(region, side, custom),
  };
}

/**
 * The most recently recorded site, or `undefined` if there is none.
 *
 * Offered purely as a memory aid — "where did I do it last?" — and never used
 * to preselect anything. Preselecting would make VITA's answer look like a
 * suggestion, which is exactly the inference this feature must not invite.
 *
 * Entries are expected newest-first, as every provider read returns them.
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

/**
 * How often each label appears — a count of what happened, nothing more.
 *
 * Grouped by the recorded label rather than by region so "Left Hip" stays its
 * own line instead of collapsing into "Other". Returned most-used first,
 * which is a description of the past and not an ordering of preference.
 */
export function siteUsageCounts(
  entries: readonly PeptideLogEntry[],
): Array<{ label: string; count: number }> {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    if (!entry.site) continue;
    counts.set(entry.site.label, (counts.get(entry.site.label) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

import { Ionicons } from '@expo/vector-icons';
import { useState, type PropsWithChildren, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '../../../components/ui';
import { spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

type Props = PropsWithChildren<{
  title: string;
  /**
   * The one line that makes collapsing safe — `1 mg · Daily`, `10 mg vial ·
   * 2 mL`. If the summary answers the question, most people never open the
   * section; if there is nothing worth summarising, leave it out.
   */
  summary?: string | null;
  /** Open on first render. Preparation is `false` everywhere it appears. */
  initiallyOpen?: boolean;
  /** Rendered on the right of the header, before the chevron. */
  action?: ReactNode;
}>;

/**
 * A section that answers its own question before it is opened.
 *
 * ## Why this exists
 *
 * Routine and Edit Routine both showed everything at once — six equally
 * weighted blocks on one, nine fields on the other — and the founders' review
 * was that both read as administrative rather than useful. Progressive
 * disclosure is the design system's answer, and this is the one
 * implementation of it in Peptides so the two screens cannot drift into
 * behaving differently.
 *
 * **The summary is the point, not the chevron.** `Preparation · 10 mg vial ·
 * 2 mL` tells you what you came for without expanding anything; collapsing
 * information that has no summary just hides it. A section with a good
 * summary line is disclosure, one without is a filing cabinet.
 *
 * **No animation.** Reduce Motion would have to disable it, and a section
 * that appears instantly for some users and slides for others is two designs.
 * The chevron and the state are the affordance — the same choice Water's
 * `TodayEntries` made in 5.2, and it has held up.
 *
 * Announces `expanded` so the state is available without sight, and the whole
 * header is one control rather than a label plus a separate chevron.
 *
 * **A 5.7 promotion candidate.** Water has its own disclosure and Fuel will
 * want one; converging them onto a shared primitive belongs to the slice that
 * owns shared components, not to this one.
 */
export function Disclosure({
  title,
  summary,
  initiallyOpen = false,
  action,
  children,
}: Props) {
  const { surfaces } = useTheme();
  const [open, setOpen] = useState(initiallyOpen);

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        {/*
          * Wrapped: `PressableScale` applies its style to an inner animated
          * view, so a `flex` handed to it never reaches this row — the header
          * collapsed to its chevron and the title vanished. Sixth call site
          * to work around this; the primitive fix stays 5.7's.
          */}
        <View style={styles.headerSlot}>
        <PressableScale
          onPress={() => setOpen((current) => !current)}
          style={styles.header}
          accessibilityLabel={summary ? `${title}, ${summary}` : title}
          accessibilityHint={open ? 'Collapses the section' : 'Expands the section'}
          accessibilityState={{ expanded: open }}
        >
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: surfaces.text }]} numberOfLines={2}>
              {title}
            </Text>
            {summary && !open ? (
              <Text style={[styles.summary, { color: surfaces.textTertiary }]} numberOfLines={2}>
                {summary}
              </Text>
            ) : null}
          </View>
          <Ionicons
            name={open ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={surfaces.textTertiary}
          />
        </PressableScale>
        </View>
        {action}
      </View>

      {open ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.s,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
  },
  headerSlot: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.m,
    // A minimum, never a height — the title has to grow with the text size.
    minHeight: 44,
  },
  headerText: {
    flex: 1,
    gap: 1,
  },
  title: {
    ...typography.bodyMedium,
    fontSize: 15.5,
    fontWeight: '600',
  },
  summary: {
    ...typography.caption,
    fontSize: 14,
  },
  body: {
    gap: spacing.m,
  },
});

import type { PropsWithChildren, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { spacing } from '../../theme/tokens';

type Props = PropsWithChildren<{
  /** Typically a <SectionHeader />. Omit for a header-less block (e.g. the greeting). */
  header?: ReactNode;
}>;

/**
 * Groups a section's header and content into one rhythm unit. Screen spaces
 * top-level children (Sections, or standalone cards like the greeting) apart
 * at the section level; content inside a Section — including repeated rows
 * like meal entries — stays tight. This is the layout primitive every
 * Dashboard section (and future screens) composes with, so hierarchy reads
 * from spacing alone rather than from decoration.
 */
export function Section({ header, children }: Props) {
  return (
    <View style={styles.root}>
      {header}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.m,
  },
  content: {
    gap: spacing.m,
  },
});

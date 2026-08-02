import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { VitaMark } from '../shell/VitaMark';
import { palette, spacing, typography } from '../../theme/tokens';

type Props = {
  title: string;
  /** Official VITA logo lockup (mark + wordmark) instead of a plain title. */
  brand?: boolean;
  /** Show the settings gear on the right (main hub screens). */
  settings?: boolean;
  /** Show a back arrow on the left (stacked screens). */
  back?: boolean;
  /** Show a close X on the right instead of the gear (flow screens). */
  close?: boolean;
  /**
   * Defaults to 'dark' (unchanged everywhere else). 'light' renders the
   * mark, wordmark, and icons in a light/white treatment for use over a
   * dark or busy background (e.g. the Dashboard hero image) — same
   * component, same tap targets, different color only.
   */
  tone?: 'dark' | 'light';
  /**
   * Overrides the VitaMark's color, independent of `tone` — unset by
   * default (unchanged everywhere: the mark still follows `tone` like the
   * wordmark). Home passes a fixed gold so the mark reads the same brand
   * color in both Light and Dark mode, while the wordmark next to it still
   * flips with theme (founders, 2026-07-19).
   */
  markColor?: string;
};

export function ScreenHeader({
  title,
  brand = false,
  settings = false,
  back = false,
  close = false,
  tone = 'dark',
  markColor,
}: Props) {
  const iconColor = tone === 'light' ? palette.textOnColor : palette.text;
  const wordmarkColor = tone === 'light' ? palette.textOnColor : palette.ink;

  return (
    <View style={styles.row}>
      {back ? (
        <Pressable
          hitSlop={12}
          onPress={() => router.back()}
          style={styles.side}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Ionicons name="chevron-back" size={24} color={iconColor} />
        </Pressable>
      ) : null}
      {brand ? (
        <View style={styles.brandRow}>
          <VitaMark size={38} color={markColor ?? (tone === 'light' ? palette.textOnColor : undefined)} />
          <Text style={[styles.wordmark, { color: wordmarkColor }]}>{title}</Text>
        </View>
      ) : (
        <Text style={[styles.title, { color: iconColor }, back && styles.centered]} numberOfLines={1}>
          {title}
        </Text>
      )}
      {settings ? (
        <Pressable
          hitSlop={12}
          onPress={() => router.push('/settings')}
          style={styles.side}
          accessibilityRole="button"
          accessibilityLabel="Settings"
        >
          <Ionicons name="settings-outline" size={22} color={iconColor} />
        </Pressable>
      ) : null}
      {close ? (
        <Pressable
          hitSlop={12}
          onPress={() => router.back()}
          style={styles.side}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Ionicons name="close" size={24} color={iconColor} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.m,
    minHeight: 44,
  },
  title: {
    ...typography.title,
    flex: 1,
  },
  brandRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  wordmark: {
    ...typography.title,
    fontSize: 28,
    letterSpacing: 6,
  },
  centered: {
    textAlign: 'center',
  },
  side: {
    width: 32,
    alignItems: 'center',
  },
});

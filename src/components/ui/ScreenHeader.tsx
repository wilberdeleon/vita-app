import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { VitaMark } from '../shell/VitaMark';
import { palette, spacing, typography } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';

type Props = {
  title: string;
  /**
   * Secondary line beneath the title — currently Fuel's date. Unset
   * everywhere else, and unset renders exactly as before: the title stays a
   * single centered-height row, so no existing header shifts.
   */
  subtitle?: string;
  /** Official VITA logo lockup (mark + wordmark) instead of a plain title. */
  brand?: boolean;
  /** Show the settings gear on the right (main hub screens). */
  settings?: boolean;
  /** Show a back arrow on the left (stacked screens). */
  back?: boolean;
  /** Show a close X on the right instead of the gear (flow screens). */
  close?: boolean;
  /**
   * Explicit override. Unset, the title and icons follow the active theme's
   * primary text color, which is what every stacked screen wants. 'light'
   * forces the white treatment for use over a dark or busy background
   * regardless of theme — same component, same tap targets, color only.
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
  /**
   * Optional right-hand control, for screens that need one that isn't the
   * gear or the close X — currently Food Detail's favorite toggle. Ignored
   * when `settings` or `close` is set, so the existing slots keep priority
   * and every current screen renders unchanged.
   */
  action?: ReactNode;
};

export function ScreenHeader({
  title,
  subtitle,
  brand = false,
  settings = false,
  back = false,
  close = false,
  tone = 'dark',
  markColor,
  action,
}: Props) {
  const { surfaces } = useTheme();
  const iconColor = tone === 'light' ? palette.textOnColor : surfaces.text;
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
        <View style={styles.titleBlock}>
          <Text style={[styles.title, { color: iconColor }, back && styles.centered]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={[styles.subtitle, { color: surfaces.textSecondary }, back && styles.centered]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
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
      {!settings && !close && action ? <View style={styles.side}>{action}</View> : null}
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
  titleBlock: {
    flex: 1,
  },
  title: {
    ...typography.title,
  },
  subtitle: {
    ...typography.caption,
    marginTop: 2,
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

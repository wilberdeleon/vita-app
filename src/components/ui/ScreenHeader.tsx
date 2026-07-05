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
};

export function ScreenHeader({ title, brand = false, settings = false, back = false, close = false }: Props) {
  return (
    <View style={styles.row}>
      {back ? (
        <Pressable hitSlop={12} onPress={() => router.back()} style={styles.side}>
          <Ionicons name="chevron-back" size={24} color={palette.text} />
        </Pressable>
      ) : null}
      {brand ? (
        <View style={styles.brandRow}>
          <VitaMark size={30} />
          <Text style={styles.wordmark}>{title}</Text>
        </View>
      ) : (
        <Text style={[styles.title, back && styles.centered]} numberOfLines={1}>
          {title}
        </Text>
      )}
      {settings ? (
        <Pressable hitSlop={12} onPress={() => router.push('/settings')} style={styles.side}>
          <Ionicons name="settings-outline" size={22} color={palette.text} />
        </Pressable>
      ) : null}
      {close ? (
        <Pressable hitSlop={12} onPress={() => router.back()} style={styles.side}>
          <Ionicons name="close" size={24} color={palette.text} />
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
    color: palette.text,
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
    color: palette.ink,
    letterSpacing: 5,
  },
  centered: {
    textAlign: 'center',
  },
  side: {
    width: 32,
    alignItems: 'center',
  },
});

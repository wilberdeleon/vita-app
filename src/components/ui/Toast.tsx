import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { DOCK_CLEARANCE, glassShadow, palette, radii, spacing, typography } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';

export type ToastOptions = {
  message: string;
  /** e.g. "Undo". Omit for a plain acknowledgement. */
  actionLabel?: string;
  onAction?: () => void;
};

type ToastContextValue = {
  showToast: (options: ToastOptions) => void;
  hideToast: () => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Long enough to read and act on; short enough not to sit in the way.
 * A toast carrying Undo gets noticeably longer than a plain one — the user
 * has to notice it, read it, decide, and reach, and a destructive action
 * whose undo window closes before they get there isn't really undoable.
 */
const PLAIN_DURATION = 2600;
const ACTION_DURATION = 6000;

/**
 * The confirmation surface for actions that complete instantly — logging a
 * food, deleting an entry.
 *
 * Deliberately not a modal or a success screen. Logging is meant to take
 * seconds, and a screen that has to be dismissed after every banana turns a
 * two-tap action into three. An inline toast confirms the same thing
 * without interrupting, and carrying Undo makes destructive actions safe
 * without a confirm dialog in front of them — which is both faster and
 * kinder than asking "are you sure?" every time.
 */
export function ToastProvider({ children }: PropsWithChildren) {
  const [toast, setToast] = useState<ToastOptions | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const anim = useRef(new Animated.Value(0)).current;
  const { surfaces, scheme } = useTheme();

  const clearTimer = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const hideToast = useCallback(() => {
    clearTimer();
    Animated.timing(anim, {
      toValue: 0,
      duration: 180,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setToast(null);
    });
  }, [anim, clearTimer]);

  const showToast = useCallback(
    (options: ToastOptions) => {
      clearTimer();
      setToast(options);
      anim.setValue(0);
      Animated.timing(anim, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      timer.current = setTimeout(hideToast, options.actionLabel ? ACTION_DURATION : PLAIN_DURATION);
    },
    [anim, clearTimer, hideToast],
  );

  useEffect(() => clearTimer, [clearTimer]);

  const value = useMemo<ToastContextValue>(() => ({ showToast, hideToast }), [showToast, hideToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <Animated.View
          /**
           * Sits above the floating dock rather than over it, so the dock
           * stays reachable while a toast is up. Uses the shared dock
           * clearance rather than safe-area insets because this provider is
           * mounted above the navigator, outside any SafeAreaProvider.
           */
          style={[
            styles.wrapper,
            {
              bottom: DOCK_CLEARANCE,
              opacity: anim,
              transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
            },
          ]}
          pointerEvents="box-none"
          accessibilityLiveRegion="polite"
        >
          <View
            style={[
              styles.toast,
              {
                backgroundColor: scheme === 'dark' ? '#2A2B2E' : palette.ink,
                borderColor: surfaces.border,
              },
            ]}
          >
            <Text style={styles.message} numberOfLines={2}>
              {toast.message}
            </Text>
            {toast.actionLabel ? (
              <Pressable
                hitSlop={10}
                accessibilityRole="button"
                onPress={() => {
                  toast.onAction?.();
                  hideToast();
                }}
              >
                <Text style={styles.action}>{toast.actionLabel}</Text>
              </Pressable>
            ) : null}
          </View>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside a ToastProvider (mounted in src/app/_layout.tsx).');
  }
  return context;
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.l,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: radii.control,
    borderWidth: StyleSheet.hairlineWidth,
    ...glassShadow,
  },
  message: {
    ...typography.captionMedium,
    // Both themes use a dark toast surface, so the label is white in each —
    // a theme-following text color would vanish in light mode.
    color: palette.textOnColor,
    flexShrink: 1,
  },
  action: {
    ...typography.captionMedium,
    color: palette.gold,
    fontWeight: '700',
  },
});

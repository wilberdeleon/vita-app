/**
 * Whether the device asks for reduced motion.
 *
 * Lives beside the theme because motion is part of VITA's design system, not
 * any one feature's concern — Sprint 5 establishes the shared motion
 * vocabulary and Sprint 9 applies it app-wide, and this is the switch every
 * part of it has to honor.
 *
 * The rule it exists to enforce: **no information may depend on animation.**
 * A component reading `true` should land on its final state directly, not
 * play a shorter version of the same animation.
 *
 * Subscribes to changes rather than reading once, because the setting can be
 * toggled while the app is open — commonly by the exact users who need it.
 */

import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let active = true;

    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (active) setReduced(enabled);
    });

    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);

    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  return reduced;
}

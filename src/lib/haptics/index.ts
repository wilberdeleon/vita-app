/**
 * VITA's haptic vocabulary (Sprint 5 slice 5.1).
 *
 * **Four events, named for what happened — not for what the phone does.**
 * Call sites say `vitaHaptic('confirm')`, never `impactAsync(Light)`. That
 * indirection is the whole point of this module: the mapping from a VITA
 * event to an Expo API lives in exactly one place, so the feel of a
 * confirmation can be retuned once rather than at every call site, and a
 * future "reduce haptics" preference has somewhere to live.
 *
 * ## The vocabulary
 *
 * | Event | Meaning | Examples |
 * |---|---|---|
 * | `selection` | The user picked something from a set | a quick-add amount, a unit, a body-map zone, a segmented tab |
 * | `confirm` | Something the user asked for was recorded | water logged, a dose marked taken, an entry saved |
 * | `complete` | A day-level goal was reached | hydration goal met, every scheduled routine answered |
 * | `warn` | Something needs attention or could not be undone | a destructive confirmation, a failed save |
 *
 * ## The rules
 *
 * **A haptic accompanies a state change the user caused.** Never on scroll,
 * never on navigation, never on render, never on a decorative transition, and
 * never twice for one action. The founder's instruction for this slice was
 * blunt and is the standard: do not vibrate on every tap.
 *
 * **`complete` is rare by design.** It fires when a day's goal is met, not
 * every time something is logged — a signal that fires constantly is not a
 * signal. If `confirm` and `complete` would both fire for one action, fire
 * only `complete`: it is the more specific statement.
 *
 * **Silence is not a failure.** Haptics are unavailable on some devices, in
 * some simulators, and whenever the OS decides otherwise. Every call is
 * fire-and-forget and swallows its own errors — a missing vibration must
 * never surface to the user or interrupt the action it was accompanying,
 * because the action is the point and the haptic is the garnish.
 */

import * as Haptics from 'expo-haptics';

export type HapticEvent = 'selection' | 'confirm' | 'complete' | 'warn';

/**
 * Fire the haptic for a VITA event.
 *
 * Deliberately returns `void` rather than the underlying promise. A caller
 * that could `await` a haptic would eventually `await` one, and putting a
 * vibration on the critical path of logging a glass of water is exactly the
 * kind of lag this app should not have.
 */
export function vitaHaptic(event: HapticEvent): void {
  void run(event);
}

async function run(event: HapticEvent): Promise<void> {
  try {
    switch (event) {
      case 'selection':
        // The lightest thing the platform offers. A quick-add tap happens
        // several times a day and must not feel like an alert.
        await Haptics.selectionAsync();
        return;
      case 'confirm':
        // Light rather than Medium: this fires on every successful log, and
        // Medium reads as "something notable happened" several times a day.
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        return;
      case 'complete':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        return;
      case 'warn':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        return;
    }
  } catch {
    // Intentionally silent — see the module docstring. There is nothing a
    // user could do about it and nothing worth telling them.
  }
}

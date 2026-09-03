/**
 * The haptic vocabulary.
 *
 * Two things are worth proving, and neither is "does Expo vibrate". The first
 * is that each VITA event maps to the intended platform feedback, because the
 * whole reason this wrapper exists is so that mapping lives in one auditable
 * place. The second is that a haptic can never take down the action it was
 * accompanying — a vibration failing must not stop a glass of water being
 * logged.
 */

jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(async () => {}),
  impactAsync: jest.fn(async () => {}),
  notificationAsync: jest.fn(async () => {}),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

import * as Haptics from 'expo-haptics';
import { vitaHaptic } from '../index';

const selection = Haptics.selectionAsync as jest.Mock;
const impact = Haptics.impactAsync as jest.Mock;
const notification = Haptics.notificationAsync as jest.Mock;

/** Lets the fire-and-forget promise inside `vitaHaptic` settle. */
const flush = () => new Promise((resolve) => setImmediate(resolve));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('vitaHaptic', () => {
  it('maps selection to the platform selection feedback', async () => {
    vitaHaptic('selection');
    await flush();

    expect(selection).toHaveBeenCalledTimes(1);
    expect(impact).not.toHaveBeenCalled();
    expect(notification).not.toHaveBeenCalled();
  });

  it('maps confirm to a light impact, not a medium one', async () => {
    vitaHaptic('confirm');
    await flush();

    // Light is deliberate: this fires on every successful log, and Medium
    // would make an ordinary action feel like an announcement.
    expect(impact).toHaveBeenCalledWith('light');
    expect(notification).not.toHaveBeenCalled();
  });

  it('maps complete to success and warn to warning', async () => {
    vitaHaptic('complete');
    await flush();
    expect(notification).toHaveBeenCalledWith('success');

    jest.clearAllMocks();

    vitaHaptic('warn');
    await flush();
    expect(notification).toHaveBeenCalledWith('warning');
  });

  it('fires exactly one platform call per event', async () => {
    vitaHaptic('confirm');
    await flush();

    const total = selection.mock.calls.length + impact.mock.calls.length + notification.mock.calls.length;
    expect(total).toBe(1);
  });

  it('never throws when the platform refuses', async () => {
    impact.mockRejectedValueOnce(new Error('haptics unavailable'));

    // The action this was accompanying must complete regardless.
    expect(() => vitaHaptic('confirm')).not.toThrow();
    await expect(flush()).resolves.toBeUndefined();
  });

  it('returns void rather than a promise, so no caller can await a vibration', () => {
    expect(vitaHaptic('selection')).toBeUndefined();
  });
});

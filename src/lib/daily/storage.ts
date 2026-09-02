/**
 * AsyncStorage helpers.
 *
 * Thin on purpose. This is not a persistence framework — it is the three
 * operations every domain repository repeats, with the one piece of judgment
 * they all need: unparseable JSON is treated as absent rather than thrown.
 *
 * That choice matters. A torn or corrupted write should cost the user the
 * affected record, not the ability to open the app — throwing here would
 * surface as a blank screen on launch with no way back.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/** `null` for a key that was never written, or whose value is unparseable. */
export async function readJson(key: string): Promise<unknown> {
  const raw = await AsyncStorage.getItem(key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export async function writeJson(key: string, value: unknown): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function removeKey(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}

export async function allKeys(): Promise<readonly string[]> {
  return AsyncStorage.getAllKeys();
}

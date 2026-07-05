import { Stack } from 'expo-router';

/**
 * Authenticated area. The (tabs) group holds the four dock destinations;
 * every other route here (fuel sub-flows, water, peptides, settings) stacks
 * above the tabs without the dock.
 */
export default function VitaLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

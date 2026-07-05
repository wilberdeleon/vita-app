import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

// Root layout. The theme provider and auth gate will be added in Sprint 0.
export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

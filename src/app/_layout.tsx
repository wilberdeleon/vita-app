import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../features/auth/AuthProvider';
import { NutritionProvider } from '../lib/nutrition';
import { ThemeProvider, useTheme } from '../theme/ThemeProvider';

function RootStack() {
  const { scheme } = useTheme();
  return (
    <AuthProvider>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(vita)" />
        <Stack.Screen name="(auth)" />
      </Stack>
    </AuthProvider>
  );
}

/**
 * `NutritionProvider` sits at the root rather than inside Fuel because Home
 * reads the same nutrition state — the whole point of the Sprint 2 engine
 * is that there is one day's data, not one per screen.
 */
export default function RootLayout() {
  return (
    <ThemeProvider>
      <NutritionProvider>
        <RootStack />
      </NutritionProvider>
    </ThemeProvider>
  );
}

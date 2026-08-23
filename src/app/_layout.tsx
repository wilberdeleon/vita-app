import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ToastProvider } from '../components/ui';
import { AuthProvider } from '../features/auth/AuthProvider';
import { NutritionProvider } from '../lib/nutrition';
import { PeptideProvider } from '../lib/peptides';
import { WaterProvider } from '../lib/water';
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
 * The domain providers sit at the root rather than inside their features,
 * because more than one screen reads each of them — Home and Fuel both read
 * nutrition, and Fuel's Hydration module reads the same water state the Water
 * screen does. The whole point is that there is one day's data, not one copy
 * per screen.
 *
 * They are siblings, not nested for any reason: neither domain reads the
 * other, and ordering them here implies a dependency that does not exist.
 */
export default function RootLayout() {
  return (
    <ThemeProvider>
      <NutritionProvider>
        <WaterProvider>
          <PeptideProvider>
            <ToastProvider>
              <RootStack />
            </ToastProvider>
          </PeptideProvider>
        </WaterProvider>
      </NutritionProvider>
    </ThemeProvider>
  );
}

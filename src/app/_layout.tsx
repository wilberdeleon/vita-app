import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../features/auth/AuthProvider';
import { ThemeProvider } from '../theme/ThemeProvider';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(vita)" />
          <Stack.Screen name="(auth)" />
        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}

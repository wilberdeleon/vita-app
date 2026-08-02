import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../features/auth/AuthProvider';
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

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootStack />
    </ThemeProvider>
  );
}

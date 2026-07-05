import { StyleSheet, Text, View } from 'react-native';

// Temporary entry screen. Replaced by the auth gate and app shell in Sprint 0.
export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>VITA</Text>
      <Text style={styles.subtitle}>Scaffolding complete. Sprint 0 begins next.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    letterSpacing: 8,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.6,
  },
});

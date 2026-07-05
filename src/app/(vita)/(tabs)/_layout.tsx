import { Tabs } from 'expo-router';
import { FloatingDock } from '../../../components/shell/FloatingDock';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingDock {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="fuel" />
      <Tabs.Screen name="journey" />
      <Tabs.Screen name="atlas" />
    </Tabs>
  );
}

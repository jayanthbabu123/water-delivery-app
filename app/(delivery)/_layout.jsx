import { Stack } from "expo-router";

export default function DeliveryLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "white" },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="delivery-details" />
      <Stack.Screen name="customer-info" />
      <Stack.Screen name="navigation" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="history" />
    </Stack>
  );
}

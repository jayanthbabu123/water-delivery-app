import { Stack } from "expo-router";

export default function CustomerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "white" },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="order" />
      <Stack.Screen name="order-details" />
      <Stack.Screen name="add-payment" />
      <Stack.Screen name="payments" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="support" />
    </Stack>
  );
}

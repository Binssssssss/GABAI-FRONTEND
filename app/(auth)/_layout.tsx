import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding/onboarding" />
      <Stack.Screen name="login/login" />
      <Stack.Screen name="register/register" />
      <Stack.Screen name="forgot-password/forgot-password" />
    </Stack>
  );
}

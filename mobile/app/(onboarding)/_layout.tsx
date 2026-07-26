import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: '#23173E',
        },
      }}
    >
      <Stack.Screen name="username" />
      <Stack.Screen name="pick-league" />
    </Stack>
  );
}

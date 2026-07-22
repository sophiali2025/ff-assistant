import { Stack } from 'expo-router';

/**
 * Auth Layout Component
 *
 * This layout defines the navigation structure for authentication screens.
 * In Expo Router, any folder with parentheses like (auth) is a "route group"
 * that groups related screens together without adding the folder name to the URL.
 *
 * The Stack navigator allows us to navigate between login and signup screens
 * with push/pop transitions.
 */
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,  // Hide the default navigation header
        contentStyle: {
          backgroundColor: '#23173E',  // Match our app's dark purple theme
        },
      }}
    >
      {/* Define the screens in this auth stack */}
      <Stack.Screen
        name="login"
        options={{
          title: 'Login',
        }}
      />
      <Stack.Screen
        name="signup"
        options={{
          title: 'Sign Up',
        }}
      />
    </Stack>
  );
}

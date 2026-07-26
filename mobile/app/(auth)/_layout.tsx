import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  // Redirect logged-in users away from auth screens
  useEffect(() => {
    if (loading) return; // Don't redirect while checking auth

    const inAuth = segments[0] === '(auth)';

    if (user && inAuth) {
      // User is logged in but on auth screen - redirect to index
      // Index will check for onboarding and route appropriately
      router.replace('/');
    }
  }, [user, loading, segments]);

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

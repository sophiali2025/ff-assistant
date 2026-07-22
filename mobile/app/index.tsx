import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { supabase } from '@/lib/supabase';

/**
 * Index/Root Component
 *
 * This is the entry point of our app. It checks if a user is authenticated
 * and redirects them to either the auth screens or the main app.
 *
 * Key React concepts:
 * - useEffect: Runs side effects (like checking auth) when component mounts
 * - useRouter: Expo Router hook for navigation
 * - Async operations: We wait for Supabase to check the session
 */
export default function Index() {
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    /**
     * Check authentication status
     * This async function checks if there's an active session
     */
    const checkAuth = async () => {
      try {
        // Get the current session from Supabase
        const { data: { session } } = await supabase.auth.getSession();

        // Small delay to prevent flash of wrong screen
        await new Promise(resolve => setTimeout(resolve, 100));

        if (session) {
          // User is logged in, go to main app (roster is the first tab)
          router.replace('/(tabs)/roster');
        } else {
          // User is not logged in, go to login screen
          router.replace('/(auth)/login');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // On error, default to login screen
        router.replace('/(auth)/login');
      }
    };

    checkAuth();
  }, []);

  // Show loading spinner while checking auth
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#A1C4F9" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#23173E',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

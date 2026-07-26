import { useState, useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase';

/**
 * Root index screen - handles initial routing based on auth state and onboarding status
 */
export default function Index() {
  console.log('Index component rendering');
  const { user, loading: authLoading } = useAuth();
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  console.log('Auth state - user:', user?.id || 'null', 'authLoading:', authLoading, 'onboardingComplete:', onboardingComplete);

  // Check if user has completed onboarding by querying users table
  useEffect(() => {
    console.log('useEffect fired - user:', user ? 'exists' : 'null', 'onboardingComplete:', onboardingComplete);

    if (!user) {
      console.log('No user, setting onboardingComplete to null');
      setOnboardingComplete(null);
      return;
    }

    async function checkOnboarding() {
      if (!user) return; // TypeScript safety check

      console.log('Checking onboarding for user:', user.id);

      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();

      console.log('Onboarding check result:', { data, error });

      if (error || !data) {
        // User not in database = needs onboarding
        console.log('User not found in database - needs onboarding');
        setOnboardingComplete(false);
      } else {
        // User exists = onboarding complete
        console.log('User found in database - onboarding complete');
        setOnboardingComplete(true);
      }
    }

    checkOnboarding();
  }, [user]);

  // Show loading spinner while checking auth or onboarding status
  if (authLoading || (user && onboardingComplete === null)) {
    return (
      <View style={{ flex: 1, backgroundColor: '#23173E', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#A1C4F9" />
      </View>
    );
  }

  // Not logged in - go to login
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  // Logged in but onboarding not complete - go to onboarding
  if (!onboardingComplete) {
    return <Redirect href="/(onboarding)/username" />;
  }

  // Logged in and onboarding complete - go to roster
  return <Redirect href="/(tabs)/roster" />;
}

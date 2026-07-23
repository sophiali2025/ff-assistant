import React, { useEffect } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function TabLayout() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  // Protect tabs - redirect to login if not authenticated
  useEffect(() => {
    if (loading) return; // Don't redirect while checking auth

    const inTabs = segments[0] === '(tabs)';

    if (!user && inTabs) {
      // User is not logged in but trying to access tabs - redirect to login
      router.replace('/(auth)/login');
    }
  }, [user, loading, segments]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#A1C4F9',
        tabBarInactiveTintColor: '#9F98EE',
        tabBarStyle: {
          backgroundColor: '#362C58',
          borderTopColor: '#A1C4F9',
          borderTopWidth: 1,
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="roster"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: 'AI',
          tabBarIcon: ({ color }) => <Ionicons name="sparkles-outline" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}


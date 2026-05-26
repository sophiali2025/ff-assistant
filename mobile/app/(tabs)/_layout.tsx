import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
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
      <Tabs.Screen
        name="startsit"
        options={{
          title: 'League',
          tabBarIcon: ({ color }) => <Ionicons name="people-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="matchup"
        options={{
          title: 'News',
          tabBarIcon: ({ color }) => <Ionicons name="document-text-outline" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

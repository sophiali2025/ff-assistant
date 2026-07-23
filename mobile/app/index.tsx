import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { View, ActivityIndicator } from 'react-native';

/**
 * Root index screen - handles initial routing based on auth state
 */
export default function Index() {
  const { user, loading } = useAuth();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#23173E', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#A1C4F9" />
      </View>
    );
  }

  // Redirect based on auth state
  if (user) {
    return <Redirect href="/(tabs)/roster" />;
  } else {
    return <Redirect href="/(auth)/login" />;
  }
}

import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { validateSleeperUsername } from '@/lib/api';

export default function UsernameScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    // Validate input
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter your Sleeper username');
      return;
    }

    setLoading(true);

    try {
      // Call API to validate username and get user ID
      const sleeperUserId = await validateSleeperUsername(username.trim());

      // Navigate to league picker with params
      router.push({
        pathname: '/(onboarding)/pick-league',
        params: {
          username: username.trim(),
          sleeperUserId: sleeperUserId,
        },
      });
    } catch (error) {
      Alert.alert(
        'Username Not Found',
        'We couldn\'t find that Sleeper username. Please check the spelling and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Header */}
        <Text style={styles.header}>enter your sleeper username to get started!</Text>

        {/* Input */}
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Sleeper username"
          placeholderTextColor="#9F98EE"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
        />

        {/* Submit button */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={loading}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#23173E',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    width: '100%',
    backgroundColor: '#362C58',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#A1C4F9',
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 24,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#597DB4',
    borderWidth: 1,
    borderColor: '#A1C4F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

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
        {/* App Title */}
        <Text style={styles.title}>edge</Text>

        {/* Instruction text */}
        <Text style={styles.instruction}>enter your sleeper username to get started!</Text>

        {/* Input group */}
        <View style={styles.inputGroup}>
          {/* Label */}
          <Text style={styles.label}>sleeper username</Text>

          {/* Input and button row */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder=""
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
                <Ionicons name="arrow-forward" size={20} color="#A1C4F9" />
              )}
            </TouchableOpacity>
          </View>
        </View>
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
    alignItems: 'center',
    paddingTop: 233,
    paddingHorizontal: 44,
  },
  title: {
    fontFamily: 'Jaro',
    fontSize: 60,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 29,
    letterSpacing: 2,
  },
  instruction: {
    fontFamily: 'Jaldi',
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
    width: 224,
    marginBottom: 61,
    lineHeight: 23,
  },
  inputGroup: {
    width: '100%',
    maxWidth: 325,
  },
  label: {
    fontFamily: 'Jaldi',
    fontSize: 18,
    color: '#A1C4F9',
    marginBottom: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  input: {
    flex: 1,
    height: 32,
    backgroundColor: '#362C58',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#A1C4F9',
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  button: {
    width: 33,
    height: 32,
    borderRadius: 15,
    backgroundColor: '#362C58',
    borderWidth: 1,
    borderColor: '#A1C4F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

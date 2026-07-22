import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

/**
 * LoginScreen Component
 *
 * This screen allows existing users to authenticate and access their account.
 * It demonstrates the same React patterns as the signup screen but with
 * different Supabase auth methods (signIn vs signUp).
 */
export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Handle the login process
   * Uses Supabase's signInWithPassword method
   */
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        Alert.alert('Login Failed', error.message);
      } else {
        // On success, navigate to main app (roster is the first tab)
        router.replace('/(tabs)/roster');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * TEMPORARY DEVELOPMENT BYPASS
   *
   * TODO: REMOVE THIS FUNCTION WHEN SUPABASE AUTH IS CONFIGURED
   *
   * This function allows bypassing authentication during development
   * when Supabase hasn't been set up yet. Simply navigates to the
   * main app without requiring valid credentials.
   */
  const handleDevBypass = () => {
    console.warn('🚧 DEV BYPASS: Skipping authentication');
    router.replace('/(tabs)/roster');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>edge</Text>

        <Text style={styles.subtitle}>
          welcome back! enter your credentials to continue
        </Text>

        <View style={styles.formContainer}>
          <Text style={styles.label}>email</Text>
          <TextInput
            style={styles.input}
            placeholder=""
            placeholderTextColor="#6B5A8E"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            editable={!loading}
          />

          <Text style={styles.label}>password</Text>
          <TextInput
            style={styles.input}
            placeholder=""
            placeholderTextColor="#6B5A8E"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Logging in...' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>don't have an account? </Text>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/signup')}
            disabled={loading}
          >
            <Text style={styles.signupLink}>sign up</Text>
          </TouchableOpacity>
        </View>

        {/*
          ⚠️ TEMPORARY DEV BYPASS BUTTON ⚠️

          TODO: DELETE THIS ENTIRE SECTION WHEN SUPABASE IS CONFIGURED

          This button allows you to skip authentication during development.
          To remove:
          1. Delete this entire TouchableOpacity component
          2. Delete the handleDevBypass function above
          3. Delete the devBypassButton style below
        */}
        <TouchableOpacity
          style={styles.devBypassButton}
          onPress={handleDevBypass}
          activeOpacity={0.7}
        >
          <Text style={styles.devBypassText}>
            🚧 Skip Login (Dev Only) 🚧
          </Text>
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
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: 'Jaro',
    fontSize: 60,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 2,
  },
  subtitle: {
    fontFamily: 'Jaldi',
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
    width: 280,
    marginBottom: 50,
    lineHeight: 26,
  },
  formContainer: {
    width: '90%',
    maxWidth: 336,
    borderWidth: 1,
    borderColor: '#A1C4F9',
    borderRadius: 20,
    padding: 16,
    backgroundColor: 'rgba(54, 44, 88, 0.3)',
  },
  label: {
    fontFamily: 'Jaldi',
    fontSize: 18,
    color: '#A1C4F9',
    marginBottom: 8,
    marginTop: -6,
  },
  input: {
    height: 32,
    backgroundColor: '#362C58',
    borderWidth: 1,
    borderColor: '#A1C4F9',
    borderRadius: 15,
    paddingHorizontal: 12,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    height: 39,
    backgroundColor: '#67558F',
    borderWidth: 1,
    borderColor: '#A1C4F9',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontFamily: 'Inter',
    fontWeight: 'bold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  signupContainer: {
    flexDirection: 'row',
    marginTop: 32,
    alignItems: 'center',
  },
  signupText: {
    fontFamily: 'Jaldi',
    fontSize: 20,
    color: '#FFFFFF',
  },
  signupLink: {
    fontFamily: 'Jaldi-Bold',
    fontSize: 20,
    color: '#9F98EE',
  },
  // ⚠️ TODO: DELETE THESE STYLES WHEN REMOVING DEV BYPASS ⚠️
  devBypassButton: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: '#FF6B35',  // Orange warning color
    borderWidth: 2,
    borderColor: '#FFD700',  // Gold border for visibility
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  devBypassText: {
    fontFamily: 'Jaldi-Bold',
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

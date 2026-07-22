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
 * SignupScreen Component
 *
 * This is a user registration screen that allows new users to create an account.
 * It demonstrates several React and React Native concepts:
 *
 * 1. **State Management with useState**: We track email, password, and loading state
 * 2. **Form Handling**: TextInput components with controlled state
 * 3. **Async Operations**: Using async/await to communicate with Supabase
 * 4. **Navigation**: Using Expo Router to navigate between screens
 * 5. **Platform-Specific Components**: KeyboardAvoidingView for iOS keyboard handling
 */
export default function SignupScreen() {
  const router = useRouter();

  // State hooks - these create reactive variables that trigger re-renders when updated
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Handle the signup process
   * This is an async function because we need to wait for the Supabase API response
   */
  const handleSignup = async () => {
    // Basic validation - check if fields are filled
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    // Email format validation using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // Password strength check
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    // Set loading state to show feedback to user
    setLoading(true);

    try {
      // Call Supabase auth API to create new user
      // The supabase client is imported from lib/supabase.js which we set up earlier
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        // If there's an error, show it to the user
        Alert.alert('Signup Failed', error.message);
      } else {
        // Success! Let user know they need to verify their email
        Alert.alert(
          'Success!',
          'Account created! Please check your email to verify your account.',
          [
            {
              text: 'OK',
              onPress: () => router.push('/(auth)/login'),
            }
          ]
        );
      }
    } catch (error) {
      // Catch any unexpected errors
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      console.error('Signup error:', error);
    } finally {
      // Always stop loading state, whether success or failure
      setLoading(false);
    }
  };

  return (
    /**
     * KeyboardAvoidingView: Ensures the form doesn't get hidden behind the keyboard on iOS
     * behavior="padding" adds padding when keyboard appears
     * flex: 1 makes it take up the full screen
     */
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Main content container */}
      <View style={styles.content}>

        {/* App Title - using Jaro font as specified in the design */}
        <Text style={styles.title}>edge</Text>

        {/* Subtitle instruction text */}
        <Text style={styles.subtitle}>
          enter your email and password to make an account!
        </Text>

        {/* Form container with border and inputs */}
        <View style={styles.formContainer}>

          {/* Email Label */}
          <Text style={styles.label}>email</Text>

          {/* Email Input Field
              TextInput is React Native's text input component
              value and onChangeText make it a "controlled component"
              (React controls the value, not the DOM)
          */}
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

          {/* Password Label */}
          <Text style={styles.label}>password</Text>

          {/* Password Input Field
              secureTextEntry hides the password characters
          */}
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

          {/* Submit Button
              TouchableOpacity: Makes the button pressable with opacity feedback
              disabled prop prevents multiple submissions while loading
          */}
          <TouchableOpacity
            style={[
              styles.button,
              loading && styles.buttonDisabled
            ]}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creating Account...' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Login Link - for users who already have an account */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>already have an account? </Text>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/login')}
            disabled={loading}
          >
            <Text style={styles.loginLink}>log in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

/**
 * StyleSheet: React Native's way of defining styles (similar to CSS but uses JavaScript objects)
 * Benefits: type checking, performance optimization, and autocomplete in IDE
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,  // Take up full screen
    backgroundColor: '#23173E',  // Dark purple background from design
  },
  content: {
    flex: 1,
    alignItems: 'center',  // Center horizontally
    paddingTop: 80,  // Push content down from top
    paddingHorizontal: 20,  // Side padding
  },
  title: {
    fontFamily: 'Jaro',  // Custom font loaded in _layout.tsx
    fontSize: 60,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 2,  // Add some spacing between letters
  },
  subtitle: {
    fontFamily: 'Jaldi',  // Jaldi font now loaded in _layout.tsx
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
    width: 250,
    marginBottom: 50,
    lineHeight: 26,  // Improved readability
  },
  formContainer: {
    width: '90%',
    maxWidth: 336,
    borderWidth: 1,
    borderColor: '#A1C4F9',  // Light blue border from design
    borderRadius: 20,
    padding: 16,
    backgroundColor: 'rgba(54, 44, 88, 0.3)',  // Semi-transparent darker purple
  },
  label: {
    fontFamily: 'Jaldi',
    fontSize: 18,
    color: '#A1C4F9',  // Light blue text
    marginBottom: 8,
    marginTop: -6,
  },
  input: {
    height: 32,
    backgroundColor: '#362C58',  // Darker input background
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
    backgroundColor: '#67558F',  // Purple button background
    borderWidth: 1,
    borderColor: '#A1C4F9',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.6,  // Visual feedback when disabled
  },
  buttonText: {
    fontFamily: 'Inter',
    fontWeight: 'bold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  loginContainer: {
    flexDirection: 'row',  // Place text and link side by side
    marginTop: 32,
    alignItems: 'center',
  },
  loginText: {
    fontFamily: 'Jaldi',
    fontSize: 20,
    color: '#FFFFFF',
  },
  loginLink: {
    fontFamily: 'Jaldi-Bold',  // Using Jaldi Bold for the link
    fontSize: 20,
    color: '#9F98EE',  // Light purple accent for link
  },
});

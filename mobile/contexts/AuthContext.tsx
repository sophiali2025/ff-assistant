import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

/**
 * AuthContext - Central authentication state management
 *
 * REACT CONCEPT: Context API
 * --------------
 * Context lets you share data across your component tree without
 * passing props down manually at every level. Think of it as a
 * "global state" that any component can subscribe to.
 *
 * Without Context:
 *   <App user={user}> → <Layout user={user}> → <Screen user={user}> → <Header user={user}>
 *
 * With Context:
 *   <App> → <Layout> → <Screen> → <Header>  (Header just calls useAuth())
 */

// Define the shape of our context data
interface AuthContextType {
  user: User | null;              // Supabase user object (contains id, email, metadata)
  session: Session | null;        // Active session (contains access token, expiry)
  loading: boolean;               // True while checking auth state on app load
  signOut: () => Promise<void>;   // Function to log out the user
}

// Create the context with default values
// These defaults are just for TypeScript — they'll be overwritten by the Provider
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

/**
 * AuthProvider - Wraps your app to provide auth state
 *
 * REACT CONCEPT: Provider Pattern
 * ---------------
 * A Provider is a component that wraps your app and "provides" data
 * to all child components via Context. It's the source of truth.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get the initial session when the component mounts
    // This checks if the user is already logged in (session saved in AsyncStorage)
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
      }
      console.log('Initial session:', session ? 'User logged in' : 'No session');
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 2. Subscribe to auth state changes
    // This listener fires whenever:
    // - User logs in (SIGNED_IN)
    // - User logs out (SIGNED_OUT)
    // - Token gets refreshed (TOKEN_REFRESHED)
    // - User profile updates (USER_UPDATED)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth event:', event, session ? 'Session exists' : 'No session');
        // Update our React state with the new session
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // REACT CONCEPT: Effect Cleanup
    // -----------------------------
    // The return function is called when:
    // - Component unmounts (disappears from screen)
    // - Effect is about to re-run (dependencies changed)
    //
    // Always clean up subscriptions to prevent memory leaks!
    // If you don't unsubscribe, the listener keeps running even after
    // the component is gone, consuming memory and potentially causing bugs.

    return () => {
      subscription.unsubscribe();
    };
  }, []); // Empty array = run once on mount, cleanup on unmount

  // Sign out function
  const signOut = async () => {
    console.log('Signing out...');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      throw error;
    }
    console.log('Sign out successful');

    // Fallback: Manually clear state in case listener doesn't fire
    // This ensures logout always works even if there's a listener issue
    setSession(null);
    setUser(null);
  };

  // REACT CONCEPT: Context Provider
  // -------------------------------
  // The Provider component makes this data available to all children.
  // Any child component can call useAuth() to access user, session, loading, signOut.

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth - Custom hook to consume auth context
 *
 * REACT CONCEPT: Custom Hooks
 * ---------------------------
 * A custom hook is just a function that uses other hooks (useState, useEffect, etc).
 * It lets you extract component logic into reusable functions.
 *
 * Convention: Custom hooks MUST start with "use" (React enforces this).
 *
 * Why this is useful:
 * - Instead of importing useContext and AuthContext in every component,
 *   you just import useAuth() — cleaner and easier to use.
 * - We can add validation (like the error check below).
 */
export function useAuth() {
  const context = useContext(AuthContext);

  // Safety check: If someone calls useAuth() outside of an AuthProvider,
  // throw a helpful error instead of returning undefined
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

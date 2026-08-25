import { useState, useCallback } from 'react';
import { StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { View } from '@/components/default/Themed';
import Header from '@/components/Header';
import WeeklyMatch from '@/components/WeeklyMatch';
import RosterList from '@/components/RosterList';
import ProfileDropdown from '@/components/ProfileDropdown';
import { fetchMatchup, fetchRoster } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useSeason } from '@/contexts/SeasonContext';
import { supabase } from '@/lib/supabase';

// --- useState and useEffect ---
//
// useState: Gives your component a piece of "state" — a value that
// React tracks. When you update it (via the setter), React re-renders
// the component so the screen reflects the new data.
//   const [value, setValue] = useState(initialValue);
//
// useEffect: Runs a side effect (like fetching data) after the
// component renders. The second argument is a dependency array:
//   [] = run once when the component first appears (mount)
//   [x] = run again whenever x changes
//   no array = run after every render (rarely what you want)

export default function RosterScreen() {
  const { user } = useAuth();
  const { currentWeek, currentSeason, seasonType } = useSeason();

  // matchup starts as null because we don't have data yet.
  // Once the fetch completes, we call setMatchup with the data,
  // which triggers a re-render with the real values.
  const [matchup, setMatchup] = useState<any>(null);
  const [roster, setRoster] = useState<any>(null);
  const [userInitial, setUserInitial] = useState<string>('');

  // State to control the profile dropdown visibility
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // useFocusEffect runs every time the screen comes into focus.
  // This ensures data refreshes when returning from other screens,
  // like when switching leagues. Both fetches fire in parallel for speed.
  useFocusEffect(
    useCallback(() => {
      // Fetch username for avatar initial
      if (user) {
        supabase
          .from('users')
          .select('sleeper_username')
          .eq('id', user.id)
          .single()
          .then(({ data }) => {
            if (data?.sleeper_username) {
              setUserInitial(data.sleeper_username.charAt(0).toUpperCase());
            }
          });
      }

      fetchMatchup(currentWeek, currentSeason)
        .then((data) => setMatchup(data))
        .catch((err) => console.error('Error fetching matchup:', err));

      fetchRoster(currentWeek, currentSeason)
        .then((data) => setRoster(data))
        .catch((err) => console.error('Error fetching roster:', err));
    }, [user, currentWeek, currentSeason])
  );

  // Preseason check - only show message if user has no roster yet
  if (seasonType === 'pre' && roster !== null && roster.length === 0) {
    return (
      <View style={styles.container}>
        <Header
          week={0}
          initials={userInitial}
          onAvatarPress={() => setShowProfileDropdown(true)}
        />
        <View style={styles.preseasonContainer}>
          <Text style={styles.preseasonMessage}>Season has not started yet</Text>
        </View>
        <ProfileDropdown
          visible={showProfileDropdown}
          onClose={() => setShowProfileDropdown(false)}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        week={matchup?.week ?? 0}
        initials={userInitial}
        onAvatarPress={() => setShowProfileDropdown(true)}
      />

      {/* While matchup is null, show a spinner. Once data arrives, show WeeklyMatch. */}
      {matchup === null ? (
        <ActivityIndicator size="large" color="#A1C4F9" style={styles.loader} />
      ) : (
        <WeeklyMatch
          week={matchup.week}
          myTeamName={matchup.my_team.name}
          myActual={matchup.my_team.points}
          myProjected={matchup.my_team.projected_points}
          oppTeamName={matchup.opponent.name}
          oppActual={matchup.opponent.points}
          oppProjected={matchup.opponent.projected_points}
        />
      )}

      {roster === null ? (
        <ActivityIndicator size="large" color="#A1C4F9" style={styles.loader} />
      ) : (
        <RosterList players={roster} />
      )}

      <ProfileDropdown
        visible={showProfileDropdown}
        onClose={() => setShowProfileDropdown(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#23173E',
  },
  loader: {
    marginVertical: 30,
  },
  preseasonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#23173E',
  },
  preseasonMessage: {
    fontSize: 18,
    fontFamily: 'Jaldi',
    color: '#A1C4F9',
    textAlign: 'center',
  },
});

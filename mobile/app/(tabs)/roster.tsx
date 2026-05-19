import { useState, useEffect } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';

import { View } from '@/components/default/Themed';
import Header from '@/components/Header';
import WeeklyMatch from '@/components/WeeklyMatch';
import RosterList from '@/components/RosterList';
import { fetchMatchup, fetchRoster } from '@/lib/api';

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
  // matchup starts as null because we don't have data yet.
  // Once the fetch completes, we call setMatchup with the data,
  // which triggers a re-render with the real values.
  const [matchup, setMatchup] = useState<any>(null);
  const [roster, setRoster] = useState<any>(null);

  // useEffect with [] runs once when the screen loads.
  // Both fetches fire at the same time (in parallel) — we don't
  // await one before starting the other, so the screen loads faster.
  useEffect(() => {
    fetchMatchup()
      .then((data) => setMatchup(data))
      .catch((err) => console.error('Error fetching matchup:', err));

    fetchRoster()
      .then((data) => setRoster(data))
      .catch((err) => console.error('Error fetching roster:', err));
  }, []);

  return (
    <View style={styles.container}>
      <Header week={matchup?.week ?? 0} initials="SL" />

      {/* While matchup is null, show a spinner. Once data arrives, show WeeklyMatch. */}
      {matchup === null ? (
        <ActivityIndicator size="large" color="#A1C4F9" style={styles.loader} />
      ) : (
        <WeeklyMatch
          week={matchup.week}
          myTeamName={matchup.my_team.name}
          myActual={matchup.my_team.points}
          myProjected={matchup.my_team.projected}
          oppTeamName={matchup.opponent.name}
          oppActual={matchup.opponent.points}
          oppProjected={matchup.opponent.projected}
        />
      )}

      {roster === null ? (
        <ActivityIndicator size="large" color="#A1C4F9" style={styles.loader} />
      ) : (
        <RosterList players={roster} />
      )}
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
});

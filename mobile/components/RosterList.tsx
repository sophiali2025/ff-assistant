import { View, Text, StyleSheet, ScrollView } from 'react-native';
import PlayerRow from './PlayerRow';

// --- Hardcoded Data ---
// Later this will come from the backend API. For now we define it
// right here so we can build and test the UI.
//
// Each object in the array represents one player on your roster.
// This is a normal JavaScript array of objects — nothing React-specific.

const ROSTER = [
  { id: '4986',  slot: 'QB',  name: 'Lamar Jackson',        status: 'active',       actualPoints: 22.4, projectedPoints: 23.1 },
  { id: '4034',  slot: 'RB',  name: 'Christian McCaffrey',   status: 'questionable', actualPoints: 14.2, projectedPoints: 18.5 },
  { id: '5006',  slot: 'RB',  name: 'Derrick Henry',         status: 'active',       actualPoints: 19.8, projectedPoints: 17.2 },
  { id: '4983',  slot: 'WR',  name: 'Tyreek Hill',           status: 'active',       actualPoints: 16.3, projectedPoints: 15.9 },
  { id: '5916',  slot: 'WR',  name: 'Michael Pittman',       status: 'active',       actualPoints: 11.7, projectedPoints: 12.4 },
  { id: '4039',  slot: 'TE',  name: 'Travis Kelce',          status: 'active',       actualPoints: 13.1, projectedPoints: 11.8 },
  { id: '4029',  slot: 'FLX', name: 'Davante Adams',         status: 'doubtful',     actualPoints: 8.4,  projectedPoints: 14.6 },
  { id: '4423',  slot: 'K',   name: 'Justin Tucker',         status: 'active',       actualPoints: 9.0,  projectedPoints: 8.2 },
  { id: 'SF',    slot: 'DEF', name: 'San Francisco 49ers',   status: 'active',       actualPoints: 12.0, projectedPoints: 7.5 },
  { id: '6151',  slot: 'BN',  name: 'Elijah Mitchell',       status: 'out',          actualPoints: 0.0,  projectedPoints: 10.3 },
  { id: '7601',  slot: 'BN',  name: 'Rashod Bateman',        status: 'active',       actualPoints: 6.2,  projectedPoints: 9.1 },
  { id: '7588',  slot: 'BN',  name: 'Tyler Allgeier',        status: 'active',       actualPoints: 5.8,  projectedPoints: 8.7 },
];

export default function RosterList() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>roster</Text>

      {/* --- ScrollView ---
        A regular View clips content that overflows — if your list is
        taller than the screen, the bottom rows would be invisible.
        ScrollView makes its contents scrollable, so the user can
        swipe up/down to see everything.
      */}
      <ScrollView style={styles.list}>
        {/* --- .map() ---
          This is how you render a list in React. `.map()` is a
          JavaScript array method that transforms each item into
          something else — here, into a <PlayerRow> component.

          The `key` prop is required when rendering lists. React uses
          it to efficiently track which items changed, were added, or
          removed. It should be unique per item — here we use the
          player's name since each name is unique in our data.
        */}
        {ROSTER.map((player) => (
          <PlayerRow
            key={player.id}
            slot={player.slot}
            name={player.name}
            status={player.status}
            actualPoints={player.actualPoints}
            projectedPoints={player.projectedPoints}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 16,
  },
  title: {
    fontFamily: 'Jaro',
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 20,
    marginBottom: 8,
  },
  list: {
    backgroundColor: '#375481',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#A1C4F9',
    marginHorizontal: 20,
    marginBottom: 20,
  },
});

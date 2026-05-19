import { View, Text, StyleSheet, ScrollView } from 'react-native';
import PlayerRow from './PlayerRow';

// --- Props instead of hardcoded data ---
// Previously the roster was a const array defined right here.
// Now the parent component (RosterScreen) fetches the data and
// passes it down as a prop. This is called "lifting state up" —
// a core React pattern where the parent owns the data and children
// just receive and display it.

type Player = {
  player_id: string;
  name: string;
  slot: string;
  status: string;
  points_this_week: number;
  projected_points: number;
};

type RosterListProps = {
  players: Player[];
};

export default function RosterList({ players }: RosterListProps) {
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
        {players.map((player) => (
          <PlayerRow
            key={player.player_id}
            slot={player.slot}
            name={player.name}
            status={player.status}
            actualPoints={player.points_this_week}
            projectedPoints={player.projected_points}
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

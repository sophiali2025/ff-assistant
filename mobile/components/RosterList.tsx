import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import PlayerRow from './PlayerRow';
import { fetchPlayerNews } from '../lib/api';

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
  // Track which player is selected. null = no one selected.
  // Tapping the same player again deselects them.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [news, setNews] = useState<string | null>(null);

  // When a player is selected, fetch their latest news from the backend.
  useEffect(() => {
    if (selectedId === null) {
      setNews(null);
      return;
    }
    setNews(null); // show "loading..." while fetching
    fetchPlayerNews(selectedId)
      .then(setNews)
      .catch(() => setNews('no news available'));
  }, [selectedId]);

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
        {players.map((player, index) => (
          <PlayerRow
            key={player.player_id}
            slot={player.slot}
            name={player.name}
            status={player.status}
            actualPoints={player.points_this_week}
            projectedPoints={player.projected_points}
            selected={player.player_id === selectedId}
            isFirst={index === 0}
            isLast={index === players.length - 1}
            news={player.player_id === selectedId ? news : undefined}
            onPress={() => setSelectedId(
              player.player_id === selectedId ? null : player.player_id
            )}
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

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type RosterPlayer = {
  player_id: string;
  name: string;
  position: string;
  slot: string;
  status: string;
  points_this_week: number;
  projected_points: number;
};

type Props = {
  player: RosterPlayer;
  matchup?: { team: string; opponent: string; is_home: boolean };
  label: string;
  color: string;
  onRemove: () => void;
};

export default function PlayerCard({ player, matchup, label, color, onRemove }: Props) {
  // Build matchup string like "WR | DEN vs DAL"
  const matchupText = matchup
    ? `${player.position} | ${matchup.team} ${matchup.is_home ? 'vs' : '@'} ${matchup.opponent}`
    : player.position;

  return (
    <View style={styles.playerCard}>
      {/* Remove button in top-right corner */}
      <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
        <View style={styles.removeButtonCircle}>
          <Ionicons name="close" size={9} color="#A1C4F9" />
        </View>
      </TouchableOpacity>
      <Text style={styles.playerLabel}>{label}</Text>
      <Text style={[styles.playerName, { color }]}>{player.name}</Text>
      <Text style={styles.playerMatchup}>{matchupText}</Text>
      <View style={styles.statusRow}>
        <View style={[styles.statusDot, player.status !== 'active' && { backgroundColor: '#E8AA3C' }]} />
        <Text style={[styles.statusText, player.status !== 'active' && { color: '#E8AA3C' }]}>{player.status}</Text>
      </View>
      <Text style={styles.projectionRow}>
        <Text style={[styles.projectionValue, { color }]}>{player.projected_points.toFixed(1)}</Text>
        <Text style={styles.projLabel}> proj</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  playerCard: {
    width: '47%',
    backgroundColor: '#375481',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A1C4F9',
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 12,
    height: 100,
  },
  playerLabel: {
    fontSize: 10,
    color: '#C1C1C1',
  },
  playerName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },
  playerMatchup: {
    fontSize: 10,
    color: '#C1C1C1',
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#39C196',
    marginRight: 5,
  },
  statusText: {
    fontSize: 10,
    color: '#39C196',
  },
  projectionRow: {
    marginTop: 2,
  },
  projectionValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  projLabel: {
    fontSize: 10,
    color: '#C1C1C1',
  },
  removeButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    zIndex: 1,
  },
  removeButtonCircle: {
    width: 15,
    height: 15,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#A1C4F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

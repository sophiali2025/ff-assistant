import { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type Player = {
  player_id: string;
  name: string;
  position: string;
  team: string;
  age: number;
  projected: number;
};

type WaiverStats = {
  overallRank: string;
  positionRank: string;
  trueValue: number;
  snapShare: string;
  rostered: string;
  avgLast3: number;
};

type WaiverResult = {
  verdict: 'add' | "don't add";
  summary: string;
  reasoning: string;
  dropPlayers: Player[];
};

// Mock data for demo
const mockPlayer: Player = {
  player_id: '1234',
  name: 'Malik Davis',
  position: 'RB',
  team: 'DAL',
  age: 27,
  projected: 9.2,
};

const mockStats: WaiverStats = {
  overallRank: '52nd',
  positionRank: '34th',
  trueValue: 102,
  snapShare: '78%',
  rostered: '37%',
  avgLast3: 15.7,
};

const mockResult: WaiverResult = {
  verdict: 'add',
  summary: 'Add him.',
  reasoning: 'Good pickup. You have WR depth and can gain a solid RB2 while adding RB depth.',
  dropPlayers: [
    { player_id: '001', name: 'Kimani Vidal', position: 'RB', team: 'LAC', age: 24, projected: 6.3 },
    { player_id: '002', name: 'Blake Corum', position: 'RB', team: 'LAR', age: 25, projected: 8.4 },
  ],
};

export default function WaiverScreen() {
  const router = useRouter();

  const [searchText, setSearchText] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(mockPlayer);
  const [stats, setStats] = useState<WaiverStats | null>(mockStats);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WaiverResult | null>(mockResult);

  const handleEvaluate = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setSelectedPlayer(mockPlayer);
      setStats(mockStats);
      setResult(mockResult);
      setLoading(false);
    }, 1000);
  };

  const getPositionColor = (position: string) => {
    const colors: { [key: string]: string } = {
      QB: '#6C8EBF',
      RB: '#59C1A0',
      WR: '#E39774',
      TE: '#C77DBA',
    };
    return colors[position] || '#597DB4';
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#A1C4F9" />
        </TouchableOpacity>
        <Text style={styles.title}>Waivers</Text>
        <Text style={styles.weekText}>Wk 9 - synced</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={15} color="#FFFFFF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="search roster or free agents ..."
          placeholderTextColor="#FFFFFF"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Player Card */}
      {selectedPlayer && stats && (
        <View style={styles.playerCard}>
          {/* Player Header */}
          <View style={styles.playerHeader}>
            <View style={[styles.positionBadge, { backgroundColor: getPositionColor(selectedPlayer.position) }]}>
              <Text style={styles.positionText}>{selectedPlayer.position}</Text>
            </View>
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>{selectedPlayer.name}</Text>
              <Text style={styles.playerDetails}>{`${selectedPlayer.team}  | age ${selectedPlayer.age}`}</Text>
            </View>
            <View style={styles.projectedBox}>
              <Text style={styles.projectedValue}>{selectedPlayer.projected}</Text>
              <Text style={styles.projectedLabel}>proj</Text>
            </View>
          </View>

          <View style={styles.solidDivider} />

          {/* Stats Grid */}
          <View style={styles.statsContainer}>
            <View style={styles.statsGrid}>
              <View style={[styles.statItem, { borderTopWidth: 0 }]}>
                <Text style={styles.statValue}>{stats.overallRank}</Text>
                <Text style={styles.statLabel}>overall ranking</Text>
              </View>
              <View style={[styles.statItem, { borderTopWidth: 0 }]}>
                <Text style={styles.statValue}>{stats.positionRank}</Text>
                <Text style={styles.statLabel}>position ranking</Text>
              </View>
              <View style={[styles.statItem, { borderTopWidth: 0 }]}>
                <Text style={styles.statValue}>{stats.trueValue}</Text>
                <Text style={styles.statLabel}>true value</Text>
              </View>
            </View>

            <View style={[styles.statsGrid, { marginTop: -1 }]}>
              <View style={[styles.statItem, { borderBottomWidth: 0, borderBottomLeftRadius: 15 }]}>
                <Text style={styles.statValue}>{stats.snapShare}</Text>
                <Text style={styles.statLabel}>snap share</Text>
              </View>
              <View style={[styles.statItem, { borderBottomWidth: 0 }]}>
                <Text style={styles.statValue}>{stats.rostered}</Text>
                <Text style={styles.statLabel}>rostered</Text>
              </View>
              <View style={[styles.statItem, { borderBottomWidth: 0, borderBottomRightRadius: 15 }]}>
                <Text style={styles.statValue}>{stats.avgLast3}</Text>
                <Text style={styles.statLabel}>avg last 3</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Evaluate Button */}
      <TouchableOpacity
        style={styles.evaluateButton}
        activeOpacity={0.7}
        onPress={handleEvaluate}
      >
        <Text style={styles.evaluateText}>
          {loading ? 'Evaluating ...' : 'Evaluate Player'}
        </Text>
      </TouchableOpacity>

      {/* Suggestion Box */}
      {result && (
        <View style={styles.suggestionBox}>
          <View style={styles.suggestionHeader}>
            <View style={styles.verdictBadge}>
              <Ionicons name="checkmark-circle" size={30} color="#6BE3B5" />
            </View>
            <View style={styles.suggestionTextBox}>
              <Text style={styles.suggestionTitle}>{result.summary}</Text>
              <Text style={styles.suggestionSubtitle}>
                {result.dropPlayers.map(p => p.name.split(' ')[1]).join(', ')}
              </Text>
            </View>
          </View>

          <View style={styles.dividerLine} />

          <Text style={styles.suggestionReasoning}>{result.reasoning}</Text>
        </View>
      )}

      {/* Who to Drop */}
      {result && result.dropPlayers.length > 0 && (
        <View style={styles.dropBox}>
          <Text style={styles.dropTitle}>who to drop</Text>

          {result.dropPlayers.map((player, index) => (
            <View key={index} style={styles.dropPlayerCard}>
              <View style={[styles.positionBadgeSmall, { backgroundColor: getPositionColor(player.position) }]}>
                <Text style={styles.positionTextSmall}>{player.position}</Text>
              </View>
              <View style={styles.dropPlayerInfo}>
                <Text style={styles.dropPlayerName}>{player.name}</Text>
                <Text style={styles.dropPlayerDetails}>{`${player.team}  | age ${player.age}`}</Text>
              </View>
              <View style={styles.dropProjectedBox}>
                <Text style={styles.dropProjectedValue}>{player.projected}</Text>
                <Text style={styles.dropProjectedLabel}>proj</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 40,
    backgroundColor: '#23173E',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  backButton: {
    marginLeft: -20,
    marginRight: -40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  title: {
    fontFamily: 'Jaro',
    fontSize: 28,
    color: '#FFFFFF',
  },
  weekText: {
    fontFamily: 'Inter',
    fontSize: 15,
    color: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#362C58',
    borderWidth: 1,
    borderColor: '#A1C4F9',
    borderRadius: 15,
    height: 34,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#FFFFFF',
    fontFamily: 'Inter',
  },
  playerCard: {
    backgroundColor: '#375481',
    borderWidth: 1,
    borderColor: '#A1C4F9',
    borderRadius: 15,
    padding: 16
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  positionBadge: {
    width: 35,
    height: 35,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  positionText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  playerInfo: {
    flex: 1,
    marginLeft: 10,
  },
  playerName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  playerDetails: {
    fontSize: 10,
    color: '#C1C1C1',
    marginTop: 2,
  },
  projectedBox: {
    alignItems: 'flex-end',
  },
  projectedValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  projectedLabel: {
    fontSize: 11,
    color: '#D4D4D4',
  },
  statsContainer: {
    position: 'relative',
    marginHorizontal: -16,
    marginBottom: -16,
  },
  statsGrid: {
    flexDirection: 'row',
  },
  statItem: {
    flex: 1,
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: '#375481',
    borderWidth: 1,
    borderColor: '#A1C4F9',
    marginLeft: -1,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8572B1',
  },
  statLabel: {
    fontSize: 8,
    color: '#C1C1C1',
    marginTop: 4,
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#A1C4F9',
    opacity: 0.3,
  },
  solidDivider: {
    height: 1,
    backgroundColor: '#A1C4F9',
    marginHorizontal: -16,
  },
  verticalDivider: {
    position: 'absolute',
    top: 8,
    bottom: 8,
    width: 1,
    backgroundColor: '#A1C4F9',
    opacity: 0.3,
    marginTop: 6,
  },
  suggestionBox: {
    backgroundColor: '#67558F',
    borderWidth: 1,
    borderColor: '#A1C4F9',
    borderRadius: 15,
    padding: 16,
    marginBottom: 20,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  verdictBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#2F8F6A',
    borderWidth: 1,
    borderColor: '#6BE3B5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionTextBox: {
    flex: 1,
    marginLeft: 12,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  suggestionSubtitle: {
    fontSize: 12,
    color: '#C1C1C1',
    marginTop: 4,
  },
  suggestionReasoning: {
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 12,
    lineHeight: 18,
  },
  dropBox: {
    backgroundColor: '#362C58',
    borderWidth: 1,
    borderColor: '#A1C4F9',
    borderRadius: 15,
    padding: 16,
    marginBottom: 20,
  },
  dropTitle: {
    fontFamily: 'Jaro',
    fontSize: 12,
    color: '#FFFCFC',
    marginBottom: 12,
  },
  dropPlayerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#152D53',
    borderWidth: 1,
    borderColor: '#A1C4F9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  positionBadgeSmall: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  positionTextSmall: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  dropPlayerInfo: {
    flex: 1,
    marginLeft: 10,
  },
  dropPlayerName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  dropPlayerDetails: {
    fontSize: 10,
    color: '#C1C1C1',
    marginTop: 2,
  },
  dropProjectedBox: {
    alignItems: 'flex-end',
  },
  dropProjectedValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  dropProjectedLabel: {
    fontSize: 8,
    color: '#D4D4D4',
  },
  evaluateButton: {
    backgroundColor: '#67558F',
    borderWidth: 1,
    borderColor: '#A1C4F9',
    borderRadius: 15,
    height: 47,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  evaluateText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

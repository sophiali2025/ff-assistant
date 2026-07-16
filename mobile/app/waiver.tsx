import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { searchPlayers, fetchDisplayStats, evaluateWaiver } from '@/lib/api';

type Player = {
  player_id: string;
  name: string;
  position: string;
  team: string;
  age: number;
  projected: number;
};

type WaiverStats = {
  positionRank: string;
  rosPositionRank: string;
  rostered: string;
  snapShare: string;
  recentAdds: string;
  avgLast3: number;
};

type WaiverResult = {
  verdict: 'Add' | "Don't Add";
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
  positionRank: '52nd',
  rosPositionRank: '34th',
  rostered: '37%',
  snapShare: '78%',
  recentAdds: '1,247',
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
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [stats, setStats] = useState<WaiverStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState<WaiverResult | null>(null);

  // Search for players as the user types
  useEffect(() => {
    if (searchText.length < 2) {
      setSearchResults([]);
      return;
    }

    searchPlayers(searchText)
      .then((data) => setSearchResults(data))
      .catch(() => setSearchResults([]));
  }, [searchText]);

  const handlePlayerSelect = async (playerId: string) => {
    setSearchText('');
    setSearchResults([]);
    setLoading(true);
    setResult(null);

    try {
      const data = await fetchDisplayStats(playerId);

      // Set selected player info
      setSelectedPlayer({
        player_id: data.player_id,
        name: data.name,
        position: data.position,
        team: data.team,
        age: data.age,
        projected: data.projected_points,
      });

      // Set stats from waiver_stats and rankings
      setStats({
        positionRank: data.overall_ranking ? `${Math.round(data.overall_ranking)}` : 'N/A',
        rosPositionRank: data.ros_ranking ? `${data.ros_ranking}` : 'N/A',
        rostered: data.waiver_stats?.player_owned_avg ? `${data.waiver_stats.player_owned_avg}%` : 'N/A',
        snapShare: data.waiver_stats?.snap_share ? `${data.waiver_stats.snap_share}%` : 'N/A',
        recentAdds: data.waiver_stats?.recent_adds ? `${data.waiver_stats.recent_adds}` : 'N/A',
        avgLast3: data.waiver_stats?.last_3_avg || 0,
      });
    } catch (error) {
      console.error('Failed to fetch player stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async () => {
    if (!selectedPlayer) return;

    setEvaluating(true);
    setResult(null);

    try {
      const data = await evaluateWaiver(selectedPlayer.player_id);

      // Map the backend response to frontend format
      setResult({
        verdict: data.verdict,
        summary: data.summary,
        reasoning: data.summary, // Using summary as reasoning
        dropPlayers: data.drop_players.map((p: any) => ({
          player_id: p.player_id,
          name: p.name,
          position: p.info?.position || '??',
          team: p.info?.team || '??',
          age: p.info?.age || 0,
          projected: p.projected_points || 0,
        })),
      });
    } catch (error) {
      console.error('Failed to evaluate waiver:', error);
      // Could show an error message to the user here
    } finally {
      setEvaluating(false);
    }
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
          onBlur={() => {
            // Delay clearing results so tap events can fire
            setTimeout(() => setSearchResults([]), 150);
          }}
        />
      </View>

      {/* Search Results Dropdown */}
      {searchResults.length > 0 && (
        <ScrollView style={styles.searchDropdown} keyboardShouldPersistTaps="handled">
          {searchResults.slice(0, 4).map((player, index) => (
            <TouchableOpacity
              key={player.player_id}
              style={[
                styles.searchResultRow,
                index === Math.min(searchResults.length, 4) - 1 && { borderBottomWidth: 0 }
              ]}
              onPress={() => handlePlayerSelect(player.player_id)}
            >
              <Text style={styles.searchResultName}>{player.name}</Text>
              <Text style={styles.searchResultPosition}>{player.position}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Empty State - Dashed Placeholder */}
      {!selectedPlayer && !loading && (
        <View style={styles.emptyCard} />
      )}

      {/* Player Card */}
      {loading && (
        <View style={styles.loadingCard}>
          <Text style={styles.loadingText}>Loading player stats...</Text>
        </View>
      )}
      {!loading && selectedPlayer && stats && (
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
              <Text style={styles.projectedValue}>{selectedPlayer.projected.toFixed(1)}</Text>
              <Text style={styles.projectedLabel}>proj</Text>
            </View>
          </View>

          <View style={styles.solidDivider} />

          {/* Stats Grid */}
          <View style={styles.statsContainer}>
            <View style={styles.statsGrid}>
              <View style={[styles.statItem, { borderTopWidth: 0 }]}>
                <Text style={styles.statValue}>{stats.positionRank}</Text>
                <Text style={styles.statLabel}>position rank</Text>
              </View>
              <View style={[styles.statItem, { borderTopWidth: 0 }]}>
                <Text style={styles.statValue}>{stats.rosPositionRank}</Text>
                <Text style={styles.statLabel}>ros position rank</Text>
              </View>
              <View style={[styles.statItem, { borderTopWidth: 0 }]}>
                <Text style={styles.statValue}>{stats.rostered}</Text>
                <Text style={styles.statLabel}>rostered</Text>
              </View>
            </View>

            <View style={[styles.statsGrid, { marginTop: -1 }]}>
              <View style={[styles.statItem, { borderBottomWidth: 0, borderBottomLeftRadius: 15 }]}>
                <Text style={styles.statValue}>{stats.snapShare}</Text>
                <Text style={styles.statLabel}>snap share</Text>
              </View>
              <View style={[styles.statItem, { borderBottomWidth: 0 }]}>
                <Text style={styles.statValue}>{stats.recentAdds}</Text>
                <Text style={styles.statLabel}>recent adds</Text>
              </View>
              <View style={[styles.statItem, { borderBottomWidth: 0, borderBottomRightRadius: 15 }]}>
                <Text style={styles.statValue}>{stats.avgLast3}</Text>
                <Text style={styles.statLabel}>avg last 3</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Analyze Button */}
      <TouchableOpacity
        style={[styles.evaluateButton, !selectedPlayer && styles.evaluateButtonDisabled]}
        activeOpacity={0.7}
        onPress={handleEvaluate}
        disabled={!selectedPlayer || evaluating}
      >
        <Text style={[styles.evaluateText, !selectedPlayer && styles.evaluateTextDisabled]}>
          {evaluating ? 'Analyzing player ...' : 'Analyze Player'}
        </Text>
      </TouchableOpacity>

      {/* Suggestion Box */}
      {result && (
        <View style={styles.suggestionBox}>
          <View style={styles.suggestionHeader}>
            <View style={[
              styles.verdictBadge,
              result.verdict === "Don't Add" && styles.verdictBadgeDecline
            ]}>
              <Ionicons
                name={result.verdict === "Add" ? "checkmark-circle" : "close-circle-outline"}
                size={32}
                color={result.verdict === "Add" ? "#6BE3B5" : "#E36B6B"}
              />
            </View>
            <View style={styles.suggestionTextBox}>
              <Text style={styles.suggestionTitle}>{result.verdict}</Text>
              <Text style={styles.suggestionSubtitle}>
                {result.verdict === "Add"
                  ? `${selectedPlayer && selectedPlayer.name.split(' ')[1]} > ${result.dropPlayers.map(p => p.name.split(' ')[1]).join(', ')}`
                  : `${selectedPlayer && selectedPlayer.name.split(' ')[1]} < Roster`
                }
              </Text>
            </View>
          </View>

          <View style={styles.dividerLine} />

          <Text style={styles.suggestionReasoning}>
            {result.reasoning}
          </Text>
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
                <Text style={styles.dropProjectedValue}>{player.projected.toFixed(1)}</Text>
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
    marginBottom: 2,
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
  searchDropdown: {
    backgroundColor: '#362C58',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A1C4F9',
    marginTop: 4,
    marginBottom: 10,
    maxHeight: 176,
  },
  searchResultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(161, 196, 249, 0.15)',
  },
  searchResultName: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  searchResultPosition: {
    fontSize: 12,
    color: '#A1C4F9',
  },
  emptyCard: {
    backgroundColor: '#1B2F4F',
    borderWidth: 1,
    borderColor: '#A1C4F9',
    borderStyle: 'dashed',
    borderRadius: 15,
    height: 166,
    marginTop: 9,
  },
  loadingCard: {
    backgroundColor: '#1B2F4F',
    borderWidth: 1,
    borderColor: '#A1C4F9',
    borderStyle: 'dashed',
    borderRadius: 15,
    height: 166,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 9,
  },
  loadingText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontFamily: 'Inter',
  },
  playerCard: {
    backgroundColor: '#375481',
    borderWidth: 1,
    borderColor: '#A1C4F9',
    borderRadius: 15,
    padding: 16,
    marginTop: 9,
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
  verdictBadgeDecline: {
    backgroundColor: '#8F2F2F',
    borderColor: '#E36B6B',
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
  evaluateButtonDisabled: {
    opacity: 0.49,
  },
  evaluateText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  evaluateTextDisabled: {
    opacity: 0.7,
  },
});

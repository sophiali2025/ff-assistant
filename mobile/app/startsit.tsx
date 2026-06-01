import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const PLAYERS = [
  {
    label: 'player 1',
    name: 'Courtland Sutton',
    position: 'WR',
    matchup: 'DEN vs DAL',
    status: 'active',
    projection: 16.2,
    color: '#9F98EE',
  },
  {
    label: 'player 2',
    name: 'Derrick Henry',
    position: 'RB',
    matchup: 'BAL vs CIN',
    status: 'active',
    projection: 14.6,
    color: '#7BB0FF',
  },
  {
    label: 'player 3',
    name: 'Rashee Rice',
    position: 'WR',
    matchup: 'KAN vs NE',
    status: 'active',
    projection: 15.8,
    color: '#8AEDCE',
  },
];

const STAT_ROWS = [
  { label: 'projected', values: ['16.2', '14.6', '15.8'] },
  { label: 'def rank', values: ['28th', '14th', '18th'] },
  { label: 'game total', values: ['47.5', '42.0', '44.5'] },
  { label: 'weather', values: ['clear', 'wind', 'rain'] },
  { label: 'spread', values: ['-3.5', '+4.5', '-6.0'] },
];

export default function StartSitScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#A1C4F9" />
          </TouchableOpacity>
          <Text style={styles.title}>Start/Sit</Text>
        </View>
        <Text style={styles.weekText}>Wk 9 - synced</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Search bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={15} color="#A1C4F9" />
          <TextInput
            style={styles.searchInput}
            placeholder="search roster or free agents ..."
            placeholderTextColor="#FFFFFF"
            editable={false}
          />
        </View>

        {/* Player cards */}
        <View style={styles.cardsGrid}>
          <PlayerCard player={PLAYERS[0]} />
          <PlayerCard player={PLAYERS[1]} />
          <PlayerCard player={PLAYERS[2]} />
          <AddPlayerCard />
        </View>

        {/* Stats box */}
        <View style={styles.statsBox}>
          {STAT_ROWS.map((row, i) => (
            <View key={row.label}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>{row.label}</Text>
                {row.values.map((val, j) => (
                  <View key={j} style={[styles.statPill, { backgroundColor: PLAYERS[j].color }]}>
                    <Text style={styles.statPillText}>{val}</Text>
                  </View>
                ))}
              </View>
              {i < STAT_ROWS.length - 1 && <View style={styles.statDivider} />}
            </View>
          ))}
        </View>

        {/* Suggestion box */}
        <View style={styles.suggestionBox}>
          {/* Top half */}
          <View style={styles.suggestionTop}>
            <View style={styles.trophyIcon}>
              <Ionicons name="trophy" size={24} color="#A1C4F9" />
            </View>
            <View style={styles.suggestionTopText}>
              <Text style={styles.suggestionTitle}>Start Courtland Sutton</Text>
              <Text style={styles.suggestionSubtitle}>{'Sutton > Rice > Henry'}</Text>
            </View>
          </View>
          <View style={styles.suggestionDivider} />
          {/* Bottom half */}
          <Text style={styles.suggestionBody}>
            Start Courtland Sutton. Worst def matchup + highest total + clear weather.
            Rice edges Henry at #2 - better matchup and no wind concerns despite lower
            projection. Henry has the positive game script but the weather hurts his
            passing game upside.
          </Text>
        </View>

        {/* Follow-up button */}
        <TouchableOpacity style={styles.followUpButton} activeOpacity={0.7}>
          <Ionicons name="sparkles-outline" size={20} color="#A1C4F9" />
          <Text style={styles.followUpText}>ask a follow-up ...</Text>
          <Ionicons name="arrow-forward" size={20} color="#A1C4F9" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function PlayerCard({ player }: { player: typeof PLAYERS[0] }) {
  return (
    <View style={styles.playerCard}>
      <Text style={styles.playerLabel}>{player.label}</Text>
      <Text style={[styles.playerName, { color: player.color }]}>{player.name}</Text>
      <Text style={styles.playerMatchup}>{player.position} | {player.matchup}</Text>
      <View style={styles.statusRow}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>{player.status}</Text>
      </View>
      <Text style={styles.projectionRow}>
        <Text style={[styles.projectionValue, { color: player.color }]}>{player.projection}</Text>
        <Text style={styles.projLabel}> proj</Text>
      </Text>
    </View>
  );
}

function AddPlayerCard() {
  return (
    <TouchableOpacity style={styles.addCard} activeOpacity={0.7}>
      <Ionicons name="add-circle-outline" size={24} color="#A1C4F9" />
      <Text style={styles.addCardText}>add player</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#23173E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  title: {
    fontFamily: 'Jaro',
    fontSize: 28,
    color: '#FFFFFF',
  },
  weekText: {
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  scroll: {
    flex: 1,
  },

  // Search bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#362C58',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#A1C4F9',
    height: 34,
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    marginLeft: 10,
  },

  // Player cards
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 16,
    marginTop: 14,
    gap: 14,
  },
  playerCard: {
    width: '47%',
    backgroundColor: '#375481',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A1C4F9',
    padding: 12,
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

  // Add player card
  addCard: {
    width: '47%',
    backgroundColor: '#152D53',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A1C4F9',
    borderStyle: 'dashed',
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCardText: {
    fontSize: 12,
    color: 'rgba(161, 196, 249, 0.98)',
    marginTop: 4,
  },

  // Stats box
  statsBox: {
    backgroundColor: '#362C58',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#A1C4F9',
    marginHorizontal: 16,
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  statLabel: {
    fontSize: 13,
    color: '#FFFFFF',
    width: 80,
  },
  statPill: {
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 6,
    minWidth: 36,
    alignItems: 'center',
  },
  statPillText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#375481',
  },
  statDivider: {
    height: 1,
    backgroundColor: 'rgba(161, 196, 249, 0.3)',
  },

  // Suggestion box
  suggestionBox: {
    backgroundColor: '#67558F',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#A1C4F9',
    marginHorizontal: 16,
    marginTop: 14,
    overflow: 'hidden',
  },
  suggestionTop: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  trophyIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#597DB4',
    borderWidth: 1,
    borderColor: '#A1C4F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionTopText: {
    marginLeft: 10,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  suggestionSubtitle: {
    fontSize: 12,
    color: '#C1C1C1',
    marginTop: 2,
  },
  suggestionDivider: {
    height: 1,
    backgroundColor: 'rgba(161, 196, 249, 0.3)',
  },
  suggestionBody: {
    fontSize: 12,
    color: '#FFFFFF',
    padding: 12,
    lineHeight: 18,
  },

  // Follow-up button
  followUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#375481',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#A1C4F9',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 30,
  },
  followUpText: {
    flex: 1,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
});

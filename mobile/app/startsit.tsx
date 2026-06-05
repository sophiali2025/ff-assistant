import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { fetchRoster, fetchMatchupContext, comparePlayersClaude } from '@/lib/api';
import PlayerCard from '@/components/PlayerCard';
import StatsBox from '@/components/StatsBox';

// Each player in the comparison gets a unique color.
const PLAYER_COLORS = ['#9F98EE', '#7BB0FF', '#8AEDCE', '#ECB781'];

// Type describing what fetchRoster returns for each player.
type RosterPlayer = {
  player_id: string;
  name: string;
  position: string;
  slot: string;
  status: string;
  points_this_week: number;
  projected_points: number;
};

export default function StartSitScreen() {
  const router = useRouter();

  // --- STATE ---
  const [roster, setRoster] = useState<RosterPlayer[]>([]);                   // roster loaded once on mount
  const [searchQuery, setSearchQuery] = useState('');                         // searchQuery: what the user is typing in the search bar
  const [selectedPlayers, setSelectedPlayers] = useState<RosterPlayer[]>([]); // selectedPlayers: players the user has added to compare
  const [matchups, setMatchups] = useState<Record<string, { team: string; opponent: string; is_home: boolean }>>({}); // matchups: keyed by player_id
  const [loading, setLoading] = useState(false);  // true while waiting for Claude's response
  const [activeDot, setActiveDot] = useState(0); // which suggestion card is visible
  const suggestionScrollRef = useRef<ScrollView>(null);
  const [advice, setAdvice] = useState<{
    players: { player: string; projection: number; ranking: string; def_rank: string; verdict: string; reasoning: string }[];
    rankings: string;
    starting_player: string;
    summary: string;
  } | null>(null);

  // --- EFFECT ---
  // Runs once when the screen loads. Fetches your full roster from
  // the backend and stores it in state.
  useEffect(() => {
    fetchRoster().then(setRoster).catch(() => {});
  }, []);

  // --- DERIVED DATA ---
  // Not state — just computed from state on every render.
  // Filters the roster to match the search text, excluding anyone
  // already selected.
  const selectedIds = new Set(selectedPlayers.map(p => p.player_id));
  const filteredRoster = searchQuery.length > 0
    ? roster.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
        && !selectedIds.has(p.player_id)
      )
    : [];

  // --- HANDLERS ---
  // Called when the user taps a search result.
  const addPlayer = (player: RosterPlayer) => {
    // setSelectedPlayers creates a NEW array with the player added.
    // React compares old vs new array reference → different → re-render.
    setSelectedPlayers([...selectedPlayers, player]);
    setSearchQuery('');   // clear the search bar

    // Fetch matchup context (team, opponent) for this player.
    fetchMatchupContext(player.player_id)
      .then(data => {
        if (!data.error) {
          setMatchups(prev => ({ ...prev, [player.player_id]: data }));
        }
      })
      .catch(() => {});
  };

  // Called when the user taps the X on a player card.
  const removePlayer = (playerId: string) => {
    // .filter returns a new array without the removed player.
    setSelectedPlayers(selectedPlayers.filter(p => p.player_id !== playerId));
    // Clean up the matchup data for this player.
    setMatchups(prev => {
      const next = { ...prev };
      delete next[playerId];
      return next;
    });
  };

  // Called when the user taps "View Advice".
  // logs the response for now.
  const handleViewAdvice = () => {
    if (selectedPlayers.length < 2) return;  // need at least 2 players to compare
    setLoading(true);

    // .map() extracts just the player_id from each selected player object.
    // comparePlayersClaude will join them with ":" for the backend.
    const playerIds = selectedPlayers.map(p => p.player_id);

    comparePlayersClaude(playerIds)
      .then(result => {
        setAdvice(result);
        setActiveDot(0);
        suggestionScrollRef.current?.scrollTo({ x: 0, animated: false });
      })
      .catch(err => {
        console.error('Compare failed:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

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

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Search bar — TextInput is a controlled component.
            "Controlled" means React owns the value: the `value` prop
            always reflects `searchQuery`, and `onChangeText` updates
            it. This keeps the UI and state in sync. */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={15} color="#A1C4F9" />
          <TextInput
            style={styles.searchInput}
            placeholder="search roster ..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Search results dropdown — only renders when there are matches.
            This is "conditional rendering": {condition && <Component />}
            If condition is false, React renders nothing. */}
        {filteredRoster.length > 0 && (
          <View style={styles.searchResults}>
            {filteredRoster.slice(0, 6).map(player => (
              <TouchableOpacity
                key={player.player_id}
                style={styles.searchResultItem}
                onPress={() => addPlayer(player)}
              >
                <Text style={styles.searchResultName}>{player.name}</Text>
                <Text style={styles.searchResultSlot}>{player.position}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Player cards — .map() turns the selectedPlayers array into
            JSX elements. React needs a unique `key` on each so it can
            efficiently update the list when items are added/removed. */}
        {/* Player cards — always show 4 slots. Filled slots show the
            player info, empty slots show a dashed outline. */}
        <View style={styles.cardsGrid}>
          {[0, 1, 2, 3].map(i => {
            const player = selectedPlayers[i];
            if (player) {
              return (
                <PlayerCard
                  key={player.player_id}
                  player={player}
                  matchup={matchups[player.player_id]}
                  label={`player ${i + 1}`}
                  color={PLAYER_COLORS[i]}
                  onRemove={() => removePlayer(player.player_id)}
                />
              );
            }
            return <View key={`empty-${i}`} style={styles.emptyCard} />;
          })}
        </View>

        {/* View Advice button */}
        <TouchableOpacity
          style={[styles.viewAdviceButton, selectedPlayers.length < 2 && { opacity: 0.4 }]}
          activeOpacity={0.7}
          onPress={handleViewAdvice}
          disabled={selectedPlayers.length < 2 || loading}
        >
          <Text style={styles.viewAdviceText}>
            {loading ? 'Asking Claude ...' : 'View Advice'}
          </Text>
        </TouchableOpacity>

        {/* Stats box — only appears after Claude responds */}
        {advice && <StatsBox players={advice.players} />}

        {/* Suggestion box — swipe inside the box to see each player */}
        {advice && (() => {
          // Content width is the box's inner width (screen - margins - border/padding)
          const CONTENT_WIDTH = Dimensions.get('window').width - 32 - 2;
          return (
            <>
              <View style={styles.suggestionBox}>
                <ScrollView
                  ref={suggestionScrollRef}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={CONTENT_WIDTH}
                  decelerationRate="fast"
                  onScroll={(e) => {
                    const page = Math.round(e.nativeEvent.contentOffset.x / CONTENT_WIDTH);
                    setActiveDot(page);
                  }}
                  scrollEventThrottle={16}
                >
                  {advice.players.map((player, i) => (
                    <View key={i} style={{ width: CONTENT_WIDTH }}>
                      {/* Top half */}
                      <View style={styles.suggestionTop}>
                        <View style={styles.trophyIcon}>
                          <Ionicons
                            name={player.verdict === 'start' ? 'trophy' : player.verdict === 'sit' ? 'thumbs-down' : 'remove-circle-outline'}
                            size={24}
                            color="#A1C4F9"
                          />
                        </View>
                        <View style={styles.suggestionTopText}>
                          <Text style={styles.suggestionTitle}>
                            {player.verdict === 'start' ? 'Start' : player.verdict === 'sit' ? 'Sit' : 'Maybe'} {player.player}
                          </Text>
                          <Text style={styles.suggestionSubtitle}>
                            {advice.rankings.split(' > ').map((name, idx) => (
                              <Text key={idx}>
                                {idx > 0 && ' > '}
                                <Text style={idx === activeDot ? { fontWeight: 'bold', color: '#FFFFFF' } : undefined}>
                                  {name}
                                </Text>
                              </Text>
                            ))}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.suggestionDivider} />
                      {/* Bottom half */}
                      <Text style={styles.suggestionBody}>{player.reasoning}</Text>
                    </View>
                  ))}
                </ScrollView>
                {/* Page dots */}
                <View style={styles.dotsRow}>
                  {advice.players.map((_, i) => (
                    <View key={i} style={[styles.dot, i === activeDot && styles.dotActive]} />
                  ))}
                </View>
              </View>

              {/* Follow-up button - bonus feature*/}
              {/* <TouchableOpacity style={styles.followUpButton} activeOpacity={0.7}>
                <Ionicons name="sparkles-outline" size={20} color="#A1C4F9" />
                <Text style={styles.followUpText}>ask a follow-up ...</Text>
                <Ionicons name="arrow-forward" size={20} color="#A1C4F9" />
              </TouchableOpacity> */}
            </>
          );
        })()}
      </ScrollView>
    </View>
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

  // Search results
  searchResults: {
    backgroundColor: '#362C58',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A1C4F9',
    marginHorizontal: 16,
    marginTop: 4,
  },
  searchResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(161, 196, 249, 0.15)',
  },
  searchResultName: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  searchResultSlot: {
    color: '#A1C4F9',
    fontSize: 12,
  },

  // Player cards
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 16,
    marginTop: 14,
    gap: 14,
  },
  // Empty player card
  emptyCard: {
    width: '47%',
    backgroundColor: '#1B2F4F',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A1C4F9',
    borderStyle: 'dashed',
    height: 100,
  },

  // View Advice button
  viewAdviceButton: {
    backgroundColor: '#67558F',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#A1C4F9',
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  viewAdviceText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(161, 196, 249, 0.3)',
  },
  dotActive: {
    backgroundColor: '#A1C4F9',
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

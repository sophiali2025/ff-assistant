import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { getUserLeagues, getUserRoster } from '@/lib/api';
import { supabase } from '@/lib/supabase';

interface League {
  league_id: string;
  name: string;
  total_rosters: number;
  roster_positions: string[];
  scoring_settings?: {
    rec?: number;
  };
}

export default function PickLeagueScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const username = params.username as string;
  const sleeperUserId = params.sleeperUserId as string;

  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch user's leagues on mount
  useEffect(() => {
    async function fetchLeagues() {
      try {
        const leaguesData = await getUserLeagues(sleeperUserId);

        if (!leaguesData || leaguesData.length === 0) {
          Alert.alert(
            'No Leagues Found',
            'You don\'t have any leagues for 2025 season. Join a league on Sleeper first!',
            [{ text: 'OK', onPress: () => router.back() }]
          );
          return;
        }

        setLeagues(leaguesData);
      } catch (error) {
        console.error('Error fetching leagues:', error);
        Alert.alert(
          'Error',
          'Failed to load your leagues. Please try again.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } finally {
        setLoading(false);
      }
    }

    fetchLeagues();
  }, [sleeperUserId]);

  const handleContinue = async () => {
    if (!selectedLeagueId) {
      Alert.alert('No League Selected', 'Please select a league to continue');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setSubmitting(true);

    try {
      // Find the selected league
      const selectedLeague = leagues.find(l => l.league_id === selectedLeagueId);
      if (!selectedLeague) {
        throw new Error('Selected league not found');
      }

      // 1. Get roster to get roster_id
      const rosterData = await getUserRoster(selectedLeagueId, sleeperUserId);
      const rosterId = rosterData.roster_id;

      // 2. Insert into users table
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          sleeper_username: username,
          sleeper_user_id: sleeperUserId,
        });

      if (userError) {
        console.error('Error inserting user:', userError);
        throw new Error('Failed to save user data');
      }

      // 3. Insert into leagues table
      const rosterSlots = selectedLeague.roster_positions;

      const { error: leagueError } = await supabase
        .from('leagues')
        .insert({
          user_id: user.id,
          league_id: selectedLeagueId,
          league_name: selectedLeague.name,
          season: 2025,
          num_teams: selectedLeague.total_rosters,
          scoring_format: selectedLeague.scoring_settings?.rec?.toString() || 'ppr',
          num_qbs: rosterSlots.filter(slot => slot === 'QB').length,
          num_wrs: rosterSlots.filter(slot => slot === 'WR').length,
          num_rbs: rosterSlots.filter(slot => slot === 'RB').length,
          num_tes: rosterSlots.filter(slot => slot === 'TE').length,
          num_flex: rosterSlots.filter(slot => slot === 'FLEX').length,
          num_bench: rosterSlots.filter(slot => slot === 'BN').length,
          sleeper_roster_id: rosterId,
          is_active: true,
        });

      if (leagueError) {
        console.error('Error inserting league:', leagueError);
        throw new Error('Failed to save league data');
      }

      // 4. Navigate to roster screen
      router.replace('/(tabs)/roster');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert(
        'Error',
        'Failed to complete setup. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#A1C4F9" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Text style={styles.header}>pick your league</Text>

        {/* League list */}
        <View style={styles.leagueList}>
          {leagues.map((league) => (
            <TouchableOpacity
              key={league.league_id}
              style={[
                styles.leagueItem,
                selectedLeagueId === league.league_id && styles.leagueItemSelected,
              ]}
              onPress={() => setSelectedLeagueId(league.league_id)}
              activeOpacity={0.7}
            >
              <View style={styles.radioButton}>
                {selectedLeagueId === league.league_id && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
              <View style={styles.leagueInfo}>
                <Text style={styles.leagueName}>{league.name}</Text>
                <Text style={styles.leagueTeams}>{league.total_rosters} teams</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Continue button */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!selectedLeagueId || submitting) && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedLeagueId || submitting}
          activeOpacity={0.7}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.continueText}>Continue</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#23173E',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 32,
  },
  leagueList: {
    marginBottom: 32,
  },
  leagueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#362C58',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#A1C4F9',
    padding: 16,
    marginBottom: 12,
  },
  leagueItemSelected: {
    backgroundColor: '#152D53',
    borderColor: '#597DB4',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#A1C4F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#A1C4F9',
  },
  leagueInfo: {
    flex: 1,
  },
  leagueName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  leagueTeams: {
    fontSize: 14,
    color: '#9F98EE',
  },
  continueButton: {
    backgroundColor: '#597DB4',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#A1C4F9',
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

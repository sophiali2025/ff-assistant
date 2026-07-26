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
  const username = params.username as string | undefined;
  const sleeperUserId = params.sleeperUserId as string | undefined;

  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userSleeperData, setUserSleeperData] = useState<{ username: string; sleeperUserId: string } | null>(null);

  // Fetch user's leagues on mount
  useEffect(() => {
    async function fetchLeagues() {
      if (!user) return;

      try {
        let actualSleeperUserId: string;
        let actualUsername: string;

        // Check if we have params (onboarding flow) or need to get from database (switch league flow)
        if (sleeperUserId && username) {
          // Onboarding flow - use params
          actualSleeperUserId = sleeperUserId;
          actualUsername = username;
        } else {
          // Switch league flow - get from database
          const { data: userData, error } = await supabase
            .from('users')
            .select('sleeper_username, sleeper_user_id')
            .eq('id', user.id)
            .single();

          if (error || !userData) {
            Alert.alert('Error', 'Could not load your user data');
            router.back();
            return;
          }

          actualSleeperUserId = userData.sleeper_user_id;
          actualUsername = userData.sleeper_username;
        }

        setUserSleeperData({ username: actualUsername, sleeperUserId: actualSleeperUserId });

        const leaguesData = await getUserLeagues(actualSleeperUserId);

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
  }, [user, sleeperUserId, username]);

  const handleContinue = async () => {
    if (!selectedLeagueId) {
      Alert.alert('No League Selected', 'Please select a league to continue');
      return;
    }

    if (!user || !userSleeperData) {
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
      const rosterData = await getUserRoster(selectedLeagueId, userSleeperData.sleeperUserId);
      const rosterId = rosterData.roster_id;

      const rosterSlots = selectedLeague.roster_positions;

      // Check if we're in onboarding mode (params exist) or switch league mode
      const isOnboarding = !!username && !!sleeperUserId;

      if (isOnboarding) {
        // Onboarding flow - insert new user and league
        // 2. Insert into users table
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            sleeper_username: userSleeperData.username,
            sleeper_user_id: userSleeperData.sleeperUserId,
          });

        if (userError) {
          console.error('Error inserting user:', userError);
          throw new Error('Failed to save user data');
        }

        // 3. Insert into leagues table
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

        router.replace('/(tabs)/roster');
      } else {
        // Switch league flow - update existing leagues
        // First, check if this league already exists in database
        const { data: existingLeague } = await supabase
          .from('leagues')
          .select('id')
          .eq('user_id', user.id)
          .eq('league_id', selectedLeagueId)
          .single();

        if (existingLeague) {
          // League exists - just activate it and deactivate others
          await supabase
            .from('leagues')
            .update({ is_active: false })
            .eq('user_id', user.id);

          await supabase
            .from('leagues')
            .update({ is_active: true })
            .eq('user_id', user.id)
            .eq('league_id', selectedLeagueId);
        } else {
          // League doesn't exist - insert it and deactivate others
          await supabase
            .from('leagues')
            .update({ is_active: false })
            .eq('user_id', user.id);

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
        }

        router.back();
      }
    } catch (error) {
      console.error('Error completing action:', error);
      Alert.alert(
        'Error',
        'Failed to complete. Please try again.'
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

  const getScoringFormat = (league: League) => {
    const rec = league.scoring_settings?.rec;
    if (rec === 1) return 'FULL PPR';
    if (rec === 0.5) return '0.5 PPR';
    if (rec === 0) return 'STD';
    return 'PPR';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>pick your league</Text>

      {/* League list */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.leagueList}>
          {leagues.map((league) => (
            <TouchableOpacity
              key={league.league_id}
              style={styles.leagueItem}
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
                <Text style={styles.leagueSubtitle}>
                  {league.total_rosters} teams · {getScoringFormat(league)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Continue button - below leagues */}
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
  header: {
    fontFamily: 'Jaro',
    fontSize: 30,
    color: '#FFFFFF',
    textAlign: 'center',
    paddingTop: 85,
    marginBottom: 40,
    letterSpacing: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  leagueList: {
    gap: 10,
  },
  leagueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#375481',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#A1C4F9',
    height: 62,
    paddingHorizontal: 24,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#A1C4F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
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
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  leagueSubtitle: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#BCBCBC',
  },
  continueButton: {
    backgroundColor: '#362C58',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#A1C4F9',
    height: 47,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueText: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

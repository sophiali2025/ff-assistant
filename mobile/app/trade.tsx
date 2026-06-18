import { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import TradeSidePanel from '@/components/TradeSidePanel';
import TradeResultCard from '@/components/TradeResultCard';
import TradeStatsCard from '@/components/TradeStatsCard';
import { evaluateTrade } from '@/lib/api';

type Player = {
  player_id: string;
  position: string;
  name: string;
  details: string;
  value: number;
  normalized_value: number;
};

type TradeResult = {
  verdict: 'accept' | 'decline' | 'counter';
  summary: string;
};

export default function TradeScreen() {
  const router = useRouter();

  const [givePlayers, setGivePlayers] = useState<Player[]>([]);
  const [getPlayers, setGetPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TradeResult | null>(null);

  const handleEvaluate = async () => {
    if (givePlayers.length === 0 || getPlayers.length === 0) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await evaluateTrade(
        givePlayers.map((p) => p.player_id),
        getPlayers.map((p) => p.player_id),
      );
      setResult({ verdict: data.verdict, summary: data.summary });
    } catch {
      setResult({ verdict: 'decline', summary: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Calculate the difference in both raw and normalized value between get and give sides.
  const giveTrueTotal = givePlayers.reduce((sum, p) => sum + p.value, 0);
  const getTrueTotal = getPlayers.reduce((sum, p) => sum + p.value, 0);
  const trueDiff = getTrueTotal - giveTrueTotal;

  const giveNormTotal = givePlayers.reduce((sum, p) => sum + p.normalized_value, 0);
  const getNormTotal = getPlayers.reduce((sum, p) => sum + p.normalized_value, 0);
  const normDiff = getNormTotal - giveNormTotal;

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#A1C4F9" />
        </TouchableOpacity>
        <Text style={styles.title}>Trade Analyzer</Text>
        <Text style={styles.weekText}>Wk 9 - synced</Text>
      </View>

      <TradeSidePanel
        label="you give"
        accentColor="#EF6F66"
        players={givePlayers}
        onAddPlayer={(player) => setGivePlayers([...givePlayers, player])}
        onRemovePlayer={(index) => setGivePlayers(givePlayers.filter((_, i) => i !== index))}
      />

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>for</Text>
        <View style={styles.dividerLine} />
      </View>

      <TradeSidePanel
        label="you get"
        accentColor="#54CA9D"
        players={getPlayers}
        onAddPlayer={(player) => setGetPlayers([...getPlayers, player])}
        onRemovePlayer={(index) => setGetPlayers(getPlayers.filter((_, i) => i !== index))}
      />

      <TouchableOpacity
        style={[styles.evaluateButton, (givePlayers.length === 0 || getPlayers.length === 0) && { opacity: 0.4 }]}
        activeOpacity={0.7}
        onPress={handleEvaluate}
        disabled={givePlayers.length === 0 || getPlayers.length === 0}
      >
        <Text style={styles.evaluateText}>
          {loading ? 'Evaluating ...' : 'Evaluate Trade'}
        </Text>
      </TouchableOpacity>

      {result && (
        <TradeStatsCard
          giveNormalized={giveNormTotal}
          getNormalized={getNormTotal}
          giveTrueValue={giveTrueTotal}
          getTrueValue={getTrueTotal}
        />
      )}

      {result && (
        <TradeResultCard
          verdict={result.verdict}
          subtitle={`${trueDiff >= 0 ? '+' : ''}${trueDiff} true value, ${normDiff >= 0 ? '+' : ''}${normDiff} normalized value`}
          summary={result.summary}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 40,          // Space at the bottom so content doesn't hug the edge
    backgroundColor: '#23173E', // Dark purple background (matches Figma)
    paddingTop: 60,             // Push content below the status bar
    paddingHorizontal: 20,      // Side padding to match the Figma layout
  },
  backButton: {
    marginLeft: -20,            // Push the chevron further left, past the container padding
    marginRight: -40
  },
  header: {
    flexDirection: 'row',       // Lay children out horizontally (left to right)
    justifyContent: 'space-between', // Push title left, week text right
    alignItems: 'baseline',     // Align text baselines so different font sizes sit on the same line
    marginBottom: 20,
  },
  title: {
    fontFamily: 'Jaro',        // Custom font loaded in app/_layout.tsx
    fontSize: 28,
    color: '#FFFFFF',
  },
  weekText: {
    fontFamily: 'Inter',
    fontSize: 15,
    color: '#FFFFFF',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  dividerLine: {
    flex: 1,                    // Each line stretches to fill remaining space
    height: 1,
    backgroundColor: '#A1C4F9',
  },
  dividerText: {
    fontFamily: 'Jaro',
    fontSize: 12,
    color: '#A1C4F9',
    marginHorizontal: 12,
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
  },
  evaluateText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

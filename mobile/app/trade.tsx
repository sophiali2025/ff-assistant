import { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import TradeSidePanel from '@/components/TradeSidePanel';

type Player = {
  position: string;
  name: string;
  details: string;
  value: number;
};

export default function TradeScreen() {
  const router = useRouter();

  // useState arrays instead of hardcoded — these grow when the user
  // selects a player from the search dropdown.
  const [givePlayers, setGivePlayers] = useState<Player[]>([]);
  const [getPlayers, setGetPlayers] = useState<Player[]>([]);

  return (
    <View style={styles.container}>
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

      <TouchableOpacity style={styles.evaluateButton} activeOpacity={0.7}>
        <Text style={styles.evaluateText}>Evaluate Trade</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,                    // Take up all available space
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

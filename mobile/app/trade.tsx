import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import TradeSidePanel from '@/components/TradeSidePanel';

// --- React Native Basics ---
//
// View: The fundamental building block — like a <div> in web HTML.
//   It's a container that supports layout with flexbox, styling, and touch handling.
//
// Text: Required for displaying any text. Unlike the web, you can't just put
//   raw strings inside a View — all text must be wrapped in <Text>.
//
// StyleSheet.create(): Defines your styles in a structured way.
//   It looks like CSS but uses camelCase (fontSize, not font-size)
//   and values are numbers (pixels) or strings (colors, percentages).

export default function TradeScreen() {
  // useRouter() gives you a router object to navigate programmatically.
  // router.back() pops this screen off the stack, returning to the previous screen.
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header row: back button + title on the left, week info on the right */}
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
        players={[
          { position: 'WR', name: 'Chris Olave', details: 'NO  |  age 25', value: 82 },
        ]}
      />

      {/* "for" divider — line on each side of the text */}
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>for</Text>
        <View style={styles.dividerLine} />
      </View>

      <TradeSidePanel
        label="you get"
        accentColor="#54CA9D"
        players={[
          { position: 'RB', name: 'Kyren Williams', details: 'LAR  |  age 25', value: 73 },
          { position: 'RB', name: 'RJ Harvey', details: 'DEN  |  age 25', value: 42 },
        ]}
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

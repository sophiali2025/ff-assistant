import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Maps the verdict to a display label, colors, and icon.
const VERDICT_CONFIG = {
  accept: {
    label: 'Accept Trade',
    bg: '#2F8F6A',
    border: '#6BE3B5',
    icon: 'checkmark-circle-outline' as const,
  },
  decline: {
    label: 'Decline Trade',
    bg: '#8F2F2F',
    border: '#E36B6B',
    icon: 'close-circle-outline' as const,
  },
  counter: {
    label: 'Counter Trade',
    bg: '#8F6A2F',
    border: '#E3B56B',
    icon: 'swap-horizontal-outline' as const,
  },
};

type TradeResultCardProps = {
  verdict: 'accept' | 'decline' | 'counter';
  subtitle: string;
  summary: string;
};

export default function TradeResultCard({ verdict, subtitle, summary }: TradeResultCardProps) {
  const config = VERDICT_CONFIG[verdict];

  return (
    <View style={styles.card}>
      {/* Top row: icon badge + verdict text */}
      <View style={styles.topRow}>
        <View style={[styles.iconBox, { backgroundColor: config.bg, borderColor: config.border }]}>
          <Ionicons name={config.icon} size={30} color={config.border} />
        </View>
        <View style={styles.verdictText}>
          <Text style={styles.verdictLabel}>{config.label}</Text>
          <Text style={styles.verdictSubtitle}>{subtitle}</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Summary — scrollable if the text is long */}
      <ScrollView style={styles.summaryScroll}>
        <Text style={styles.summary}>{summary}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#67558F',
    borderWidth: 1,
    borderColor: '#A1C4F9',
    borderRadius: 15,
    padding: 14,
    marginTop: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verdictText: {
    marginLeft: 12,
  },
  verdictLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  verdictSubtitle: {
    fontSize: 12,
    color: '#C1C1C1',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#A1C4F9',
    marginVertical: 10,
  },
  summaryScroll: {
    maxHeight: 90,
  },
  summary: {
    fontSize: 12,
    color: '#FFFFFF',
    lineHeight: 18,
  },
});

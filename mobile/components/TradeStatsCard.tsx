import { View, Text, StyleSheet } from 'react-native';

type TradeStatsCardProps = {
  giveNormalized: number;
  getNormalized: number;
  giveTrueValue: number;
  getTrueValue: number;
};

// A single bar row: label centered, give value on the left, get value on the
// right, and a proportional red/green bar underneath.
function StatBar({ label, giveValue, getValue }: { label: string; giveValue: number; getValue: number }) {
  const total = giveValue + getValue;
  // Percentage of the bar that belongs to the "give" side.
  // If both are 0, split 50/50 to avoid division by zero.
  const givePct = total > 0 ? (giveValue / total) * 100 : 50;

  return (
    <View style={styles.barSection}>
      {/* Label row: give value | label | get value */}
      <View style={styles.labelRow}>
        <Text style={styles.giveValue}>{giveValue}</Text>
        <Text style={styles.barLabel}>{label}</Text>
        <Text style={styles.getValue}>{getValue}</Text>
      </View>

      {/* The bar itself — two colored halves side by side */}
      <View style={styles.barTrack}>
        <View style={[styles.barGive, { flex: givePct }]} />
        <View style={[styles.barGet, { flex: 100 - givePct }]} />
      </View>
    </View>
  );
}

export default function TradeStatsCard({ giveNormalized, getNormalized, giveTrueValue, getTrueValue }: TradeStatsCardProps) {
  return (
    <View style={styles.card}>
      <StatBar label="normalized value" giveValue={giveNormalized} getValue={getNormalized} />
      <View style={styles.divider} />
      <StatBar label="true value" giveValue={giveTrueValue} getValue={getTrueValue} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#362C58',
    borderWidth: 1,
    borderColor: '#A1C4F9',
    borderRadius: 15,
    padding: 14,
    marginTop: 16,
  },
  barSection: {
    gap: 6,
    paddingVertical: 4,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  barLabel: {
    fontFamily: 'Jaro',
    fontSize: 12,
    color: '#FFFCFC',
    textAlign: 'center',
  },
  giveValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#EF6F66',
  },
  getValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#54CA9D',
    textAlign: 'right',
  },
  barTrack: {
    flexDirection: 'row',
    height: 9,
    borderRadius: 5,
    overflow: 'hidden',
  },
  barGive: {
    backgroundColor: '#EF6F66',
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
  },
  barGet: {
    backgroundColor: '#54CA9D',
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  },
  divider: {
    height: 1,
    backgroundColor: '#A1C4F9',
    marginVertical: 10,
  },
});

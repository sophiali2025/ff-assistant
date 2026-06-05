import { View, Text, StyleSheet } from 'react-native';

const PLAYER_COLORS = ['#9F98EE', '#7BB0FF', '#8AEDCE', '#ECB781'];

const STATIC_STAT_ROWS = [
  { label: 'game total', values: ['coming soon'] },
  { label: 'spread', values: ['coming soon'] },
  { label: 'weather', values: ['coming soon'] },
];

type ComparePlayer = {
  projection: number;
  ranking: string;
  def_rank: string;
};

type Props = {
  players: ComparePlayer[];
};

// Extract the numeric value from a stat string.
// "22nd" → 22, "RB20" → 20, "12.8" → 12.8
const parseNum = (val: string) => parseFloat(val.replace(/[^0-9.]/g, ''));

// Calculate a fixed width for each pill, scaled proportionally.
// When invert is true, smaller numbers get bigger pills.
const MIN_PILL = 25;
const MAX_PILL = 75;
const pillWidth = (val: string, allValues: string[], invert = false) => {
  const nums = allValues.map(parseNum);
  const max = Math.max(...nums);
  const min = Math.min(...nums);
  if (max === min) return (MIN_PILL + MAX_PILL) / 2;
  let ratio = (parseNum(val) - min) / (max - min);
  if (invert) ratio = 1 - ratio;
  return MIN_PILL + ratio * (MAX_PILL - MIN_PILL);
};

export default function StatsBox({ players }: Props) {
  const statRows = [
    { label: 'projected', values: players.map(p => p.projection.toFixed(1)) },
    { label: 'ranking', values: players.map(p => p.ranking) },
    { label: 'def rank', values: players.map(p => p.def_rank) },
    ...STATIC_STAT_ROWS,
  ];

  return (
    <View style={styles.statsBox}>
      {statRows.map((row, i) => (
        <View key={row.label}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>{row.label}</Text>
            {row.values.length === 1 && row.values[0] === 'coming soon'
              ? <Text style={styles.comingSoonText}>coming soon</Text>
              : row.values.map((val, j) => (
                <View key={j} style={[styles.statPill, {
                  backgroundColor: PLAYER_COLORS[j],
                  width: pillWidth(val, row.values, row.label === 'ranking'),
                }]}>
                  <Text style={styles.statPillText}>{val}</Text>
                </View>
              ))}
          </View>
          {i < statRows.length - 1 && <View style={styles.statDivider} />}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
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
    gap: 6,
  },
  statLabel: {
    fontSize: 13,
    color: '#FFFFFF',
    width: 80,
  },
  statPill: {
    borderRadius: 5,
    paddingVertical: 2,
    alignItems: 'center',
  },
  statPillText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#375481',
  },
  comingSoonText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    fontStyle: 'italic',
  },
  statDivider: {
    height: 1,
    backgroundColor: 'rgba(161, 196, 249, 0.3)',
  },
});

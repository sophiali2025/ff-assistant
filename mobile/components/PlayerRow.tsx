import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// --- Slot vs Position ---
// A player has a `position` (what they play: QB, RB, WR, TE, K, DEF)
// and a `slot` (where they sit on your roster: QB, RB, WR, TE, K, DEF, FLX, BN).
// FLX can hold a WR, RB, or TE. BN (bench) can hold any position.
// The badge shows the SLOT, not the position, because that's the
// roster context that matters when viewing your lineup.

const SLOT_COLORS: Record<string, string> = {
  QB: '#EC8585',    // red
  RB: '#59C1A0',    // green
  WR: '#85B7EC',    // blue
  TE: '#ECB985',    // orange
  K: '#9590CC',     // purple
  DEF: '#A67C52',   // brown
  FLX: '#73C7CA',   // teal
  BN: '#9EA5A9',    // gray
};

const STATUS_COLORS: Record<string, string> = {
  active: '#39C196',       // green
  questionable: '#F6D140', // yellow
  doubtful: '#EC942F',     // orange
  out: '#E43A2E',          // red
};

type PlayerRowProps = {
  slot: string;     // roster slot: QB, RB, WR, TE, K, DEF, FLX, BN
  name: string;
  status: string;
  actualPoints: number;
  projectedPoints: number;
  selected?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  news?: string;
  onPress?: () => void;
};

export default function PlayerRow({ slot, name, status, actualPoints, projectedPoints, selected, isFirst, isLast, news, onPress }: PlayerRowProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View style={[
        styles.row,
        selected && styles.selectedRow,
        selected && isFirst && { borderTopLeftRadius: 20, borderTopRightRadius: 20 },
        selected && isLast && { borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
      ]}>
        {/* Top section: badge + name/status + points */}
        <View style={styles.topSection}>
          {/* Slot badge — color depends on the roster slot */}
          <View style={[styles.badge, { backgroundColor: SLOT_COLORS[slot] || '#9EA5A9' }]}>
            <Text style={styles.badgeText}>{slot}</Text>
          </View>

          {/* name + status (takes up remaining space) */}
          <View style={styles.info}>
            <Text style={styles.name}>{name}</Text>
            <View style={styles.statusRow}>
              {/* The dot is just a tiny View styled as a circle */}
              <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[status] || '#9EA5A9' }]} />
              <Text style={[styles.statusText, { color: STATUS_COLORS[status] || '#9EA5A9' }]}>
                {status}
              </Text>
            </View>
          </View>

          {/* Right section: points */}
          <View style={styles.points}>
            <Text style={styles.actualPoints}>{actualPoints.toFixed(1)}</Text>
            <Text style={styles.projectedPoints}>{projectedPoints.toFixed(1)}</Text>
          </View>
        </View>

        {/* Expanded news section — only visible when selected */}
        {selected && (
          <View style={styles.newsSection}>
            <View style={styles.newsDivider} />
            <Text style={styles.newsText}>{news ?? 'loading...'}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// --- Inline Dynamic Styles ---
// Notice the badge uses: style={[styles.badge, { backgroundColor: POSITION_COLORS[position] }]}
//
// This combines a static style (styles.badge for size, shape, centering)
// with a dynamic style (backgroundColor that changes per player).
// You can't put dynamic values in StyleSheet.create because it runs
// once at load time — so you pass them inline in the JSX instead.

const styles = StyleSheet.create({
  row: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(161, 196, 249, 0.2)',
  },
  selectedRow: {
    backgroundColor: '#67558F',
    borderWidth: 2,
    borderColor: '#A1C4F9',
    borderBottomWidth: 2,
    borderBottomColor: '#A1C4F9',
    borderLeftWidth: 1,
    borderRightWidth: 1
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newsSection: {
    marginTop: 8,
  },
  newsDivider: {
    height: 1,
    backgroundColor: 'rgba(161, 196, 249, 0.3)',
    marginBottom: 8,
  },
  newsText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  badge: {
    width: 35,
    height: 35,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  info: {
    flex: 1,        // takes all remaining horizontal space between badge and points
    marginLeft: 12,
  },
  name: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,  // half of width = circle
    marginRight: 7,
  },
  statusText: {
    fontSize: 12,
  },
  points: {
    alignItems: 'flex-end', // right-align the text inside this container
  },
  actualPoints: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  projectedPoints: {
    fontSize: 11,
    color: '#D4D4D4',
    marginTop: 2,
  },
});

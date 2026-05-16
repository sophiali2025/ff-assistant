import { View, Text, StyleSheet } from 'react-native';

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
};

export default function PlayerRow({ slot, name, status, actualPoints, projectedPoints }: PlayerRowProps) {
  return (
    <View style={styles.row}>
      {/* Slot badge — color depends on the roster slot */}
      <View style={[styles.badge, { backgroundColor: SLOT_COLORS[slot] || '#9EA5A9' }]}>
        <Text style={styles.badgeText}>{slot}</Text>
      </View>

      {/* Middle section: name + status (takes up remaining space) */}
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
        <Text style={styles.actualPoints}>{actualPoints}</Text>
        <Text style={styles.projectedPoints}>{projectedPoints}</Text>
      </View>
    </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(161, 196, 249, 0.2)', // subtle separator line
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

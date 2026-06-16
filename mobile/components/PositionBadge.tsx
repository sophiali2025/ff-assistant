import { View, Text, StyleSheet } from 'react-native';

// Color map for player positions (what they play on the field).
// This is different from SLOT colors in PlayerRow, which include
// roster-specific slots like FLX and BN.
const POSITION_COLORS: Record<string, string> = {
  QB: '#EC8585',    // red
  RB: '#59C1A0',    // green
  WR: '#85B7EC',    // blue
  TE: '#ECB985',    // orange
  K: '#9590CC',     // purple
  DEF: '#A67C52',   // brown
};

type PositionBadgeProps = {
  position: string;   // player position: QB, RB, WR, TE, K, DEF
  size?: number;      // optional — defaults to 35
};

export default function PositionBadge({ position, size = 35 }: PositionBadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: size * 0.29,
          backgroundColor: POSITION_COLORS[position] || '#9EA5A9',
        },
      ]}
    >
      <Text style={[styles.badgeText, { fontSize: size * 0.43 }]}>{position}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

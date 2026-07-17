import { View, Text, StyleSheet } from 'react-native';

type Player = {
  player_id: string;
  name: string;
  position: string;
  team: string;
  age: number;
  projected: number;
};

type WaiverStats = {
  positionRank: string;
  rosPositionRank: string;
  rostered: string;
  snapShare: string;
  recentAdds: string;
  avgLast3: number;
};

type PlayerStatsCardProps = {
  player: Player;
  stats: WaiverStats;
  getPositionColor: (position: string) => string;
  size?: 'default' | 'small';
};

export default function PlayerStatsCard({
  player,
  stats,
  getPositionColor,
  size = 'default'
}: PlayerStatsCardProps) {
  const isSmall = size === 'small';

  return (
    <View style={[styles.playerCard, isSmall && styles.playerCardSmall]}>
      {/* Player Header - only show for default size */}
      {!isSmall && (
        <>
          <View style={styles.playerHeader}>
            <View style={[
              styles.positionBadge,
              { backgroundColor: getPositionColor(player.position) }
            ]}>
              <Text style={styles.positionText}>
                {player.position}
              </Text>
            </View>
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>
                {player.name}
              </Text>
              <Text style={styles.playerDetails}>
                {`${player.team}  | age ${player.age}`}
              </Text>
            </View>
            <View style={styles.projectedBox}>
              <Text style={styles.projectedValue}>
                {player.projected.toFixed(1)}
              </Text>
              <Text style={styles.projectedLabel}>proj</Text>
            </View>
          </View>

          <View style={styles.solidDivider} />
        </>
      )}

      {/* Stats Grid */}
      <View style={isSmall ? styles.statsContainerSmall : styles.statsContainer}>
        <View style={[styles.statsGrid, { width: '100%' }]}>
          <View style={[
            isSmall ? styles.statItemSmall : styles.statItem,
            { borderTopWidth: 0, borderLeftWidth: isSmall ? 0 : 1 }
          ]}>
            <Text style={isSmall ? styles.statValueSmall : styles.statValue}>
              {stats.positionRank}
            </Text>
            <Text style={isSmall ? styles.statLabelSmall : styles.statLabel}>
              position rank
            </Text>
          </View>
          <View style={[
            isSmall ? styles.statItemSmall : styles.statItem,
            { borderTopWidth: 0 }
          ]}>
            <Text style={isSmall ? styles.statValueSmall : styles.statValue}>
              {stats.rosPositionRank}
            </Text>
            <Text style={isSmall ? styles.statLabelSmall : styles.statLabel}>
              ros position rank
            </Text>
          </View>
          <View style={[
            isSmall ? styles.statItemSmall : styles.statItem,
            { borderTopWidth: 0, borderRightWidth: isSmall ? 0 : 1 }
          ]}>
            <Text style={isSmall ? styles.statValueSmall : styles.statValue}>
              {stats.rostered}
            </Text>
            <Text style={isSmall ? styles.statLabelSmall : styles.statLabel}>
              rostered
            </Text>
          </View>
        </View>

        <View style={[styles.statsGrid, { marginTop: -1, width: '100%' }]}>
          <View style={[
            isSmall ? styles.statItemSmall : styles.statItem,
            { borderBottomWidth: 0, borderBottomLeftRadius: isSmall ? 10 : 15, borderLeftWidth: isSmall ? 0 : 1 }
          ]}>
            <Text style={isSmall ? styles.statValueSmall : styles.statValue}>
              {stats.snapShare}
            </Text>
            <Text style={isSmall ? styles.statLabelSmall : styles.statLabel}>
              snap share
            </Text>
          </View>
          <View style={[
            isSmall ? styles.statItemSmall : styles.statItem,
            { borderBottomWidth: 0 }
          ]}>
            <Text style={isSmall ? styles.statValueSmall : styles.statValue}>
              {stats.recentAdds}
            </Text>
            <Text style={isSmall ? styles.statLabelSmall : styles.statLabel}>
              recent adds
            </Text>
          </View>
          <View style={[
            isSmall ? styles.statItemSmall : styles.statItem,
            { borderBottomWidth: 0, borderBottomRightRadius: isSmall ? 10 : 15, borderRightWidth: isSmall ? 0 : 1 }
          ]}>
            <Text style={isSmall ? styles.statValueSmall : styles.statValue}>
              {stats.avgLast3}
            </Text>
            <Text style={isSmall ? styles.statLabelSmall : styles.statLabel}>
              avg last 3
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  playerCard: {
    backgroundColor: '#375481',
    borderWidth: 1,
    borderColor: '#A1C4F9',
    borderRadius: 15,
    padding: 16,
    marginTop: 9,
  },
  playerCardSmall: {
    backgroundColor: '#152D53',
    padding: 0,
    marginTop: 0,
    borderRadius: 10,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  positionBadge: {
    width: 35,
    height: 35,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  positionBadgeSmall: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  positionText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  positionTextSmall: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  playerInfo: {
    flex: 1,
    marginLeft: 10,
  },
  playerName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  playerNameSmall: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  playerDetails: {
    fontSize: 10,
    color: '#C1C1C1',
    marginTop: 2,
  },
  projectedBox: {
    alignItems: 'flex-end',
  },
  projectedValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  projectedValueSmall: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  projectedLabel: {
    fontSize: 11,
    color: '#D4D4D4',
  },
  solidDivider: {
    height: 1,
    backgroundColor: '#A1C4F9',
    marginHorizontal: -16,
  },
  statsContainer: {
    position: 'relative',
    marginHorizontal: -16,
    marginBottom: -16,
  },
  statsContainerSmall: {
    position: 'relative',
    margin: -1,
  },
  statsGrid: {
    flexDirection: 'row',
  },
  statItem: {
    flex: 1,
    flexBasis: 0,
    flexGrow: 1,
    flexShrink: 1,
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: '#375481',
    borderWidth: 1,
    borderColor: '#A1C4F9',
    marginLeft: -1,
  },
  statItemSmall: {
    flex: 1,
    flexBasis: 0,
    flexGrow: 1,
    flexShrink: 1,
    alignItems: 'flex-start',
    padding: 10,
    backgroundColor: '#152D53',
    borderWidth: 1,
    borderColor: '#A1C4F9',
    marginLeft: -1,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8572B1',
  },
  statValueSmall: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#8572B1',
  },
  statLabel: {
    fontSize: 8,
    color: '#C1C1C1',
    marginTop: 4,
  },
  statLabelSmall: {
    fontSize: 8,
    color: '#C1C1C1',
    marginTop: 3,
  },
});

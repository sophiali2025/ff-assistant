import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PositionBadge from '@/components/PositionBadge';

type TradePlayerCardProps = {
  position: string;
  name: string;
  details: string;
  value: number;           // raw FantasyCalc value (e.g. 8905)
  normalizedValue: number; // log-scaled 1–100 (e.g. 98)
  accentColor: string;     // red for "give", green for "get"
  onRemove?: () => void;
};

export default function TradePlayerCard({ position, name, details, value, normalizedValue, accentColor, onRemove }: TradePlayerCardProps) {
  return (
    <View style={[styles.card, { borderColor: accentColor }]}>
      <PositionBadge position={position} size={30} />

      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.details}>{details}</Text>
      </View>

      <Text style={[styles.value, { color: accentColor }]}>{normalizedValue}</Text>

      <TouchableOpacity style={styles.closeButton} onPress={onRemove}>
        <View style={[styles.closeCircle, { borderColor: accentColor }]}>
          <Ionicons name="close" size={10} color={accentColor} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#152D53',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  info: {
    flex: 1,
    marginLeft: 10,
  },
  name: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  details: {
    fontSize: 10,
    color: '#C1C1C1',
    marginTop: 2,
  },
  value: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
  },
  closeCircle: {
    width: 15,
    height: 15,
    borderRadius: 10,
    backgroundColor: '#152D53',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

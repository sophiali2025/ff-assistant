import { View, Text, StyleSheet } from 'react-native';
import TradePlayerCard from '@/components/TradePlayerCard';
import AddTradePlayer from '@/components/AddTradePlayer';

type Player = {
  position: string;
  name: string;
  details: string;
  value: number;
};

type TradeSidePanelProps = {
  label: string;
  accentColor: string;
  players: Player[];
};

export default function TradeSidePanel({ label, accentColor, players }: TradeSidePanelProps) {
  return (
    <View style={styles.panel}>
      <Text style={[styles.label, { color: accentColor }]}>{label}</Text>
      {players.map((player, index) => (
        <TradePlayerCard
          key={index}
          position={player.position}
          name={player.name}
          details={player.details}
          value={player.value}
          accentColor={accentColor}
        />
      ))}
      <AddTradePlayer />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: '#375481',
    borderWidth: 1,
    borderColor: '#A1C4F9',
    borderRadius: 15,
    padding: 12,
    gap: 6,
  },
  label: {
    fontSize: 10,
    fontWeight: 'bold',
  },
});

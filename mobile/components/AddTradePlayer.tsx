import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type AddTradePlayerProps = {
  onPress?: () => void;
};

export default function AddTradePlayer({ onPress }: AddTradePlayerProps) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name="add" size={15} color="#A1C4F9" />
      <Text style={styles.text}>add another player</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#A1C4F9',
    borderRadius: 10,
    height: 26,
    paddingHorizontal: 12,
  },
  text: {
    fontSize: 10,
    color: '#A1C4F9',
    marginLeft: 4,
  },
});

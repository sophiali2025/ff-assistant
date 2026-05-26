import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function StartSitScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#A1C4F9" />
        </TouchableOpacity>
        <Text style={styles.title}>Start/Sit</Text>
        <View style={{ width: 24 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#23173E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 12,
  },
  title: {
    fontFamily: 'Jaro',
    fontSize: 24,
    color: '#FFFFFF',
  },
});

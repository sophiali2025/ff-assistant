import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Header from '@/components/Header';

const MENU_ITEMS = [
  {
    title: 'Set My Lineup',
    subtitle: 'Start/Sit Assistant',
    icon: 'checkbox-outline' as const,
    href: '/startsit' as const,
  },
  {
    title: 'Trade Analyzer',
    subtitle: 'AI suggested trades or evaluate your own',
    icon: 'swap-horizontal' as const,
    href: null,
  },
  {
    title: 'Waiver Pickup',
    subtitle: 'Find best adds for your roster',
    icon: 'person-add-outline' as const,
    href: null,
  },
  {
    title: 'Injury Impact',
    subtitle: 'Advice based on your team\'s injuries',
    icon: 'medkit-outline' as const,
    href: null,
  },
];

export default function AiScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Header week={0} initials="SL" />

      <ScrollView style={styles.scroll}>
        {/* Main box */}
        <View style={styles.mainBox}>
          <Text style={styles.heading}>what do you need help with?</Text>

          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.title}
              style={styles.menuButton}
              activeOpacity={0.7}
              onPress={() => item.href && router.push(item.href)}
            >
              <View style={styles.iconBox}>
                <Ionicons name={item.icon} size={24} color="#A1C4F9" />
              </View>
              <View style={styles.menuText}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#A1C4F9" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Chat button */}
        <TouchableOpacity style={styles.chatButton} activeOpacity={0.7}>
          <Ionicons name="sparkles-outline" size={20} color="#A1C4F9" />
          <Text style={styles.chatText}>or just ask anything...</Text>
          <Ionicons name="arrow-forward" size={20} color="#A1C4F9" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#23173E',
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  mainBox: {
    backgroundColor: '#362C58',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#A1C4F9',
    padding: 20,
    marginTop: 16,
  },
  heading: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#152D53',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#A1C4F9',
    padding: 14,
    marginBottom: 12,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#597DB4',
    borderWidth: 1,
    borderColor: '#A1C4F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    flex: 1,
    marginLeft: 12,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#FFFFFF',
    marginTop: 2,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#375481',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#A1C4F9',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
  },
  chatText: {
    flex: 1,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
});

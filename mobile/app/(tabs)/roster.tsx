import { StyleSheet } from 'react-native';

import { View } from '@/components/default/Themed';
import Header from '@/components/Header';
import WeeklyMatch from '@/components/WeeklyMatch';
import RosterList from '@/components/RosterList';

export default function RosterScreen() {
  return (
    <View style={styles.container}>
      <Header week={9} initials="SL" />
      <WeeklyMatch
        week = {9}
        myTeamName="My Team"
        myActual={98.4}
        myProjected={96.2}
        oppTeamName="Other Team"
        oppActual={81.2}
        oppProjected={87.9}
      />
      <RosterList />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#23173E',
  },
});

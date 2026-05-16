import { View, Text, StyleSheet } from 'react-native';
import TeamScore from './TeamScore';

// --- Composing Components ---
// This component doesn't do much styling on TeamScore itself — it
// just places two TeamScore components side by side with "VS" in
// the middle. Each small component handles its own look, and
// this parent component handles the layout. That's composition.

type WeeklyMatchProps = {
  week: number,
  myTeamName: string;
  myActual: number;
  myProjected: number;
  oppTeamName: string;
  oppActual: number;
  oppProjected: number;
};

export default function WeeklyMatch({
  week,
  myTeamName,
  myActual,
  myProjected,
  oppTeamName,
  oppActual,
  oppProjected,
}: WeeklyMatchProps) {
  return (
    <View style={styles.card}>
      {/* Title row */}
      <Text style={styles.title}>Week {week} Match-up</Text>

      {/* Scores row: two TeamScore components with VS in the middle */}
      <View style={styles.scoresRow}>
        <TeamScore
          name={myTeamName}
          actualPoints={myActual}
          projectedPoints={myProjected}
        />

        <Text style={styles.vs}>VS</Text>

        <TeamScore
          name={oppTeamName}
          actualPoints={oppActual}
          projectedPoints={oppProjected}
          alignRight
          // ^ shorthand for alignRight={true}
          // In JSX, writing a prop name without a value means true.
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#362C58',   // slightly lighter purple from the Figma design
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#A1C4F9',       // light blue border
    marginHorizontal: 20,
    padding: 18,
  },
  title: {
    fontFamily: 'Jaro',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  scoresRow: {
    flexDirection: 'row',          // horizontal layout
    alignItems: 'center',
  },
  vs: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginHorizontal: 12,
  },
});

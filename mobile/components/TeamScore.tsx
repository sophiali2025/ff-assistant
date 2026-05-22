import { View, Text, StyleSheet } from 'react-native';

// --- Reusable Components ---
// This component shows ONE team's score. We'll use it twice inside
// WeeklyMatch — once for "My Team" (left-aligned) and once for
// "Other Team" (right-aligned).
//
// By making it a separate component, we avoid duplicating the same
// name + score + projected layout twice. This is a core React idea:
// build small pieces, then compose them together.

type TeamScoreProps = {
  name: string;
  actualPoints: number;
  projectedPoints: number;
  // `alignRight` flips the text alignment for the opponent side.
  // It's a boolean prop — the parent passes `true` or `false`.
  alignRight?: boolean;
  // The `?` after `alignRight` makes it optional. If the parent
  // doesn't pass it, it defaults to `undefined` (which is falsy).
};

export default function TeamScore({ name, actualPoints, projectedPoints, alignRight }: TeamScoreProps) {
  return (
    <View style={styles.container}>
      <Text style={[styles.name, alignRight && styles.textRight]}>
        {name}
      </Text>
      <Text style={[styles.actual, alignRight && styles.textRight]}>
        {actualPoints.toFixed(2)}
      </Text>
      <Text style={[styles.projected, alignRight && styles.textRight]}>
        {projectedPoints.toFixed(2)}
      </Text>
    </View>
  );
}

// --- Style Arrays ---
// Notice above we wrote: style={[styles.name, alignRight && styles.textRight]}
//
// When you pass an array to `style`, React Native merges them left to right.
// The `&&` operator means: "if alignRight is true, include styles.textRight".
// If alignRight is false/undefined, the `&&` evaluates to false, which
// React Native ignores. This is a common pattern for conditional styles.

const styles = StyleSheet.create({
  container: {
    flex: 1,  // each TeamScore takes equal width inside the parent row
  },
  name: {
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  actual: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  projected: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  textRight: {
    textAlign: 'right',
  },
});

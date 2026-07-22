import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// --- What are Props? ---
// Props are the inputs to your component, like function parameters.
// Here we define what data the Header needs from its parent:
//   - `week`: which NFL week to display
//   - `initials`: the user's initials for the avatar circle
//   - `onAvatarPress`: callback function when avatar is tapped
type HeaderProps = {
  week: number;
  initials: string;
  onAvatarPress?: () => void;  // Optional callback for avatar tap
};

// --- What is a Component? ---
// A component is just a function that returns JSX (the HTML-like syntax).
// The curly braces in the parameter `{ week, initials, onAvatarPress }` are called
// "destructuring" — it unpacks the props object so you can use
// `week` directly instead of `props.week`.
export default function Header({ week, initials, onAvatarPress }: HeaderProps) {
  return (
    // View = a container box (like <div> in web HTML).
    // `style` takes an array — styles later in the array override earlier ones.
    <View style={styles.container}>

      {/* Left: app name */}
      <Text style={styles.appName}>edge</Text>

      {/* Right side: week label + avatar grouped together */}
      <View style={styles.rightSection}>
        {/*
          TouchableOpacity: Makes the avatar tappable
          When tapped, it calls the onAvatarPress function passed from parent
          activeOpacity: Reduces opacity to 0.7 when pressed (visual feedback)
        */}
        <TouchableOpacity
          onPress={onAvatarPress}
          activeOpacity={0.7}
          disabled={!onAvatarPress}  // Disable if no callback provided
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// --- What is StyleSheet.create? ---
// It's React Native's version of CSS. You write styles as JS objects
// with camelCase property names (e.g. backgroundColor, not background-color).
// Numeric values are in density-independent pixels (dp) by default — no "px" needed.
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#23173E',  // dark navy from the Figma design
    flexDirection: 'row',        // lay children out horizontally (default is vertical/'column')
    alignItems: 'center',        // vertically center children
    justifyContent: 'space-between', // push children to opposite ends
    paddingHorizontal: 20,
    paddingTop: 50,              // extra top padding to clear the iOS status bar
    paddingBottom: 12,
  },
  appName: {
    fontFamily: 'Jaro',     // custom font loaded in _layout.tsx
    fontSize: 28,
    color: '#FFFFFF',
  },
  rightSection: {
    flexDirection: 'row',        // horizontal layout for week + avatar
    alignItems: 'center',
    gap: 14,                     // space between week label and avatar
  },
  
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,            // half of width/height = perfect circle
    borderColor: '#A1C4F9',  
    backgroundColor: '#597db4',  // blue-gray from the Figma design
    alignItems: 'center',        // center text horizontally inside
    justifyContent: 'center',    // center text vertically inside
  },
  avatarText: {
    fontSize: 15,
    color: '#A1C4F9',            // light blue from the Figma design
  },
});

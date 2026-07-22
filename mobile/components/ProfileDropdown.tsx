import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

type ProfileDropdownProps = {
  visible: boolean;
  onClose: () => void;
  position?: { top: number; right: number };
};

export default function ProfileDropdown({
  visible,
  onClose,
  position = { top: 100, right: 20 },
}: ProfileDropdownProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      console.log('Logging out user...');
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Logout error:', error);
      } else {
        onClose();
        router.replace('/(auth)/login');
      }
    } catch (error) {
      console.error('Unexpected logout error:', error);
    }
  };

  const handleSwitchLeague = () => {
    console.log('Switch league tapped (not yet implemented)');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.dropdown, { top: position.top, right: position.right }]}>
              {/* Switch League Option */}
              <TouchableOpacity
                style={styles.option}
                onPress={handleSwitchLeague}
                activeOpacity={0.7}
              >
                <Text style={styles.optionText}>Switch League</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              {/* Logout Option */}
              <TouchableOpacity
                style={styles.option}
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <Text style={styles.optionText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  dropdown: {
    position: 'absolute',
    backgroundColor: '#597db4',  // From Figma design
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#a1c4f9',  // From Figma design
    width: 130,   // Increased from 100px for better readability
    height: 72,   // Increased from 55px for easier tapping
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  option: {
    paddingVertical: 8,     // Increased from 7px for more breathing room
    paddingHorizontal: 12,   // Increased from 10px for more side padding
    height: 35,              // Increased from 27px (Apple's min touch target)
    justifyContent: 'center',
  },
  optionText: {
    fontFamily: 'Inter',
    fontSize: 13,            // Increased from 10px for better readability
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#a1c4f9',
    marginHorizontal: 0,
  },
});

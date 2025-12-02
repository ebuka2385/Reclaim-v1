import React from 'react';
import { useClerk } from '@clerk/clerk-expo';
import { TouchableOpacity, Text, StyleSheet, Alert, ViewStyle, TextStyle } from 'react-native';
import { clearUserId } from '../../services/api';

interface SignOutButtonProps {
  compact?: boolean;
  buttonStyle?: ViewStyle;
  textStyle?: TextStyle;
}

export const SignOutButton = ({ compact = false, buttonStyle, textStyle }: SignOutButtonProps = {}) => {
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    try {
      clearUserId(); // Clear stored userId
      await signOut();
    } catch (err: any) {
      Alert.alert('Error', err.errors?.[0]?.message || 'Failed to sign out. Please try again.');
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.button, compact && styles.buttonCompact, buttonStyle]} 
      onPress={handleSignOut}
    >
      <Text style={[styles.buttonText, compact && styles.buttonTextCompact, textStyle]}>Sign out</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#dc2626',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonCompact: {
    padding: 8,
    marginTop: 0,
    minWidth: 80,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextCompact: {
    fontSize: 14,
  },
});


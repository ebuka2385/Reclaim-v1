import React from 'react';
import { useClerk } from '@clerk/clerk-expo';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { clearUserId } from '../../services/api';

export const SignOutButton = () => {
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
    <TouchableOpacity style={styles.button} onPress={handleSignOut}>
      <Text style={styles.buttonText}>Sign out</Text>
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
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});


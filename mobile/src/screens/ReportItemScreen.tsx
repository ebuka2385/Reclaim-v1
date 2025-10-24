import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import { apiService } from '../services/api';
import { Screen } from '../types';

interface ReportItemScreenProps {
  onNavigate: (screen: Screen) => void;
}

export default function ReportItemScreen({ onNavigate }: ReportItemScreenProps) {
  const [itemType, setItemType] = useState<'LOST' | 'FOUND'>('LOST');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const itemData = {
        title: title.trim(),
        description: description.trim(),
        status: itemType,
      };
      
      const response = await apiService.createItem(itemData);

      // Check if the response contains an error
      if (response.error) {
        Alert.alert('Error', response.error);
        return;
      }

      Alert.alert('Success', 'Item reported!', [
        { text: 'OK', onPress: () => onNavigate('myitems') }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Report Item</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.label}>Item Type</Text>
          <View style={styles.typeButtons}>
            <TouchableOpacity
              style={[styles.typeButton, itemType === 'LOST' && styles.activeType]}
              onPress={() => setItemType('LOST')}
            >
              <Text style={[styles.typeButtonText, itemType === 'LOST' && styles.activeTypeText]}>Lost</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, itemType === 'FOUND' && styles.activeType]}
              onPress={() => setItemType('FOUND')}
            >
              <Text style={[styles.typeButtonText, itemType === 'FOUND' && styles.activeTypeText]}>Found</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Item Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Blue Backpack"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the item..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Submit Report</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#003071',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 8,
    marginTop: 16,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  activeType: {
    backgroundColor: '#003071',
    borderColor: '#003071',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  activeTypeText: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  mapSection: {
    marginTop: 16,
  },
  mapLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 8,
  },
  mapPlaceholder: {
    height: 150,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapText: {
    fontSize: 14,
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#003071',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});


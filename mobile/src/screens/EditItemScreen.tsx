import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { apiService, UpdateItemRequest } from '../services/api';
import { Item, Screen } from '../types';

interface EditItemScreenProps {
  item: Item;
  onNavigate?: (screen: Screen) => void;
  onItemUpdated: () => void;
}

export default function EditItemScreen({ item, onNavigate, onItemUpdated }: EditItemScreenProps) {
  const [itemType, setItemType] = useState<'LOST' | 'FOUND'>(item.status === 'LOST' ? 'LOST' : 'FOUND');
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const updateData: UpdateItemRequest = {
        title: title.trim(),
        description: description.trim(),
        status: itemType,
      };
      
      const response = await apiService.updateItem(item.id, updateData);

      // Success - update the list and close edit view
      onItemUpdated();
      Alert.alert('Success', 'Item updated successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update item');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Edit Item</Text>
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
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? 'Updating...' : 'Update Item'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => {
              // Just close the edit view, don't navigate
              onItemUpdated();
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
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
  submitButton: {
    backgroundColor: '#003071',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});


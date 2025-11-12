import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useState, useEffect, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';
import { apiService } from '../services/api';
import { Screen } from '../types';

interface ReportItemScreenProps {
  onNavigate: (screen: Screen) => void;
}

export default function ReportItemScreen({ onNavigate }: ReportItemScreenProps) {
  const [itemType, setItemType] = useState<'LOST' | 'FOUND'>('LOST');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
        if (newStatus !== 'granted') {
          return;
        }
        status = newStatus;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      
      setUserLocation(coords);
      // Don't auto-select - let user choose
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const handleUseCurrentLocation = () => {
    if (userLocation) {
      setSelectedLocation(userLocation);
      setShowMap(false);
      Alert.alert('Location Set', 'Using your current location');
    } else {
      Alert.alert('Location Unavailable', 'Please enable location permissions');
      getCurrentLocation();
    }
  };

  const handleMapPress = (event: any) => {
    // Extract coordinates from map click
    const lat = event.nativeEvent.data?.lat;
    const lng = event.nativeEvent.data?.lng;
    if (lat && lng) {
      setSelectedLocation({ latitude: lat, longitude: lng });
      setShowMap(false);
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!title.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in title and description');
      return;
    }

    try {
      // Prepare item data with location if available
      const itemData: {
        title: string;
        description: string;
        status: 'LOST' | 'FOUND';
        latitude?: number;
        longitude?: number;
      } = {
        title: title.trim(),
        description: description.trim(),
        status: itemType,
      };

      // Add location if selected
      if (selectedLocation) {
        itemData.latitude = selectedLocation.latitude;
        itemData.longitude = selectedLocation.longitude;
      }
      
      console.log('Submitting item:', itemData);
      
      const response = await apiService.createItem(itemData);
      console.log('Item created successfully:', response);

      Alert.alert('Success', 'Item reported successfully!', [
        { text: 'OK', onPress: () => onNavigate('myitems') }
      ]);
    } catch (error: any) {
      console.error('Error creating item:', error);
      Alert.alert('Error', error.message || 'Failed to submit item. Please try again.');
    }
  };

  // Generate map HTML for location selection
  const mapHtml = useMemo(() => {
    const centerLat = selectedLocation?.latitude || userLocation?.latitude || 37.7749;
    const centerLng = selectedLocation?.longitude || userLocation?.longitude || -122.4194;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <style>
          * { margin: 0; padding: 0; }
          body { margin: 0; padding: 0; }
          #map { height: 100%; width: 100%; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
          const map = L.map('map').setView([${centerLat}, ${centerLng}], 16);
          L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap &copy; CARTO',
            subdomains: 'abcd',
            maxZoom: 19
          }).addTo(map);
          
          ${userLocation ? `
            L.marker([${userLocation.latitude}, ${userLocation.longitude}])
              .addTo(map)
              .bindPopup('Your Location');
          ` : ''}
          
          let marker = null;
          if (${selectedLocation ? `true` : 'false'}) {
            marker = L.marker([${selectedLocation?.latitude || centerLat}, ${selectedLocation?.longitude || centerLng}], { draggable: true })
              .addTo(map);
            marker.on('dragend', function(e) {
              const pos = marker.getLatLng();
              window.ReactNativeWebView.postMessage(JSON.stringify({ lat: pos.lat, lng: pos.lng }));
            });
          }
          
          map.on('click', function(e) {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;
            
            if (marker) {
              marker.setLatLng([lat, lng]);
            } else {
              marker = L.marker([lat, lng], { draggable: true }).addTo(map);
              marker.on('dragend', function(e) {
                const pos = marker.getLatLng();
                window.ReactNativeWebView.postMessage(JSON.stringify({ lat: pos.lat, lng: pos.lng }));
              });
            }
            
            window.ReactNativeWebView.postMessage(JSON.stringify({ lat: lat, lng: lng }));
          });
        </script>
      </body>
      </html>
    `;
  }, [selectedLocation, userLocation]);

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

          <Text style={styles.label}>Location (Optional)</Text>
          <Text style={styles.locationHint}>
            Add location so this item appears on the map
          </Text>

          {!selectedLocation ? (
            <View style={styles.locationButtons}>
              <TouchableOpacity 
                style={styles.locationButton}
                onPress={handleUseCurrentLocation}
              >
                <Ionicons name="location" size={20} color="#003071" />
                <Text style={styles.locationButtonText}>Use My Location</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.locationButton, styles.mapButton]}
                onPress={() => setShowMap(true)}
              >
                <Ionicons name="map" size={20} color="#003071" />
                <Text style={styles.locationButtonText}>Pick on Map</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.locationInfo}>
              <Ionicons name="checkmark-circle" size={18} color="#10b981" />
              <Text style={styles.locationInfoText}>
                Location set
              </Text>
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={() => {
                  setSelectedLocation(null);
                  setShowMap(false);
                }}
              >
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
            </View>
          )}

          {showMap && (
            <View style={styles.mapContainer}>
              <WebView
                source={{ html: mapHtml }}
                style={styles.map}
                javaScriptEnabled={true}
                onMessage={(event) => {
                  try {
                    const data = JSON.parse(event.nativeEvent.data);
                    if (data.lat && data.lng) {
                      setSelectedLocation({ latitude: data.lat, longitude: data.lng });
                      setShowMap(false);
                    }
                  } catch (e) {
                    console.error('Error parsing map message:', e);
                  }
                }}
              />
              <View style={styles.mapHintContainer}>
                <Text style={styles.mapHint}>Tap on map to set location</Text>
                <TouchableOpacity 
                  style={styles.closeMapButton}
                  onPress={() => setShowMap(false)}
                >
                  <Text style={styles.closeMapButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

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
  locationHint: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
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
  locationButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  locationButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#003071',
  },
  mapButton: {
    backgroundColor: '#fff',
  },
  locationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#003071',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10b981',
    marginBottom: 12,
  },
  locationInfoText: {
    flex: 1,
    fontSize: 14,
    color: '#166534',
    fontWeight: '500',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fee2e2',
    borderRadius: 6,
  },
  clearButtonText: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '600',
  },
  mapContainer: {
    height: 250,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginBottom: 12,
  },
  map: {
    flex: 1,
  },
  mapHintContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  mapHint: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  closeMapButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#003071',
    borderRadius: 6,
  },
  closeMapButtonText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#003071',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

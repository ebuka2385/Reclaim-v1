import { View, Text, TextInput, StyleSheet, SafeAreaView } from 'react-native';
import { useState, useEffect, useMemo } from 'react';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { apiService } from '../services/api';

interface MapPin {
  itemId: string;
  title: string;
  status: 'LOST' | 'FOUND' | 'CLAIMED';
  latitude: number;
  longitude: number;
  description?: string;
}

export default function SearchScreen() {
  const [allPins, setAllPins] = useState<MapPin[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    getCurrentLocation();
    loadMapPins();
  }, []);

  const getCurrentLocation = async () => {
    try {
      // Check if permission already granted
      let { status } = await Location.getForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        // Request permission
        const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
        if (newStatus !== 'granted') {
          console.log('Location permission denied');
          return;
        }
        status = newStatus;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 10000,
      });
      
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      
      setUserLocation(coords);
      console.log('✅ User location set:', coords.latitude, coords.longitude);
    } catch (error) {
      console.error('❌ Error getting location:', error);
      // Don't block the app if location fails
    }
  };

  const loadMapPins = async () => {
    try {
      const mapPins = await apiService.getMapPins();
      setAllPins(mapPins);
    } catch (error) {
      console.error('Failed to load map pins:', error);
      setAllPins([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter pins based on search query
  const filteredPins = useMemo(() => {
    if (!searchQuery.trim()) {
      return allPins;
    }
    const query = searchQuery.toLowerCase();
    return allPins.filter(pin =>
      pin.title.toLowerCase().includes(query) ||
      (pin.description && pin.description.toLowerCase().includes(query))
    );
  }, [allPins, searchQuery]);

  // Generate map HTML
  const mapHtml = useMemo(() => {
    // Use user location if available, otherwise use center of pins, or default
    let centerLat = 37.7749; // Default fallback
    let centerLng = -122.4194;
    let zoom = 15;

    if (userLocation) {
      centerLat = userLocation.latitude;
      centerLng = userLocation.longitude;
      zoom = 16;
    } else if (filteredPins.length > 0) {
      const latitudes = filteredPins.map(pin => pin.latitude);
      const longitudes = filteredPins.map(pin => pin.longitude);
      centerLat = (Math.min(...latitudes) + Math.max(...latitudes)) / 2;
      centerLng = (Math.min(...longitudes) + Math.max(...longitudes)) / 2;
      zoom = 13;
    }

    // Create markers
    const markers = filteredPins.map((pin) => {
      const color = pin.status === 'LOST' ? '#ef4444' : pin.status === 'FOUND' ? '#10b981' : '#6b7280';
      const title = pin.title.replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, ' ');
      
      return `
        L.marker([${pin.latitude}, ${pin.longitude}])
          .addTo(map)
          .bindPopup(
            '<div style="padding: 10px; min-width: 180px; max-width: 250px;">' +
            '<div style="font-weight: 600; font-size: 15px; color: #111; margin-bottom: 6px; line-height: 1.3;">${title}</div>' +
            '<div style="display: inline-block; padding: 3px 8px; background-color: ${color}; color: white; font-size: 11px; font-weight: 600; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px;">${pin.status}</div>' +
            '</div>',
            { className: 'custom-popup' }
          )
          .setIcon(L.divIcon({
            className: 'custom-marker',
            html: '<div style="background-color: ${color}; width: 26px; height: 26px; border-radius: 50%; border: 3px solid white; box-shadow: 0 3px 10px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; cursor: pointer;"><div style="width: 10px; height: 10px; background-color: white; border-radius: 50%;"></div></div>',
            iconSize: [26, 26],
            iconAnchor: [13, 13],
            popupAnchor: [0, -13]
          }));
      `;
    }).join('\n');

    // Add user location marker
    const userMarker = userLocation ? `
      L.marker([${userLocation.latitude}, ${userLocation.longitude}])
        .addTo(map)
        .setIcon(L.divIcon({
          className: 'user-marker',
          html: '<div style="background-color: #003071; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);"></div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        }))
        .bindPopup('<div style="padding: 4px; font-size: 12px; font-weight: bold;">Your Location</div>');
    ` : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { margin: 0; padding: 0; overflow: hidden; }
          #map { height: 100vh; width: 100%; }
          .leaflet-popup-content-wrapper {
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            padding: 0;
          }
          .leaflet-popup-content { margin: 0; padding: 0; }
          .leaflet-popup-tip {
            background: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .leaflet-control-attribution {
            font-size: 10px;
            background: rgba(255,255,255,0.8);
            padding: 2px 4px;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
          const map = L.map('map', {
            zoomControl: true,
            attributionControl: true,
            scrollWheelZoom: true,
            doubleClickZoom: true,
            boxZoom: true,
            dragging: true,
            touchZoom: true
          }).setView([${centerLat}, ${centerLng}], ${zoom});
          
          L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
          }).addTo(map);
          
          ${userMarker}
          ${markers}
          
          ${filteredPins.length > 0 ? `
            const group = new L.featureGroup([${filteredPins.map(p => `L.marker([${p.latitude}, ${p.longitude}])`).join(',')}]);
            ${userLocation ? `group.addLayer(L.marker([${userLocation.latitude}, ${userLocation.longitude}]));` : ''}
            map.fitBounds(group.getBounds().pad(0.1));
          ` : userLocation ? `map.setView([${userLocation.latitude}, ${userLocation.longitude}], 16);` : ''}
        </script>
      </body>
      </html>
    `;
  }, [filteredPins, userLocation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
      </View>

      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search items by name or description..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <Text style={styles.resultCount}>
            {filteredPins.length} {filteredPins.length === 1 ? 'item' : 'items'} found
          </Text>
        )}
      </View>

      <View style={styles.mapContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading map...</Text>
          </View>
        ) : (
          <WebView
            source={{ html: mapHtml }}
            style={styles.map}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            key={filteredPins.length + (userLocation ? 1 : 0)} // Force re-render when pins change
          />
        )}
      </View>

      <View style={styles.legend}>
        {userLocation && (
          <View style={styles.legendItem}>
            <View style={[styles.marker, { backgroundColor: '#003071' }]} />
            <Text style={styles.legendText}>You</Text>
          </View>
        )}
        <View style={styles.legendItem}>
          <View style={[styles.marker, { backgroundColor: '#ef4444' }]} />
          <Text style={styles.legendText}>Lost</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.marker, { backgroundColor: '#10b981' }]} />
          <Text style={styles.legendText}>Found</Text>
        </View>
      </View>
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
  searchSection: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInput: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    fontSize: 16,
  },
  resultCount: {
    marginTop: 8,
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 20,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  marker: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 6,
    borderWidth: 1.5,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  legendText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
});




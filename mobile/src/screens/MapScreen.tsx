import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';

export default function MapScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Map View</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapIcon}>🗺️</Text>
          <Text style={styles.placeholderTitle}>Map Coming Soon</Text>
          <Text style={styles.placeholderText}>
            Interactive map showing all lost and found item locations across campus
          </Text>
        </View>

        <View style={styles.legendSection}>
          <Text style={styles.legendTitle}>Legend</Text>
          <View style={styles.legendItem}>
            <View style={[styles.marker, styles.lostMarker]} />
            <Text style={styles.legendText}>Lost Items</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.marker, styles.foundMarker]} />
            <Text style={styles.legendText}>Found Items</Text>
          </View>
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
  content: {
    flex: 1,
    padding: 20,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
  },
  mapIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  legendSection: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  marker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  lostMarker: {
    backgroundColor: '#ef4444',
  },
  foundMarker: {
    backgroundColor: '#10b981',
  },
  legendText: {
    fontSize: 14,
    color: '#666',
  },
});


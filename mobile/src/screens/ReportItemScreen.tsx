import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export default function ReportItemScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Report Item</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.box}>
          <Text style={styles.boxTitle}>Coming Soon</Text>
          <Text style={styles.boxText}>This screen will allow you to report lost or found items.</Text>
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
    backgroundColor: '#3b82f6',
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
  box: {
    backgroundColor: '#e0f2fe',
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  boxTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0369a1',
    marginBottom: 10,
  },
  boxText: {
    fontSize: 14,
    color: '#0c4a6e',
  },
});


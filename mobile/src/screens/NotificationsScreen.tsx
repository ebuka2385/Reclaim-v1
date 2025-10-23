import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';

export default function NotificationsScreen() {
  const notifications = [
    { id: '1', title: 'Possible Match Found', message: 'Your lost backpack might match a recent report', time: '2 hours ago', read: false },
    { id: '2', title: 'Item Claimed', message: 'Someone claimed your found iPhone', time: '1 day ago', read: true },
    { id: '3', title: 'New Item Nearby', message: 'A student ID was found near Kelvin Smith Library', time: '3 days ago', read: true },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {notifications.map((notification) => (
            <View key={notification.id} style={[styles.card, !notification.read && styles.unreadCard]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{notification.title}</Text>
                {!notification.read && <View style={styles.unreadDot} />}
              </View>
              <Text style={styles.message}>{notification.message}</Text>
              <Text style={styles.time}>{notification.time}</Text>
            </View>
          ))}
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
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  unreadCard: {
    backgroundColor: '#e6f0ff',
    borderColor: '#003071',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#003071',
  },
  message: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  time: {
    fontSize: 12,
    color: '#9ca3af',
  },
});


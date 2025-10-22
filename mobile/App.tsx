import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { HomeScreen, ReportItemScreen, ViewItemsScreen } from './src/screens';
import BottomNav from './src/screens/components/BottomNav';
import { Screen } from './src/types';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');

  const renderScreen = () => {
    if (screen === 'home') return <HomeScreen />;
    if (screen === 'report') return <ReportItemScreen />;
    return <ViewItemsScreen />;
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {renderScreen()}
      </View>
      <BottomNav currentScreen={screen} onNavigate={setScreen} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
});


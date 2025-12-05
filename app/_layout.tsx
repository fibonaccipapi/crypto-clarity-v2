import { Stack } from 'expo-router';
import { WalletProvider } from './contexts/WalletContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { View, StatusBar } from 'react-native';
import { BottomNav } from './components/BottomNav';

export default function RootLayout() {
  return (
    <WalletProvider>
      <ThemeProvider>
        <View style={{ flex: 1, backgroundColor: '#0A0A0F' }}>
          <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#0A0A0F' },
              animation: 'fade',
            }}
          />
          <BottomNav />
        </View>
      </ThemeProvider>
    </WalletProvider>
  );
}

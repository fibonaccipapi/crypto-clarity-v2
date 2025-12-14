import { Stack } from 'expo-router';
import { WalletProvider } from './contexts/WalletContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { StatsProvider } from './contexts/StatsContext';
import { View, StatusBar } from 'react-native';
import { BottomNav } from './components/BottomNav';
import { dynamicClient } from './lib/dynamicClient';

export default function RootLayout() {
  return (
    <>
      <dynamicClient.reactNative.WebView />
      <WalletProvider>
        <StatsProvider>
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
        </StatsProvider>
      </WalletProvider>
    </>
  );
}

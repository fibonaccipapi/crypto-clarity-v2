import { Stack } from 'expo-router';
import { WalletProvider } from './contexts/WalletContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { StatsProvider } from './contexts/StatsContext';
import { View, StatusBar } from 'react-native';
import { BottomNav } from './components/BottomNav';
import { DynamicContextProvider } from '@dynamic-labs/react-native-extension';
import { ReactNativeExtension } from '@dynamic-labs/react-native-extension';

export default function RootLayout() {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: '2873c4d4-13c6-4478-866d-e6b9a2177f85',
        appName: 'Crypto Clarity',
        appLogoUrl: 'https://example.com/logo.png',
        initialAuthenticationMode: 'connect-only',
        mobileExperience: 'fullScreen',
        walletConnectors: [],
        cssOverrides: `
          .dynamic-widget-modal-overlay {
            background: rgba(0, 0, 0, 0.9);
          }
          .dynamic-widget-card {
            background: linear-gradient(180deg, rgba(30, 30, 35, 0.95), rgba(10, 10, 15, 0.98));
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
          }
          .dynamic-widget-button-primary {
            background: linear-gradient(135deg, rgba(255, 107, 203, 0.9), rgba(255, 107, 203, 0.7));
            border: 1px solid rgba(255, 107, 203, 0.5);
          }
          .dynamic-widget-button-primary:hover {
            background: linear-gradient(135deg, rgba(255, 107, 203, 1), rgba(255, 107, 203, 0.8));
          }
          .dynamic-widget-text {
            color: #FFFFFF;
          }
        `,
      }}
      walletConnectorExtensions={[ReactNativeExtension]}
    >
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
    </DynamicContextProvider>
  );
}

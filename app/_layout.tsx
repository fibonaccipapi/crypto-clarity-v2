import { Stack } from 'expo-router';
import { WalletProvider, useWallet } from './contexts/WalletContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { StatsProvider } from './contexts/StatsContext';
import { View, StatusBar, Platform } from 'react-native';
import { BottomNav } from './components/BottomNav';
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';
import { dynamicClient } from './lib/dynamicClient';

const isWeb = Platform.OS === 'web';

function AppContent() {
  const { address } = useWallet();

  return (
    <StatsProvider userId={address}>
      <ThemeProvider>
        <View style={{ flex: 1, backgroundColor: '#0A0A0F' }}>
          {!isWeb && <dynamicClient.reactNative.WebView />}
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
  );
}

export default function RootLayout() {
  const content = (
    <WalletProvider>
      <AppContent />
    </WalletProvider>
  );

  if (isWeb) {
    return (
      <DynamicContextProvider
        settings={{
          environmentId: '2873c4d4-13c6-4478-866d-e6b9a2177f85',
          organizationId: '16bf06bb-afdb-4dba-b812-3f2e8f168a08',
          appName: 'Crypto Clarity',
          walletsFilter: (walletOptions) => walletOptions,
          cssOverrides: `
            .dynamic-widget-modal-overlay {
              background: rgba(0, 0, 0, 0.95);
            }
            .dynamic-widget-card {
              background: linear-gradient(180deg, rgba(30, 30, 35, 0.95), rgba(10, 10, 15, 0.98));
              border: 1px solid rgba(255, 107, 203, 0.3);
              border-radius: 20px;
            }
            .dynamic-widget-button-primary {
              background: linear-gradient(135deg, #FF6BCB, rgba(255, 107, 203, 0.8));
            }
          `,
        }}
      >
        {content}
      </DynamicContextProvider>
    );
  }

  return content;
}

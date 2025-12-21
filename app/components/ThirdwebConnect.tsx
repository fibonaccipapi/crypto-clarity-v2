import { ConnectButton, darkTheme, useActiveAccount } from 'thirdweb/react';
import { createThirdwebClient } from 'thirdweb';
import { inAppWallet, createWallet } from 'thirdweb/wallets';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useWallet } from '../contexts/WalletContext';

const clientId = process.env.EXPO_PUBLIC_THIRDWEB_CLIENT_ID;
const client = clientId ? createThirdwebClient({ clientId }) : null;

const wallets = [
  inAppWallet({
    auth: {
      options: ['google', 'discord', 'telegram', 'farcaster', 'email', 'x', 'phone'],
    },
  }),
  createWallet('io.metamask'),
  createWallet('com.coinbase.wallet'),
  createWallet('me.rainbow'),
  createWallet('io.rabby'),
  createWallet('io.zerion.wallet'),
];

export function ThirdwebConnect() {
  const account = useActiveAccount();
  const { disconnect, connected } = useWallet();

  if (!client) {
    console.warn('Missing EXPO_PUBLIC_THIRDWEB_CLIENT_ID for thirdweb ConnectButton');
    return <Text style={{ color: '#fff' }}>Connect unavailable: missing client id</Text>;
  }

  // If connected (check both Thirdweb account AND WalletContext state), show disconnect button
  if (account && connected) {
    return (
      <TouchableOpacity
        onPress={() => disconnect()}
        style={styles.disconnectButton}
      >
        <Text style={styles.disconnectText}>Disconnect</Text>
      </TouchableOpacity>
    );
  }

  // If not connected, show connect button
  return (
    <ConnectButton
      client={client}
      connectModal={{ showThirdwebBranding: false, size: 'compact' }}
      theme={darkTheme({
        colors: {
          selectedTextColor: 'hsl(271, 91%, 65%)',
          selectedTextBg: 'hsl(0, 0%, 0%)',
          accentText: 'hsl(271, 91%, 65%)',
          separatorLine: 'hsl(321, 100%, 71%)',
          tertiaryBg: 'hsl(0, 0%, 11%)',
          borderColor: 'hsl(321, 100%, 71%)',
          accentButtonBg: 'hsl(321, 100%, 71%)',
          accentButtonText: 'hsl(0, 0%, 100%)',
          primaryButtonBg: 'hsl(271, 91%, 65%)',
          primaryButtonText: 'hsl(0, 0%, 100%)',
          secondaryButtonHoverBg: 'hsl(271, 91%, 65%)',
          connectedButtonBg: 'hsl(271, 91%, 65%)',
          secondaryIconColor: 'hsl(321, 100%, 71%)',
          secondaryIconHoverColor: 'hsl(271, 91%, 65%)',
          secondaryIconHoverBg: 'hsl(271, 91%, 65%)',
          scrollbarBg: 'hsl(0, 0%, 11%)',
        },
      })}
      wallets={wallets}
    />
  );
}

const styles = StyleSheet.create({
  disconnectButton: {
    backgroundColor: '#FF6BCB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 203, 0.4)',
  },
  disconnectText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
});

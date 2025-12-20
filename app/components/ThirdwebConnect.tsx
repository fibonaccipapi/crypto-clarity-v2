import { ConnectButton, darkTheme } from 'thirdweb/react';
import { createThirdwebClient } from 'thirdweb';
import { inAppWallet, createWallet } from 'thirdweb/wallets';
import { Text } from 'react-native';

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
  if (!client) {
    // Avoid runtime crash if env var is missing; render a small hint instead.
    console.warn('Missing EXPO_PUBLIC_THIRDWEB_CLIENT_ID for thirdweb ConnectButton');
    return <Text style={{ color: '#fff' }}>Connect unavailable: missing client id</Text>;
  }

  return (
    <ConnectButton
      client={client}
      connectModal={{ showThirdwebBranding: false, size: 'compact' }}
      detailsModal={{
        showThirdwebBranding: false,
      }}
      detailsButton={{
        displayBalanceToken: undefined,
      }}
      theme={darkTheme({
        colors: {
          selectedTextColor: 'hsl(132, 100%, 50%)',
          selectedTextBg: 'hsl(0, 0%, 0%)',
          accentText: 'hsl(132, 100%, 50%)',
          separatorLine: 'hsl(321, 100%, 71%)',
          tertiaryBg: 'hsl(0, 0%, 11%)',
          borderColor: 'hsl(321, 100%, 71%)',
          accentButtonBg: 'hsl(321, 100%, 71%)',
          accentButtonText: 'hsl(0, 0%, 100%)',
          primaryButtonBg: 'hsl(271, 91%, 65%)',
          primaryButtonText: 'hsl(0, 0%, 100%)',
          secondaryButtonHoverBg: 'hsl(132, 100%, 50%)',
          connectedButtonBg: 'hsl(132, 100%, 50%)',
          secondaryIconColor: 'hsl(321, 100%, 71%)',
          secondaryIconHoverColor: 'hsl(271, 91%, 65%)',
          secondaryIconHoverBg: 'hsl(132, 100%, 50%)',
          scrollbarBg: 'hsl(0, 0%, 11%)',
        },
      })}
      wallets={wallets}
    />
  );
}

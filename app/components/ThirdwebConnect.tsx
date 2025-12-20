import { ConnectButton } from 'thirdweb/react';
import { createThirdwebClient } from 'thirdweb';

const clientId = process.env.EXPO_PUBLIC_THIRDWEB_CLIENT_ID;

if (!clientId) {
  console.warn('Missing EXPO_PUBLIC_THIRDWEB_CLIENT_ID for thirdweb ConnectButton');
}

const client = createThirdwebClient({ clientId: clientId || '' });

export function ThirdwebConnect() {
  return (
    <ConnectButton
      client={client}
      auth={{
        // TODO: wire these to your backend endpoints for session-based auth
        getLoginPayload: async ({ address }) => {
          return {
            message: `Login ${address}`,
            uri: '',
            version: '1',
            chain_id: '1',
            nonce: '0',
            issued_at: new Date().toISOString(),
          } as any;
        },
        doLogin: async () => {
          // send signed payload to your backend to verify
          return { ok: true } as any;
        },
        isLoggedIn: async () => {
          // ask backend if user session is active
          return false;
        },
        doLogout: async () => {
          // tell backend to clear session
        },
      }}
    />
  );
}

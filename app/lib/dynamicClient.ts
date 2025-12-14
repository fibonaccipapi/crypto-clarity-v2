import { createClient } from '@dynamic-labs/client';
import { ReactNativeExtension } from '@dynamic-labs/react-native-extension';
import { ViemExtension } from '@dynamic-labs/viem-extension';
import { SolanaExtension } from '@dynamic-labs/solana-extension';
import { ZeroDevSmartWalletConnectors } from '@dynamic-labs/zerodev-extension';

export const dynamicClient = createClient({
  environmentId: '2873c4d4-13c6-4478-866d-e6b9a2177f85',
  appName: 'Crypto Clarity',
  appLogoUrl: 'https://demo.dynamic.xyz/favicon-32x32.png',
})
  .extend(ViemExtension())
  .extend(SolanaExtension())
  .extend(ZeroDevSmartWalletConnectors())
  .extend(
    ReactNativeExtension({
      appOrigin: 'http://localhost:8081'
    })
  );

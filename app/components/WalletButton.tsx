import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useWallet } from '../contexts/WalletContext';

export function WalletButton() {
  const { connected, connecting, address, connect, disconnect } = useWallet();

  if (connected && address) {
    return (
      <TouchableOpacity onPress={disconnect} style={styles.buttonWrapper}>
        <LinearGradient
          colors={['rgba(255, 107, 203, 0.95)', 'rgba(236, 72, 153, 0.98)', 'rgba(219, 39, 119, 1)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.button}
        >
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.shine}
          />
          <Text style={styles.buttonText}>
            {address.slice(0, 6)}...{address.slice(-4)}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      onPress={connect}
      disabled={connecting}
      style={styles.buttonWrapper}
    >
      <LinearGradient
        colors={['rgba(255, 107, 203, 0.95)', 'rgba(236, 72, 153, 0.98)', 'rgba(219, 39, 119, 1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.button}
      >
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.shine}
        />
        <Text style={styles.buttonText}>
          {connecting ? 'Connecting...' : 'Connect'}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  shine: {
    position: 'absolute',
    top: -10,
    left: -10,
    width: '70%',
    height: '70%',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

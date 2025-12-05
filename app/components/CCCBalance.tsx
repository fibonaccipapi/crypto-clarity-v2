import { View, Text, StyleSheet } from 'react-native';
import { useWallet } from '../contexts/WalletContext';

export function CCCBalance() {
  const { balance } = useWallet();

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>💰</Text>
      <Text style={styles.label}>CCC</Text>
      <Text style={styles.balance}>{balance.toLocaleString()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 80, 40, 0.4)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 255, 51, 0.6)',
    gap: 6,
  },
  icon: {
    fontSize: 16,
  },
  label: {
    color: '#00FF33',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  balance: {
    color: '#00FF33',
    fontSize: 16,
    fontWeight: '900',
  },
});

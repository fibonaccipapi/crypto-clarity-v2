import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BALANCE_KEY = '@ccc_balance';

interface WalletContextType {
  connected: boolean;
  connecting: boolean;
  address: string | null;
  balance: number;
  connect: () => Promise<void>;
  disconnect: () => void;
  addBalance: (amount: number) => void;
  justConnected: boolean;
  clearJustConnected: () => void;
  resetWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [justConnected, setJustConnected] = useState(false);

  useEffect(() => {
    loadBalance();
    checkPreviousConnection();
  }, []);

  const checkPreviousConnection = async () => {
    try {
      const savedAddress = await AsyncStorage.getItem('@wallet_address');
      if (savedAddress) {
        setAddress(savedAddress);
        setConnected(true);
      }
    } catch (error) {
      console.log('Error checking previous connection:', error);
    }
  };

  const loadBalance = async () => {
    try {
      const savedBalance = await AsyncStorage.getItem(BALANCE_KEY);
      if (savedBalance) {
        setBalance(parseInt(savedBalance));
      }
    } catch (error) {
      console.log('Error loading balance:', error);
    }
  };

  const saveBalance = async (newBalance: number) => {
    try {
      await AsyncStorage.setItem(BALANCE_KEY, newBalance.toString());
    } catch (error) {
      console.log('Error saving balance:', error);
    }
  };

  const connect = async () => {
    setConnecting(true);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const demoAddress = '0x' + Math.random().toString(36).substring(2, 15).toUpperCase();
    
    setAddress(demoAddress);
    setConnected(true);
    setConnecting(false);
    setJustConnected(true);
    
    await AsyncStorage.setItem('@wallet_address', demoAddress);
    
    console.log('✅ Connected in demo mode');
  };

  const disconnect = async () => {
    setConnected(false);
    setAddress(null);
    setJustConnected(false);
    await AsyncStorage.removeItem('@wallet_address');
  };

  const addBalance = (amount: number) => {
    const newBalance = balance + amount;
    setBalance(newBalance);
    saveBalance(newBalance);
  };

  const clearJustConnected = () => {
    setJustConnected(false);
  };

  const resetWallet = async () => {
    try {
      await AsyncStorage.multiRemove(['@wallet_address', BALANCE_KEY]);
      setConnected(false);
      setAddress(null);
      setBalance(0);
      setJustConnected(false);
    } catch (error) {
      console.log('Error resetting wallet:', error);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        connected,
        connecting,
        address,
        balance,
        connect,
        disconnect,
        addBalance,
        justConnected,
        clearJustConnected,
        resetWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

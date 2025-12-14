import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { dynamicClient } from '../lib/dynamicClient';

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
  const [balance, setBalance] = useState(0);
  const [justConnected, setJustConnected] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    loadBalance();

    // Listen for Dynamic auth state changes
    const unsubscribe = dynamicClient.auth.onAuthSuccess(() => {
      const user = dynamicClient.auth.getUser();
      setConnected(true);
      setAddress(user?.verifiedCredentials?.[0]?.address || user?.email || null);
      setJustConnected(true);
    });

    return () => unsubscribe();
  }, []);

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
    try {
      setConnecting(true);
      await dynamicClient.auth.login();
    } catch (error) {
      console.log('Error connecting:', error);
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = async () => {
    try {
      await dynamicClient.auth.logout();
      setConnected(false);
      setAddress(null);
      setJustConnected(false);
    } catch (error) {
      console.log('Error disconnecting:', error);
    }
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
      await AsyncStorage.removeItem(BALANCE_KEY);
      await dynamicClient.auth.logout();
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

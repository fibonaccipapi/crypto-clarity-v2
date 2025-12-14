import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDynamicContext } from '@dynamic-labs/react-hooks';

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
  const dynamicContext = useDynamicContext();
  const { primaryWallet, user, setShowAuthFlow, isAuthenticated } = dynamicContext || {};

  const [balance, setBalance] = useState(0);
  const [justConnected, setJustConnected] = useState(false);

  const connected = isAuthenticated || false;
  const connecting = false;
  const address = primaryWallet?.address || user?.email || null;

  useEffect(() => {
    loadBalance();
  }, []);

  useEffect(() => {
    if (isAuthenticated && !justConnected) {
      setJustConnected(true);
    }
  }, [isAuthenticated]);

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
    if (setShowAuthFlow) {
      setShowAuthFlow(true);
    }
  };

  const disconnect = async () => {
    if (dynamicContext?.handleLogOut) {
      await dynamicContext.handleLogOut();
    }
    setJustConnected(false);
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
      setBalance(0);
      setJustConnected(false);
      if (dynamicContext?.handleLogOut) {
        await dynamicContext.handleLogOut();
      }
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

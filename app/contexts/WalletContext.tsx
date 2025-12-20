import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { dynamicClient } from '../lib/dynamicClient';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useActiveAccount, useDisconnect } from 'thirdweb/react';

const isWeb = Platform.OS === 'web';

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
  // Dynamic Labs context (if on web)
  const webContext = isWeb ? useDynamicContext() : null;
  const { setShowAuthFlow, primaryWallet, user, handleLogOut } = webContext || {};

  // Thirdweb hooks
  const thirdwebAccount = useActiveAccount();
  const { disconnect: thirdwebDisconnect } = useDisconnect();

  const [balance, setBalance] = useState(0);
  const [justConnected, setJustConnected] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    // Check Thirdweb authentication first (works on all platforms)
    if (thirdwebAccount?.address) {
      console.log('Thirdweb account connected:', thirdwebAccount.address);
      setConnected(true);
      setAddress(thirdwebAccount.address);
      setJustConnected(true);
      loadBalance(thirdwebAccount.address);
      return;
    }

    if (isWeb) {
      // On web, check Dynamic Labs authentication
      if (primaryWallet || user) {
        const userAddress = primaryWallet?.address || user?.email || null;
        console.log('Dynamic Labs account connected:', userAddress);
        setConnected(true);
        setAddress(userAddress);
        loadBalance(userAddress);
      } else {
        // No wallet connected
        setConnected(false);
        setAddress(null);
      }
    } else {
      // On mobile, listen for Dynamic auth events
      const unsubscribe = dynamicClient.auth.on('authSuccess', (authToken) => {
        console.log('Dynamic auth success!', authToken);
        setConnected(true);
        setJustConnected(true);

        dynamicClient.auth.refreshUser().then(() => {
          console.log('User refreshed');
        });
      });

      return () => {
        dynamicClient.auth.off('authSuccess', unsubscribe);
      };
    }
  }, [thirdwebAccount, primaryWallet, user]);

  // Load balance when address changes
  useEffect(() => {
    if (address) {
      loadBalance(address);
    } else {
      setBalance(0);
    }
  }, [address]);

  const getBalanceKey = (userId: string | null) => {
    return userId ? `${userId}_balance` : `guest_balance`;
  };

  const loadBalance = async (userId: string | null) => {
    try {
      const savedBalance = await AsyncStorage.getItem(getBalanceKey(userId));
      if (savedBalance) {
        setBalance(parseInt(savedBalance));
      } else {
        setBalance(0);
      }
    } catch (error) {
      console.log('Error loading balance:', error);
    }
  };

  const saveBalance = async (newBalance: number) => {
    try {
      await AsyncStorage.setItem(getBalanceKey(address), newBalance.toString());
    } catch (error) {
      console.log('Error saving balance:', error);
    }
  };

  const connect = async () => {
    try {
      setConnecting(true);

      if (isWeb && setShowAuthFlow) {
        // Use web SDK
        setShowAuthFlow(true);
      } else {
        // Use mobile SDK
        dynamicClient.ui.auth.show();
      }
    } catch (error) {
      console.log('Error connecting:', error);
    } finally {
      if (isWeb) {
        setConnecting(false);
      }
    }
  };

  const disconnect = async () => {
    try {
      if (isWeb && handleLogOut) {
        // Use web SDK
        await handleLogOut();
      } else {
        // Use mobile SDK
        await dynamicClient.auth.logout();
      }

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
      // Note: We don't remove the balance from storage - it stays for when user logs back in
      // Just reset the current session state

      if (isWeb && handleLogOut) {
        await handleLogOut();
      } else {
        await dynamicClient.auth.logout();
      }

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

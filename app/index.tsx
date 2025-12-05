import { View, Text, ScrollView, TouchableOpacity, Modal, StyleSheet, AppState, Image } from 'react-native';
import { Link } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { WalletButton } from './components/WalletButton';
import { CCCBalance } from './components/CCCBalance';
import { useWallet } from './contexts/WalletContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dailyTermsData from './data/dailyTerms.json';

const LAST_LOGIN_KEY = '@last_login_timestamp';
const STREAK_KEY = '@login_streak';
const LAST_TERM_DAY_KEY = '@last_term_day';

const GlassCard = ({ children, style }: any) => {
  return (
    <LinearGradient
      colors={['rgba(30, 30, 35, 0.95)', 'rgba(10, 10, 15, 0.98)', 'rgba(0, 0, 0, 1)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[styles.glassCardBase, style]}
    >
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.06)', 'rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.diagonalShine}
      />
      {children}
    </LinearGradient>
  );
};

export default function HomeScreen() {
  const { connected, addBalance, justConnected, clearJustConnected } = useWallet();
  
  const [showDailyLogin, setShowDailyLogin] = useState(false);
  const [streak, setStreak] = useState(1);
  const [cccReward, setCccReward] = useState(5);
  const [dailyTerm, setDailyTerm] = useState(dailyTermsData.terms[0]);
  const refreshTimeoutRef = useRef<any>(null);
  const refreshIntervalRef = useRef<any>(null);

  useEffect(() => {
    loadDailyTerm();
    // schedule refresh at next local midnight and then every 24h
    const scheduleRefresh = () => {
      // clear any existing timers
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }

      const now = new Date();
      const nextMidnight = new Date(now);
      nextMidnight.setHours(24, 0, 0, 0);
      const msUntilMidnight = nextMidnight.getTime() - now.getTime();

      refreshTimeoutRef.current = setTimeout(() => {
        loadDailyTerm();
        // after the first midnight trigger, run every 24 hours
        refreshIntervalRef.current = setInterval(loadDailyTerm, 24 * 60 * 60 * 1000);
      }, msUntilMidnight);
    };

    scheduleRefresh();

    // refresh when app becomes active (e.g., user returns to app)
    const sub = AppState.addEventListener?.('change', (state) => {
      if (state === 'active') loadDailyTerm();
    });

    return () => {
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
      if (sub && typeof sub.remove === 'function') sub.remove();
    };
  }, []);

  useEffect(() => {
    if (connected && !justConnected) {
      checkDailyLogin();
    }
    if (justConnected) {
      clearJustConnected();
    }
  }, [connected, justConnected]);

  const loadDailyTerm = async () => {
    try {
      const now = new Date();
      const currentDay = Math.floor(now.getTime() / (1000 * 60 * 60 * 24));
      const lastTermDay = await AsyncStorage.getItem(LAST_TERM_DAY_KEY);
      const lastDay = lastTermDay ? parseInt(lastTermDay) : 0;
      
      if (currentDay !== lastDay) {
        await AsyncStorage.setItem(LAST_TERM_DAY_KEY, currentDay.toString());
      }
      
      const termIndex = currentDay % dailyTermsData.terms.length;
      setDailyTerm(dailyTermsData.terms[termIndex]);
    } catch (error) {
      console.error('Error loading daily term:', error);
      setDailyTerm(dailyTermsData.terms[0]);
    }
  };

  const checkDailyLogin = async () => {
    try {
      const now = new Date();
      const currentDay = Math.floor(now.getTime() / (1000 * 60 * 60 * 24));
      const lastLoginStr = await AsyncStorage.getItem(LAST_LOGIN_KEY);
      const lastLoginDay = lastLoginStr ? parseInt(lastLoginStr) : 0;
      
      if (currentDay > lastLoginDay) {
        const storedStreak = await AsyncStorage.getItem(STREAK_KEY);
        let currentStreak = storedStreak ? parseInt(storedStreak) : 0;
        
        if (currentDay === lastLoginDay + 1) {
          currentStreak += 1;
        } else if (currentDay > lastLoginDay + 1) {
          currentStreak = 1;
        }
        
        let reward = 5;
        if (currentStreak === 7) reward += 25;
        if (currentStreak === 30) reward += 100;
        
        setStreak(currentStreak);
        setCccReward(reward);
        
        await AsyncStorage.setItem(LAST_LOGIN_KEY, currentDay.toString());
        await AsyncStorage.setItem(STREAK_KEY, currentStreak.toString());
        
        addBalance(reward);
        setShowDailyLogin(true);
      }
    } catch (error) {
      console.error('Daily login check error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>💎</Text>
          </View>
          
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>CRYPTO CLARITY</Text>
            <Text style={styles.headerSubtitle}>DEMYSTIFYING CRYPTO, ONE TERM AT A TIME</Text>
          </View>
        </View>

        <View style={styles.walletSection}>
          {connected && <CCCBalance />}
          <WalletButton />
        </View>

        <View style={styles.dailyTermContainer}>
          <GlassCard>
            <View style={styles.dailyTermContent}>
              <View style={styles.dailyTermHeader}>
                <View style={styles.dailyBadge}>
                  <Text style={styles.dailyBadgeText}>DAILY TERM</Text>
                </View>
                <View style={styles.categoryPill}>
                  <Text style={styles.categoryPillText}>{dailyTerm.category}</Text>
                </View>
              </View>
              
              <Text style={styles.dailyTermTitle}>{dailyTerm.term}</Text>
              <Text style={styles.dailyTermDefinition}>{dailyTerm.definition}</Text>
            </View>
          </GlassCard>
        </View>

        <View style={styles.mainGrid}>
          <Link href="/learn" asChild>
            <TouchableOpacity style={styles.gridItem}>
              <LinearGradient
                colors={['rgba(0, 255, 51, 0.8)', 'rgba(0, 255, 51, 0.4)', 'rgba(0, 255, 51, 0.1)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.learnIconBorder}
              >
                <Image
                  source={require('../assets/images/learn-icon.png')}
                  style={styles.learnIconImage}
                  resizeMode="cover"
                />
              </LinearGradient>
              <Text style={styles.iconLabel}>Learn</Text>
              <Text style={styles.iconSubtitle}>7 Categories</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/quiz" asChild>
            <TouchableOpacity style={styles.gridItem}>
              <LinearGradient
                colors={['rgba(255, 107, 203, 0.8)', 'rgba(255, 107, 203, 0.4)', 'rgba(255, 107, 203, 0.1)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.quizIconBorder}
              >
                <Image
                  source={require('../assets/images/quiz-icon.png')}
                  style={styles.quizIconImage}
                  resizeMode="cover"
                />
              </LinearGradient>
              <Text style={styles.iconLabel}>Quiz</Text>
              <Text style={styles.iconSubtitle}>Test Skills</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/flashcards" asChild>
            <TouchableOpacity style={styles.gridItem}>
              <LinearGradient
                colors={['rgba(0, 255, 51, 0.8)', 'rgba(0, 255, 51, 0.4)', 'rgba(0, 255, 51, 0.1)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gamesIconBorder}
              >
                <Image
                  source={require('../assets/images/games-icon.png')}
                  style={styles.gamesIconImage}
                  resizeMode="cover"
                />
              </LinearGradient>
              <Text style={styles.iconLabel}>Games</Text>
              <Text style={styles.iconSubtitle}>Play & Learn</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/profile" asChild>
            <TouchableOpacity style={styles.gridItem}>
              <LinearGradient
                colors={['rgba(255, 107, 203, 0.8)', 'rgba(255, 107, 203, 0.4)', 'rgba(255, 107, 203, 0.1)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.profileIconBorder}
              >
                <Image
                  source={require('../assets/images/profile-icon.png')}
                  style={styles.profileIconImage}
                  resizeMode="cover"
                />
              </LinearGradient>
              <Text style={styles.iconLabel}>Profile</Text>
              <Text style={styles.iconSubtitle}>Your Stats</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>

      <Modal visible={showDailyLogin} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Welcome Back! 🔥</Text>
            <Text style={styles.modalStreak}>{streak}</Text>
            <Text style={styles.modalStreakLabel}>Day Streak</Text>
            <Text style={styles.modalReward}>+{cccReward} CCC</Text>
            
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setShowDailyLogin(false)}
            >
              <Text style={styles.modalButtonText}>LET'S GO! 🚀</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 12,
    gap: 16,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoEmoji: {
    fontSize: 40,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 9,
    color: '#555',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  walletSection: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  dailyTermContainer: {
    marginHorizontal: 20,
    marginBottom: 32,
  },
  glassCardBase: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    overflow: 'hidden',
    position: 'relative',
  },
  diagonalShine: {
    position: 'absolute',
    top: -20,
    left: -20,
    width: '60%',
    height: '60%',
    borderTopLeftRadius: 24,
  },
  dailyTermContent: {
    padding: 20,
  },
  dailyTermHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dailyBadge: {
    backgroundColor: 'rgba(0, 255, 51, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 51, 0.5)',
  },
  dailyBadgeText: {
    color: '#00FF33',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  categoryPill: {
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.5)',
  },
  categoryPillText: {
    color: '#A855F7',
    fontSize: 11,
    fontWeight: '800',
  },
  dailyTermTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 12,
  },
  dailyTermDefinition: {
    fontSize: 14,
    color: '#CCC',
    lineHeight: 22,
  },
  mainGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 24,
    justifyContent: 'center',
  },
  gridItem: {
    width: '45%',
    alignItems: 'center',
  },
  iconButton: {
    width: 120,
    height: 120,
    borderRadius: 30,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 50,
  },
  profileIconBorder: {
    width: 120,
    height: 120,
    borderRadius: 30,
    padding: 3,
    marginBottom: 12,
  },
  profileIconImage: {
    width: '100%',
    height: '100%',
    borderRadius: 27,
  },
  gamesIconBorder: {
    width: 120,
    height: 120,
    borderRadius: 30,
    padding: 3,
    marginBottom: 12,
  },
  gamesIconImage: {
    width: '100%',
    height: '100%',
    borderRadius: 27,
  },
  learnIconBorder: {
    width: 120,
    height: 120,
    borderRadius: 30,
    padding: 3,
    marginBottom: 12,
  },
  learnIconImage: {
    width: '100%',
    height: '100%',
    borderRadius: 27,
  },
  quizIconBorder: {
    width: 120,
    height: 120,
    borderRadius: 30,
    padding: 3,
    marginBottom: 12,
  },
  quizIconImage: {
    width: '100%',
    height: '100%',
    borderRadius: 27,
  },
  iconLabel: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  iconSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#000',
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#00FF33',
    padding: 40,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#00FF33',
    marginBottom: 24,
  },
  modalStreak: {
    fontSize: 80,
    fontWeight: '900',
    color: '#FFF',
  },
  modalStreakLabel: {
    fontSize: 18,
    color: '#777',
    marginBottom: 24,
  },
  modalReward: {
    fontSize: 44,
    fontWeight: '900',
    color: '#00FF33',
    marginBottom: 32,
  },
  modalButton: {
    width: '100%',
    backgroundColor: '#00FF33',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 1,
  },
});

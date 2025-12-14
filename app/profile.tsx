import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from './contexts/ThemeContext';
import { useWallet } from './contexts/WalletContext';
import { useStats } from './contexts/StatsContext';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BADGES = [
  { id: 1, name: 'First Steps', description: 'Complete your first quiz', earned: true },
  { id: 2, name: 'Perfectionist', description: 'Get 100% on a quiz', earned: false },
  { id: 3, name: 'Month Master', description: '30 day login streak', earned: false },
  { id: 4, name: 'Wallet Wizard', description: 'Connect your wallet', earned: false },
  { id: 5, name: 'Fast Learner', description: 'Complete 5 quizzes in one day', earned: false },
  { id: 6, name: 'Quiz Master', description: 'Score 100% on any quiz', earned: false },
  { id: 7, name: 'Week Warrior', description: '7 day login streak', earned: false },
  { id: 8, name: 'Master Learner', description: 'Complete quizzes in all categories', earned: false },
  { id: 9, name: 'Crypto Pro', description: 'Reach level 10', earned: false },
  { id: 10, name: 'CCC Collector', description: 'Earn 1000 CCC total', earned: false },
];

const GlassCard = ({ children, style }: any) => {
  return (
    <LinearGradient
      colors={['rgba(30, 30, 35, 0.95)', 'rgba(10, 10, 15, 0.98)', 'rgba(0, 0, 0, 1)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[styles.glassCard, style]}
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

const ProgressBar = ({ progress, color = '#00FF33' }: any) => {
  return (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBar, { backgroundColor: `${color}33` }]}>
        <View 
          style={[
            styles.progressFill, 
            { 
              width: `${progress}%`,
              backgroundColor: color
            }
          ]} 
        />
      </View>
    </View>
  );
};

export default function ProfileScreen() {
  const { theme } = useTheme();
  const wallet = useWallet();
  const { connected, balance, address } = wallet;
  const stats = useStats();
  const [profile, setProfile] = useState(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const { level, xp, xpForNextLevel } = stats.calculateLevel(balance);
  const { accuracy, streak, quizzesCompleted, bestStreak, quizzesTodayCount, requiredQuizzesForStreak } = stats;

  const getProfileImageKey = () => {
    return address ? `${address}_profileImage` : `guest_profileImage`;
  };

  const earnedBadges = BADGES.map(badge => {
    let earned = false;
    if (badge.id === 1 && quizzesCompleted >= 1) earned = true;
    if (badge.id === 2 && accuracy === 100 && quizzesCompleted > 0) earned = true;
    if (badge.id === 3 && streak >= 30) earned = true;
    if (badge.id === 4 && connected) earned = true;
    if (badge.id === 5 && quizzesCompleted >= 5) earned = true;
    if (badge.id === 6 && accuracy === 100 && quizzesCompleted > 0) earned = true;
    if (badge.id === 7 && streak >= 7) earned = true;
    if (badge.id === 8 && quizzesCompleted >= 6) earned = true;
    if (badge.id === 9 && level >= 10) earned = true;
    if (badge.id === 10 && balance >= 1000) earned = true;
    return { ...badge, earned };
  });

  useEffect(() => {
    const loadProfile = async () => {
      setProfile({
        username: 'Crypto Learner',
        level,
        badges: earnedBadges.filter(b => b.earned),
      });

      const savedImage = await AsyncStorage.getItem(getProfileImageKey());
      if (savedImage) {
        // Clear invalid blob URLs (they don't persist across page reloads)
        if (savedImage.startsWith('blob:')) {
          await AsyncStorage.removeItem(getProfileImageKey());
          setProfileImage(null);
        } else {
          setProfileImage(savedImage);
        }
      } else {
        setProfileImage(null);
      }
    };

    loadProfile();
  }, [balance, quizzesCompleted, accuracy, streak, level, connected, address]);

  const handleAvatarPress = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Please allow access to your photos to change your profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      // Use base64 if available, otherwise fall back to URI (will be cleared on reload)
      const imageData = asset.base64
        ? `data:image/jpeg;base64,${asset.base64}`
        : asset.uri;

      setProfileImage(imageData);
      await AsyncStorage.setItem(getProfileImageKey(), imageData);
    }
  };

  const handleAvatarLongPress = () => {
    Alert.alert(
      'Remove Avatar',
      'Are you sure you want to remove your profile picture?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setProfileImage(null);
            await AsyncStorage.removeItem(getProfileImageKey());
          },
        },
      ]
    );
  };

  if (!profile) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.text, textAlign: 'center', marginTop: 50 }}>
          Loading profile...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: '#000000' }]}>
      <View style={styles.header}>
        <Text style={styles.title}>PROFILE</Text>
      </View>

      <View style={styles.profileSection}>
        <GlassCard style={styles.profileCard}>
          <View style={styles.profileContent}>
            <TouchableOpacity
              onPress={handleAvatarPress}
              onLongPress={handleAvatarLongPress}
            >
              <LinearGradient
                colors={['rgba(102, 255, 153, 0.9)', 'rgba(51, 255, 102, 0.7)', 'rgba(0, 255, 51, 0.5)', 'rgba(0, 170, 34, 0.3)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarBorder}
              >
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.avatarBorder, { position: 'absolute' }]}
                />
                <Image
                  source={profileImage ? { uri: profileImage } : require('../assets/images/profile-icon.png')}
                  style={styles.avatar}
                  resizeMode="cover"
                />
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.avatarHint}>Tap to change - Hold to remove</Text>
            <Text style={styles.username}>Crypto Learner</Text>
            <Text style={styles.level}>LEVEL {level}</Text>
            <View style={styles.xpBarContainer}>
              <View style={styles.xpBarBackground}>
                <View style={[styles.xpBarFill, { width: `${(xp / xpForNextLevel) * 100}%` }]} />
              </View>
              <Text style={styles.xpText}>{xp} / {xpForNextLevel} XP</Text>
            </View>
          </View>
        </GlassCard>
      </View>

      <View style={styles.statsSection}>
        <GlassCard style={styles.statsCard}>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{accuracy}%</Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{balance.toLocaleString()}</Text>
              <Text style={styles.statLabel}>CCC</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{streak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>
        </GlassCard>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quiz Progress</Text>
        <GlassCard style={styles.trackerCard}>
          <View style={styles.trackerItem}>
            <View style={styles.trackerHeader}>
              <Text style={styles.trackerLabel}>Quizzes Completed</Text>
              <Text style={styles.trackerValue}>{quizzesCompleted}</Text>
            </View>
            <ProgressBar progress={(quizzesCompleted / 10) * 100} />
            <Text style={styles.trackerSubtext}>Next milestone: 5 quizzes</Text>
          </View>

          <View style={styles.trackerDivider} />

          <View style={styles.trackerItem}>
            <View style={styles.trackerHeader}>
              <Text style={styles.trackerLabel}>Current Streak</Text>
              <Text style={styles.trackerValue}>{streak} days</Text>
            </View>
            <ProgressBar
              progress={streak >= 30 ? 100 : (streak / (streak < 7 ? 7 : streak < 14 ? 14 : 30)) * 100}
              color="#FF6BCB"
            />
            <Text style={styles.trackerSubtext}>
              {quizzesTodayCount}/{requiredQuizzesForStreak} quizzes today
              {streak < 7 && ' • Next milestone: 7 days (2 quizzes/day)'}
              {streak >= 7 && streak < 14 && ' • Next milestone: 14 days'}
              {streak >= 14 && streak < 30 && ' • Next milestone: 30 days (3 quizzes/day)'}
              {streak >= 30 && ' • Master streak! Keep it up!'}
            </Text>
          </View>

          <View style={styles.trackerDivider} />

          <View style={styles.trackerItem}>
            <View style={styles.trackerHeader}>
              <Text style={styles.trackerLabel}>Best Streak</Text>
              <Text style={styles.trackerValue}>{bestStreak} days</Text>
            </View>
            <ProgressBar
              progress={(bestStreak / Math.max(30, bestStreak)) * 100}
              color="#C084FC"
            />
            <Text style={styles.trackerSubtext}>
              {bestStreak === 0 ? 'Complete your first quiz!' : 'Personal record'}
            </Text>
          </View>
        </GlassCard>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Badges</Text>
        <View style={styles.badgesList}>
          {earnedBadges.map((badge) => (
            <GlassCard key={badge.id} style={styles.badgeItem}>
              <View style={styles.badgeContent}>
                <View style={styles.badgeHeader}>
                  <Text style={[
                    styles.badgeName,
                    { color: badge.earned ? '#00FF33' : '#FFF' }
                  ]}>
                    {badge.name}
                  </Text>
                  <View style={[
                    styles.badgeStatus,
                    { backgroundColor: badge.earned ? 'rgba(0, 255, 51, 0.2)' : 'rgba(255, 255, 255, 0.1)' }
                  ]}>
                    <Text style={[
                      styles.badgeStatusText,
                      { color: badge.earned ? '#00FF33' : '#FFF' }
                    ]}>
                      {badge.earned ? 'EARNED' : 'LOCKED'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.badgeDescription}>
                  {badge.description}
                </Text>
              </View>
            </GlassCard>
          ))}
        </View>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 1,
  },
  glassCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    overflow: 'hidden',
    position: 'relative',
  },
  diagonalShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  profileSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  profileCard: {
    padding: 24,
  },
  profileContent: {
    alignItems: 'center',
    gap: 8,
  },
  avatarBorder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    padding: 3,
    marginBottom: 8,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 47,
  },
  avatarHint: {
    fontSize: 12,
    color: '#777',
    marginBottom: 8,
  },
  username: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  level: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00FF33',
  },
  xpBarContainer: {
    width: '100%',
    marginTop: 12,
    gap: 6,
  },
  xpBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: '#00FF33',
    borderRadius: 4,
  },
  xpText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
    textAlign: 'center',
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statsCard: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#00FF33',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 16,
  },
  trackerCard: {
    padding: 20,
  },
  trackerItem: {
    marginBottom: 16,
  },
  trackerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trackerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  trackerValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00FF33',
  },
  trackerSubtext: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
  trackerDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 12,
  },
  progressBarContainer: {
    marginTop: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  badgesList: {
    gap: 12,
  },
  badgeItem: {
    padding: 16,
  },
  badgeContent: {
    gap: 8,
  },
  badgeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeName: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  badgeStatus: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeStatusText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  badgeDescription: {
    fontSize: 14,
    color: '#BBB',
    lineHeight: 18,
  },
  bottomSpacer: {
    height: 40,
  },
});

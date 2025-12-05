import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from './contexts/ThemeContext';
import { useWallet } from './contexts/WalletContext';

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
  const { connected, balance } = useWallet();
  const [profile, setProfile] = useState(null);
  const [accuracy, setAccuracy] = useState(0);
  const [streak, setStreak] = useState(0);
  const [quizzesCompleted, setQuizzesCompleted] = useState(0);

  useEffect(() => {
    const loadProfile = async () => {
      setProfile({
        username: 'Crypto Learner',
        level: 0,
        badges: BADGES.filter(b => b.earned),
      });
      setAccuracy(0);
      setStreak(0);
      setQuizzesCompleted(1);
    };
    
    loadProfile();
  }, []);

  const handleAvatarPress = () => {
    Alert.alert('Change Avatar', 'Avatar change functionality would go here');
  };

  const handleAvatarLongPress = () => {
    Alert.alert('Remove Avatar', 'Remove avatar functionality would go here');
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive' },
    ]);
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
                colors={['#66FF99', '#33FF66', '#00FF33']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarBorder}
              >
                <Image
                  source={require('../assets/images/profile-icon.png')}
                  style={styles.avatar}
                  resizeMode="cover"
                />
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.avatarHint}>Tap to change - Hold to remove</Text>
            <Text style={styles.username}>Crypto Learner</Text>
            <Text style={styles.level}>LEVEL 0</Text>
          </View>
        </GlassCard>
      </View>

      <View style={styles.statsSection}>
        <GlassCard style={styles.statsCard}>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0%</Text>
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
            <ProgressBar progress={(streak / 7) * 100} color="#FF6BCB" />
            <Text style={styles.trackerSubtext}>Next milestone: 7 days</Text>
          </View>
        </GlassCard>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Badges</Text>
        <View style={styles.badgesList}>
          {BADGES.map((badge) => (
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

      <View style={styles.signOutSection}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
        <Text style={styles.footerDate}>Nov 20</Text>
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
  signOutSection: {
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  signOutButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  signOutText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
  },
  footerDate: {
    color: '#777',
    fontSize: 12,
    marginTop: 8,
  },
  bottomSpacer: {
    height: 40,
  },
});

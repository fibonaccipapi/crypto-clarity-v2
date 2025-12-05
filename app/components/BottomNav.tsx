import { View, TouchableOpacity, StyleSheet, Text, Image } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { route: '/', icon: '🏠', label: 'Home', isImage: false },
    { route: '/learn', icon: '📚', label: 'Learn', isImage: false },
    { route: '/quiz', icon: '❓', label: 'Quiz', isImage: false },
    { route: '/flashcards', icon: '🎮', label: 'Games', isImage: false },
    { route: '/profile', icon: require('../../assets/images/profile-icon.png'), label: 'Profile', isImage: true },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(10, 10, 15, 0.98)', 'rgba(0, 0, 0, 1)']}
        style={styles.gradient}
      >
        <View style={styles.navContent}>
          {navItems.map((item, index) => {
            const isActive = pathname === item.route;
            const color = index % 2 === 0 ? '#00FF33' : '#FF6BCB';

            return (
              <TouchableOpacity
                key={item.route}
                onPress={() => router.push(item.route as any)}
                style={styles.navItem}
              >
                {item.isImage ? (
                  <LinearGradient
                    colors={['#00FF33', '#00AA22', '#006611']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.iconImageBorder}
                  >
                    <Image
                      source={item.icon}
                      style={styles.iconImage}
                      resizeMode="cover"
                    />
                  </LinearGradient>
                ) : (
                  <View style={[
                    styles.iconContainer,
                    isActive && { borderColor: color, borderWidth: 2 }
                  ]}>
                    <Text style={[
                      styles.iconText,
                      isActive && { color: color }
                    ]}>
                      {item.icon}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
  },
  gradient: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  navContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 28,
    color: '#666',
  },
  iconImageBorder: {
    width: 56,
    height: 56,
    borderRadius: 16,
    padding: 2,
  },
  iconImage: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },
});

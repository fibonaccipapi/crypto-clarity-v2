import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import lessonsData from './data/lessons.json';

const logoIcon = require('../assets/images/logo.png');

const GlassCard = ({ children, glowColor = 'green', style }: any) => {
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

const Badge = ({ text, variant = 'green' }: any) => {
  const colors: any = {
    green: { bg: 'rgba(0, 255, 51, 0.25)', text: '#00FF33' },
    pink: { bg: 'rgba(255, 107, 203, 0.25)', text: '#FF6BCB' },
    purple: { bg: 'rgba(168, 85, 247, 0.25)', text: '#A855F7' },
  };

  return (
    <View style={[styles.badge, { backgroundColor: colors[variant].bg }]}>
      <Text style={[styles.badgeText, { color: colors[variant].text }]}>
        {text}
      </Text>
    </View>
  );
};

const IconContainer = ({ icon, size = 'medium', glowColor = 'green' }: any) => {
  const sizes: any = {
    small: 48,
    medium: 64,
    large: 80,
  };

  const colors: any = {
    green: '#00FF33',
    pink: '#FF6BCB',
    purple: '#A855F7',
  };

  const isImage = icon && typeof icon !== 'string';

  return (
    <View style={[styles.iconContainer, {
      width: sizes[size],
      height: sizes[size],
      borderColor: colors[glowColor],
    }]}>
      {isImage ? (
        <Image
          source={icon}
          style={[styles.iconImage, { width: sizes[size] * 0.7, height: sizes[size] * 0.7 }]}
          resizeMode="contain"
        />
      ) : (
        <Text style={styles.iconEmoji}>{icon}</Text>
      )}
    </View>
  );
};

export default function Learn() {
  const [selectedLesson, setSelectedLesson] = useState<any>(null);

  const categories = [
    { 
      id: 'blockchain', 
      title: 'Blockchain Basics', 
      icon: '⛓️',
      color: 'green' as const,
      description: 'Understanding the foundation'
    },
    { 
      id: 'cryptocurrency', 
      title: 'Cryptocurrency', 
      icon: logoIcon,
      color: 'pink' as const,
      description: 'Digital money explained'
    },
    { 
      id: 'defi', 
      title: 'DeFi', 
      icon: '🏦',
      color: 'purple' as const,
      description: 'Decentralized finance'
    },
    { 
      id: 'nft', 
      title: 'NFTs', 
      icon: '🎨',
      color: 'pink' as const,
      description: 'Digital ownership'
    },
    { 
      id: 'trading', 
      title: 'Trading', 
      icon: '📈',
      color: 'green' as const,
      description: 'Markets & strategies'
    },
    { 
      id: 'security', 
      title: 'Security', 
      icon: '🔒',
      color: 'purple' as const,
      description: 'Protecting your assets'
    },
    { 
      id: 'future', 
      title: 'Future Trends', 
      icon: '🚀',
      color: 'pink' as const,
      description: 'What\'s coming next'
    },
  ];

  const getLessonsByCategory = (categoryId: string) => {
    return lessonsData.lessons.filter((lesson: any) => lesson.category === categoryId);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Learn</Text>
          <Text style={styles.subtitle}>Master crypto concepts step by step</Text>
        </View>

        <View style={styles.categoriesContainer}>
          {categories.map((category) => {
            const categoryLessons = getLessonsByCategory(category.id);
            
            return (
              <View key={category.id} style={styles.categorySection}>
                <View style={styles.categorySectionHeader}>
                  <IconContainer 
                    icon={category.icon}
                    size="medium" 
                    glowColor={category.color}
                  />
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryTitle}>{category.title}</Text>
                    <Text style={styles.categoryDescription}>{category.description}</Text>
                  </View>
                  <Badge text={`${categoryLessons.length} LESSONS`} variant={category.color} />
                </View>

                <View style={styles.lessonsGrid}>
                  {categoryLessons.map((lesson: any) => (
                    <TouchableOpacity
                      key={lesson.id}
                      onPress={() => setSelectedLesson(lesson)}
                      style={styles.lessonCard}
                    >
                      <GlassCard glowColor={category.color}>
                        <View style={styles.lessonCardContent}>
                          <View style={styles.lessonHeader}>
                            <Text style={styles.lessonEmoji}>{lesson.emoji}</Text>
                            <Badge text={lesson.difficulty.toUpperCase()} variant={category.color} />
                          </View>
                          <Text style={styles.lessonTitle}>{lesson.title}</Text>
                          <Text style={styles.lessonPreview} numberOfLines={2}>
                            {lesson.content.split('\n')[0]}
                          </Text>
                        </View>
                      </GlassCard>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <Modal visible={!!selectedLesson} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setSelectedLesson(null)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>

              <Text style={styles.modalEmoji}>{selectedLesson?.emoji}</Text>
              <Text style={styles.modalTitle}>{selectedLesson?.title}</Text>
              
              <View style={styles.modalBadges}>
                <Badge text={selectedLesson?.difficulty.toUpperCase()} variant="green" />
                <Badge text={selectedLesson?.category.toUpperCase()} variant="purple" />
              </View>

              <Text style={styles.modalContentText}>{selectedLesson?.content}</Text>

              {selectedLesson?.keyTakeaways && selectedLesson.keyTakeaways.length > 0 && (
                <View style={styles.takeawaysSection}>
                  <Text style={styles.takeawaysTitle}>🎯 Key Takeaways</Text>
                  {selectedLesson.keyTakeaways.map((takeaway: string, index: number) => (
                    <View key={index} style={styles.takeawayItem}>
                      <Text style={styles.takeawayBullet}>•</Text>
                      <Text style={styles.takeawayText}>{takeaway}</Text>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
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
    paddingTop: 60 
  },
  header: { 
    padding: 20, 
    paddingBottom: 24 
  },
  title: { 
    fontSize: 32, 
    fontWeight: '800', 
    color: '#FFF', 
    marginBottom: 8 
  },
  subtitle: { 
    fontSize: 14, 
    color: '#777' 
  },
  categoriesContainer: { 
    paddingHorizontal: 20, 
    gap: 32, 
    paddingBottom: 120 
  },
  categorySection: { 
    gap: 16 
  },
  categorySectionHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12 
  },
  categoryInfo: { 
    flex: 1 
  },
  categoryTitle: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: '#FFF', 
    marginBottom: 4 
  },
  categoryDescription: { 
    fontSize: 12, 
    color: '#777' 
  },
  iconContainer: {
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 36,
  },
  iconImage: {
    width: 36,
    height: 36,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  lessonsGrid: { 
    gap: 12 
  },
  lessonCard: { 
    width: '100%' 
  },
  glassCardBase: {
    borderRadius: 20,
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
    borderTopLeftRadius: 20,
  },
  lessonCardContent: {
    padding: 18,
  },
  lessonHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  lessonEmoji: { 
    fontSize: 32 
  },
  lessonTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#FFF', 
    marginBottom: 8 
  },
  lessonPreview: { 
    fontSize: 13, 
    color: '#BBB', 
    lineHeight: 20 
  },
  modalContainer: { 
    flex: 1, 
    backgroundColor: 'rgba(0, 0, 0, 0.95)', 
    justifyContent: 'flex-end' 
  },
  modalContent: { 
    backgroundColor: '#0A0A0A', 
    borderTopLeftRadius: 32, 
    borderTopRightRadius: 32, 
    maxHeight: '90%', 
    paddingTop: 20, 
    paddingHorizontal: 24, 
    paddingBottom: 40 
  },
  closeButton: { 
    alignSelf: 'flex-end', 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 16 
  },
  closeButtonText: { 
    fontSize: 24, 
    color: '#FFF' 
  },
  modalEmoji: { 
    fontSize: 64, 
    textAlign: 'center', 
    marginBottom: 16 
  },
  modalTitle: { 
    fontSize: 28, 
    fontWeight: '900', 
    color: '#FFF', 
    textAlign: 'center', 
    marginBottom: 16 
  },
  modalBadges: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    gap: 8, 
    marginBottom: 24 
  },
  modalContentText: { 
    fontSize: 15, 
    color: '#CCC', 
    lineHeight: 24, 
    marginBottom: 24 
  },
  takeawaysSection: { 
    backgroundColor: 'rgba(0, 255, 51, 0.1)', 
    borderRadius: 16, 
    padding: 20, 
    borderWidth: 1, 
    borderColor: 'rgba(0, 255, 51, 0.3)', 
    marginTop: 24 
  },
  takeawaysTitle: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: '#00FF33', 
    marginBottom: 16 
  },
  takeawayItem: { 
    flexDirection: 'row', 
    marginBottom: 12, 
    gap: 12 
  },
  takeawayBullet: { 
    fontSize: 18, 
    color: '#00FF33', 
    marginTop: 2 
  },
  takeawayText: { 
    flex: 1, 
    fontSize: 14, 
    color: '#FFF', 
    lineHeight: 22 
  },
});

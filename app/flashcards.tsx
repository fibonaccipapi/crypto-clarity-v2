import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Animated, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useWallet } from './contexts/WalletContext';
import flashcardsData from './data/flashcards.json';

const flashcardIcon = require('../assets/images/flashcard-icon.png');
const matchGameIcon = require('../assets/images/games-icon.png');

const GAME_TIME_LIMIT = 90;

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

const IconContainer = ({ icon, glowColor = 'green' }: any) => {
  const iconSize = 64;

  const gradientColors: any = {
    green: ['rgba(102, 255, 153, 0.9)', 'rgba(51, 255, 102, 0.7)', 'rgba(0, 255, 51, 0.5)', 'rgba(0, 170, 34, 0.3)'],
    pink: ['rgba(255, 153, 221, 0.9)', 'rgba(255, 107, 203, 0.7)', 'rgba(255, 51, 153, 0.5)', 'rgba(204, 86, 153, 0.3)'],
    purple: ['rgba(192, 132, 252, 0.9)', 'rgba(168, 85, 247, 0.7)', 'rgba(147, 51, 234, 0.5)', 'rgba(126, 34, 206, 0.3)'],
  };

  return (
    <LinearGradient
      colors={gradientColors[glowColor]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.iconBorder, {
        width: iconSize,
        height: iconSize,
        borderRadius: 16,
      }]}
    >
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.iconBorder, {
          width: iconSize,
          height: iconSize,
          borderRadius: 16,
          position: 'absolute',
        }]}
      />
      <View style={[styles.iconInnerContainer, {
        width: iconSize - 4,
        height: iconSize - 4,
        overflow: 'hidden',
      }]}>
        <Image
          source={icon}
          style={[styles.iconImage, { width: iconSize * 0.95, height: iconSize * 0.95 }]}
          resizeMode="cover"
        />
      </View>
    </LinearGradient>
  );
};

type GameMode = 'menu' | 'flashcards' | 'match';

export default function Games() {
  const { addBalance } = useWallet();
  const [gameMode, setGameMode] = useState<GameMode>('menu');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [matchCards, setMatchCards] = useState<{terms:any[];definitions:any[]}>({terms:[], definitions:[]});
  const [selectedTermIndex, setSelectedTermIndex] = useState<number | null>(null);
  const [selectedDefinitionIndex, setSelectedDefinitionIndex] = useState<number | null>(null);
  const [termScales, setTermScales] = useState<any[]>([]);
  const [defScales, setDefScales] = useState<any[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME_LIMIT);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const flashcards = flashcardsData.flashcards;

  useEffect(() => {
    if (gameMode === 'match' && gameStarted && !gameOver && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameOver(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameMode, gameStarted, gameOver, timeLeft]);

  useEffect(() => {
    if (matchedPairs.length === 6 && gameMode === 'match') {
      setGameOver(true);
      const reward = Math.max(50, timeLeft * 2);
      addBalance(reward);
    }
  }, [matchedPairs]);

  const startMatchGame = () => {
    const selectedCards = flashcards.slice(0, 6);
    const termsList = selectedCards.map((card, idx) => ({ ...card, id: idx, type: 'term' })).sort(() => Math.random() - 0.5);
    const definitionsList = selectedCards.map((card, idx) => ({ ...card, id: idx, type: 'definition' })).sort(() => Math.random() - 0.5);

    setMatchCards({ terms: termsList, definitions: definitionsList });
    setSelectedTermIndex(null);
    setSelectedDefinitionIndex(null);
    // initialize per-card animated scales
    setTermScales(termsList.map(() => new Animated.Value(1)));
    setDefScales(definitionsList.map(() => new Animated.Value(1)));
    setMatchedPairs([]);
    setTimeLeft(GAME_TIME_LIMIT);
    setGameStarted(true);
    setGameOver(false);
  };

  const handleSelectTerm = (index: number) => {
    if (matchedPairs.includes(matchCards.terms[index].id)) return;
    setSelectedTermIndex(index === selectedTermIndex ? null : index);
    // if a definition already selected, check match
    if (selectedDefinitionIndex !== null) {
      const term = matchCards.terms[index];
      const def = matchCards.definitions[selectedDefinitionIndex];
      if (term.id === def.id) {
        setMatchedPairs(prev => [...prev, term.id]);
        setSelectedTermIndex(null);
        setSelectedDefinitionIndex(null);
      } else {
        // clear selection after brief delay
        setTimeout(() => {
          setSelectedTermIndex(null);
          setSelectedDefinitionIndex(null);
        }, 600);
      }
    }
  };

  const handleSelectDefinition = (index: number) => {
    if (matchedPairs.includes(matchCards.definitions[index].id)) return;
    setSelectedDefinitionIndex(index === selectedDefinitionIndex ? null : index);
    if (selectedTermIndex !== null) {
      const term = matchCards.terms[selectedTermIndex];
      const def = matchCards.definitions[index];
      if (term.id === def.id) {
        setMatchedPairs(prev => [...prev, term.id]);
        setSelectedTermIndex(null);
        setSelectedDefinitionIndex(null);
      } else {
        setTimeout(() => {
          setSelectedTermIndex(null);
          setSelectedDefinitionIndex(null);
        }, 600);
      }
    }
  };

  // animate selection scale for terms
  useEffect(() => {
    termScales.forEach((v: any, i: number) => {
      Animated.timing(v, {
        toValue: selectedTermIndex === i ? 1.06 : 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
    });
  }, [selectedTermIndex, termScales]);

  // animate selection scale for definitions
  useEffect(() => {
    defScales.forEach((v: any, i: number) => {
      Animated.timing(v, {
        toValue: selectedDefinitionIndex === i ? 1.06 : 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
    });
  }, [selectedDefinitionIndex, defScales]);

  const resetGame = () => {
    setGameMode('menu');
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setGameStarted(false);
    setGameOver(false);
  };

  if (gameMode === 'menu') {
    return (
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Games</Text>
            <Text style={styles.subtitle}>Learn while you play</Text>
          </View>

          <View style={styles.gamesContainer}>
            <TouchableOpacity
              onPress={() => setGameMode('flashcards')}
              style={styles.gameCard}
            >
              <GlassCard>
                <View style={styles.gameCardContent}>
                  <IconContainer icon={flashcardIcon} glowColor="green" />
                  <Text style={styles.gameTitle}>Flashcards</Text>
                  <Text style={styles.gameDescription}>
                    Study crypto terms at your own pace
                  </Text>
                  <Badge text={`${flashcards.length} CARDS`} variant="green" />
                </View>
              </GlassCard>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setGameMode('match');
                startMatchGame();
              }}
              style={styles.gameCard}
            >
              <GlassCard>
                <View style={styles.gameCardContent}>
                  <IconContainer icon={matchGameIcon} glowColor="pink" />
                  <Text style={styles.gameTitle}>Match Game</Text>
                  <Text style={styles.gameDescription}>
                    Match terms with definitions in 90 seconds
                  </Text>
                  <Badge text="EARN CCC" variant="pink" />
                </View>
              </GlassCard>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (gameMode === 'flashcards') {
    const currentCard = flashcards[currentCardIndex];
    
    return (
      <View style={styles.container}>
        <View style={styles.gameHeader}>
          <TouchableOpacity onPress={resetGame} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.cardCounter}>
            {currentCardIndex + 1} / {flashcards.length}
          </Text>
        </View>

        <View style={styles.flashcardContainer}>
          <TouchableOpacity
            onPress={() => setIsFlipped(!isFlipped)}
            style={styles.flashcard}
            activeOpacity={0.9}
          >
            <GlassCard style={styles.flashcardInner}>
              <View style={styles.flashcardContent}>
                <Text style={styles.flashcardLabel}>
                  {isFlipped ? 'DEFINITION' : 'TERM'}
                </Text>
                <Text style={styles.flashcardText}>
                  {isFlipped ? currentCard.definition : currentCard.term}
                </Text>
                <Text style={styles.tapHint}>Tap to flip</Text>
              </View>
            </GlassCard>
          </TouchableOpacity>

          <View style={styles.navigationButtons}>
            <TouchableOpacity
              onPress={() => {
                setCurrentCardIndex(Math.max(0, currentCardIndex - 1));
                setIsFlipped(false);
              }}
              disabled={currentCardIndex === 0}
              style={[styles.navButton, currentCardIndex === 0 && styles.navButtonDisabled]}
            >
              <Text style={styles.navButtonText}>← Previous</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setCurrentCardIndex(Math.min(flashcards.length - 1, currentCardIndex + 1));
                setIsFlipped(false);
              }}
              disabled={currentCardIndex === flashcards.length - 1}
              style={[styles.navButton, currentCardIndex === flashcards.length - 1 && styles.navButtonDisabled]}
            >
              <Text style={styles.navButtonText}>Next →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (gameMode === 'match') {
    if (gameOver) {
      const won = matchedPairs.length === 6;
      const reward = won ? Math.max(50, timeLeft * 2) : 0;

      return (
        <View style={styles.container}>
          <View style={styles.resultContainer}>
            <GlassCard style={styles.resultCard}>
              <View style={styles.resultContent}>
                <Text style={styles.resultEmoji}>{won ? '🏆' : '⏰'}</Text>
                <Text style={styles.resultTitle}>
                  {won ? 'Perfect Match!' : 'Time\'s Up!'}
                </Text>
                <Text style={styles.resultText}>
                  {matchedPairs.length} / 6 pairs matched
                </Text>
                {won && (
                  <View style={styles.rewardBox}>
                    <Text style={styles.rewardText}>+{reward} CCC</Text>
                  </View>
                )}
                <TouchableOpacity style={styles.retryButton} onPress={resetGame}>
                  <LinearGradient
                    colors={['#00FF33', '#00CC29']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.retryButtonGradient}
                  >
                    <Text style={styles.retryButtonText}>Back to Menu</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </GlassCard>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <View style={styles.gameHeader}>
          <TouchableOpacity onPress={resetGame} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Quit</Text>
          </TouchableOpacity>
          <View style={styles.matchStats}>
            <Text style={styles.timerText}>⏱️ {timeLeft}s</Text>
            <Text style={styles.matchesText}>
              {matchedPairs.length} / 6 matched
            </Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.matchGrid}>
          <View style={styles.matchColumns}>
            <View style={styles.matchColumn}>
              {matchCards.terms.map((card, index) => {
                const isMatched = matchedPairs.includes(card.id);
                const isSelected = selectedTermIndex === index;
                const scale = termScales[index] || new Animated.Value(1);
                return (
                  <TouchableOpacity
                    key={`t-${index}`}
                    onPress={() => handleSelectTerm(index)}
                    disabled={isMatched}
                    style={styles.matchCard}
                  >
                    <Animated.View style={{ transform: [{ scale }], width: '100%' }}>
                      <LinearGradient
                        colors={
                          isMatched
                            ? ['rgba(0, 255, 51, 0.4)', 'rgba(0, 255, 51, 0.2)']
                            : isSelected
                            ? ['rgba(255, 107, 203, 0.6)', 'rgba(255, 107, 203, 0.3)']
                            : ['rgba(255, 107, 203, 0.25)', 'rgba(255, 107, 203, 0.08)']
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[
                          styles.matchCardInner,
                          isMatched && styles.matchCardMatched,
                          isSelected && styles.matchCardSelected,
                        ]}
                      >
                        <Text style={[styles.matchCardText, isMatched ? styles.matchedText : styles.termText]}>
                          {card.term}
                        </Text>
                      </LinearGradient>
                    </Animated.View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.matchColumn}>
              {matchCards.definitions.map((card, index) => {
                const isMatched = matchedPairs.includes(card.id);
                const isSelected = selectedDefinitionIndex === index;
                const scale = defScales[index] || new Animated.Value(1);
                return (
                  <TouchableOpacity
                    key={`d-${index}`}
                    onPress={() => handleSelectDefinition(index)}
                    disabled={isMatched}
                    style={styles.matchCard}
                  >
                    <Animated.View style={{ transform: [{ scale }], width: '100%' }}>
                      <LinearGradient
                        colors={
                          isMatched
                            ? ['rgba(0, 255, 51, 0.4)', 'rgba(0, 255, 51, 0.2)']
                            : isSelected
                            ? ['rgba(0, 255, 51, 0.6)', 'rgba(0, 255, 51, 0.3)']
                            : ['rgba(0, 255, 51, 0.22)', 'rgba(0, 255, 51, 0.08)']
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[
                          styles.matchCardInner,
                          isMatched && styles.matchCardMatched,
                          isSelected && styles.matchCardSelected,
                        ]}
                      >
                        <Text style={[styles.matchCardText, isMatched ? styles.matchedText : styles.definitionText]}>
                          {card.definition}
                        </Text>
                      </LinearGradient>
                    </Animated.View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: 60,
  },
  header: {
    padding: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#777',
  },
  gamesContainer: {
    paddingHorizontal: 20,
    gap: 16,
    paddingBottom: 120,
  },
  gameCard: {
    width: '100%',
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
  gameCardContent: {
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  iconBorder: {
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInnerContainer: {
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconImage: {
    width: 64,
    height: 64,
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
  },
  gameDescription: {
    fontSize: 14,
    color: '#BBB',
    textAlign: 'center',
    lineHeight: 20,
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
  gameHeader: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {},
  backButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00FF33',
  },
  cardCounter: {
    fontSize: 16,
    fontWeight: '700',
    color: '#BBB',
  },
  flashcardContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    gap: 32,
  },
  flashcard: {
    height: 400,
  },
  flashcardInner: {
    height: '100%',
  },
  flashcardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 24,
  },
  flashcardLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#00FF33',
    letterSpacing: 1,
  },
  flashcardText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 38,
  },
  tapHint: {
    fontSize: 14,
    color: '#777',
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  navButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  matchStats: {
    alignItems: 'flex-end',
    gap: 4,
  },
  timerText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FF6BCB',
  },
  matchesText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#BBB',
  },
  matchGrid: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'flex-start',
  },
  matchColumns: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  matchColumn: {
    width: '50%',
    paddingHorizontal: 6,
  },
  matchCard: {
    width: '100%',
    height: 64,
    marginBottom: 10,
  },
  matchCardInner: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  matchCardMatched: {
    borderColor: '#00FF33',
  },
  matchCardSelected: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  matchCardText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  termText: {
    color: '#FF6BCB',
  },
  definitionText: {
    color: '#00FF33',
  },
  matchedText: {
    color: '#FFFFFF',
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  resultCard: {
    width: '100%',
    maxWidth: 400,
  },
  resultContent: {
    padding: 40,
    alignItems: 'center',
    gap: 16,
  },
  resultEmoji: {
    fontSize: 80,
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFF',
  },
  resultText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#BBB',
  },
  rewardBox: {
    backgroundColor: 'rgba(0, 255, 51, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 51, 0.5)',
    marginTop: 8,
  },
  rewardText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#00FF33',
  },
  retryButton: {
    width: '100%',
    marginTop: 24,
  },
  retryButtonGradient: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  retryButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000',
  },
});

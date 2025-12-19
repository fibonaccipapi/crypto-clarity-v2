import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useWallet } from './contexts/WalletContext';
import { useStats } from './contexts/StatsContext';
import quizData from './data/questions.json';

const blockchainIcon = require('../assets/images/blockchain-icon.png');
const cryptoIcon = require('../assets/images/crypto-icon.png');
const defiIcon = require('../assets/images/defi-icon.png');
const nftIcon = require('../assets/images/nft-icon.png');
const tradingIcon = require('../assets/images/trading-icon.png');
const securityIcon = require('../assets/images/security-icon.png');

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
        borderRadius: 22,
      }]}
    >
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.iconBorder, {
          width: iconSize,
          height: iconSize,
          borderRadius: 22,
          position: 'absolute',
        }]}
      />
      <View style={[styles.iconInnerContainer, {
        width: iconSize - 4,
        height: iconSize - 4,
        overflow: 'hidden',
        borderRadius: 20,
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

export default function Quiz() {
  const { addBalance, connected } = useWallet();
  const stats = useStats();
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<any[]>([]);

  const categories = quizData.categories || [];
  const currentQuestion = shuffledQuestions[currentQuestionIndex];

  const getCategoryIcon = (categoryId: number) => {
    const iconMap: any = {
      1: blockchainIcon,
      2: cryptoIcon,
      3: defiIcon,
      4: nftIcon,
      5: tradingIcon,
      6: securityIcon,
    };
    return iconMap[categoryId];
  };

  const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    if (selectedCategory) {
      const questionsWithShuffledAnswers = selectedCategory.questions.map((question: any) => ({
        ...question,
        options: shuffleArray(question.options)
      }));
      setShuffledQuestions(shuffleArray(questionsWithShuffledAnswers));
    }
  }, [selectedCategory]);

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    setShowResult(true);

    if (answer === currentQuestion.correct) {
      setScore(score + 1);
      // Only award CCC if user is connected
      if (connected) {
        addBalance(10);
      }
    }

    setTimeout(async () => {
      if (currentQuestionIndex < shuffledQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        await stats.updateQuizStats(score + (answer === currentQuestion.correct ? 1 : 0), shuffledQuestions.length);
        setQuizCompleted(true);
      }
    }, 1500);
  };

  const resetQuiz = () => {
    setSelectedCategory(null);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setQuizCompleted(false);
    setShuffledQuestions([]);
  };

  const getCategoryColor = (index: number) => {
    const colors = ['green', 'pink', 'purple'];
    return colors[index % colors.length] as 'green' | 'pink' | 'purple';
  };

  if (!selectedCategory) {
    return (
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Choose Category</Text>
            <Text style={styles.subtitle}>Pick a topic to test your knowledge</Text>
          </View>

          <View style={styles.categoriesContainer}>
            {categories.map((category: any, index: number) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => setSelectedCategory(category)}
                style={styles.categoryCard}
              >
                <GlassCard>
                  <View style={styles.categoryCardContent}>
                    <IconContainer
                      icon={getCategoryIcon(category.id)}
                      glowColor={getCategoryColor(index)}
                    />
                    <Text style={styles.categoryTitle}>{category.title}</Text>
                    <Badge
                      text={`${category.questions.length} QUESTIONS`}
                      variant={getCategoryColor(index)}
                    />
                  </View>
                </GlassCard>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  if (quizCompleted) {
    const percentage = Math.round((score / shuffledQuestions.length) * 100);
    const earnedCCC = score * 10;

    return (
      <View style={styles.container}>
        <View style={styles.resultContainer}>
          <GlassCard style={styles.resultCard}>
            <View style={styles.resultContent}>
              <Text style={styles.resultEmoji}>
                {percentage >= 80 ? '🏆' : percentage >= 60 ? '🎉' : '📚'}
              </Text>
              <Text style={styles.resultTitle}>Quiz Complete!</Text>
              <Text style={styles.resultScore}>{percentage}%</Text>
              <Text style={styles.resultText}>
                {score} / {shuffledQuestions.length} correct
              </Text>

              {connected ? (
                <View style={styles.rewardBox}>
                  <Text style={styles.rewardText}>+{earnedCCC} CCC</Text>
                </View>
              ) : (
                <View style={styles.notConnectedBox}>
                  <Text style={styles.notConnectedTitle}>🔒 Connect to Earn CCC</Text>
                  <Text style={styles.notConnectedText}>
                    You could have earned {earnedCCC} CCC!
                  </Text>
                  <Text style={styles.notConnectedSubtext}>
                    Connect your wallet or sign in to start earning rewards
                  </Text>
                </View>
              )}

              <TouchableOpacity style={styles.retryButton} onPress={resetQuiz}>
                <LinearGradient
                  colors={['#00FF33', '#00CC29']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.retryButtonGradient}
                >
                  <Text style={styles.retryButtonText}>Try Another Quiz</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>
      </View>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.quizHeader}>
        <TouchableOpacity onPress={resetQuiz} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Question {currentQuestionIndex + 1} / {shuffledQuestions.length}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${((currentQuestionIndex + 1) / shuffledQuestions.length) * 100}%` }
              ]}
            />
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.quizContent}>
        <GlassCard style={styles.questionCard}>
          <View style={styles.questionContent}>
            <Text style={styles.questionText}>{currentQuestion.question}</Text>
          </View>
        </GlassCard>

        <View style={styles.answersContainer}>
          {currentQuestion.options.map((option: string, index: number) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === currentQuestion.correct;
            const showCorrect = showResult && isCorrect;
            const showWrong = showResult && isSelected && !isCorrect;

            return (
              <TouchableOpacity
                key={index}
                onPress={() => !showResult && handleAnswer(option)}
                disabled={showResult}
                style={styles.answerButton}
              >
                <LinearGradient
                  colors={
                    showCorrect
                      ? ['rgba(0, 255, 51, 0.3)', 'rgba(0, 255, 51, 0.1)']
                      : showWrong
                      ? ['rgba(255, 46, 151, 0.3)', 'rgba(255, 46, 151, 0.1)']
                      : ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.answerGradient,
                    showCorrect && styles.correctAnswer,
                    showWrong && styles.wrongAnswer,
                  ]}
                >
                  <Text style={styles.answerText}>{option}</Text>
                  {showCorrect && <Text style={styles.answerIcon}>✓</Text>}
                  {showWrong && <Text style={styles.answerIcon}>✗</Text>}
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
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
  categoriesContainer: {
    paddingHorizontal: 20,
    gap: 16,
    paddingBottom: 120,
  },
  categoryCard: {
    width: '100%',
  },
  glassCardBase: {
    borderRadius: 28,
    borderWidth: 0,
    overflow: 'hidden',
    position: 'relative',
  },
  diagonalShine: {
    position: 'absolute',
    top: -20,
    left: -20,
    width: '60%',
    height: '60%',
    borderTopLeftRadius: 28,
  },
  categoryCardContent: {
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
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconImage: {
    width: 64,
    height: 64,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  quizHeader: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00FF33',
  },
  progressContainer: {
    gap: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#BBB',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00FF33',
    borderRadius: 3,
  },
  quizContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  questionCard: {
    marginBottom: 24,
  },
  questionContent: {
    padding: 24,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    lineHeight: 28,
  },
  answersContainer: {
    gap: 12,
  },
  answerButton: {
    width: '100%',
  },
  answerGradient: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  correctAnswer: {
    borderColor: '#00FF33',
  },
  wrongAnswer: {
    borderColor: '#FF2E97',
  },
  answerText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    flex: 1,
  },
  answerIcon: {
    fontSize: 24,
    fontWeight: '800',
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
  resultScore: {
    fontSize: 64,
    fontWeight: '900',
    color: '#00FF33',
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
  notConnectedBox: {
    backgroundColor: 'rgba(255, 107, 203, 0.15)',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 203, 0.3)',
    marginTop: 8,
    alignItems: 'center',
    gap: 8,
  },
  notConnectedTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FF6BCB',
  },
  notConnectedText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
  },
  notConnectedSubtext: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
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

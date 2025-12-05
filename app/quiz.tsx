import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useWallet } from './contexts/WalletContext';
import quizData from './data/questions.json';

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

export default function Quiz() {
  const { addBalance } = useWallet();
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const categories = quizData.categories || [];
  const currentQuestion = selectedCategory?.questions[currentQuestionIndex];

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    setShowResult(true);

    if (answer === currentQuestion.correct) {
      setScore(score + 1);
      addBalance(10);
    }

    setTimeout(() => {
      if (currentQuestionIndex < selectedCategory.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
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
                    <Text style={styles.categoryEmoji}>{category.icon}</Text>
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
    const percentage = Math.round((score / selectedCategory.questions.length) * 100);
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
                {score} / {selectedCategory.questions.length} correct
              </Text>
              
              <View style={styles.rewardBox}>
                <Text style={styles.rewardText}>+{earnedCCC} CCC</Text>
              </View>

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

  return (
    <View style={styles.container}>
      <View style={styles.quizHeader}>
        <TouchableOpacity onPress={resetQuiz} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Question {currentQuestionIndex + 1} / {selectedCategory.questions.length}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentQuestionIndex + 1) / selectedCategory.questions.length) * 100}%` }
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
  categoryCardContent: {
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  categoryEmoji: {
    fontSize: 48,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
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
    borderRadius: 16,
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

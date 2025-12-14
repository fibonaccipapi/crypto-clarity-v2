import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface StatsContextType {
  level: number;
  xp: number;
  xpForNextLevel: number;
  accuracy: number;
  streak: number;
  bestStreak: number;
  lastQuizDate: string | null;
  quizzesCompleted: number;
  totalQuestions: number;
  correctAnswers: number;
  quizzesTodayCount: number;
  requiredQuizzesForStreak: number;
  updateQuizStats: (correct: number, total: number) => Promise<void>;
  checkStreak: () => Promise<void>;
  calculateLevel: (cccBalance: number) => { level: number; xp: number; xpForNextLevel: number };
  resetStats: () => Promise<void>;
  userId: string | null;
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

const getXPForLevel = (level: number): number => {
  return Math.floor(100 * level * (level + 1) / 2);
};

const getTotalXPForLevel = (targetLevel: number): number => {
  let total = 0;
  for (let i = 1; i <= targetLevel; i++) {
    total += getXPForLevel(i);
  }
  return total;
};

const getRequiredQuizzesForStreak = (currentStreak: number): number => {
  if (currentStreak >= 30) return 3;
  if (currentStreak >= 14) return 2;
  if (currentStreak >= 7) return 2;
  return 1;
};

export function StatsProvider({ children, userId }: { children: React.ReactNode; userId: string | null }) {
  const [quizzesCompleted, setQuizzesCompleted] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [lastQuizDate, setLastQuizDate] = useState<string | null>(null);
  const [quizzesTodayCount, setQuizzesTodayCount] = useState(0);

  // Get user-scoped storage keys
  const getStorageKey = (key: string) => {
    return userId ? `${userId}_${key}` : `guest_${key}`;
  };

  useEffect(() => {
    loadStats();
  }, [userId]); // Reload stats when user changes

  const loadStats = async () => {
    try {
      const savedQuizzesCompleted = await AsyncStorage.getItem(getStorageKey('quizzes_completed'));
      const savedTotalQuestions = await AsyncStorage.getItem(getStorageKey('total_questions'));
      const savedCorrectAnswers = await AsyncStorage.getItem(getStorageKey('correct_answers'));
      const savedStreak = await AsyncStorage.getItem(getStorageKey('streak'));
      const savedBestStreak = await AsyncStorage.getItem(getStorageKey('best_streak'));
      const savedLastQuizDate = await AsyncStorage.getItem(getStorageKey('last_quiz_date'));
      const savedQuizzesToday = await AsyncStorage.getItem(getStorageKey('quizzes_today'));

      if (savedQuizzesCompleted) setQuizzesCompleted(parseInt(savedQuizzesCompleted));
      else setQuizzesCompleted(0);
      if (savedTotalQuestions) setTotalQuestions(parseInt(savedTotalQuestions));
      else setTotalQuestions(0);
      if (savedCorrectAnswers) setCorrectAnswers(parseInt(savedCorrectAnswers));
      else setCorrectAnswers(0);
      if (savedStreak) setStreak(parseInt(savedStreak));
      else setStreak(0);
      if (savedBestStreak) setBestStreak(parseInt(savedBestStreak));
      else setBestStreak(0);
      if (savedLastQuizDate) setLastQuizDate(savedLastQuizDate);
      else setLastQuizDate(null);
      if (savedQuizzesToday) setQuizzesTodayCount(parseInt(savedQuizzesToday));
      else setQuizzesTodayCount(0);
    } catch (error) {
      console.log('Error loading stats:', error);
    }
  };

  const updateQuizStats = async (correct: number, total: number) => {
    const newQuizzesCompleted = quizzesCompleted + 1;
    const newTotalQuestions = totalQuestions + total;
    const newCorrectAnswers = correctAnswers + correct;

    setQuizzesCompleted(newQuizzesCompleted);
    setTotalQuestions(newTotalQuestions);
    setCorrectAnswers(newCorrectAnswers);

    try {
      await AsyncStorage.setItem(getStorageKey('quizzes_completed'), newQuizzesCompleted.toString());
      await AsyncStorage.setItem(getStorageKey('total_questions'), newTotalQuestions.toString());
      await AsyncStorage.setItem(getStorageKey('correct_answers'), newCorrectAnswers.toString());
    } catch (error) {
      console.log('Error saving quiz stats:', error);
    }

    await checkStreak();
  };

  const checkStreak = async () => {
    const today = new Date().toDateString();
    let newQuizzesToday = quizzesTodayCount;

    if (lastQuizDate === today) {
      newQuizzesToday = quizzesTodayCount + 1;
    } else {
      newQuizzesToday = 1;
    }

    setQuizzesTodayCount(newQuizzesToday);
    await AsyncStorage.setItem(getStorageKey('quizzes_today'), newQuizzesToday.toString());

    const requiredQuizzes = getRequiredQuizzesForStreak(streak);

    if (newQuizzesToday >= requiredQuizzes) {
      if (lastQuizDate) {
        const lastDate = new Date(lastQuizDate);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastDate.toDateString() === yesterday.toDateString()) {
          const newStreak = streak + 1;
          setStreak(newStreak);
          await AsyncStorage.setItem(getStorageKey('streak'), newStreak.toString());

          if (newStreak > bestStreak) {
            setBestStreak(newStreak);
            await AsyncStorage.setItem(getStorageKey('best_streak'), newStreak.toString());
          }
        } else if (lastDate.toDateString() !== today) {
          setStreak(1);
          await AsyncStorage.setItem(getStorageKey('streak'), '1');
        }
      } else {
        setStreak(1);
        await AsyncStorage.setItem(getStorageKey('streak'), '1');
        if (bestStreak === 0) {
          setBestStreak(1);
          await AsyncStorage.setItem(getStorageKey('best_streak'), '1');
        }
      }
    }

    setLastQuizDate(today);
    await AsyncStorage.setItem(getStorageKey('last_quiz_date'), today);
  };

  const resetStats = async () => {
    try {
      await AsyncStorage.multiRemove([
        getStorageKey('quizzes_completed'),
        getStorageKey('total_questions'),
        getStorageKey('correct_answers'),
        getStorageKey('streak'),
        getStorageKey('best_streak'),
        getStorageKey('last_quiz_date'),
        getStorageKey('quizzes_today'),
      ]);

      setQuizzesCompleted(0);
      setTotalQuestions(0);
      setCorrectAnswers(0);
      setStreak(0);
      setBestStreak(0);
      setLastQuizDate(null);
      setQuizzesTodayCount(0);
    } catch (error) {
      console.log('Error resetting stats:', error);
    }
  };

  const calculateLevel = (cccBalance: number) => {
    let level = 0;
    let remainingXP = cccBalance;

    while (remainingXP >= getXPForLevel(level + 1)) {
      level++;
      remainingXP -= getXPForLevel(level);
    }

    const xp = remainingXP;
    const xpForNextLevel = getXPForLevel(level + 1);

    return { level, xp, xpForNextLevel };
  };

  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const level = 0;
  const xp = 0;
  const xpForNextLevel = getXPForLevel(1);
  const requiredQuizzesForStreak = getRequiredQuizzesForStreak(streak);

  return (
    <StatsContext.Provider
      value={{
        level,
        xp,
        xpForNextLevel,
        accuracy,
        streak,
        bestStreak,
        lastQuizDate,
        quizzesCompleted,
        totalQuestions,
        correctAnswers,
        quizzesTodayCount,
        requiredQuizzesForStreak,
        updateQuizStats,
        checkStreak,
        calculateLevel,
        resetStats,
        userId,
      }}
    >
      {children}
    </StatsContext.Provider>
  );
}

export function useStats() {
  const context = useContext(StatsContext);
  if (context === undefined) {
    throw new Error('useStats must be used within a StatsProvider');
  }
  return context;
}

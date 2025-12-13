import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface StatsContextType {
  level: number;
  xp: number;
  xpForNextLevel: number;
  accuracy: number;
  streak: number;
  lastQuizDate: string | null;
  quizzesCompleted: number;
  totalQuestions: number;
  correctAnswers: number;
  updateQuizStats: (correct: number, total: number) => Promise<void>;
  checkStreak: () => Promise<void>;
  calculateLevel: (cccBalance: number) => { level: number; xp: number; xpForNextLevel: number };
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

export function StatsProvider({ children }: { children: React.ReactNode }) {
  const [quizzesCompleted, setQuizzesCompleted] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lastQuizDate, setLastQuizDate] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const savedQuizzesCompleted = await AsyncStorage.getItem('@quizzes_completed');
      const savedTotalQuestions = await AsyncStorage.getItem('@total_questions');
      const savedCorrectAnswers = await AsyncStorage.getItem('@correct_answers');
      const savedStreak = await AsyncStorage.getItem('@streak');
      const savedLastQuizDate = await AsyncStorage.getItem('@last_quiz_date');

      if (savedQuizzesCompleted) setQuizzesCompleted(parseInt(savedQuizzesCompleted));
      if (savedTotalQuestions) setTotalQuestions(parseInt(savedTotalQuestions));
      if (savedCorrectAnswers) setCorrectAnswers(parseInt(savedCorrectAnswers));
      if (savedStreak) setStreak(parseInt(savedStreak));
      if (savedLastQuizDate) setLastQuizDate(savedLastQuizDate);
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
      await AsyncStorage.setItem('@quizzes_completed', newQuizzesCompleted.toString());
      await AsyncStorage.setItem('@total_questions', newTotalQuestions.toString());
      await AsyncStorage.setItem('@correct_answers', newCorrectAnswers.toString());
    } catch (error) {
      console.log('Error saving quiz stats:', error);
    }

    await checkStreak();
  };

  const checkStreak = async () => {
    const today = new Date().toDateString();

    if (lastQuizDate) {
      const lastDate = new Date(lastQuizDate);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastDate.toDateString() === yesterday.toDateString()) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        await AsyncStorage.setItem('@streak', newStreak.toString());
      } else if (lastDate.toDateString() !== today) {
        setStreak(1);
        await AsyncStorage.setItem('@streak', '1');
      }
    } else {
      setStreak(1);
      await AsyncStorage.setItem('@streak', '1');
    }

    setLastQuizDate(today);
    await AsyncStorage.setItem('@last_quiz_date', today);
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

  return (
    <StatsContext.Provider
      value={{
        level,
        xp,
        xpForNextLevel,
        accuracy,
        streak,
        lastQuizDate,
        quizzesCompleted,
        totalQuestions,
        correctAnswers,
        updateQuizStats,
        checkStreak,
        calculateLevel,
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

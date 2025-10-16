export interface UserProgression {
  userId: string;
  email: string;
  name: string;
  createdAt: Date;
  lastActiveAt: Date;
  
  // Learning Progress
  totalLessonsCompleted: number;
  totalPracticeSessions: number;
  totalSpeakingTime: number; // in minutes
  
  // Accuracy Metrics
  averageAccuracy: number;
  bestAccuracy: number;
  accuracyHistory: AccuracyRecord[];
  
  // Streaks
  currentStreak: number;
  longestStreak: number;
  streakHistory: StreakRecord[];
  
  // Achievements
  achievements: Achievement[];
  totalPoints: number;
  level: number;
  
  // Practice Statistics
  practiceStats: {
    monologue: PracticeTypeStats;
    publicSpeaking: PracticeTypeStats;
    debate: PracticeTypeStats;
  };
  
  // Goals
  weeklyGoal: number; // minutes per week
  monthlyGoal: number; // sessions per month
  goalsAchieved: number;
  
  // Preferences
  preferredDifficulty: 'beginner' | 'intermediate' | 'advanced';
  preferredPracticeType: 'monologue' | 'publicSpeaking' | 'debate';
  darkMode: boolean;
}

export interface AccuracyRecord {
  date: Date;
  accuracy: number;
  practiceType: string;
  difficulty: string;
}

export interface StreakRecord {
  startDate: Date;
  endDate: Date;
  days: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  points: number;
  category: 'accuracy' | 'streak' | 'practice' | 'milestone';
}

export interface PracticeTypeStats {
  sessionsCompleted: number;
  totalTime: number; // minutes
  averageAccuracy: number;
  bestAccuracy: number;
  lastPracticed: Date;
}

export interface WeeklyProgress {
  week: string; // YYYY-WW format
  lessonsCompleted: number;
  practiceSessions: number;
  speakingTime: number;
  averageAccuracy: number;
  streakDays: number;
}

export interface MonthlyProgress {
  month: string; // YYYY-MM format
  lessonsCompleted: number;
  practiceSessions: number;
  speakingTime: number;
  averageAccuracy: number;
  achievementsUnlocked: number;
  level: number;
}

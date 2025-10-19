import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { UserProgression, AccuracyRecord, Achievement, WeeklyProgress, MonthlyProgress } from '../models/user-progression.model';

@Injectable({
  providedIn: 'root'
})
export class UserProgressionService {
  private progressionCollection: AngularFirestoreCollection<UserProgression>;
  private currentUser$ = new BehaviorSubject<any>(null);

  constructor(
    private firestore: AngularFirestore,
    private auth: AngularFireAuth
  ) {
    this.progressionCollection = this.firestore.collection<UserProgression>('userProgressions');
    
    // Listen to auth state changes
    this.auth.authState.subscribe(user => {
      this.currentUser$.next(user);
    });
  }

  // Get current user's progression
  getUserProgression(): Observable<UserProgression | null> {
    return this.currentUser$.pipe(
      switchMap(user => {
        if (!user) return [null];
        return this.firestore.doc<UserProgression>(`userProgressions/${user.uid}`).valueChanges().pipe(
          map(progression => progression || null)
        );
      })
    );
  }

  // Initialize user progression for new users
  async initializeUserProgression(user: any): Promise<void> {
    // Check if user progression already exists
    const existingDoc = await this.progressionCollection.doc(user.uid).get().toPromise();
    if (existingDoc?.exists) {
      return; // User progression already exists
    }
    const initialProgression: UserProgression = {
      userId: user.uid,
      email: user.email,
      name: user.displayName || 'User',
      createdAt: new Date(),
      lastActiveAt: new Date(),
      totalLessonsCompleted: 0,
      totalPracticeSessions: 0,
      totalSpeakingTime: 0,
      averageAccuracy: 0,
      bestAccuracy: 0,
      accuracyHistory: [],
      currentStreak: 0,
      longestStreak: 0,
      streakHistory: [],
      achievements: [],
      totalPoints: 0,
      level: 1,
      practiceStats: {
        monologue: {
          sessionsCompleted: 0,
          totalTime: 0,
          averageAccuracy: 0,
          bestAccuracy: 0,
          lastPracticed: new Date()
        },
        publicSpeaking: {
          sessionsCompleted: 0,
          totalTime: 0,
          averageAccuracy: 0,
          bestAccuracy: 0,
          lastPracticed: new Date()
        },
        debate: {
          sessionsCompleted: 0,
          totalTime: 0,
          averageAccuracy: 0,
          bestAccuracy: 0,
          lastPracticed: new Date()
        }
      },
      weeklyGoal: 30, // 30 minutes per week
      monthlyGoal: 10, // 10 sessions per month
      goalsAchieved: 0,
      preferredDifficulty: 'beginner',
      preferredPracticeType: 'monologue',
      darkMode: true
    };

    await this.progressionCollection.doc(user.uid).set(initialProgression);
  }

  // Update user progression after practice session
  async updatePracticeSession(
    accuracy: number,
    duration: number, // in minutes
    practiceType: 'monologue' | 'publicSpeaking' | 'debate',
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  ): Promise<void> {
    const user = await this.currentUser$.pipe(take(1)).toPromise();
    if (!user) return;

    const docRef = this.progressionCollection.doc(user.uid);
    
    return this.firestore.firestore.runTransaction(async (transaction) => {
      const doc = await transaction.get(docRef.ref);
      const progression = doc.data() as UserProgression;

      if (!progression) return;

      // Update basic stats
      progression.totalPracticeSessions += 1;
      progression.totalSpeakingTime += duration;
      progression.lastActiveAt = new Date();

      // Update accuracy metrics
      const newAverageAccuracy = this.calculateNewAverage(
        progression.averageAccuracy,
        progression.totalPracticeSessions - 1,
        accuracy
      );
      progression.averageAccuracy = newAverageAccuracy;
      progression.bestAccuracy = Math.max(progression.bestAccuracy, accuracy);

      // Add to accuracy history
      const accuracyRecord: AccuracyRecord = {
        date: new Date(),
        accuracy: accuracy,
        practiceType: practiceType,
        difficulty: difficulty
      };
      progression.accuracyHistory.push(accuracyRecord);

      // Update practice type stats
      const practiceStats = progression.practiceStats[practiceType];
      practiceStats.sessionsCompleted += 1;
      practiceStats.totalTime += duration;
      practiceStats.averageAccuracy = this.calculateNewAverage(
        practiceStats.averageAccuracy,
        practiceStats.sessionsCompleted - 1,
        accuracy
      );
      practiceStats.bestAccuracy = Math.max(practiceStats.bestAccuracy, accuracy);
      practiceStats.lastPracticed = new Date();

      // Update streak
      this.updateStreak(progression);

      // Update points and level
      const pointsEarned = this.calculatePoints(accuracy, duration, practiceType, difficulty);
      progression.totalPoints += pointsEarned;
      progression.level = this.calculateLevel(progression.totalPoints);

      // Check for achievements
      const newAchievements = await this.checkAchievements(progression);
      progression.achievements.push(...newAchievements);

      // Update goals
      this.updateGoals(progression);

      transaction.update(docRef.ref, progression);
    });
  }

  // Update lesson completion
  async completeLesson(lessonId: string): Promise<void> {
    const user = await this.currentUser$.pipe(take(1)).toPromise();
    if (!user) return;

    const docRef = this.progressionCollection.doc(user.uid);
    
    return this.firestore.firestore.runTransaction(async (transaction) => {
      const doc = await transaction.get(docRef.ref);
      const progression = doc.data() as UserProgression;

      if (!progression) return;

      progression.totalLessonsCompleted += 1;
      progression.lastActiveAt = new Date();

      // Update points
      const pointsEarned = 50; // Points for completing a lesson
      progression.totalPoints += pointsEarned;
      progression.level = this.calculateLevel(progression.totalPoints);

      // Check for achievements
      const newAchievements = await this.checkAchievements(progression);
      progression.achievements.push(...newAchievements);

      transaction.update(docRef.ref, progression);
    });
  }

  // Get weekly progress
  getWeeklyProgress(): Observable<WeeklyProgress[]> {
    return this.getUserProgression().pipe(
      map(progression => {
        if (!progression) return [];
        return this.calculateWeeklyProgress(progression);
      })
    );
  }

  // Get monthly progress
  getMonthlyProgress(): Observable<MonthlyProgress[]> {
    return this.getUserProgression().pipe(
      map(progression => {
        if (!progression) return [];
        return this.calculateMonthlyProgress(progression);
      })
    );
  }

  // Get leaderboard
  getLeaderboard(limit: number = 10): Observable<UserProgression[]> {
    return this.firestore.collection<UserProgression>('userProgressions', ref =>
      ref.orderBy('totalPoints', 'desc').limit(limit)
    ).valueChanges();
  }

  // Get recent sessions for analytics
  async getRecentSessions(days: number): Promise<any[]> {
    const user = await this.currentUser$.pipe(take(1)).toPromise();
    if (!user) return [];

    try {
      // Use a simpler query without composite index
      const sessionsSnapshot = await this.firestore.collection('sessions', ref =>
        ref
          .where('userId', '==', user.uid)
          .orderBy('createdAt', 'desc')
          .limit(30)
      ).get().toPromise();

      const sessions = sessionsSnapshot?.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() || {})
      })) || [];

      // Filter by date on the client side to avoid composite index
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      return sessions.filter(session => {
        const sessionDate = (session as any).createdAt?.toDate ? 
          (session as any).createdAt.toDate() : 
          new Date((session as any).createdAt);
        return sessionDate >= startDate;
      });
    } catch (error) {
      console.error('Error fetching recent sessions:', error);
      return [];
    }
  }

  // Get sessions for chart display
  async getSessionsForChart(count: number): Promise<any[]> {
    const user = await this.currentUser$.pipe(take(1)).toPromise();
    if (!user) return [];

    try {
      const sessionsSnapshot = await this.firestore.collection('sessions', ref =>
        ref
          .where('userId', '==', user.uid)
          .orderBy('createdAt', 'desc')
          .limit(count)
      ).get().toPromise();

      // Return in ascending order (oldest first) for charts
      return sessionsSnapshot?.docs
        .map(doc => ({
          id: doc.id,
          ...(doc.data() || {})
        }))
        .reverse() || [];
    } catch (error) {
      console.error('Error fetching sessions for chart:', error);
      return [];
    }
  }

  // Update user preferences
  async updatePreferences(preferences: Partial<UserProgression>): Promise<void> {
    const user = await this.currentUser$.pipe(take(1)).toPromise();
    if (!user) return;

    await this.progressionCollection.doc(user.uid).update(preferences);
  }

  // Private helper methods
  private calculateNewAverage(currentAverage: number, currentCount: number, newValue: number): number {
    return ((currentAverage * currentCount) + newValue) / (currentCount + 1);
  }

  private updateStreak(progression: UserProgression): void {
    const today = new Date();
    const lastActive = new Date(progression.lastActiveAt);
    const daysDiff = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 1) {
      // Consecutive day
      progression.currentStreak += 1;
    } else if (daysDiff > 1) {
      // Streak broken
      if (progression.currentStreak > progression.longestStreak) {
        progression.longestStreak = progression.currentStreak;
      }
      progression.currentStreak = 1;
    }
    // If daysDiff === 0, same day, don't change streak
  }

  private calculatePoints(
    accuracy: number,
    duration: number,
    practiceType: string,
    difficulty: string
  ): number {
    let basePoints = 10;
    
    // Accuracy multiplier
    const accuracyMultiplier = accuracy / 100;
    
    // Duration bonus (1 point per minute)
    const durationBonus = duration;
    
    // Difficulty multiplier
    const difficultyMultiplier = difficulty === 'advanced' ? 1.5 : 
                                difficulty === 'intermediate' ? 1.2 : 1;
    
    // Practice type bonus
    const typeBonus = practiceType === 'debate' ? 5 : 
                     practiceType === 'publicSpeaking' ? 3 : 0;
    
    return Math.floor((basePoints * accuracyMultiplier + durationBonus + typeBonus) * difficultyMultiplier);
  }

  private calculateLevel(totalPoints: number): number {
    // Level 1: 0-100 points
    // Level 2: 101-300 points
    // Level 3: 301-600 points
    // etc. (exponential growth)
    return Math.floor(Math.sqrt(totalPoints / 100)) + 1;
  }

  private async checkAchievements(progression: UserProgression): Promise<Achievement[]> {
    const newAchievements: Achievement[] = [];
    const existingAchievementIds = progression.achievements.map(a => a.id);

    // First Practice Achievement
    if (progression.totalPracticeSessions === 1 && !existingAchievementIds.includes('first_practice')) {
      newAchievements.push({
        id: 'first_practice',
        name: 'First Steps',
        description: 'Completed your first practice session!',
        icon: '🎯',
        unlockedAt: new Date(),
        points: 25,
        category: 'milestone'
      });
    }

    // Accuracy Achievements
    if (progression.bestAccuracy >= 90 && !existingAchievementIds.includes('accuracy_master')) {
      newAchievements.push({
        id: 'accuracy_master',
        name: 'Accuracy Master',
        description: 'Achieved 90% accuracy in a practice session!',
        icon: '🎯',
        unlockedAt: new Date(),
        points: 100,
        category: 'accuracy'
      });
    }

    // Streak Achievements
    if (progression.currentStreak >= 7 && !existingAchievementIds.includes('week_warrior')) {
      newAchievements.push({
        id: 'week_warrior',
        name: 'Week Warrior',
        description: 'Practiced for 7 consecutive days!',
        icon: '🔥',
        unlockedAt: new Date(),
        points: 150,
        category: 'streak'
      });
    }

    // Level Achievements
    if (progression.level >= 5 && !existingAchievementIds.includes('level_up_5')) {
      newAchievements.push({
        id: 'level_up_5',
        name: 'Rising Star',
        description: 'Reached level 5!',
        icon: '⭐',
        unlockedAt: new Date(),
        points: 200,
        category: 'milestone'
      });
    }

    return newAchievements;
  }

  private updateGoals(progression: UserProgression): void {
    // Check weekly goal (30 minutes)
    const thisWeek = this.getWeekNumber(new Date());
    const weeklyProgress = this.getWeeklyProgressForWeek(progression, thisWeek);
    
    if (weeklyProgress.speakingTime >= progression.weeklyGoal) {
      progression.goalsAchieved += 1;
    }

    // Check monthly goal (10 sessions)
    const thisMonth = this.getMonthNumber(new Date());
    const monthlyProgress = this.getMonthlyProgressForMonth(progression, thisMonth);
    
    if (monthlyProgress.practiceSessions >= progression.monthlyGoal) {
      progression.goalsAchieved += 1;
    }
  }

  private calculateWeeklyProgress(progression: UserProgression): WeeklyProgress[] {
    // Implementation for calculating weekly progress
    // This would group accuracyHistory by week and calculate stats
    return [];
  }

  private calculateMonthlyProgress(progression: UserProgression): MonthlyProgress[] {
    // Implementation for calculating monthly progress
    // This would group accuracyHistory by month and calculate stats
    return [];
  }

  private getWeekNumber(date: Date): string {
    const year = date.getFullYear();
    const week = this.getWeekOfYear(date);
    return `${year}-W${week.toString().padStart(2, '0')}`;
  }

  private getMonthNumber(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return `${year}-${month.toString().padStart(2, '0')}`;
  }

  private getWeekOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 1);
    const diff = date.getTime() - start.getTime();
    return Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));
  }

  private getWeeklyProgressForWeek(progression: UserProgression, week: string): any {
    // Implementation to get progress for specific week
    return { speakingTime: 0, practiceSessions: 0 };
  }

  private getMonthlyProgressForMonth(progression: UserProgression, month: string): any {
    // Implementation to get progress for specific month
    return { practiceSessions: 0 };
  }
}

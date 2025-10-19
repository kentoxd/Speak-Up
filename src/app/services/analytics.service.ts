import { Injectable } from '@angular/core';
import { UserProgressionService } from './user-progression.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  
  constructor(private userProgressionService: UserProgressionService) {}

  // Get weekly analytics data
  async getWeeklyAnalytics(): Promise<any> {
    const sessions = await this.userProgressionService.getRecentSessions(7);
    return this.transformSessionData(sessions);
  }

  // Get monthly analytics data
  async getMonthlyAnalytics(): Promise<any> {
    const sessions = await this.userProgressionService.getRecentSessions(30);
    return this.transformSessionData(sessions);
  }

  // Get trend data for charts
  async getTrendData(days: number = 14): Promise<any> {
    const sessions = await this.userProgressionService.getSessionsForChart(days);
    return this.transformTrendData(sessions);
  }

  // Transform session data for analytics display
  private transformSessionData(sessions: any[]): any {
    if (!sessions || sessions.length === 0) {
      return {
        totalSessions: 0,
        totalTime: 0,
        averageAccuracy: 0,
        averagePace: 0,
        averageClarity: 0
      };
    }

    const totalSessions = sessions.length;
    const totalTime = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    const totalAccuracy = sessions.reduce((sum, session) => sum + (session.accuracy || 0), 0);
    const totalPace = sessions.reduce((sum, session) => sum + (session.wordsPerMinute || 0), 0);
    const totalClarity = sessions.reduce((sum, session) => sum + (session.clarityScore || 0), 0);

    return {
      totalSessions,
      totalTime: Math.round(totalTime / 60), // Convert to minutes
      averageAccuracy: Math.round(totalAccuracy / totalSessions),
      averagePace: Math.round(totalPace / totalSessions),
      averageClarity: Math.round(totalClarity / totalSessions)
    };
  }

  // Transform data for trend charts
  private transformTrendData(sessions: any[]): any {
    if (!sessions || sessions.length === 0) {
      return {
        accuracyTrend: [],
        paceTrend: [],
        clarityTrend: [],
        dates: []
      };
    }

    // Sort sessions by date (oldest first)
    const sortedSessions = sessions.sort((a, b) => {
      const dateA = (a.createdAt as any)?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = (b.createdAt as any)?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateA.getTime() - dateB.getTime();
    });

    return {
      accuracyTrend: sortedSessions.map(session => session.accuracy || 0),
      paceTrend: sortedSessions.map(session => session.wordsPerMinute || 0),
      clarityTrend: sortedSessions.map(session => session.clarityScore || 0),
      dates: sortedSessions.map(session => {
        const date = (session.createdAt as any)?.toDate ? session.createdAt.toDate() : new Date(session.createdAt);
        return date.toLocaleDateString();
      })
    };
  }

  // Calculate improvement suggestions based on user progression
  getImprovementSuggestions(progression: any): string[] {
    const suggestions: string[] = [];

    if (progression.averageAccuracy < 70) {
      suggestions.push('Focus on pronunciation and clarity in your practice sessions');
    }

    if (progression.currentStreak < 3) {
      suggestions.push('Try to practice daily to build a consistent routine');
    }

    if (progression.totalPracticeSessions < 5) {
      suggestions.push('Complete more practice sessions to see improvement trends');
    }

    if (progression.bestAccuracy < 80) {
      suggestions.push('Work on reducing filler words and improving speech clarity');
    }

    if (progression.totalSpeakingTime < 30) {
      suggestions.push('Increase your practice time to see better results');
    }

    if (suggestions.length === 0) {
      suggestions.push('Great job! Keep up the consistent practice');
    }

    return suggestions;
  }

  // Calculate trend direction
  calculateTrendDirection(values: number[]): 'up' | 'down' | 'stable' {
    if (values.length < 2) return 'stable';

    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

    const difference = secondAvg - firstAvg;

    if (Math.abs(difference) < 2) return 'stable';
    return difference > 0 ? 'up' : 'down';
  }

  // Get performance insights
  getPerformanceInsights(progression: any, recentSessions: any[]): any {
    const insights = {
      strengths: [] as string[],
      areasForImprovement: [] as string[],
      recommendations: [] as string[]
    };

    // Analyze strengths
    if (progression.averageAccuracy >= 80) {
      insights.strengths.push('High accuracy in speech recognition');
    }
    if (progression.currentStreak >= 7) {
      insights.strengths.push('Consistent daily practice');
    }
    if (progression.totalPracticeSessions >= 10) {
      insights.strengths.push('Regular practice commitment');
    }

    // Analyze areas for improvement
    if (progression.averageAccuracy < 70) {
      insights.areasForImprovement.push('Speech clarity and pronunciation');
    }
    if (progression.currentStreak < 3) {
      insights.areasForImprovement.push('Consistency in practice');
    }
    if (progression.totalSpeakingTime < 60) {
      insights.areasForImprovement.push('Practice duration');
    }

    // Generate recommendations
    if (progression.averageAccuracy < 75) {
      insights.recommendations.push('Practice speaking more slowly and clearly');
    }
    if (progression.currentStreak < 5) {
      insights.recommendations.push('Set a daily practice reminder');
    }
    if (recentSessions.length < 3) {
      insights.recommendations.push('Increase practice frequency');
    }

    return insights;
  }
}
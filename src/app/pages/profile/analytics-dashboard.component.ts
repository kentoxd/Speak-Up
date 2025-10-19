import { Component, OnInit } from '@angular/core';
import { UserProgressionService } from '../../services/user-progression.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-analytics-dashboard',
  templateUrl: './analytics-dashboard.component.html',
  styleUrls: ['./analytics-dashboard.component.scss']
})
export class AnalyticsDashboardComponent implements OnInit {
  userProgression$: Observable<any> = new Observable();
  weeklyData: any[] = [];
  monthlyData: any[] = [];
  accuracyTrend: number[] = [];
  paceTrend: number[] = [];
  clarityTrend: number[] = [];
  isLoading = true;
  
  // Make Math available in template
  Math = Math;

  constructor(private userProgressionService: UserProgressionService) {}

  async ngOnInit() {
    this.userProgression$ = this.userProgressionService.getUserProgression();
    
    // Load analytics data
    await this.loadAnalyticsData();
    this.isLoading = false;
  }

  private async loadAnalyticsData() {
    try {
      // Load weekly data (last 7 days)
      this.weeklyData = await this.userProgressionService.getRecentSessions(7);
      
      // Load monthly data (last 30 days)
      this.monthlyData = await this.userProgressionService.getRecentSessions(30);
      
      // Load chart data (last 14 sessions)
      const chartData = await this.userProgressionService.getSessionsForChart(14);
      
      // Extract trends
      this.accuracyTrend = chartData.map(session => session.accuracy || 0);
      this.paceTrend = chartData.map(session => session.wordsPerMinute || 0);
      this.clarityTrend = chartData.map(session => session.clarityScore || 0);
      
    } catch (error) {
      console.error('Error loading analytics data:', error);
    }
  }

  getWeeklyStats() {
    const totalSessions = this.weeklyData.length;
    const totalTime = this.weeklyData.reduce((sum, session) => sum + (session.duration || 0), 0);
    const avgAccuracy = this.weeklyData.length > 0 
      ? this.weeklyData.reduce((sum, session) => sum + (session.accuracy || 0), 0) / this.weeklyData.length 
      : 0;
    
    return {
      sessions: totalSessions,
      time: Math.round(totalTime / 60), // Convert to minutes
      accuracy: Math.round(avgAccuracy)
    };
  }

  getMonthlyStats() {
    const totalSessions = this.monthlyData.length;
    const totalTime = this.monthlyData.reduce((sum, session) => sum + (session.duration || 0), 0);
    const avgAccuracy = this.monthlyData.length > 0 
      ? this.monthlyData.reduce((sum, session) => sum + (session.accuracy || 0), 0) / this.monthlyData.length 
      : 0;
    
    return {
      sessions: totalSessions,
      time: Math.round(totalTime / 60), // Convert to minutes
      accuracy: Math.round(avgAccuracy)
    };
  }

  getTrendDirection(trend: number[]): 'up' | 'down' | 'stable' {
    if (trend.length < 2) return 'stable';
    
    const firstHalf = trend.slice(0, Math.floor(trend.length / 2));
    const secondHalf = trend.slice(Math.floor(trend.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    const difference = secondAvg - firstAvg;
    
    if (Math.abs(difference) < 2) return 'stable';
    return difference > 0 ? 'up' : 'down';
  }

  getTrendIcon(direction: 'up' | 'down' | 'stable'): string {
    switch (direction) {
      case 'up': return 'trending-up';
      case 'down': return 'trending-down';
      default: return 'remove';
    }
  }

  getTrendColor(direction: 'up' | 'down' | 'stable'): string {
    switch (direction) {
      case 'up': return 'success';
      case 'down': return 'danger';
      default: return 'medium';
    }
  }

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
    
    if (suggestions.length === 0) {
      suggestions.push('Great job! Keep up the consistent practice');
    }
    
    return suggestions;
  }
}
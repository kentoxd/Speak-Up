import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService, UserProfile } from '../../services/storage.service';
import { DataService, MotivationalQuote } from '../../services/data.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  userProfile: UserProfile | null = null;
  motivationalQuote?: MotivationalQuote;
  currentStreak = 0;
  totalLessons = 0;
  completedLessons = 0;

  constructor(
    private router: Router,
    private storageService: StorageService,
    private dataService: DataService
  ) {}

  async ngOnInit() {
    await this.loadUserData();
    this.loadMotivationalQuote();
  }

  async ionViewWillEnter() {
    await this.loadUserData();
  }

  private async loadUserData() {
    this.userProfile = await this.storageService.getUserProfile();
    this.currentStreak = await this.storageService.updateStreak();
    
    // Calculate lesson progress
    const allProgress = await this.storageService.getAllLessonProgress();
    const lessons = this.dataService.getLessons();
    this.totalLessons = lessons.length;
    this.completedLessons = Object.values(allProgress).filter(p => p.completed).length;
  }

  private loadMotivationalQuote() {
    this.motivationalQuote = this.dataService.getRandomQuote();
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    const name = this.userProfile?.name || 'Speaker';
    
    if (hour < 12) {
      return `Good morning, ${name}!`;
    } else if (hour < 18) {
      return `Good afternoon, ${name}!`;
    } else {
      return `Good evening, ${name}!`;
    }
  }

  getProgressPercentage(): number {
    return this.totalLessons > 0 ? Math.round((this.completedLessons / this.totalLessons) * 100) : 0;
  }

  navigateToLessons() {
    this.router.navigate(['/tabs/lessons']);
  }

  navigateToPractice() {
    this.router.navigate(['/tabs/practice']);
  }

  navigateToProfile() {
    this.router.navigate(['/tabs/profile']);
  }

}

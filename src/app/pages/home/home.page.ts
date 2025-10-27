import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { UserProgressionService } from '../../services/user-progression.service';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { UserProgression } from '../../models/user-progression.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  userProgression$: Observable<UserProgression | null> = new Observable();
  localCompletedLessons = 0;
  dailyQuote = '';

  // Array of motivational quotes
  private quotes = [
    "The way to get started is to quit talking and begin doing.",
    "The only impossible journey is the one you never begin.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "Believe you can and you're halfway there.",
    "The future belongs to those who believe in the beauty of their dreams.",
    "It does not matter how slowly you go as long as you do not stop.",
    "Everything you've ever wanted is on the other side of fear.",
    "Success is not how high you have climbed, but how you make a positive difference to the world.",
    "Don't watch the clock; do what it does. Keep going.",
    "The only way to do great work is to love what you do.",
    "You are never too old to set another goal or to dream a new dream.",
    "The secret of getting ahead is getting started.",
    "It always seems impossible until it's done.",
    "What you get by achieving your goals is not as important as what you become by achieving your goals.",
    "The best time to plant a tree was 20 years ago. The second best time is now.",
    "Your limitation—it's only your imagination.",
    "Great things never come from comfort zones.",
    "Dream it. Wish it. Do it.",
    "Success doesn't just find you. You have to go out and get it.",
    "The harder you work for something, the greater you'll feel when you achieve it.",
    "Don't stop when you're tired. Stop when you're done.",
    "Wake up with determination. Go to bed with satisfaction.",
    "Do something today that your future self will thank you for.",
    "Little things make big days.",
    "It's going to be hard, but hard does not mean impossible.",
    "Don't wait for opportunity. Create it.",
    "Sometimes we're tested not to show our weaknesses, but to discover our strengths.",
    "The key to success is to focus on goals, not obstacles.",
    "Dream bigger. Do bigger.",
    "Don't be afraid to give up the good to go for the great."
  ];

  constructor(
    private router: Router,
    private storageService: StorageService,
    private userProgressionService: UserProgressionService,
    private dataService: DataService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    // Initialize user progression
    this.authService.getCurrentUser().subscribe(async (user) => {
      if (user) {
        await this.userProgressionService.initializeUserProgression(user);
      }
    });

    // Load user progression
    this.userProgression$ = this.userProgressionService.getUserProgression();

    // Load local lesson data
    await this.loadLocalLessonData();

    // Get daily quote
    this.dailyQuote = this.getDailyQuote();
  }

  async ionViewWillEnter() {
    // Refresh data when entering the page
    await this.loadLocalLessonData();
    this.dailyQuote = this.getDailyQuote();
  }

  private async loadLocalLessonData() {
    const allProgress = await this.storageService.getAllLessonProgress();
    this.localCompletedLessons = Object.values(allProgress).filter(p => p.completed).length;
  }

  private getDailyQuote(): string {
    // Get the current date and use it as a seed for consistent daily quotes
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    const index = dayOfYear % this.quotes.length;
    return this.quotes[index];
  }

  navigateToLessons() {
    this.router.navigate(['/tabs/lessons']);
  }

  navigateToPractice() {
    this.router.navigate(['/tabs/practice']);
  }
}
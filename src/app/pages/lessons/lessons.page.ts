import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { DataService, Topic, Lesson } from '../../services/data.service';
import { StorageService, TopicProgress, LessonProgress } from '../../services/storage.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lessons',
  templateUrl: './lessons.page.html',
  styleUrls: ['./lessons.page.scss'],
})
export class LessonsPage implements OnInit, OnDestroy {
  topics: Topic[] = [];
  topicProgress: {[key: string]: TopicProgress} = {};
  overallProgress = 0;
  completedTopics = 0;
  totalTopics = 0;
  Math = Math;
  
  private progressSubscription: Subscription | null = null;

  constructor(
    private router: Router,
    private dataService: DataService,
    private storageService: StorageService
  ) { }

  async ngOnInit() {
    await this.loadTopics();
    
    // Subscribe to progress changes
    this.progressSubscription = this.storageService.topicProgressChanged$.subscribe(async (topicId) => {
      if (topicId) {
        // Reload progress immediately when any topic changes
        await this.loadTopicProgress();
      }
    });
  }

  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks
    if (this.progressSubscription) {
      this.progressSubscription.unsubscribe();
    }
  }

  async ionViewWillEnter() {
    await this.loadTopicProgress();
  }

  private async loadTopics() {
    this.topics = this.dataService.getTopics();
    this.totalTopics = this.topics.length;  
    await this.loadTopicProgress();
  }

  private async loadTopicProgress() {
    this.topicProgress = await this.storageService.getAllTopicProgress();
    this.calculateOverallProgress();
  }

  private calculateOverallProgress() {
  const totalLessons = this.topics.reduce((sum, topic) => sum + topic.lessons.length, 0);
  let completedLessons = 0;
  this.completedTopics = 0;

  this.topics.forEach(topic => {
    const progress = this.topicProgress[topic.id];
    if (progress) {
      // Only count actually completed lessons
      completedLessons += progress.lessonsCompleted || 0;
      if (progress.completed) {
        this.completedTopics++;
      }
    }
    // If no progress exists, completedLessons stays at 0 for this topic
  });

  // Make sure we don't show 100% when nothing is completed
  if (totalLessons === 0) {
    this.overallProgress = 0;
  } else if (completedLessons === 0) {
    this.overallProgress = 0;
  } else {
    this.overallProgress = (completedLessons / totalLessons) * 100;
  }
  
  console.log('Total lessons:', totalLessons, 'Completed:', completedLessons, 'Progress:', this.overallProgress);
}

  getTopicProgress(topicId: string): TopicProgress | null {
    return this.topicProgress[topicId] || null;
  }

  isTopicCompleted(topicId: string): boolean {
    const progress = this.getTopicProgress(topicId);
    return progress?.completed || false;
  }

  isQuizUnlocked(topicId: string): boolean {
    const progress = this.getTopicProgress(topicId);
    return progress?.quizUnlocked || false;
  }

  openTopic(topic: Topic) {
    this.router.navigate(['/topic-lessons', topic.id]);
  }

  getCompletedTopicsCount(): number {
    return this.completedTopics;
  }

  getTotalTopicsCount(): number {
    return this.totalTopics;
  }

  startQuiz(topic: Topic) {
    this.router.navigate(['/topic-quiz', topic.id]);
  }
}
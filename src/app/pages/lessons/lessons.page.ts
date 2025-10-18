import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService, Topic, Lesson } from '../../services/data.service';
import { StorageService, TopicProgress, LessonProgress } from '../../services/storage.service';

@Component({
  selector: 'app-lessons',
  templateUrl: './lessons.page.html',
  styleUrls: ['./lessons.page.scss'],
})
export class LessonsPage implements OnInit {
  topics: Topic[] = [];
  topicProgress: {[key: string]: TopicProgress} = {};
  overallProgress = 0;
  completedTopics = 0;
  totalTopics = 0;
  Math = Math;

  constructor(
    private router: Router,
    private dataService: DataService,
    private storageService: StorageService
  ) { }

  async ngOnInit() {
    await this.loadTopics();
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
    const totalLessons = this.topics.length * 5; // 5 lessons per topic
    let completedLessons = 0;
    this.completedTopics = 0;

    this.topics.forEach(topic => {
      const progress = this.topicProgress[topic.id];
      if (progress) {
        completedLessons += progress.lessonsCompleted;
        if (progress.completed) {
          this.completedTopics++;
        }
      }
    });

    this.overallProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
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

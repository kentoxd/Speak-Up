import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService, Topic, Lesson } from '../../services/data.service';
import { StorageService, TopicProgress, LessonProgress } from '../../services/storage.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-topic-lessons',
  templateUrl: './topic-lessons.page.html',
  styleUrls: ['./topic-lessons.page.scss'],
})
export class TopicLessonsPage implements OnInit {
  topic: Topic | null = null;
  lessons: Lesson[] = [];
  topicProgress: TopicProgress | null = null;
  lessonProgress: {[key: string]: LessonProgress} = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private storageService: StorageService,
    private toastController: ToastController
  ) { }

  async ngOnInit() {
    const topicId = this.route.snapshot.paramMap.get('id');
    if (topicId) {
      await this.loadTopic(topicId);
    }
  }

  async ionViewWillEnter() {
    if (this.topic) {
      await this.loadProgress();
    }
  }

  private async loadTopic(topicId: string) {
    this.topic = this.dataService.getTopic(topicId) || null;
    if (this.topic) {
      this.lessons = this.topic.lessons.sort((a, b) => a.order - b.order);
      await this.loadProgress();
    }
  }

  private async loadProgress() {
    if (!this.topic) return;
    
    this.lessonProgress = await this.storageService.getAllLessonProgress();
    
    // Recalculate topic progress to ensure it's in sync with lesson progress
    this.topicProgress = await this.storageService.updateTopicProgress(this.topic.id, true);
  }

  readLesson(lesson: Lesson) {
    // Navigate to lesson content page
    this.router.navigate(['/lesson-content', lesson.id]);
  }

  async markLessonAsDone(lesson: Lesson) {
    if (!this.topic) return;

    // Check if lesson is already completed
    if (this.isLessonCompleted(lesson.id)) {
      const toast = await this.toastController.create({
        message: 'This lesson is already completed!',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      // Still recalculate topic progress in case it's out of sync
      const updatedTopicProgress = await this.storageService.updateTopicProgress(this.topic.id, true);
      this.topicProgress = updatedTopicProgress;
      return;
    }

    // Mark lesson as completed
    const lessonProgress: LessonProgress = {
      lessonId: lesson.id,
      completed: true,
      progress: 100,
      lastAccessed: new Date().toISOString()
    };
    await this.storageService.setLessonProgress(lesson.id, lessonProgress);

    // Update lesson progress immediately in UI
    this.lessonProgress[lesson.id] = lessonProgress;

    // Update topic progress (this will recalculate based on actual completed lessons)
    const updatedTopicProgress = await this.storageService.updateTopicProgress(this.topic.id, true);
    this.topicProgress = updatedTopicProgress;

    // Show success message
    const toast = await this.toastController.create({
      message: 'Lesson marked as completed!',
      duration: 2000,
      color: 'success'
    });
    await toast.present();

    // Check if all lessons are completed to unlock quiz
    if (updatedTopicProgress.quizUnlocked) {
      const quizToast = await this.toastController.create({
        message: 'Quiz unlocked! You can now take the topic quiz.',
        duration: 3000,
        color: 'tertiary'
      });
      await quizToast.present();
    }
  }

  isLessonCompleted(lessonId: string): boolean {
    return this.lessonProgress[lessonId]?.completed || false;
  }

  getTopicProgress(): number {
    return this.topicProgress?.progress || 0;
  }

  isQuizUnlocked(): boolean {
    return this.topicProgress?.quizUnlocked || false;
  }

  startQuiz() {
    if (this.topic) {
      this.router.navigate(['/topic-quiz', this.topic.id]);
    }
  }

  goBack() {
    this.router.navigate(['/tabs/lessons']);
  }

  getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'danger';
      default: return 'medium';
    }
  }

}

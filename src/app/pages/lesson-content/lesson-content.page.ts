import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { DataService, Lesson, QuizQuestion } from '../../services/data.service';
import { StorageService, LessonProgress } from '../../services/storage.service';
import { UserProgressionService } from '../../services/user-progression.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-lesson-content',
  templateUrl: './lesson-content.page.html',
  styleUrls: ['./lesson-content.page.scss'],
})
export class LessonContentPage implements OnInit {
  lesson?: Lesson;
  currentContentIndex = 0;
  showQuiz = false;
  currentQuizQuestion = 0;
  selectedAnswers: number[] = [];
  quizCompleted = false;
  lessonProgress: LessonProgress | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private storageService: StorageService,
    private userProgressionService: UserProgressionService,
    private authService: AuthService,
    private alertController: AlertController,
    private toastController: ToastController
  ) { }

  async ngOnInit() {
    const lessonId = this.route.snapshot.paramMap.get('id');
    if (lessonId) {
      this.lesson = this.dataService.getLesson(lessonId);
      if (this.lesson) {
        await this.loadLessonProgress();
      } else {
        this.router.navigate(['/not-found']);
      }
    }
  }

  private async loadLessonProgress() {
    if (!this.lesson) return;
    
    this.lessonProgress = await this.storageService.getLessonProgress(this.lesson.id);
    if (!this.lessonProgress) {
      this.lessonProgress = {
        lessonId: this.lesson.id,
        completed: false,
        progress: 0,
        lastAccessed: new Date().toISOString()
      };
    }
    
    // Update last accessed
    this.lessonProgress.lastAccessed = new Date().toISOString();
    await this.storageService.setLessonProgress(this.lesson.id, this.lessonProgress);
  }

  nextContent() {
    if (!this.lesson) return;
    
    if (this.currentContentIndex < this.lesson.content.length - 1) {
      // Move to next content section
      this.currentContentIndex++;
      this.updateProgress();
    } else if (this.lesson.quiz && !this.showQuiz) {
      // Show quiz after last content section
      this.showQuiz = true;
      this.selectedAnswers = new Array(this.lesson.quiz.questions.length).fill(-1);
      this.updateProgress();
    }
    // If no quiz exists and we're at the last content, the "Complete Lesson" button handles it
  }

  prevContent() {
    if (this.showQuiz) {
      this.showQuiz = false;
      return;
    }
    
    if (this.currentContentIndex > 0) {
      this.currentContentIndex--;
      this.updateProgress();
    }
  }

  private async updateProgress() {
    if (!this.lesson || !this.lessonProgress) return;
    
    const totalSteps = this.lesson.content.length + (this.lesson.quiz ? 1 : 0);
    const currentStep = this.showQuiz ? this.lesson.content.length + 1 : this.currentContentIndex + 1;
    
    this.lessonProgress.progress = Math.round((currentStep / totalSteps) * 100);
    await this.storageService.setLessonProgress(this.lesson.id, this.lessonProgress);
  }

  selectAnswer(questionIndex: number, answerIndex: number) {
    this.selectedAnswers[questionIndex] = answerIndex;
  }

  async submitQuiz() {
    if (!this.lesson?.quiz) return;
    
    const unanswered = this.selectedAnswers.some(answer => answer === -1);
    if (unanswered) {
      const alert = await this.alertController.create({
        header: 'Incomplete Quiz',
        message: 'Please answer all questions before submitting.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    let correctAnswers = 0;
    this.lesson.quiz.questions.forEach((question, index) => {
      if (this.selectedAnswers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = correctAnswers;
    const total = this.lesson.quiz.questions.length;

    // Navigate to results page with params
    this.router.navigate(['/quiz-results', this.lesson.id], {
      queryParams: {
        score: score,
        total: total,
        answers: JSON.stringify(this.selectedAnswers),
        type: 'lesson'  // Indicate it's a lesson quiz
      }
    });

    // Optionally, mark as completed after viewing results
    // this.quizCompleted = true;
    // this.completeLesson();
  }

  async completeLesson() {
    if (!this.lesson || !this.lessonProgress) return;
    
    this.lessonProgress.completed = true;
    this.lessonProgress.progress = 100;
    await this.storageService.setLessonProgress(this.lesson.id, this.lessonProgress);
    
    // Update Firebase user progression
    try {
      this.authService.getCurrentUser().subscribe(async user => {
        if (user) {
          console.log('Updating user progression for lesson completion');
          await this.userProgressionService.completeLesson(this.lesson!.id);
          console.log('User progression updated successfully');
        }
      });
    } catch (error) {
      console.error('Error updating user progression:', error);
    }
    
    const toast = await this.toastController.create({
      message: 'Lesson completed! 🎉',
      duration: 2000,
      color: 'success',
      position: 'top'
    });
    await toast.present();
    
    setTimeout(() => {
      this.router.navigate(['/tabs/lessons']);
    }, 2000);
  }

  goBack() {
    this.router.navigate(['/tabs/lessons']);
  }

  getProgressPercentage(): number {
    return this.lessonProgress?.progress || 0;
  }

  canGoNext(): boolean {
    if (!this.lesson) return false;
    
    // Can't go next while in quiz - must use Submit Quiz button
    if (this.showQuiz) {
      return !this.selectedAnswers.some(answer => answer === -1);
    }
    
    // Can go next if not at the last content item
    return this.currentContentIndex < this.lesson.content.length - 1;
  }

  canGoPrev(): boolean {
    return this.currentContentIndex > 0 || this.showQuiz;
  }

  shouldShowStartQuizButton(): boolean {
    if (!this.lesson?.quiz) return false;
    return !this.showQuiz && this.currentContentIndex === this.lesson.content.length - 1;
  }
}

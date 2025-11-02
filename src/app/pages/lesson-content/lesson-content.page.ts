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
    const randomize = this.route.snapshot.queryParamMap.get('randomize');
    const retry = this.route.snapshot.queryParamMap.get('retry');
    
    if (lessonId) {
      this.lesson = this.dataService.getLesson(lessonId);
      if (this.lesson) {
        await this.loadLessonProgress();
        
        // Only randomize quiz questions if explicitly requested (retry or randomize param)
        // This ensures questions stay consistent during an active quiz session
        if (this.lesson.quiz && (retry === 'true' || randomize === 'true')) {
          this.shuffleQuizQuestions();
        }
        
        // If retry is requested, go straight to quiz
        if (retry === 'true' && this.lesson.quiz) {
          this.showQuiz = true;
          this.selectedAnswers = new Array(this.lesson.quiz.questions.length).fill(-1);
          this.currentContentIndex = this.lesson.content.length - 1;
          this.updateProgress();
        }
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

    // Get shuffle mapping if questions were shuffled
    const shuffleMapping = (this.lesson.quiz as any)._shuffleMapping || null;

    // Mark lesson as completed before navigating to results
    this.quizCompleted = true;
    await this.completeLesson();

    // Navigate to results page with params - include question order mapping if shuffled
    const queryParams: any = {
      score: score,
      total: total,
      answers: JSON.stringify(this.selectedAnswers),
      type: 'lesson'  // Indicate it's a lesson quiz
    };
    
    if (shuffleMapping) {
      // Pass the mapping: array where index = shuffled position, value = original index
      queryParams.questionOrder = JSON.stringify(shuffleMapping);
    }

    this.router.navigate(['/quiz-results', this.lesson.id], { queryParams });
  }

  async completeLesson(showToast: boolean = false) {
    if (!this.lesson || !this.lessonProgress) return;
    
    // Check if already completed to prevent double counting
    if (this.lessonProgress.completed) {
      console.log('Lesson already completed, skipping duplicate completion');
      return;
    }
    
    this.lessonProgress.completed = true;
    this.lessonProgress.progress = 100;
    await this.storageService.setLessonProgress(this.lesson.id, this.lessonProgress);
    
    // Update topic progress when lesson is completed
    if (this.lesson.topicId) {
      try {
        const topicProgress = await this.storageService.updateTopicProgress(this.lesson.topicId, true);
        console.log('Topic progress updated:', topicProgress);
      } catch (error) {
        console.error('Error updating topic progress:', error);
      }
    }
    
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
    
    if (showToast) {
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

  // Shuffle quiz questions for retry
  private shuffleQuizQuestions() {
    if (!this.lesson?.quiz) return;
    
    // Store original indices before shuffling
    const originalQuestions = [...this.lesson.quiz.questions];
    const indices = originalQuestions.map((_, idx) => idx);
    
    // Shuffle indices array
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    
    // Create shuffled questions array using shuffled indices
    const shuffledQuestions = indices.map(idx => originalQuestions[idx]);
    
    // Store the mapping for results page (which original index is at which shuffled position)
    // Store in a temporary property that will be used when submitting
    (this.lesson.quiz as any)._shuffleMapping = indices;
    
    // Create shuffled quiz object
    this.lesson.quiz = {
      ...this.lesson.quiz,
      questions: shuffledQuestions
    };
  }
}

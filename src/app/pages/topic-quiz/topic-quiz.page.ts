import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService, Topic, QuizQuestion } from '../../services/data.service';
import { StorageService, TopicProgress } from '../../services/storage.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-topic-quiz',
  templateUrl: './topic-quiz.page.html',
  styleUrls: ['./topic-quiz.page.scss'],
})
export class TopicQuizPage implements OnInit {
  topic: Topic | null = null;
  questions: QuizQuestion[] = [];
  currentQuestionIndex = 0;
  selectedAnswers: number[] = [];
  quizCompleted = false;
  score = 0;
  totalQuestions = 0;
  Math = Math;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private storageService: StorageService,
    private toastController: ToastController
  ) { }

  async ngOnInit() {
    const topicId = this.route.snapshot.paramMap.get('id');
    const retry = this.route.snapshot.queryParamMap.get('retry');
    
    if (topicId) {
      await this.loadTopic(topicId, retry === 'true');
    }
  }

  async ionViewWillEnter() {
    // Check if this is a retry and reset the quiz
    const retry = this.route.snapshot.queryParamMap.get('retry');
    if (retry === 'true' && this.topic) {
      await this.resetQuiz();
    }
  }

  private async resetQuiz() {
    if (this.topic && this.topic.quiz) {
      // Reset all quiz state
      this.currentQuestionIndex = 0;
      this.quizCompleted = false;
      this.score = 0;
      
      // Randomize questions for retry
      this.questions = [...this.topic.quiz.questions].sort(() => Math.random() - 0.5);
      this.totalQuestions = this.questions.length;
      this.selectedAnswers = new Array(this.totalQuestions).fill(-1);
    }
  }

  private async loadTopic(topicId: string, isRetry: boolean = false) {
    this.topic = this.dataService.getTopic(topicId) || null;
    if (this.topic && this.topic.quiz) {
      // Reset quiz state
      this.currentQuestionIndex = 0;
      this.quizCompleted = false;
      this.score = 0;
      
      // Randomize questions if it's a retry
      if (isRetry) {
        this.questions = [...this.topic.quiz.questions].sort(() => Math.random() - 0.5);
      } else {
        this.questions = [...this.topic.quiz.questions];
      }
      
      this.totalQuestions = this.questions.length;
      this.selectedAnswers = new Array(this.totalQuestions).fill(-1);
      
      // Check if quiz is unlocked
      const topicProgress = await this.storageService.getTopicProgress(topicId);
      if (!topicProgress?.quizUnlocked) {
        const toast = await this.toastController.create({
          message: 'Complete all lessons first to unlock the quiz!',
          duration: 3000,
          color: 'warning'
        });
        await toast.present();
        this.router.navigate(['/topic-lessons', topicId]);
        return;
      }
    }
  }

  selectAnswer(answerIndex: number) {
    this.selectedAnswers[this.currentQuestionIndex] = answerIndex;
  }

  nextQuestion() {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  async submitQuiz() {
    if (this.selectedAnswers.includes(-1)) {
      const toast = await this.toastController.create({
        message: 'Please answer all questions before submitting!',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    // Calculate score
    this.score = 0;
    this.questions.forEach((question, index) => {
      if (this.selectedAnswers[index] === question.correctAnswer) {
        this.score++;
      }
    });

    this.quizCompleted = true;

    // Update topic progress
    if (this.topic) {
      const topicProgress = await this.storageService.getTopicProgress(this.topic.id);
      if (topicProgress) {
        const updatedProgress: TopicProgress = {
          ...topicProgress,
          quizCompleted: true,
          lastAccessed: new Date().toISOString()
        };
        await this.storageService.setTopicProgress(this.topic.id, updatedProgress);
      }
    }


    // Auto-navigate to results after showing completion briefly
    setTimeout(() => {
      this.goToResults();
    }, 1000);
  }

  goToResults() {
    if (this.topic) {
      this.router.navigate(['/quiz-results', this.topic.id], {
        queryParams: {
          score: this.score,
          total: this.totalQuestions,
          answers: JSON.stringify(this.selectedAnswers)
        }
      });
    }
  }

  goBack() {
    if (this.topic) {
      this.router.navigate(['/topic-lessons', this.topic.id]);
    }
  }

  getCurrentQuestion(): QuizQuestion | null {
    return this.questions[this.currentQuestionIndex] || null;
  }

  isAnswerSelected(answerIndex: number): boolean {
    return this.selectedAnswers[this.currentQuestionIndex] === answerIndex;
  }

  hasAnswerSelected(): boolean {
    return this.selectedAnswers[this.currentQuestionIndex] !== -1;
  }

  getProgress(): number {
    return ((this.currentQuestionIndex + 1) / this.totalQuestions) * 100;
  }

}

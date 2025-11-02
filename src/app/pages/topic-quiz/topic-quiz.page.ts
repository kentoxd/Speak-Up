import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService, Topic, Lesson, QuizQuestion } from '../../services/data.service';
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

  private shuffleMapping: number[] = [];

  private async resetQuiz() {
    if (this.topic) {
      // Reset all quiz state
      this.currentQuestionIndex = 0;
      this.quizCompleted = false;
      this.score = 0;
      
      // Collect all questions from lessons
      const originalQuestions: QuizQuestion[] = [];
      this.topic.lessons.forEach((lesson: Lesson) => {
        if (lesson.quiz && lesson.quiz.questions) {
          originalQuestions.push(...lesson.quiz.questions);
        }
      });
      
      // Create indices array and shuffle it
      this.shuffleMapping = originalQuestions.map((_, idx) => idx);
      for (let i = this.shuffleMapping.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.shuffleMapping[i], this.shuffleMapping[j]] = [this.shuffleMapping[j], this.shuffleMapping[i]];
      }
      
      // Apply shuffle to questions
      this.questions = this.shuffleMapping.map(idx => originalQuestions[idx]);
      
      this.totalQuestions = this.questions.length;
      this.selectedAnswers = new Array(this.totalQuestions).fill(-1);
    }
  }

  private async loadTopic(topicId: string, isRetry: boolean = false) {
    this.topic = this.dataService.getTopic(topicId) || null;
    if (this.topic) {
      // Reset quiz state
      this.currentQuestionIndex = 0;
      this.quizCompleted = false;
      this.score = 0;
      
      // Collect all quiz questions from all lessons in the topic
      const originalQuestions: QuizQuestion[] = [];
      this.topic.lessons.forEach((lesson: Lesson) => {
        if (lesson.quiz && lesson.quiz.questions) {
          originalQuestions.push(...lesson.quiz.questions);
        }
      });
      
      // Only randomize questions if it's explicitly a retry
      // This ensures consistency during an active quiz session
      if (isRetry) {
        // Create indices array and shuffle it
        this.shuffleMapping = originalQuestions.map((_, idx) => idx);
        for (let i = this.shuffleMapping.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [this.shuffleMapping[i], this.shuffleMapping[j]] = [this.shuffleMapping[j], this.shuffleMapping[i]];
        }
        // Apply shuffle to questions
        this.questions = this.shuffleMapping.map(idx => originalQuestions[idx]);
      } else {
        // Use original order
        this.questions = [...originalQuestions];
        this.shuffleMapping = originalQuestions.map((_, idx) => idx);
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
      // Pass shuffle mapping to preserve question order in results page
      const queryParams: any = {
        type: 'topic',
        score: this.score,
        total: this.totalQuestions,
        answers: JSON.stringify(this.selectedAnswers)
      };
      
      // If questions were shuffled, pass the mapping
      if (this.shuffleMapping && this.shuffleMapping.length > 0) {
        queryParams.questionOrder = JSON.stringify(this.shuffleMapping);
      }
      
      this.router.navigate(['/quiz-results', this.topic.id], { queryParams });
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
  retakeQuiz() {
    // Reset quiz state
    this.currentQuestionIndex = 0;
    this.selectedAnswers = [];
    this.score = 0;
    this.quizCompleted = false;
  }
  
}
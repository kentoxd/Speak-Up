import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService, Topic, QuizQuestion } from '../../services/data.service';

@Component({
  selector: 'app-quiz-results',
  templateUrl: './quiz-results.page.html',
  styleUrls: ['./quiz-results.page.scss'],
})
export class QuizResultsPage implements OnInit {
  topic: Topic | null = null;
  questions: QuizQuestion[] = [];
  userAnswers: number[] = [];
  score = 0;
  totalQuestions = 0;
  percentage = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService
  ) { }

  ngOnInit() {
    const topicId = this.route.snapshot.paramMap.get('id');
    const queryParams = this.route.snapshot.queryParams;
    
    if (topicId) {
      this.loadTopic(topicId);
    }
    
    if (queryParams['score'] && queryParams['total'] && queryParams['answers']) {
      this.score = parseInt(queryParams['score']);
      this.totalQuestions = parseInt(queryParams['total']);
      this.percentage = Math.round((this.score / this.totalQuestions) * 100);
      this.userAnswers = JSON.parse(queryParams['answers']);
    }
  }

  private loadTopic(topicId: string) {
    this.topic = this.dataService.getTopic(topicId) || null;
    if (this.topic && this.topic.quiz) {
      this.questions = [...this.topic.quiz.questions];
    }
  }

  isCorrectAnswer(questionIndex: number, answerIndex: number): boolean {
    return this.questions[questionIndex]?.correctAnswer === answerIndex;
  }

  isUserAnswer(questionIndex: number, answerIndex: number): boolean {
    return this.userAnswers[questionIndex] === answerIndex;
  }

  getAnswerColor(questionIndex: number, answerIndex: number): string {
    if (this.isCorrectAnswer(questionIndex, answerIndex)) {
      return 'success';
    } else if (this.isUserAnswer(questionIndex, answerIndex) && !this.isCorrectAnswer(questionIndex, answerIndex)) {
      return 'danger';
    }
    return 'medium';
  }

  tryAgain() {
    if (this.topic) {
      this.router.navigate(['/topic-quiz', this.topic.id], {
        queryParams: { retry: 'true' }
      });
    }
  }

  backToLessons() {
    if (this.topic) {
      this.router.navigate(['/topic-lessons', this.topic.id]);
    }
  }

  goToLearnTab() {
    this.router.navigate(['/tabs/lessons']);
  }

  getScoreMessage(): string {
    if (this.percentage >= 90) return 'Excellent!';
    if (this.percentage >= 80) return 'Great job!';
    if (this.percentage >= 70) return 'Good work!';
    if (this.percentage >= 60) return 'Not bad!';
    return 'Keep practicing!';
  }

  getScoreColor(): string {
    if (this.percentage >= 70) return 'success';
    if (this.percentage >= 50) return 'warning';
    return 'danger';
  }
}
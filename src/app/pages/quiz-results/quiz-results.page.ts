import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService, Topic, Lesson, QuizQuestion } from '../../services/data.service';

@Component({
  selector: 'app-quiz-results',
  templateUrl: './quiz-results.page.html',
  styleUrls: ['./quiz-results.page.scss'],
})
export class QuizResultsPage implements OnInit {
  topic: Topic | null = null;
  lesson: Lesson | null = null;  // Add support for lessons
  questions: QuizQuestion[] = [];
  userAnswers: number[] = [];
  score = 0;
  totalQuestions = 0;
  percentage = 0;
  isLessonQuiz = false;  // Flag to distinguish lesson vs. topic quiz

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');  // Could be topicId or lessonId
    const queryParams = this.route.snapshot.queryParams;
    const type = queryParams['type'];  // Add 'type' param: 'topic' or 'lesson'
    
    if (id && type === 'lesson') {
      this.isLessonQuiz = true;
      this.loadLesson(id);
    } else if (id) {
      this.loadTopic(id);
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

  private loadLesson(lessonId: string) {  // New method for lessons
    this.lesson = this.dataService.getLesson(lessonId) || null;
    if (this.lesson && this.lesson.quiz) {
      this.questions = [...this.lesson.quiz.questions];
    }
  }

  // Rest of the methods remain the same...
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
    if (this.isLessonQuiz && this.lesson) {
      // Navigate to lesson content and signal to randomize quiz
      this.router.navigate(['/lesson-content', this.lesson.id], {
        queryParams: { retry: 'true', randomize: 'true' }
      });
    } else if (this.topic) {
      this.router.navigate(['/topic-quiz', this.topic.id], {
        queryParams: { retry: 'true', randomize: 'true' }
      });
    }
  }

  backToLessons() {
    if (this.isLessonQuiz && this.lesson) {
      this.router.navigate(['/tabs/lessons']);  // Or specific lesson list
    } else if (this.topic) {
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
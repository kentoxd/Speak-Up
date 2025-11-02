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
  lesson: Lesson | null = null;
  questions: QuizQuestion[] = [];
  userAnswers: number[] = [];
  score = 0;
  totalQuestions = 0;
  percentage = 0;
  isLessonQuiz = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    const queryParams = this.route.snapshot.queryParams;
    const type = queryParams['type'];
    
    if (id && type === 'lesson') {
      this.isLessonQuiz = true;
      this.loadLesson(id, queryParams);
    } else if (id) {
      this.loadTopic(id, queryParams);
    }
    
    if (queryParams['score'] && queryParams['total'] && queryParams['answers']) {
      this.score = parseInt(queryParams['score']);
      this.totalQuestions = parseInt(queryParams['total']);
      this.percentage = Math.round((this.score / this.totalQuestions) * 100);
      this.userAnswers = JSON.parse(queryParams['answers']);
    }
  }

  private loadTopic(topicId: string, queryParams: any) {
    this.topic = this.dataService.getTopic(topicId) || null;
    if (this.topic) {
      // Collect all questions in original order
      const originalQuestions: QuizQuestion[] = [];
      this.topic.lessons.forEach((lesson: Lesson) => {
        if (lesson.quiz && lesson.quiz.questions) {
          originalQuestions.push(...lesson.quiz.questions);
        }
      });
      
      // Preserve question order from quiz if provided (shuffle mapping)
      // The mapping tells us: at shuffled position i, which original index should appear
      if (queryParams['questionOrder']) {
        const shuffleMapping = JSON.parse(queryParams['questionOrder']) as number[];
        this.questions = shuffleMapping.map((originalIdx: number) => {
          return originalQuestions[originalIdx];
        }).filter(q => q !== undefined);
      } else {
        // Use original order if no mapping provided
        this.questions = originalQuestions;
      }
    }
  }

  private loadLesson(lessonId: string, queryParams: any) {
    this.lesson = this.dataService.getLesson(lessonId) || null;
    if (this.lesson && this.lesson.quiz) {
      // Get original questions from data service (unshuffled)
      const originalQuestions = [...this.lesson.quiz.questions];
      
      // If questionOrder mapping is provided, use it to reorder (for shuffled quizzes)
      // The mapping tells us: at shuffled position i, which original index should appear
      if (queryParams['questionOrder']) {
        const shuffleMapping = JSON.parse(queryParams['questionOrder']) as number[];
        this.questions = shuffleMapping.map((originalIdx: number) => {
          return originalQuestions[originalIdx];
        }).filter(q => q !== undefined);
      } else {
        // Use original order if no mapping was specified
        this.questions = originalQuestions;
      }
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
    if (this.isLessonQuiz && this.lesson) {
      this.router.navigate(['/lesson-content', this.lesson.id], {
        queryParams: { retry: 'true', randomize: 'true' }
      });
    } else if (this.topic) {
      this.router.navigate(['/topic-quiz', this.topic.id], {
        queryParams: { retry: 'true', randomize: 'true' }
      });
    }
  }

  // NEW: Navigate to next lesson
  goToNextLesson() {
    if (this.lesson) {
      // Get all lessons from the topic
      const allLessons = this.dataService.getAllLessons();
      const currentIndex = allLessons.findIndex(l => l.id === this.lesson?.id);
      
      // Find next lesson
      if (currentIndex !== -1 && currentIndex < allLessons.length - 1) {
        const nextLesson = allLessons[currentIndex + 1];
        this.router.navigate(['/lesson-content', nextLesson.id]);
      } else {
        // No next lesson available, go back to lessons
        this.backToLessons();
      }
    }
  }

  // UPDATED: Back to Lessons (list of lessons for the current topic)
  backToLessons() {
    if (this.lesson && this.lesson.topicId) {
      // Navigate to lessons page for this lesson's topic
      this.router.navigate(['/topic-lessons', this.lesson.topicId]);
    } else if (this.topic) {
      // Navigate to lessons page for this topic
      this.router.navigate(['/topic-lessons', this.topic.id]);
    } else {
      // Fallback to lessons tab
      this.router.navigate(['/tabs/lessons']);
    }
  }

  // NEW: Back to Topics (main learn/topics page)
  backToTopics() {
    this.router.navigate(['/tabs/lessons']);
  }

  goToLearnTab() {
    this.router.navigate(['/tabs/topic-lessons']);
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
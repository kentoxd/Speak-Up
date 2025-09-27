import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService, Lesson } from '../../services/data.service';
import { StorageService, LessonProgress } from '../../services/storage.service';

@Component({
  selector: 'app-lessons',
  templateUrl: './lessons.page.html',
  styleUrls: ['./lessons.page.scss'],
})
export class LessonsPage implements OnInit {
  lessons: Lesson[] = [];
  filteredLessons: Lesson[] = [];
  searchTerm = '';
  selectedCategory = 'all';
  categories: string[] = ['all'];
  lessonProgress: {[key: string]: LessonProgress} = {};

  constructor(
    private router: Router,
    private dataService: DataService,
    private storageService: StorageService
  ) { }

  async ngOnInit() {
    await this.loadLessons();
  }

  async ionViewWillEnter() {
    await this.loadLessonProgress();
  }

  private async loadLessons() {
    this.lessons = this.dataService.getLessons();
    this.filteredLessons = [...this.lessons];
    
    // Extract unique categories
    const categorySet = new Set(['all']);
    this.lessons.forEach(lesson => categorySet.add(lesson.category));
    this.categories = Array.from(categorySet);
    
    await this.loadLessonProgress();
  }

  private async loadLessonProgress() {
    this.lessonProgress = await this.storageService.getAllLessonProgress();
  }

  filterLessons() {
    this.filteredLessons = this.lessons.filter(lesson => {
      const matchesSearch = lesson.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                          lesson.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = this.selectedCategory === 'all' || lesson.category === this.selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }

  onSearchChange(event: any) {
    this.searchTerm = event.detail.value;
    this.filterLessons();
  }

  onCategoryChange(event: any) {
    this.selectedCategory = event.detail.value;
    this.filterLessons();
  }

  getLessonProgress(lessonId: string): number {
    return this.lessonProgress[lessonId]?.progress || 0;
  }

  isLessonCompleted(lessonId: string): boolean {
    return this.lessonProgress[lessonId]?.completed || false;
  }

  getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'danger';
      default: return 'medium';
    }
  }

  openLesson(lesson: Lesson) {
    this.router.navigate(['/lesson-content', lesson.id]);
  }

  getCompletedCount(): number {
    return Object.values(this.lessonProgress).filter(p => p.completed).length;
  }

  getTotalLessons(): number {
    return this.lessons.length;
  }

}

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TopicLessonsPage } from './topic-lessons.page';

describe('TopicLessonsPage', () => {
  let component: TopicLessonsPage;
  let fixture: ComponentFixture<TopicLessonsPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(TopicLessonsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

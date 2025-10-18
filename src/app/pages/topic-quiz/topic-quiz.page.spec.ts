import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TopicQuizPage } from './topic-quiz.page';

describe('TopicQuizPage', () => {
  let component: TopicQuizPage;
  let fixture: ComponentFixture<TopicQuizPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(TopicQuizPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

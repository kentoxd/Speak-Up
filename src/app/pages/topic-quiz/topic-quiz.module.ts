import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TopicQuizPageRoutingModule } from './topic-quiz-routing.module';

import { TopicQuizPage } from './topic-quiz.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TopicQuizPageRoutingModule
  ],
  declarations: [TopicQuizPage]
})
export class TopicQuizPageModule {}

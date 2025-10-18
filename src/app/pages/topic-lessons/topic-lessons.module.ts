import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TopicLessonsPageRoutingModule } from './topic-lessons-routing.module';

import { TopicLessonsPage } from './topic-lessons.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TopicLessonsPageRoutingModule
  ],
  declarations: [TopicLessonsPage]
})
export class TopicLessonsPageModule {}

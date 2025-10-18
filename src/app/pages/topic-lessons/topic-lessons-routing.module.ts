import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TopicLessonsPage } from './topic-lessons.page';

const routes: Routes = [
  {
    path: '',
    component: TopicLessonsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TopicLessonsPageRoutingModule {}

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LessonContentPage } from './lesson-content.page';

const routes: Routes = [
  {
    path: '',
    component: LessonContentPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LessonContentPageRoutingModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LessonContentPageRoutingModule } from './lesson-content-routing.module';

import { LessonContentPage } from './lesson-content.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LessonContentPageRoutingModule
  ],
  declarations: [LessonContentPage]
})
export class LessonContentPageModule {}

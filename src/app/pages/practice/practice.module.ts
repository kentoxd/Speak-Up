import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PracticePageRoutingModule } from './practice-routing.module';

import { PracticePage } from './practice.page';
import { FeedbackModalModule } from '../../components/feedback-modal/feedback-modal.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PracticePageRoutingModule,
    FeedbackModalModule
  ],
  declarations: [PracticePage]
})
export class PracticePageModule {}

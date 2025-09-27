import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FeedbackModalComponent } from './feedback-modal.component';

@NgModule({
  declarations: [FeedbackModalComponent],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [FeedbackModalComponent]
})
export class FeedbackModalModule {}

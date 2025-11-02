import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { PracticePageRoutingModule } from './practice-routing.module';
import { PracticePage } from './practice.page';
import { FeedbackModalModule } from '../../components/feedback-modal/feedback-modal.module';
import { BreadcrumbModule } from '../../components/breadcrumb/breadcrumb.module';
import { ContextIndicatorModule } from '../../components/context-indicator/context-indicator.module';
import { SessionCompleteModule } from '../../components/session-complete/session-complete.module';
import { StepIndicatorModule } from '../../components/step-indicator/step-indicator.module';
import { UndoToastModule } from '../../components/undo-toast/undo-toast.module';
import { RecordingIndicatorModule } from '../../components/recording-indicator/recording-indicator.module';
import { ProgressAnimationModule } from '../../components/progress-animation/progress-animation.module';

import { PracticeHistoryModalComponent } from './practice-history-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PracticePageRoutingModule,
    FeedbackModalModule,
    BreadcrumbModule,
    ContextIndicatorModule,
    SessionCompleteModule,
    StepIndicatorModule,
    UndoToastModule,
    RecordingIndicatorModule,
    ProgressAnimationModule
  ],
  declarations: [
    PracticePage,
    PracticeHistoryModalComponent // ✅ add this line
  ]
})
export class PracticePageModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ProgressAnimationComponent } from './progress-animation.component';

@NgModule({
  declarations: [ProgressAnimationComponent],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [ProgressAnimationComponent]
})
export class ProgressAnimationModule {}


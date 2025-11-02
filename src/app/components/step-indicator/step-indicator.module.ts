import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { StepIndicatorComponent } from './step-indicator.component';

@NgModule({
  declarations: [StepIndicatorComponent],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [StepIndicatorComponent]
})
export class StepIndicatorModule {}


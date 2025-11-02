import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ContextIndicatorComponent } from './context-indicator.component';

@NgModule({
  declarations: [ContextIndicatorComponent],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [ContextIndicatorComponent]
})
export class ContextIndicatorModule {}


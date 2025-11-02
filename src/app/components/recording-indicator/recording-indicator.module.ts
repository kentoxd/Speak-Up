import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RecordingIndicatorComponent } from './recording-indicator.component';

@NgModule({
  declarations: [RecordingIndicatorComponent],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [RecordingIndicatorComponent]
})
export class RecordingIndicatorModule {}


import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SessionCompleteComponent } from './session-complete.component';

@NgModule({
  declarations: [SessionCompleteComponent],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [SessionCompleteComponent]
})
export class SessionCompleteModule {}


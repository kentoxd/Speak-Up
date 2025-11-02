import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { UndoToastComponent } from './undo-toast.component';

@NgModule({
  declarations: [UndoToastComponent],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [UndoToastComponent]
})
export class UndoToastModule {}


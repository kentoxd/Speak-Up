import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { CreateNewPasswordPageComponentRoutingModule } from './create-new-password-page-routing.module';
import { CreateNewPasswordPageComponent } from './create-new-password-page.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonicModule,
    CreateNewPasswordPageComponentRoutingModule
  ],
  declarations: [CreateNewPasswordPageComponent]
})
export class CreateNewPasswordPageComponentModule {}

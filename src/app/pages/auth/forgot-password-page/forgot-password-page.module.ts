import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ForgotPasswordPageComponentRoutingModule } from './forgot-password-page-routing.module';
import { ForgotPasswordPageComponent } from './forgot-password-page.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    ForgotPasswordPageComponentRoutingModule
  ],
  declarations: [ForgotPasswordPageComponent]
})
export class ForgotPasswordPageComponentModule {}

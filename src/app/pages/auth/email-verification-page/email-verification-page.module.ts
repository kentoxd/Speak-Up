import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { EmailVerificationPageRoutingModule } from './email-verification-page-routing.module';
import { EmailVerificationPageComponent } from './email-verification-page.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    EmailVerificationPageRoutingModule
  ],
  declarations: [EmailVerificationPageComponent]
})
export class EmailVerificationPageComponentModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { SignInPageComponentRoutingModule } from './signin-page-routing.module';
import { SignInPageComponent } from './signin-page.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonicModule,
    SignInPageComponentRoutingModule
  ],
  declarations: [SignInPageComponent]
})
export class SignInPageComponentModule {}

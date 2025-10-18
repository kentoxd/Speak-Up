import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { OTPPageComponentRoutingModule } from './otp-page-routing.module';
import { OTPPageComponent } from './otp-page.component';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OTPPageComponentRoutingModule
  ],
  declarations: [OTPPageComponent]
})
export class OTPPageComponentModule {}

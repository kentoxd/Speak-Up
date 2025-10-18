import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { RegistrationPageComponentRoutingModule } from './registration-page-routing.module';
import { RegistrationPageComponent } from './registration-page.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    RegistrationPageComponentRoutingModule
  ],
  declarations: [RegistrationPageComponent]
})
export class RegistrationPageComponentModule {}

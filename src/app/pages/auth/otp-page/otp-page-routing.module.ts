import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OTPPageComponent } from './otp-page.component';

const routes: Routes = [
  {
    path: '',
    component: OTPPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OTPPageComponentRoutingModule {}

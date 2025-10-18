import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ForgotPasswordPageComponent } from './forgot-password-page.component';

const routes: Routes = [
  {
    path: '',
    component: ForgotPasswordPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ForgotPasswordPageComponentRoutingModule {}

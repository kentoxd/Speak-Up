import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EmailVerificationPageComponent } from './email-verification-page.component';

const routes: Routes = [
  {
    path: '',
    component: EmailVerificationPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmailVerificationPageRoutingModule {}

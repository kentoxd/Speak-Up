import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateNewPasswordPageComponent } from './create-new-password-page.component';

const routes: Routes = [
  {
    path: '',
    component: CreateNewPasswordPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateNewPasswordPageComponentRoutingModule {}

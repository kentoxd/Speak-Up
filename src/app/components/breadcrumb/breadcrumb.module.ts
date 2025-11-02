import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { BreadcrumbComponent } from './breadcrumb.component';

@NgModule({
  declarations: [BreadcrumbComponent],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule
  ],
  exports: [BreadcrumbComponent]
})
export class BreadcrumbModule {}


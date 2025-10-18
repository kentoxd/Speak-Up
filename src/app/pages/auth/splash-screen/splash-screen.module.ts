import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { SplashScreenComponentRoutingModule } from './splash-screen-routing.module';
import { SplashScreenComponent } from './splash-screen.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SplashScreenComponentRoutingModule
  ],
  declarations: [SplashScreenComponent]
})
export class SplashScreenComponentModule {}

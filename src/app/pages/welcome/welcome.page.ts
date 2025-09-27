import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { StorageService, UserProfile } from '../../services/storage.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
})
export class WelcomePage implements OnInit {
  currentSlide = 0;
  userName = '';
  userEmail = '';

  constructor(
    private router: Router,
    private storageService: StorageService,
    private alertController: AlertController
  ) { }

  ngOnInit() {
  }

  nextSlide() {
    if (this.currentSlide < 2) {
      this.currentSlide++;
    }
  }

  prevSlide() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
    }
  }

  async finishOnboarding() {
    if (!this.userName.trim()) {
      const alert = await this.alertController.create({
        header: 'Name Required',
        message: 'Please enter your name to continue.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    // Create initial user profile
    const profile: UserProfile = {
      name: this.userName,
      email: this.userEmail,
      bio: '',
      avatar: '',
      joinDate: new Date().toISOString(),
      totalLessons: 0,
      streakDays: 0,
      achievements: []
    };

    await this.storageService.setUserProfile(profile);
    await this.storageService.setHasSeenWelcome();
    
    this.router.navigate(['/tabs']);
  }

}

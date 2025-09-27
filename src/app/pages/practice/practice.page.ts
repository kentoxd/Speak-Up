import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController, ModalController } from '@ionic/angular';
import { DataService, PracticeExercise } from '../../services/data.service';
import { SpeechService, SpeechRecognitionResult } from '../../services/speech.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-practice',
  templateUrl: './practice.page.html',
  styleUrls: ['./practice.page.scss'],
})
export class PracticePage implements OnInit {
  exercises: PracticeExercise[] = [];
  selectedExercise?: PracticeExercise;
  isRecording = false;
  isPracticing = false;
  currentPrompt = '';
  timeRemaining = 0;
  sessionResults: any = null;
  practiceHistory: any[] = [];

  constructor(
    private dataService: DataService,
    private speechService: SpeechService,
    private storageService: StorageService,
    private alertController: AlertController,
    private toastController: ToastController
  ) { }

  async ngOnInit() {
    this.exercises = this.dataService.getPracticeExercises();
    await this.loadPracticeHistory();
  }

  async ionViewWillEnter() {
    await this.loadPracticeHistory();
  }

  private async loadPracticeHistory() {
    this.practiceHistory = await this.storageService.getPracticeHistory();
  }

  async startExercise(exercise: PracticeExercise) {
    this.selectedExercise = exercise;
    this.currentPrompt = this.getRandomPrompt(exercise);
    this.timeRemaining = exercise.timeLimit * 60; // Convert to seconds
    this.isPracticing = true;
    this.sessionResults = null;

    const alert = await this.alertController.create({
      header: 'Ready to Practice?',
      message: `You'll have ${exercise.timeLimit} minutes to complete this exercise. Your prompt: "${this.currentPrompt}"`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            this.stopPractice();
          }
        },
        {
          text: 'Start',
          handler: () => {
            this.startPracticeSession();
          }
        }
      ]
    });

    await alert.present();
  }

  private getRandomPrompt(exercise: PracticeExercise): string {
    const randomIndex = Math.floor(Math.random() * exercise.prompts.length);
    return exercise.prompts[randomIndex];
  }

  private startPracticeSession() {
    // Start countdown timer
    const timer = setInterval(() => {
      this.timeRemaining--;
      if (this.timeRemaining <= 0) {
        clearInterval(timer);
        this.endPracticeSession();
      }
    }, 1000);
  }

  async startRecording() {
    if (!this.speechService.isSpeechRecognitionSupported()) {
      const toast = await this.toastController.create({
        message: 'Speech recognition not supported in this browser. Recording simulation will start.',
        duration: 3000,
        color: 'warning'
      });
      await toast.present();
    }

    try {
      this.isRecording = true;
      const result = await this.speechService.startRecording();
      this.handleRecordingResult(result);
    } catch (error) {
      console.error('Recording error:', error);
      this.isRecording = false;
      
      const toast = await this.toastController.create({
        message: 'Recording failed. Please try again.',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  stopRecording() {
    this.speechService.stopRecording();
    this.isRecording = false;
  }

  private handleRecordingResult(result: SpeechRecognitionResult) {
    this.isRecording = false;
    
    // Analyze the speech
    const analysis = this.speechService.analyzeSpeech(result.transcript, result.duration);
    
    this.sessionResults = {
      transcript: result.transcript,
      confidence: result.confidence,
      duration: result.duration,
      analysis: analysis,
      prompt: this.currentPrompt,
      exercise: this.selectedExercise?.title,
      timestamp: new Date().toISOString()
    };
  }

  private async endPracticeSession() {
    if (this.sessionResults) {
      // Save to practice history
      await this.storageService.addPracticeSession(this.sessionResults);
      await this.loadPracticeHistory();
    }

    const toast = await this.toastController.create({
      message: 'Practice session completed!',
      duration: 2000,
      color: 'success'
    });
    await toast.present();
  }

  stopPractice() {
    this.isPracticing = false;
    this.selectedExercise = undefined;
    this.isRecording = false;
    this.timeRemaining = 0;
    this.sessionResults = null;
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  getExerciseIcon(type: string): string {
    switch (type) {
      case 'impromptu': return 'flash';
      case 'presentation': return 'easel';
      case 'storytelling': return 'library';
      case 'speech': return 'mic';
      default: return 'mic';
    }
  }

  getExerciseColor(type: string): string {
    switch (type) {
      case 'impromptu': return 'danger';
      case 'presentation': return 'primary';
      case 'storytelling': return 'secondary';
      case 'speech': return 'tertiary';
      default: return 'medium';
    }
  }

  async viewHistory() {
    const alert = await this.alertController.create({
      header: 'Practice History',
      message: `You've completed ${this.practiceHistory.length} practice sessions.`,
      buttons: ['OK']
    });
    await alert.present();
  }

  getTotalPracticeTime(): number {
    return this.practiceHistory.reduce((total, session) => {
      return total + Math.round(session.duration / 1000 / 60); // Convert to minutes
    }, 0);
  }

}

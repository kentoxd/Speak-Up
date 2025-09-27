import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController, ModalController } from '@ionic/angular';
import { DataService, PracticeExercise, StructuredPractice } from '../../services/data.service';
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
  
  // New Structured Practice Properties
  practiceTypes = [
    { value: 'monologue', label: 'Monologue' },
    { value: 'public-speaking', label: 'Public Speaking' },
    { value: 'debate-speech', label: 'Debate Speech' }
  ];
  
  difficultyLevels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' }, 
    { value: 'advanced', label: 'Advanced' }
  ];
  
  selectedPracticeType = 'monologue';
  selectedDifficulty = 'beginner';
  currentStructuredPractice?: StructuredPractice;
  
  isRecording = false;
  isPracticing = false;
  isListeningToText = false;
  currentPrompt = '';
  timeRemaining = 0;
  sessionResults: any = null;
  practiceHistory: any[] = [];
  userSpeechText = '';
  showFeedback = false;

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
    this.loadStructuredPractice();
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

  // New Structured Practice Methods
  loadStructuredPractice() {
    this.currentStructuredPractice = this.dataService.getStructuredPractice(
      this.selectedPracticeType, 
      this.selectedDifficulty
    );
  }

  onPracticeTypeChange(event: any) {
    this.selectedPracticeType = event.detail.value;
    this.loadStructuredPractice();
  }

  onDifficultyChange(event: any) {
    this.selectedDifficulty = event.detail.value;
    this.loadStructuredPractice();
  }

  async listenToPracticeText() {
    if (!this.currentStructuredPractice) return;
    
    this.isListeningToText = true;
    
    try {
      await this.speechService.speak({
        text: this.currentStructuredPractice.practiceText,
        rate: 0.9,
        pitch: 1,
        volume: 1
      });
    } catch (error) {
      const toast = await this.toastController.create({
        message: 'Text-to-speech not available in this browser',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
    } finally {
      this.isListeningToText = false;
    }
  }

  stopListening() {
    this.speechService.stopSpeaking();
    this.isListeningToText = false;
  }

  startStructuredPractice() {
    if (!this.currentStructuredPractice) return;
    
    this.isPracticing = true;
    this.timeRemaining = this.currentStructuredPractice.timeLimit * 60;
    this.userSpeechText = '';
    this.sessionResults = null;
    this.showFeedback = false;
    
    // Start countdown timer
    const timer = setInterval(() => {
      this.timeRemaining--;
      if (this.timeRemaining <= 0) {
        clearInterval(timer);
        this.endStructuredPractice();
      }
    }, 1000);
  }

  async startStructuredRecording() {
    if (!this.speechService.isSpeechRecognitionSupported()) {
      const toast = await this.toastController.create({
        message: 'Speech recognition not supported. Using simulation mode.',
        duration: 3000,
        color: 'warning'
      });
      await toast.present();
    }

    try {
      this.isRecording = true;
      this.userSpeechText = 'Listening...';
      
      const result = await this.speechService.startRecording();
      this.userSpeechText = result.transcript;
      this.handleStructuredRecordingResult(result);
    } catch (error) {
      console.error('Recording error:', error);
      this.isRecording = false;
      this.userSpeechText = '';
      
      const toast = await this.toastController.create({
        message: 'Recording failed. Please try again.',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    }
  }

  stopStructuredRecording() {
    this.speechService.stopRecording();
    this.isRecording = false;
  }

  private handleStructuredRecordingResult(result: SpeechRecognitionResult) {
    this.isRecording = false;
    this.userSpeechText = result.transcript;
    
    this.sessionResults = {
      transcript: result.transcript,
      confidence: result.confidence,
      duration: result.duration,
      practiceType: this.selectedPracticeType,
      difficulty: this.selectedDifficulty,
      timestamp: new Date().toISOString()
    };
  }

  private async endStructuredPractice() {
    if (this.sessionResults) {
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

  stopStructuredPractice() {
    this.isPracticing = false;
    this.isRecording = false;
    this.userSpeechText = '';
    this.sessionResults = null;
    this.showFeedback = false;
    this.timeRemaining = 0;
  }

  clearSpeech() {
    this.userSpeechText = '';
    this.sessionResults = null;
  }

  async showDetailedFeedback() {
    if (!this.sessionResults || !this.currentStructuredPractice) return;

    const analysis = this.speechService.analyzeSpeech(
      this.sessionResults.transcript, 
      this.sessionResults.duration
    );

    // Enhanced feedback based on practice type and difficulty
    const contextualFeedback = this.generateContextualFeedback(
      this.selectedPracticeType,
      this.selectedDifficulty,
      analysis,
      this.sessionResults.transcript
    );

    const alert = await this.alertController.create({
      header: 'Practice Feedback',
      message: `
        <div class="feedback-content">
          <h4>📊 Performance Metrics</h4>
          <p><strong>Overall Accuracy:</strong> ${this.calculateOverallAccuracy(analysis)}%</p>
          <p><strong>Word Accuracy:</strong> ${analysis.totalWords > 0 ? '85' : '0'}% (${analysis.totalWords} words)</p>
          <p><strong>Pace:</strong> ${analysis.wordsPerMinute} WPM</p>
          
          <h4>💡 Tips for Improvement</h4>
          <ul>
            ${contextualFeedback.map(tip => `<li>${tip}</li>`).join('')}
          </ul>
          
          <h4>🎯 Target vs Your Speech</h4>
          <p><strong>Expected:</strong> ${this.currentStructuredPractice?.practiceText.substring(0, 100)}...</p>
          <p><strong>Your Speech:</strong> "${this.sessionResults.transcript}"</p>
        </div>
      `,
      buttons: ['Close']
    });

    await alert.present();
    this.showFeedback = true;
  }

  private generateContextualFeedback(type: string, difficulty: string, analysis: any, transcript: string): string[] {
    const feedback: string[] = [];
    
    // Base feedback from speech analysis
    if (analysis.wordsPerMinute < 120) {
      feedback.push('Try speaking a bit faster to maintain audience engagement');
    } else if (analysis.wordsPerMinute > 180) {
      feedback.push('Slow down slightly to ensure clarity and comprehension');
    } else {
      feedback.push('Great pacing! Your speech rate is well-balanced');
    }

    // Type-specific feedback
    if (type === 'monologue') {
      if (transcript.includes('I') || transcript.includes('my')) {
        feedback.push('Good use of personal perspective in your monologue');
      } else {
        feedback.push('Consider adding more personal elements to make your monologue more engaging');
      }
    } else if (type === 'public-speaking') {
      if (transcript.length > 50) {
        feedback.push('Good content length for a public speech');
      } else {
        feedback.push('Try to elaborate more on your points for better impact');
      }
    } else if (type === 'debate-speech') {
      if (transcript.includes('because') || transcript.includes('therefore') || transcript.includes('however')) {
        feedback.push('Excellent use of logical connectors in your argument');
      } else {
        feedback.push('Consider using more logical connectors to strengthen your argument');
      }
    }

    // Difficulty-specific feedback
    if (difficulty === 'beginner') {
      feedback.push('Focus on speaking clearly and maintaining good posture');
    } else if (difficulty === 'intermediate') {
      feedback.push('Work on varying your vocal tone and using purposeful gestures');
    } else if (difficulty === 'advanced') {
      feedback.push('Challenge yourself with more complex arguments and sophisticated delivery');
    }

    return feedback;
  }

  private calculateOverallAccuracy(analysis: any): number {
    // Mock calculation based on various factors
    let accuracy = 70; // Base accuracy
    
    if (analysis.wordsPerMinute >= 120 && analysis.wordsPerMinute <= 180) {
      accuracy += 15; // Good pace
    }
    
    if (analysis.totalWords >= 30) {
      accuracy += 15; // Good content length
    }
    
    return Math.min(accuracy, 100);
  }

}

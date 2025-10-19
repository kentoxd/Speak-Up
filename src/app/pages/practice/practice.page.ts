import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { AlertController, ToastController, ModalController } from '@ionic/angular';
import { DataService, PracticeExercise, StructuredPractice } from '../../services/data.service';
import { SpeechService, SpeechRecognitionResult } from '../../services/speech.service';
import { StorageService } from '../../services/storage.service';
import { UserProgressionService } from '../../services/user-progression.service';
import { AuthService } from '../../services/auth.service';
import { FeedbackModalComponent } from '../../components/feedback-modal/feedback-modal.component';

@Component({
  selector: 'app-practice',
  templateUrl: './practice.page.html',
  styleUrls: ['./practice.page.scss'],
})
export class PracticePage implements OnInit, OnDestroy {
  exercises: PracticeExercise[] = [];
  selectedExercise?: PracticeExercise;
  
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
  recordingTimer: any = null;

  constructor(
    private dataService: DataService,
    private speechService: SpeechService,
    private storageService: StorageService,
    private userProgressionService: UserProgressionService,
    private authService: AuthService,
    private alertController: AlertController,
    private toastController: ToastController,
    private modalController: ModalController,
    private cdr: ChangeDetectorRef
  ) { }

  async ngOnInit() {
    this.exercises = this.dataService.getPracticeExercises();
    await this.loadPracticeHistory();
    this.loadStructuredPractice();
    
    if (!this.speechService.isSpeechRecognitionSupported()) {
      const toast = await this.toastController.create({
        message: 'Speech Recognition not supported in this browser. Please use Chrome, Edge, or Safari.',
        duration: 5000,
        color: 'warning'
      });
      await toast.present();
    }
    
    this.authService.getCurrentUser().subscribe(async user => {
      if (user) {
        await this.userProgressionService.initializeUserProgression(user);
      }
    });
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
    this.timeRemaining = exercise.timeLimit * 60;
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
        message: 'Speech Recognition not supported. Please use Chrome, Edge, or Safari.',
        duration: 3000,
        color: 'danger'
      });
      await toast.present();
      return;
    }

    try {
      this.isRecording = true;
      this.userSpeechText = '🎤 Listening...';
      this.speechService.startRecording();
      
      const transcriptInterval = setInterval(() => {
        if (this.isRecording) {
          const currentTranscript = this.speechService.getCurrentTranscript();
          if (currentTranscript) {
            this.userSpeechText = currentTranscript;
            this.cdr.detectChanges();
          }
        } else {
          clearInterval(transcriptInterval);
        }
      }, 500);
      
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
    
    const result = this.speechService.getRecordingResult();
    this.userSpeechText = result.transcript;
    this.handleRecordingResult(result);
  }

  private handleRecordingResult(result: SpeechRecognitionResult) {
    this.isRecording = false;
    
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
      return total + Math.round(session.duration / 1000 / 60);
    }, 0);
  }

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

  async listenToTargetText() {
    if (!this.currentStructuredPractice) return;
    
    this.isListeningToText = true;
    
    try {
      await this.speechService.speak({
        text: this.currentStructuredPractice.targetText,
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
    
    if (!this.speechService.isSpeechRecognitionSupported()) {
      this.showSpeechRecognitionError();
      return;
    }
    
    this.isPracticing = true;
    this.timeRemaining = this.currentStructuredPractice.timeLimit * 60;
    this.userSpeechText = '';
    this.sessionResults = null;
    this.showFeedback = false;
    
    const timer = setInterval(() => {
      this.timeRemaining--;
      if (this.timeRemaining <= 0) {
        clearInterval(timer);
        this.endStructuredPractice();
      }
    }, 1000);
  }

  private async showSpeechRecognitionError() {
    const alert = await this.alertController.create({
      header: 'Speech Recognition Not Supported',
      message: 'Your browser does not support speech recognition. Please use: Chrome, Edge, or Safari.',
      buttons: ['OK']
    });
    await alert.present();
  }

  async startStructuredRecording() {
    if (!this.speechService.isSpeechRecognitionSupported()) {
      await this.showSpeechRecognitionError();
      return;
    }

    try {
      this.userSpeechText = '';
      this.sessionResults = null;
      this.speechService.clearTranscript();
      
      if (this.currentStructuredPractice?.targetText) {
        this.speechService.setTargetText(this.currentStructuredPractice.targetText);
        console.log('Target text set:', this.currentStructuredPractice.targetText);
      }
      
      this.speechService.startRecording();
      this.isRecording = true;
      
      const transcriptInterval = setInterval(() => {
        if (this.isRecording) {
          const currentTranscript = this.speechService.getCurrentTranscript();
          
          if (currentTranscript && currentTranscript.trim() !== '') {
            const capitalized = this.capitalizeFirstLetter(currentTranscript);
            console.log('%cDirect assignment:', 'color: cyan; font-weight: bold', capitalized);
            this.userSpeechText = capitalized;
            console.log('%cAfter assignment userSpeechText:', 'color: magenta; font-weight: bold', this.userSpeechText);
            this.cdr.detectChanges();
          }
        } else {
          clearInterval(transcriptInterval);
        }
      }, 100);
      
      (this as any).transcriptInterval = transcriptInterval;
      
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

  stopStructuredRecording() {
    this.speechService.stopRecording();
    this.isRecording = false;
    
    if ((this as any).transcriptInterval) {
      clearInterval((this as any).transcriptInterval);
      (this as any).transcriptInterval = null;
    }
    
    // Add a small delay to ensure final punctuation is processed
    setTimeout(() => {
      const result = this.speechService.getRecordingResult();
      // Force get the latest transcript with punctuation
      const finalTranscript = this.speechService.getCurrentTranscript();
      console.log('%cFinal transcript with punctuation:', 'color: lime; font-weight: bold', finalTranscript);
      
      this.userSpeechText = this.capitalizeFirstLetter(finalTranscript);
      console.log('%cFinal userSpeechText:', 'color: lime; font-weight: bold', this.userSpeechText);
      
      this.handleStructuredRecordingResult(result);
      this.cdr.detectChanges();
    }, 100);
  }

  private async handleStructuredRecordingResult(result: SpeechRecognitionResult) {
    this.isRecording = false;
    
    const finalTranscript = this.userSpeechText || result.transcript;
    
    this.sessionResults = {
      transcript: finalTranscript,
      confidence: result.confidence,
      duration: result.duration,
      practiceType: this.selectedPracticeType,
      difficulty: this.selectedDifficulty,
      timestamp: new Date().toISOString()
    };

    if (this.sessionResults && this.currentStructuredPractice) {
      const accuracy = this.calculateOverallAccuracy({
        wordAccuracy: this.calculateWordAccuracy(finalTranscript, this.currentStructuredPractice.targetText),
        punctuationAccuracy: this.calculatePunctuationAccuracy(finalTranscript, this.currentStructuredPractice.targetText),
        confidence: result.confidence,
        duration: result.duration
      });

      const durationMinutes = result.duration / 60000;
      
      const practiceType = this.selectedPracticeType === 'public-speaking' ? 'publicSpeaking' : 
                          this.selectedPracticeType === 'debate-speech' ? 'debate' : 'monologue';
      
      await this.userProgressionService.updatePracticeSession(
        accuracy,
        durationMinutes,
        practiceType as 'monologue' | 'publicSpeaking' | 'debate',
        this.selectedDifficulty as 'beginner' | 'intermediate' | 'advanced'
      );
    }
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

  ngOnDestroy() {
    if ((this as any).transcriptInterval) {
      clearInterval((this as any).transcriptInterval);
    }
  }

  async showDetailedFeedback() {
  if (!this.sessionResults || !this.currentStructuredPractice) {
    const toast = await this.toastController.create({
      message: 'No speech recorded. Please record first.',
      duration: 2000,
      color: 'warning'
    });
    await toast.present();
    return;
  }

  // Use userSpeechText (which has punctuation) instead of sessionResults.transcript
  const userTranscript = this.userSpeechText || this.sessionResults.transcript;
  const targetText = this.currentStructuredPractice.targetText;

  if (!userTranscript || userTranscript.trim() === '') {
    const toast = await this.toastController.create({
      message: 'No speech text found. Please record again.',
      duration: 2000,
      color: 'warning'
    });
    await toast.present();
    return;
  }

  const analysis = this.speechService.analyzeSpeech(
    userTranscript, 
    this.sessionResults.duration
  );

  const targetWords = targetText.split(/\s+/).filter((w: string) => w.length > 0).length;
  const userWords = userTranscript.split(/\s+/).filter((w: string) => w.length > 0).length;
  const wordDifference = userWords - targetWords;
  
  const overallAccuracy = this.calculateOverallAccuracy({
    wordAccuracy: this.calculateWordAccuracy(userTranscript, targetText),
    punctuationAccuracy: this.calculatePunctuationAccuracy(userTranscript, targetText),
    confidence: this.sessionResults.confidence,
    duration: this.sessionResults.duration
  });
  const wordAccuracy = this.calculateWordAccuracy(userTranscript, targetText);
  const punctuationAccuracy = this.calculatePunctuationAccuracy(userTranscript, targetText);

  const getAccuracyColor = (accuracy: number) => accuracy < 50 ? 'red' : 'green';
  const overallColor = getAccuracyColor(overallAccuracy);
  const wordColor = getAccuracyColor(wordAccuracy);
  const punctuationColor = getAccuracyColor(punctuationAccuracy);

  const modal = await this.modalController.create({
    component: FeedbackModalComponent,
    componentProps: {
      overallAccuracy,
      wordAccuracy,
      punctuationAccuracy,
      wordDifference,
      overallColor,
      wordColor,
      punctuationColor,
      targetText: targetText,
      userSpeech: userTranscript,  // Now uses punctuation-enhanced transcript
      analysis: analysis
    },
    cssClass: 'feedback-modal'
  });

  await modal.present();
  this.showFeedback = true;
}

// Also fix calculateOverallAccuracy to use the passed analysis parameter
private calculateOverallAccuracy(analysis: any): number {
  const wordAccuracy = analysis.wordAccuracy || 0;
  const punctuationAccuracy = analysis.punctuationAccuracy || 0;
  
  return Math.round((wordAccuracy * 0.7) + (punctuationAccuracy * 0.3));
}

  private calculateWordAccuracy(userText: string, targetText: string): number {
    if (!userText || !targetText) return 0;
    
    const normalizeText = (text: string) => {
      return text.toLowerCase()
        .replace(/\s+/g, ' ')
        .trim()
        .split(/\s+/)
        .filter((word: string) => word.length > 0);
    };
    
    const userWords = normalizeText(userText);
    const targetWords = normalizeText(targetText);
    
    if (targetWords.length === 0) return 0;
    
    let correctWords = 0;
    const minLength = Math.min(userWords.length, targetWords.length);
    
    for (let i = 0; i < minLength; i++) {
      if (userWords[i] === targetWords[i]) {
        correctWords++;
      }
    }
    
    return (correctWords / targetWords.length) * 100;
  }

  private calculatePunctuationAccuracy(userText: string, targetText: string): number {
    if (!userText || !targetText) return 0;
    
    const getPunctuationWithPositions = (text: string) => {
      const punctuation: { char: string; pos: number }[] = [];
      for (let i = 0; i < text.length; i++) {
        if (/[.,!?;:]/.test(text[i])) {
          punctuation.push({ char: text[i], pos: i });
        }
      }
      return punctuation;
    };
    
    const userPunctuation = getPunctuationWithPositions(userText);
    const targetPunctuation = getPunctuationWithPositions(targetText);
    
    if (targetPunctuation.length === 0) return 100;
    
    let correctPunctuation = 0;
    const minLength = Math.min(userPunctuation.length, targetPunctuation.length);
    
    for (let i = 0; i < minLength; i++) {
      if (userPunctuation[i].char === targetPunctuation[i].char) {
        correctPunctuation++;
      }
    }
    
    return (correctPunctuation / targetPunctuation.length) * 100;
  }

  private capitalizeFirstLetter(text: string): string {
    if (!text) return text;
    const result = text.charAt(0).toUpperCase() + text.slice(1);
    console.log('%cCapitalize result:', 'color: orange', result);
    return result;
  }

  getSafeUserSpeech(): string {
    return this.userSpeechText || '';
  }
}
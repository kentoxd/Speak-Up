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
    
    // Initialize user progression for authenticated users
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
      this.speechService.startRecording();
      
      // Start real-time transcript updates
      const transcriptInterval = setInterval(() => {
        if (this.isRecording) {
          const currentTranscript = this.speechService.getCurrentTranscript();
          if (currentTranscript) {
            this.userSpeechText = currentTranscript;
          }
        } else {
          clearInterval(transcriptInterval);
        }
      }, 100);
      
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
    
    // Get the final result
    const result = this.speechService.getRecordingResult();
    this.userSpeechText = result.transcript;
    this.handleRecordingResult(result);
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
      this.userSpeechText = 'Listening...';
      
      // Only clear transcript if not using mock mode
      if (this.speechService.isSpeechRecognitionSupported()) {
        this.speechService.clearTranscript();
      }
      
      // Start recording (non-blocking)
      this.speechService.startRecording();
      
      // Set recording flag AFTER starting the speech service
      this.isRecording = true;
      
      // Set target text for intelligent punctuation handling
      if (this.currentStructuredPractice?.targetText) {
        (this.speechService as any).targetText = this.currentStructuredPractice.targetText;
      }
      
      // Start real-time transcript updates with more frequent polling
      const transcriptInterval = setInterval(() => {
        if (this.isRecording) {
          const currentTranscript = this.speechService.getCurrentTranscript();
          // Always update the display, even if transcript is empty
          if (currentTranscript && currentTranscript.trim() !== '') {
            this.userSpeechText = currentTranscript;
            // Trigger change detection to ensure UI updates
            this.cdr.detectChanges();
          }
        } else {
          clearInterval(transcriptInterval);
        }
      }, 1000); // Increased frequency for more responsive updates
      
      // Store interval ID for cleanup
      (this as any).transcriptInterval = transcriptInterval;
      
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
    
    // Clear the transcript update interval
    if ((this as any).transcriptInterval) {
      clearInterval((this as any).transcriptInterval);
      (this as any).transcriptInterval = null;
    }
    
    // Get the current transcript (what was being displayed in real-time)
    const currentTranscript = this.speechService.getCurrentTranscript();
    
    // Get the final result for analysis
    const result = this.speechService.getRecordingResult();
    
    // Use the current transcript for display, not just the final result
    this.userSpeechText = currentTranscript || result.transcript;
    
    this.handleStructuredRecordingResult({
      ...result,
      transcript: this.userSpeechText
    });
    
    // Trigger change detection to ensure feedback button appears
    this.cdr.detectChanges();
  }

  private async handleStructuredRecordingResult(result: SpeechRecognitionResult) {
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

    // Update user progression in Firebase
    if (this.sessionResults && this.currentStructuredPractice) {
      const accuracy = this.calculateOverallAccuracy({
        wordAccuracy: this.calculateWordAccuracy(result.transcript, this.currentStructuredPractice.targetText),
        punctuationAccuracy: this.calculatePunctuationAccuracy(result.transcript, this.currentStructuredPractice.targetText),
        confidence: result.confidence,
        duration: result.duration
      });

      const durationMinutes = result.duration / 60; // Convert seconds to minutes
      
      // Map practice types to match the service
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
    // Clean up any running intervals
    if ((this as any).transcriptInterval) {
      clearInterval((this as any).transcriptInterval);
    }
  }

  async showDetailedFeedback() {
    if (!this.sessionResults || !this.currentStructuredPractice) return;

    const analysis = this.speechService.analyzeSpeech(
      this.sessionResults.transcript, 
      this.sessionResults.duration
    );

    // Calculate detailed accuracy metrics
    const targetWords = this.currentStructuredPractice.targetText.split(' ').length;
    const userWords = this.sessionResults.transcript.split(' ').length;
    const wordDifference = userWords - targetWords;
    
    const overallAccuracy = this.calculateOverallAccuracy(analysis);
    const wordAccuracy = this.calculateWordAccuracy(this.sessionResults.transcript, this.currentStructuredPractice.targetText);
    const punctuationAccuracy = this.calculatePunctuationAccuracy(this.sessionResults.transcript, this.currentStructuredPractice.targetText);

    // Determine color based on accuracy (red < 50%, green >= 50%)
    const getAccuracyColor = (accuracy: number) => accuracy < 50 ? 'red' : 'green';
    const overallColor = getAccuracyColor(overallAccuracy);
    const wordColor = getAccuracyColor(wordAccuracy);
    const punctuationColor = getAccuracyColor(punctuationAccuracy);

    // Create custom modal for better formatting and color control
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
        targetText: this.currentStructuredPractice.targetText,
        userSpeech: this.sessionResults.transcript
      },
      cssClass: 'feedback-modal'
    });

    await modal.present();
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
    // Calculate based on word accuracy (70%) and punctuation accuracy (30%)
    const wordAccuracy = this.calculateWordAccuracy(this.sessionResults?.transcript || '', this.currentStructuredPractice?.targetText || '');
    const punctuationAccuracy = this.calculatePunctuationAccuracy(this.sessionResults?.transcript || '', this.currentStructuredPractice?.targetText || '');
    
    return Math.round((wordAccuracy * 0.7) + (punctuationAccuracy * 0.3));
  }

  private calculateWordAccuracy(userText: string, targetText: string): number {
    if (!userText || !targetText) return 0;
    
    // Normalize text: remove extra spaces but preserve punctuation
    const normalizeText = (text: string) => {
      return text.toLowerCase()
        .replace(/\s+/g, ' ')
        .trim()
        .split(/\s+/)
        .filter(word => word.length > 0);
    };
    
    const userWords = normalizeText(userText);
    const targetWords = normalizeText(targetText);
    
    if (targetWords.length === 0) return 0;
    
    let correctWords = 0;
    const minLength = Math.min(userWords.length, targetWords.length);
    
    for (let i = 0; i < minLength; i++) {
      // Compare words exactly, including punctuation marks
      if (userWords[i] === targetWords[i]) {
        correctWords++;
      }
    }
    
    // Calculate accuracy based on the target text length
    return (correctWords / targetWords.length) * 100;
  }

  private calculatePunctuationAccuracy(userText: string, targetText: string): number {
    if (!userText || !targetText) return 0;
    
    // Extract punctuation marks with their positions
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
    
    // Check if punctuation marks match in sequence
    const minLength = Math.min(userPunctuation.length, targetPunctuation.length);
    for (let i = 0; i < minLength; i++) {
      if (userPunctuation[i].char === targetPunctuation[i].char) {
        correctPunctuation++;
      }
    }
    
    return (correctPunctuation / targetPunctuation.length) * 100;
  }

}

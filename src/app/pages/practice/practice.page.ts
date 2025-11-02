import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { AlertController, ToastController, ModalController } from '@ionic/angular';
import { DataService, PracticeExercise, StructuredPractice } from '../../services/data.service';
import { SpeechService, SpeechRecognitionResult } from '../../services/speech.service';
import { StorageService } from '../../services/storage.service';
import { UserProgressionService } from '../../services/user-progression.service';
import { AuthService } from '../../services/auth.service';
import { FeedbackModalComponent } from '../../components/feedback-modal/feedback-modal.component';
import { PracticeHistoryModalComponent } from './practice-history-modal.component';

export interface SavedCustomText {
  id: string;
  name: string;
  text: string;
  createdAt: string;
}

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
  
  useCustomText = false;
  customTargetText = '';
  customTextName = '';
  isEditingCustomText = false;
  showCustomTextForm = false;
  isPracticeReady = false;
  savedCustomTexts: SavedCustomText[] = [];

  selectedPrompt = '';
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
  showInstructions = false;
  highlightedWord: string | null = null;
  phoneticGuide: string = '';
  isPlayingRecording = false;
  currentRecordingBlob: Blob | null = null;
  currentRecordingUrl: string | null = null;

  constructor(
    private dataService: DataService,
    private speechService: SpeechService,
    private storageService: StorageService,
    private userProgressionService: UserProgressionService,
    private authService: AuthService,
    private alertController: AlertController,
    private toastController: ToastController,
    private modalController: ModalController,
    private cdr: ChangeDetectorRef,
  ) { }

  async ngOnInit() {
    this.exercises = this.dataService.getPracticeExercises();
    await this.loadPracticeHistory();
    await this.loadSavedCustomTexts();
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
    await this.loadSavedCustomTexts();
  }

  ngOnDestroy() {
    if ((this as any).transcriptInterval) {
      clearInterval((this as any).transcriptInterval);
    }
  }

  toggleInstructions() {
    this.showInstructions = !this.showInstructions;
  }

  setPracticeReady() {
    this.isPracticeReady = true;
  }

  onPracticeTypeChange(event: any) {
    this.selectedPracticeType = event.detail.value;
    this.isPracticeReady = false;
    this.loadStructuredPractice();
  }

  onDifficultyChange(event: any) {
    this.selectedDifficulty = event.detail.value;
    this.isPracticeReady = false;
    this.loadStructuredPractice();
  }

  loadStructuredPractice() {
    if (!this.useCustomText) {
      this.currentStructuredPractice = this.dataService.getStructuredPractice(
        this.selectedPracticeType, 
        this.selectedDifficulty
      );
    }
  }

  startStructuredPractice() {
    this.isPracticing = true;
    this.sessionResults = null;
    this.startStructuredRecording();
  }

  stopStructuredPractice() {
    this.isPracticing = false;
    this.isRecording = false;
    this.userSpeechText = '';
    this.sessionResults = null;
    this.showFeedback = false;
    this.timeRemaining = 0;
  }

  cleanWord(word: string): string {
    return word.toLowerCase().replace(/[.,!?;:]/g, '');
  }

  setupCustomText() {
    if (this.customTargetText.trim().length >= 10) {
      const displayName = this.customTextName.trim() || 'Custom Practice Text';
      
      this.currentStructuredPractice = {
        title: displayName,
        description: 'Practice with your own text',
        targetText: this.customTargetText,
        timeLimit: 5,
        tips: [
          'Read the text carefully before recording',
          'Speak clearly and at a natural pace',
          'Try to match the exact wording and punctuation'
        ],
        type: this.selectedPracticeType as 'monologue' | 'public-speaking' | 'debate-speech',
        difficulty: this.selectedDifficulty as 'beginner' | 'intermediate' | 'advanced',
        practiceText: this.customTargetText
      };
      this.isPracticeReady = true;
    }
  }

  async saveCustomText() {
    if (this.customTargetText.trim().length < 10 || this.customTextName.trim().length === 0) {
      const toast = await this.toastController.create({
        message: 'Please enter both a name and text (minimum 10 characters)',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    const nameExists = this.savedCustomTexts.some(
      saved => saved.name.toLowerCase() === this.customTextName.trim().toLowerCase()
    );

    if (nameExists) {
      const toast = await this.toastController.create({
        message: 'A custom text with this name already exists. Please use a different name.',
        duration: 3000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    // Check for duplicate content
    const contentExists = this.savedCustomTexts.some(
      saved => saved.text.trim() === this.customTargetText.trim()
    );

    if (contentExists) {
      const toast = await this.toastController.create({
        message: 'This text content has already been saved. Please enter different text.',
        duration: 3000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    const newCustomText: SavedCustomText = {
      id: Date.now().toString(),
      name: this.customTextName.trim(),
      text: this.customTargetText.trim(),
      createdAt: new Date().toISOString()
    };

    await this.storageService.addSavedCustomText(newCustomText);
    await this.loadSavedCustomTexts();

    // Clear form and setup the practice
    this.setupCustomText();

    const toast = await this.toastController.create({
      message: `"${newCustomText.name}" saved successfully!`,
      duration: 2000,
      color: 'success'
    });
    await toast.present();
  }

  async loadSavedCustomText(saved: SavedCustomText) {
    this.customTextName = saved.name;
    this.customTargetText = saved.text;
    this.setupCustomText();

    const toast = await this.toastController.create({
      message: `Loaded "${saved.name}"`,
      duration: 1500,
      color: 'success'
    });
    await toast.present();
  }

  async deleteSavedCustomText(id: string) {
    const alert = await this.alertController.create({
      header: 'Delete Custom Text',
      message: 'Are you sure you want to delete this saved text?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            await this.storageService.deleteSavedCustomText(id);
            await this.loadSavedCustomTexts();
            
            const toast = await this.toastController.create({
              message: 'Custom text deleted',
              duration: 2000,
              color: 'success'
            });
            await toast.present();
          }
        }
      ]
    });

    await alert.present();
  }

  async listenToTargetText() {
    if (!this.currentStructuredPractice?.targetText) return;
    
    this.isListeningToText = true;
    try {
      await this.speechService.speak({
        text: this.currentStructuredPractice.targetText,
        rate: 0.9,
        pitch: 1,
        volume: 1
      });
    } catch (error) {
      console.error('Error speaking text:', error);
      const toast = await this.toastController.create({
        message: 'Unable to play audio. Please check your browser settings.',
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

  async listenToRecording() {
    // Check if we have a stored audio blob from the last recording
    if (!this.currentRecordingBlob && !this.currentRecordingUrl) {
      // Try to get from speech service
      const audioBlob = this.speechService.getAudioBlob();
      const audioUrl = this.speechService.getAudioUrl();
      
      if (!audioBlob && !audioUrl) {
        const toast = await this.toastController.create({
          message: 'No audio recording available to play. Please record your speech first.',
          duration: 3000,
          color: 'warning'
        });
        await toast.present();
        return;
      }
      
      if (audioBlob) {
        this.currentRecordingBlob = audioBlob;
        console.log('Loaded audio blob from service:', audioBlob.size, 'bytes');
      }
      if (audioUrl) {
        // Clean up previous URL if exists
        if (this.currentRecordingUrl) {
          URL.revokeObjectURL(this.currentRecordingUrl);
        }
        this.currentRecordingUrl = audioUrl;
        console.log('Loaded audio URL from service');
      }
    }
    
    // Verify we have something to play
    if (!this.currentRecordingBlob && !this.currentRecordingUrl) {
      const toast = await this.toastController.create({
        message: 'Audio recording is not available. Please record again.',
        duration: 3000,
        color: 'warning'
      });
      await toast.present();
      return;
    }
    
    try {
      this.isPlayingRecording = true;
      this.cdr.detectChanges();
      
      console.log('Attempting to play recording...');
      await this.speechService.playRecording();
      console.log('Recording playback completed successfully');
    } catch (error: any) {
      console.error('Error playing recording:', error);
      const errorMessage = error?.message || 'Unable to play audio recording. Please try recording again.';
      
      const toast = await this.toastController.create({
        message: errorMessage,
        duration: 4000,
        color: 'danger',
        buttons: [
          {
            text: 'OK',
            role: 'cancel'
          }
        ]
      });
      await toast.present();
    } finally {
      this.isPlayingRecording = false;
      this.cdr.detectChanges();
    }
  }
  
  stopPlayingRecording() {
    this.speechService.stopPlaying();
    this.isPlayingRecording = false;
  }

  async speakWord(word: string, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    
    // Remove punctuation for cleaner pronunciation
    const cleanWord = word.replace(/[.,!?;:]/g, '').trim();
    if (!cleanWord) return;
    
    // Highlight the word and show phonetic guide
    this.highlightedWord = cleanWord.toLowerCase();
    this.phoneticGuide = this.getPhoneticGuide(word);
    
    try {
      await this.speechService.speak({
        text: cleanWord,
        rate: 0.8,
        pitch: 1,
        volume: 1
      });
    } catch (error) {
      console.error('Error speaking word:', error);
    } finally {
      // Clear highlight after a short delay
      setTimeout(() => {
        this.highlightedWord = null;
        this.phoneticGuide = '';
      }, 2000);
    }
  }

  getPhoneticGuide(word: string): string {
    // Simple phonetic approximation - in a real app, you'd use a proper phonetic dictionary
    // This is a basic implementation
    const cleanWord = word.replace(/[.,!?;:]/g, '').toLowerCase();
    
    // Simple phonetic approximations for common words
    const phoneticMap: {[key: string]: string} = {
      'hello': '/həˈloʊ/',
      'world': '/wɜːrld/',
      'education': '/ˌedʒuˈkeɪʃn/',
      'technology': '/tekˈnɑːlədʒi/',
      'communication': '/kəˌmjuːnɪˈkeɪʃn/'
    };
    
    return phoneticMap[cleanWord] || `/${cleanWord}/`; // Fallback to word itself
  }

  clearSpeech() {
    this.userSpeechText = '';
    // Clean up audio recording
    if (this.currentRecordingUrl) {
      URL.revokeObjectURL(this.currentRecordingUrl);
      this.currentRecordingUrl = null;
    }
    this.currentRecordingBlob = null;
    this.speechService.clearRecording();
    this.stopPlayingRecording();
  }

  getTotalPracticeTime(): string {
    const totalMs = this.practiceHistory.reduce((sum, s) => sum + (s.duration || 0), 0);
    const totalMin = Math.round(totalMs / 60000);
    return `${totalMin} min`;
  }

  private async loadPracticeHistory() {
    this.practiceHistory = await this.storageService.getPracticeHistory();
  }

  private async loadSavedCustomTexts() {
    this.savedCustomTexts = await this.storageService.getSavedCustomTexts();
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

    const fillerAnalysis = this.speechService.analyzeFillerWords(userTranscript);

    const clarityScore = this.speechService.calculateClarityScore(
      userTranscript,
      overallAccuracy,
      analysis.wordsPerMinute
    );

    const repeatedWords = this.speechService.detectRepeatedWords(userTranscript);
    const rhythmAnalysis = this.speechService.analyzeSpeakingRhythm(userTranscript);
    
    const clarityFeedbackArray = this.speechService.getClarityFeedback(
      clarityScore.clarityScore,
      repeatedWords.count,
      rhythmAnalysis.feedback
    );

    const clarityAnalysis = {
      ...clarityScore,
      feedbackArray: clarityFeedbackArray
    };

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
        userSpeech: userTranscript, 
        analysis: analysis,
        fillerAnalysis: fillerAnalysis,
        clarityAnalysis: clarityAnalysis
      },
      cssClass: 'feedback-modal'
    });

    await modal.present();
    this.showFeedback = true;
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
          handler: () => this.stopPractice()
        },
        {
          text: 'Start',
          handler: () => this.startPracticeSession()
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

  async viewHistoryWithFeedback() {
    if (this.practiceHistory.length === 0) {
      const toast = await this.toastController.create({
        message: 'No practice sessions yet. Start practicing to see your history!',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    const modal = await this.modalController.create({
      component: PracticeHistoryModalComponent,
      componentProps: { sessions: this.practiceHistory },
      cssClass: 'history-modal'
    });

    await modal.present();
  }

  async startStructuredRecording() {
    if (!this.speechService.isSpeechRecognitionSupported()) {
      await this.showSpeechRecognitionError();
      return;
    }

    try {
      this.userSpeechText = '';
      this.sessionResults = null;
      // Clear previous recording
      if (this.currentRecordingUrl) {
        URL.revokeObjectURL(this.currentRecordingUrl);
        this.currentRecordingUrl = null;
      }
      this.currentRecordingBlob = null;
      this.speechService.clearTranscript();
      
      if (this.currentStructuredPractice?.targetText) {
        this.speechService.setTargetText(this.currentStructuredPractice.targetText);
      }
      
      await this.speechService.startRecording();
      this.isRecording = true;
      
      // Update transcript more frequently and ensure UI updates
      const transcriptInterval = setInterval(() => {
        if (this.isRecording) {
          const currentTranscript = this.speechService.getCurrentTranscript();
          if (currentTranscript) {
            // Always update, even if empty, to show "Listening..." state
            const formattedText = currentTranscript.trim() !== '' 
              ? this.capitalizeFirstLetter(currentTranscript)
              : '🎤 Listening...';
            
            // Only update if text has changed to avoid unnecessary change detection
            if (this.userSpeechText !== formattedText) {
              this.userSpeechText = formattedText;
              this.cdr.detectChanges();
              console.log('Transcript updated:', formattedText.substring(0, 50) + '...');
            }
          } else if (!this.userSpeechText || this.userSpeechText === '') {
            // Show listening state if no transcript yet
            this.userSpeechText = '🎤 Listening...';
            this.cdr.detectChanges();
          }
        } else {
          clearInterval(transcriptInterval);
        }
      }, 100); // Check every 100ms for real-time updates
      
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

  async stopStructuredRecording() {
    this.isRecording = false;
    
    if ((this as any).transcriptInterval) {
      clearInterval((this as any).transcriptInterval);
      (this as any).transcriptInterval = null;
    }
    
    // Wait for recording to stop properly (including MediaRecorder)
    try {
      await this.speechService.stopRecording();
      
      // Wait longer for MediaRecorder to finish processing the blob
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const result = this.speechService.getRecordingResult();
      const finalTranscript = this.speechService.getCurrentTranscript();
      console.log('%cFinal transcript with punctuation:', 'color: lime; font-weight: bold', finalTranscript);
      console.log('%cTranscript length:', 'color: orange; font-weight: bold', finalTranscript.length);
      
      // Check if transcript is empty
      if (!finalTranscript || finalTranscript.trim() === '' || finalTranscript === '🎤 Listening...') {
        console.error('❌ Empty transcript detected!');
        const toast = await this.toastController.create({
          message: 'No speech detected. Please speak clearly and try again. Make sure your microphone is working.',
          duration: 4000,
          color: 'warning',
          buttons: [{
            text: 'OK',
            role: 'cancel'
          }]
        });
        await toast.present();
        this.userSpeechText = '';
        return; // Exit early if no speech detected
      }
      
      // Get audio with multiple attempts
      let audioBlob = result.audioBlob || this.speechService.getAudioBlob();
      let audioUrl = result.audioUrl || this.speechService.getAudioUrl();
      
      // Retry getting blob if not available yet
      if (!audioBlob) {
        await new Promise(resolve => setTimeout(resolve, 500));
        audioBlob = this.speechService.getAudioBlob();
      }
      
      console.log('%cAudio blob available:', 'color: lime; font-weight: bold', !!audioBlob, 'Size:', audioBlob?.size);
      
      this.userSpeechText = this.capitalizeFirstLetter(finalTranscript);
      console.log('%cFinal userSpeechText:', 'color: lime; font-weight: bold', this.userSpeechText);
      
      // Store the audio recording for playback
      if (audioBlob) {
        this.currentRecordingBlob = audioBlob;
        console.log('✓ Audio blob stored:', audioBlob.size, 'bytes');
        
        // Create URL from blob if not available
        if (!audioUrl) {
          if (this.currentRecordingUrl) {
            URL.revokeObjectURL(this.currentRecordingUrl);
          }
          this.currentRecordingUrl = URL.createObjectURL(audioBlob);
          console.log('✓ Audio URL created from blob');
        }
      }
      
      if (audioUrl) {
        if (this.currentRecordingUrl && this.currentRecordingUrl !== audioUrl) {
          URL.revokeObjectURL(this.currentRecordingUrl);
        }
        this.currentRecordingUrl = audioUrl;
        console.log('✓ Audio URL stored:', audioUrl);
      }
      
      // Show warning if no audio available
      if (!audioBlob && !audioUrl) {
        console.warn('⚠️ No audio recording available');
        const toast = await this.toastController.create({
          message: 'Audio recording may not be available for playback. Speech recognition worked correctly.',
          duration: 3000,
          color: 'warning',
          position: 'bottom'
        });
        await toast.present();
      }
      
      this.handleStructuredRecordingResult(result);
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error stopping recording:', error);
      // Still try to get transcript even if audio fails
      const finalTranscript = this.speechService.getCurrentTranscript();
      if (finalTranscript && finalTranscript.trim() !== '') {
        this.userSpeechText = this.capitalizeFirstLetter(finalTranscript);
        
        const toast = await this.toastController.create({
          message: 'Speech captured but audio recording failed. You can still get feedback.',
          duration: 3000,
          color: 'warning'
        });
        await toast.present();
        this.cdr.detectChanges();
      } else {
        // Show error if both transcript and audio failed
        const toast = await this.toastController.create({
          message: 'Recording failed. No speech was detected. Please try again.',
          duration: 3000,
          color: 'danger'
        });
        await toast.present();
      }
    }
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

  private calculateOverallAccuracy(analysis: any): number {
    const wordAccuracy = analysis.wordAccuracy || 0;
    const punctuationAccuracy = analysis.punctuationAccuracy || 0;
    return Math.round((wordAccuracy * 0.7) + (punctuationAccuracy * 0.3));
  }

  private calculateWordAccuracy(userText: string, targetText: string): number {
    if (!userText || !targetText) return 0;
    const normalize = (text: string) => text.toLowerCase().replace(/\s+/g, ' ').trim().split(' ');
    const userWords = normalize(userText);
    const targetWords = normalize(targetText);
    let correct = 0;
    for (let i = 0; i < Math.min(userWords.length, targetWords.length); i++) {
      if (userWords[i] === targetWords[i]) correct++;
    }
    return (correct / targetWords.length) * 100;
  }

  private calculatePunctuationAccuracy(userText: string, targetText: string): number {
    const userPunc = userText.match(/[.,!?;:]/g) || [];
    const targetPunc = targetText.match(/[.,!?;:]/g) || [];
    const correct = userPunc.filter((p, i) => p === targetPunc[i]).length;
    return (correct / (targetPunc.length || 1)) * 100;
  }

  private capitalizeFirstLetter(text: string): string {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  getWordsArray(text: string | undefined): string[] {
    if (!text) return [];
    return text.split(/\s+/).filter(word => word.length > 0);
  }

  private async showSpeechRecognitionError() {
    const alert = await this.alertController.create({
      header: 'Speech Recognition Not Supported',
      message: 'Your browser does not support speech recognition. Please use: Chrome, Edge, or Safari.',
      buttons: ['OK']
    });
    await alert.present();
  }
}
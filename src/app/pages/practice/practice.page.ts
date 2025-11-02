import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { AlertController, ToastController, ModalController } from '@ionic/angular';
import { DataService, PracticeExercise, StructuredPractice } from '../../services/data.service';
import { SpeechService, SpeechRecognitionResult } from '../../services/speech.service';
import { StorageService } from '../../services/storage.service';
import { UserProgressionService } from '../../services/user-progression.service';
import { AuthService } from '../../services/auth.service';
import { ErrorHandlerService, ErrorType } from '../../services/error-handler.service';
import { PracticeStateService } from '../../services/practice-state.service';
import { UndoService, UndoActionType } from '../../services/undo.service';
import { PreferencesService } from '../../services/preferences.service';
import { KeyboardShortcutsService } from '../../services/keyboard-shortcuts.service';
import { FeedbackModalComponent } from '../../components/feedback-modal/feedback-modal.component';
import { SessionCompleteComponent } from '../../components/session-complete/session-complete.component';
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
  
  // Context indicator properties
  recordingDuration = 0;
  recordingStartTime = 0;
  wordCount = 0;
  showTargetText = true; // Toggle for sticky target text visibility
  
  // Step tracking
  currentPracticeStep = 1; // 1: Select Type, 2: Set Difficulty, 3: Start Practice
  previousSessionAccuracy: number | undefined = undefined;

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
    private errorHandler: ErrorHandlerService,
    private practiceStateService: PracticeStateService,
    private undoService: UndoService,
    private preferencesService: PreferencesService,
    private keyboardShortcuts: KeyboardShortcutsService
  ) { }

  async ngOnInit() {
    this.exercises = this.dataService.getPracticeExercises();
    await this.loadPracticeHistory();
    await this.loadSavedCustomTexts();
    
    // Subscribe to keyboard shortcuts
    this.keyboardShortcuts.shortcut$.subscribe(shortcut => {
      this.handleKeyboardShortcut(shortcut);
    });
    
    // Restore practice state if available
    const savedState = this.practiceStateService.getState();
    if (savedState && savedState.isActive) {
      if (savedState.practiceType && savedState.difficulty) {
        this.selectedPracticeType = savedState.practiceType;
        this.selectedDifficulty = savedState.difficulty;
      }
      if (savedState.customText) {
        this.customTextName = savedState.customText.name;
        this.customTargetText = savedState.customText.text;
        this.useCustomText = true;
      }
    }
    
    this.loadStructuredPractice();
    
    if (!this.speechService.isSpeechRecognitionSupported()) {
      await this.errorHandler.showError(
        new Error('Speech Recognition not supported'),
        ErrorType.SPEECH_RECOGNITION_NOT_SUPPORTED
      );
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
    this.currentPracticeStep = 3; // Move to step 3 (ready to start)
  }

  onPracticeTypeChange(event: any) {
    this.selectedPracticeType = event.detail.value;
    this.isPracticeReady = false;
    this.currentPracticeStep = 1; // Reset to step 1
    this.loadStructuredPractice();
    // Save state
    this.practiceStateService.updatePracticeSetup(this.selectedPracticeType, this.selectedDifficulty);
  }

  onDifficultyChange(event: any) {
    this.selectedDifficulty = event.detail.value;
    this.isPracticeReady = false;
    this.currentPracticeStep = 2; // Move to step 2 (difficulty selected)
    this.loadStructuredPractice();
    // Save state
    this.practiceStateService.updatePracticeSetup(this.selectedPracticeType, this.selectedDifficulty);
  }
  
  onStepChange(step: number) {
    this.currentPracticeStep = step;
    if (step === 1) {
      // Reset to type selection
      this.isPracticeReady = false;
    } else if (step === 2) {
      // Move to difficulty selection
      this.isPracticeReady = false;
    }
  }
  
  getPracticeStepLabels(): string[] {
    return ['Select Type', 'Set Difficulty', 'Start Practice'];
  }
  
  shouldShowTips(): boolean {
    return this.preferencesService.getPreferences().showTips;
  }
  
  private handleKeyboardShortcut(shortcut: any): void {
    switch (shortcut.action) {
      case 'practice:start-recording':
        if (this.isPracticing && !this.isRecording) {
          this.startStructuredRecording();
        } else if (this.isRecording) {
          this.stopStructuredRecording();
        }
        break;
      case 'practice:stop-practice':
        if (this.isPracticing) {
          this.stopStructuredPractice();
        }
        break;
      case 'practice:retry':
        if (this.userSpeechText) {
          this.clearSpeech();
        }
        break;
      case 'show-help':
        this.showKeyboardShortcutsHelp();
        break;
    }
  }
  
  async showKeyboardShortcutsHelp(): Promise<void> {
    const shortcuts = this.keyboardShortcuts.getShortcutsByCategory('practice');
    const shortcutText = shortcuts.map(s => 
      `${this.keyboardShortcuts.formatShortcutDisplay(s)}: ${s.description}`
    ).join('\n');
    
    const alert = await this.alertController.create({
      header: 'Keyboard Shortcuts',
      message: shortcutText || 'No shortcuts available',
      buttons: ['OK']
    });
    
    await alert.present();
  }

  loadStructuredPractice() {
    if (!this.useCustomText) {
      this.currentStructuredPractice = this.dataService.getStructuredPractice(
        this.selectedPracticeType, 
        this.selectedDifficulty
      );
      // Update step based on whether practice is ready
      if (this.currentStructuredPractice && this.isPracticeReady) {
        this.currentPracticeStep = 3;
      } else if (this.selectedDifficulty && this.selectedPracticeType) {
        this.currentPracticeStep = 2;
      } else {
        this.currentPracticeStep = 1;
      }
    }
  }

  async startStructuredPractice() {
    this.isPracticing = true;
    this.sessionResults = null;
    this.currentPracticeStep = 3;
    
    // Check if auto-start is enabled in preferences
    const prefs = this.preferencesService.getPreferences();
    if (prefs.autoStartRecording) {
      // Auto-start recording if preference is enabled
      await this.startStructuredRecording();
    }
    // Otherwise, user must click "START RECORDING" button
  }

  async stopStructuredPractice() {
    // Show confirmation if there's unsaved progress
    if (this.userSpeechText && this.userSpeechText.trim() !== '' && this.userSpeechText !== '🎤 Listening...') {
      const alert = await this.alertController.create({
        header: 'End Practice Session?',
        message: 'Your progress will be saved. Are you sure you want to end this practice session?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'End Session',
            role: 'destructive',
            handler: () => {
              this.endPracticeSessionNow();
            }
          }
        ]
      });
      
      await alert.present();
    } else {
      this.endPracticeSessionNow();
    }
  }
  
  private endPracticeSessionNow() {
    this.isPracticing = false;
    this.isRecording = false;
    this.userSpeechText = '';
    this.sessionResults = null;
    this.showFeedback = false;
    this.timeRemaining = 0;
    this.currentPracticeStep = 1;
    this.practiceStateService.clearState();
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
      // Save state
      this.practiceStateService.updateCustomText(displayName, this.customTargetText);
    }
  }

  async saveCustomText() {
    if (this.customTargetText.trim().length < 10 || this.customTextName.trim().length === 0) {
      await this.errorHandler.showWarning('Please enter both a name and text (minimum 10 characters)');
      return;
    }

    const nameExists = this.savedCustomTexts.some(
      saved => saved.name.toLowerCase() === this.customTextName.trim().toLowerCase()
    );

    if (nameExists) {
      await this.errorHandler.showWarning('A custom text with this name already exists. Please use a different name.');
      return;
    }

    // Check for duplicate content
    const contentExists = this.savedCustomTexts.some(
      saved => saved.text.trim() === this.customTargetText.trim()
    );

    if (contentExists) {
      await this.errorHandler.showWarning('This text content has already been saved. Please enter different text.');
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

    await this.errorHandler.showSuccess(`"${newCustomText.name}" saved successfully!`);
  }

  async loadSavedCustomText(saved: SavedCustomText) {
    this.customTextName = saved.name;
    this.customTargetText = saved.text;
    this.setupCustomText();

    await this.errorHandler.showSuccess(`Loaded "${saved.name}"`);
  }

  async deleteSavedCustomText(id: string) {
    const savedText = this.savedCustomTexts.find(t => t.id === id);
    if (!savedText) return;

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
            // Register undo action before deleting
            this.undoService.registerAction(
              UndoActionType.DELETE_CUSTOM_TEXT,
              { text: savedText },
              `"${savedText.name}" deleted`,
              async (data: any) => {
                // Undo: restore the deleted text
                await this.storageService.addSavedCustomText(data.text);
                await this.loadSavedCustomTexts();
              }
            );

            await this.storageService.deleteSavedCustomText(id);
            await this.loadSavedCustomTexts();
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
      await this.errorHandler.showError(
        error,
        ErrorType.AUDIO_PLAYBACK_FAILURE
      );
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
        await this.errorHandler.showWarning(
          'No audio recording available to play. Please record your speech first.'
        );
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
      await this.errorHandler.showWarning(
        'Audio recording is not available. Please record again.'
      );
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
      await this.errorHandler.showError(
        error,
        ErrorType.AUDIO_PLAYBACK_FAILURE
      );
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

  async clearSpeech() {
    if (!this.userSpeechText || this.userSpeechText.trim() === '' || this.userSpeechText === '🎤 Listening...') {
      return;
    }

    const speechToClear = this.userSpeechText;
    const audioBlob = this.currentRecordingBlob;
    const audioUrl = this.currentRecordingUrl;

    // Register undo action before clearing
    this.undoService.registerAction(
      UndoActionType.CLEAR_SPEECH,
      { text: speechToClear, audioBlob, audioUrl },
      'Speech cleared',
      async (data: any) => {
        // Undo: restore the speech
        this.userSpeechText = data.text;
        if (data.audioUrl) {
          this.currentRecordingUrl = data.audioUrl;
        }
        if (data.audioBlob) {
          this.currentRecordingBlob = data.audioBlob;
        }
        this.cdr.detectChanges();
      }
    );

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
      await this.errorHandler.showWarning('No speech recorded. Please record first.');
      return;
    }

    const userTranscript = this.userSpeechText || this.sessionResults.transcript;
    const targetText = this.currentStructuredPractice.targetText;

    if (!userTranscript || userTranscript.trim() === '') {
      await this.errorHandler.showWarning('No speech text found. Please record again.');
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
    
    // Wait for modal to dismiss, then show session complete
    const { data } = await modal.onDidDismiss();
    
    // Show session complete modal
    await this.showSessionComplete({
      accuracy: overallAccuracy,
      duration: this.sessionResults.duration / 1000, // Convert ms to seconds
      wordsSpoken: userWords,
      previousAccuracy: this.previousSessionAccuracy,
      practiceType: this.selectedPracticeType
    });
    
    // Store this accuracy for next comparison
    this.previousSessionAccuracy = overallAccuracy;
  }
  
  private async showSessionComplete(data: {
    accuracy: number;
    duration: number;
    wordsSpoken: number;
    previousAccuracy?: number;
    practiceType: string;
  }) {
    const modal = await this.modalController.create({
      component: SessionCompleteComponent,
      componentProps: data,
      cssClass: 'session-complete-modal'
    });
    
    await modal.present();
    
    const { data: result } = await modal.onDidDismiss();
    
    // Handle action from session complete modal
    if (result?.action === 'tryAgain') {
      // Reset and start again
      this.userSpeechText = '';
      this.sessionResults = null;
      this.showFeedback = false;
      this.startStructuredPractice();
    } else if (result?.action === 'viewHistory') {
      await this.viewHistoryWithFeedback();
    } else if (result?.action === 'startNew') {
      this.endPracticeSessionNow();
    }
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
      await this.errorHandler.showError(
        new Error('Speech Recognition not supported'),
        ErrorType.SPEECH_RECOGNITION_NOT_SUPPORTED
      );
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
      
      await this.errorHandler.showError(
        error,
        ErrorType.RECORDING_FAILED,
        async () => {
          await this.startRecording();
        }
      );
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

    await this.errorHandler.showSuccess('Practice session completed!');
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
      await this.errorHandler.showInfo('No practice sessions yet. Start practicing to see your history!');
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
      this.recordingStartTime = Date.now();
      this.recordingDuration = 0;
      this.wordCount = 0;
      
      // Start recording duration timer
      const durationInterval = setInterval(() => {
        if (this.isRecording) {
          this.recordingDuration = Math.floor((Date.now() - this.recordingStartTime) / 1000);
        } else {
          clearInterval(durationInterval);
        }
      }, 1000);
      
      // Update transcript more frequently and ensure UI updates
      const transcriptInterval = setInterval(() => {
        if (this.isRecording) {
          const currentTranscript = this.speechService.getCurrentTranscript();
          if (currentTranscript) {
            // Always update, even if empty, to show "Listening..." state
            const formattedText = currentTranscript.trim() !== '' 
              ? this.capitalizeFirstLetter(currentTranscript)
              : '🎤 Listening...';
            
            // Update word count
            if (formattedText !== '🎤 Listening...') {
              this.wordCount = formattedText.split(/\s+/).filter(w => w.length > 0).length;
            }
            
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
      
      await this.errorHandler.showError(
        error,
        ErrorType.RECORDING_FAILED,
        async () => {
          await this.startStructuredRecording();
        }
      );
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
        this.userSpeechText = '';
        
        await this.errorHandler.showError(
          new Error('Empty transcript'),
          ErrorType.EMPTY_TRANSCRIPT,
          async () => {
            // Retry: Start recording again
            await this.startStructuredRecording();
          }
        );
        
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
        await this.errorHandler.showWarning(
          'Audio recording may not be available for playback. Speech recognition worked correctly.'
        );
      }
      
      this.handleStructuredRecordingResult(result);
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error stopping recording:', error);
      // Still try to get transcript even if audio fails
      const finalTranscript = this.speechService.getCurrentTranscript();
      if (finalTranscript && finalTranscript.trim() !== '') {
        this.userSpeechText = this.capitalizeFirstLetter(finalTranscript);
        
        await this.errorHandler.showWarning(
          'Speech captured but audio recording failed. You can still get feedback.'
        );
        this.cdr.detectChanges();
      } else {
        // Show error if both transcript and audio failed
        await this.errorHandler.showError(
          new Error('Recording and transcript failed'),
          ErrorType.RECORDING_FAILED,
          async () => {
            await this.startStructuredRecording();
          }
        );
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

    // Save session to storage
    await this.storageService.addPracticeSession(this.sessionResults);
    await this.loadPracticeHistory();

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
    await this.errorHandler.showError(
      new Error('Speech Recognition not supported'),
      ErrorType.SPEECH_RECOGNITION_NOT_SUPPORTED
    );
  }
}
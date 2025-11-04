import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { AlertController, ToastController, ModalController, Platform } from '@ionic/angular';
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

// Browser compatibility detection
interface BrowserCapabilities {
  hasSpeechRecognition: boolean;
  hasMediaRecorder: boolean;
  hasGetUserMedia: boolean;
  speechRecognitionType: 'native' | 'webkit' | 'none';
  preferredAudioFormat: string;
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
  currentStructuredPractice: any = {}; 
  
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
  isTipsVisible = false;
  highlightedWord: string | null = null;
  phoneticGuide: string = '';
  isPlayingRecording = false;
  currentRecordingBlob: Blob | null = null;
  currentRecordingUrl: string | null = null;
  
  // Context indicator properties
  recordingDuration = 0;
  recordingStartTime = 0;
  wordCount = 0;
  showTargetText = true;
  
  // Step tracking
  currentPracticeStep = 1;
  previousSessionAccuracy: number | undefined = undefined;

  // Platform detection
  isIOS = false;
  isAndroid = false;
  isMobile = false;
  browserName = '';
  
  // Browser capabilities
  private browserCapabilities: BrowserCapabilities = {
    hasSpeechRecognition: false,
    hasMediaRecorder: false,
    hasGetUserMedia: false,
    speechRecognitionType: 'none',
    preferredAudioFormat: 'audio/webm'
  };
  
  // Audio playback
  private audioElement: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  
  // MediaRecorder for better cross-platform support
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private mediaStream: MediaStream | null = null;
  
  // Speech recognition instances
  private recognitionInstance: any = null;
  private interimTranscript = '';
  private finalTranscript = '';
  private recognitionRestartAttempts = 0;
  private maxRestartAttempts = 3;
  
  // Interaction guards
  private isPlaybackStarting = false;
  private isStoppingPlayback = false;
  private isStartingRecording = false;
  private isStoppingRecording = false;
  
  // Permission tracking
  private microphonePermissionGranted = false;
  private hasShownPermissionError = false;

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
    private keyboardShortcuts: KeyboardShortcutsService,
    private platform: Platform
  ) { }

  async ngOnInit() {
    // Detect platform and browser
    await this.detectPlatformAndBrowser();
    
    console.log('Platform detection:', {
      isIOS: this.isIOS,
      isAndroid: this.isAndroid,
      isMobile: this.isMobile,
      browser: this.browserName,
      platforms: this.platform.platforms()
    });
    
    // Detect browser capabilities
    await this.detectBrowserCapabilities();
    
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
    
    // Initialize audio context for iOS
    if (this.isIOS) {
      await this.initializeAudioContext();
    }
    
    // Show compatibility warning if needed
    await this.checkCompatibilityAndWarn();
    
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
    
    // Clean up all resources
    this.cleanupAllResources();
  }
  
  private async detectPlatformAndBrowser() {
    this.isIOS = this.platform.is('ios');
    this.isAndroid = this.platform.is('android');
    this.isMobile = this.platform.is('mobile');
    
    // Detect browser
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('chrome') && !ua.includes('edg')) {
      this.browserName = 'chrome';
    } else if (ua.includes('safari') && !ua.includes('chrome')) {
      this.browserName = 'safari';
    } else if (ua.includes('firefox')) {
      this.browserName = 'firefox';
    } else if (ua.includes('edg')) {
      this.browserName = 'edge';
    } else {
      this.browserName = 'unknown';
    }
  }
  
  private async detectBrowserCapabilities() {
    // Check for Speech Recognition
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.browserCapabilities.hasSpeechRecognition = true;
      // @ts-ignore
      this.browserCapabilities.speechRecognitionType = window.SpeechRecognition ? 'native' : 'webkit';
    }
    
    // Check for MediaRecorder
    this.browserCapabilities.hasMediaRecorder = typeof MediaRecorder !== 'undefined';
    
    // Check for getUserMedia
    this.browserCapabilities.hasGetUserMedia = !!(
      navigator.mediaDevices && navigator.mediaDevices.getUserMedia
    );
    
    // Determine best audio format
    if (this.browserCapabilities.hasMediaRecorder) {
      if (this.isIOS) {
        // iOS Safari prefers mp4
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
          this.browserCapabilities.preferredAudioFormat = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/wav')) {
          this.browserCapabilities.preferredAudioFormat = 'audio/wav';
        } else {
          this.browserCapabilities.preferredAudioFormat = 'audio/webm';
        }
      } else if (this.browserName === 'firefox') {
        // Firefox prefers ogg
        if (MediaRecorder.isTypeSupported('audio/ogg')) {
          this.browserCapabilities.preferredAudioFormat = 'audio/ogg';
        } else {
          this.browserCapabilities.preferredAudioFormat = 'audio/webm';
        }
      } else {
        // Chrome/Edge prefer webm with opus
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          this.browserCapabilities.preferredAudioFormat = 'audio/webm;codecs=opus';
        } else {
          this.browserCapabilities.preferredAudioFormat = 'audio/webm';
        }
      }
    }
    
    console.log('Browser capabilities:', this.browserCapabilities);
  }
  
  private async checkCompatibilityAndWarn() {
    const issues: string[] = [];
    
    if (!this.browserCapabilities.hasSpeechRecognition) {
      issues.push('Speech recognition is not supported in this browser');
    }
    
    if (!this.browserCapabilities.hasMediaRecorder) {
      issues.push('Audio recording is not supported in this browser');
    }
    
    if (!this.browserCapabilities.hasGetUserMedia) {
      issues.push('Microphone access is not supported in this browser');
    }
    
    // Only show warning if there are ACTUAL issues
    if (issues.length > 0) {
      console.warn('Browser compatibility issues detected:', issues);
      
      let message = 'Some features may not work:\n\n';
      message += issues.join('\n');
      message += '\n\nRecommended browsers:\n';
      
      if (this.isIOS) {
        message += '• Safari (latest version)\n';
        message += '• Chrome for iOS (with microphone permission)';
      } else if (this.isAndroid) {
        message += '• Chrome (latest version)\n';
        message += '• Firefox';
      } else {
        message += '• Chrome\n• Edge\n• Firefox';
      }
      
      const alert = await this.alertController.create({
        header: 'Browser Compatibility',
        message: message,
        buttons: ['I Understand']
      });
      
      await alert.present();
    } else {
      // All features supported - just log success
      console.log('✓ All browser features supported:', this.browserCapabilities);
    }
  }
  
  private cleanupAllResources() {
    // Clean up audio
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
      this.audioElement = null;
    }
    
    if (this.currentRecordingUrl) {
      URL.revokeObjectURL(this.currentRecordingUrl);
      this.currentRecordingUrl = null;
    }
    
    // Clean up media recorder
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (e) {
        console.log('MediaRecorder already stopped');
      }
    }
    this.mediaRecorder = null;
    
    // Clean up media stream
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    
    // Clean up speech recognition
    if (this.recognitionInstance) {
      try {
        this.recognitionInstance.stop();
      } catch (e) {
        console.log('Recognition already stopped');
      }
      this.recognitionInstance = null;
    }
    
    // Clean up audio context
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch (e) {
        console.log('AudioContext already closed');
      }
    }
  }
  
  private async initializeAudioContext() {
    try {
      // @ts-ignore - webkit prefix for iOS
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContextClass();
      
      if (this.audioContext.state === 'suspended') {
        console.log('Audio context suspended, will resume on user interaction');
      }
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }
  
  private async requestMicrophonePermission(): Promise<boolean> {
    if (this.microphonePermissionGranted) {
      return true;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      });
      
      // Permission granted - stop the stream immediately
      stream.getTracks().forEach(track => track.stop());
      this.microphonePermissionGranted = true;
      this.hasShownPermissionError = false;
      
      console.log('✓ Microphone permission granted');
      return true;
      
    } catch (error: any) {
      console.error('Microphone permission denied:', error);
      
      if (!this.hasShownPermissionError) {
        this.hasShownPermissionError = true;
        await this.showMicrophonePermissionError(error);
      }
      
      return false;
    }
  }
  
  private initializeSpeechRecognition() {
    if (this.recognitionInstance) {
      return this.recognitionInstance;
    }
    
    if (!this.browserCapabilities.hasSpeechRecognition) {
      console.error('Speech recognition not supported');
      return null;
    }
    
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    // Configure recognition for maximum compatibility
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;
    
    recognition.onstart = () => {
      console.log('✓ Speech recognition started');
      this.recognitionRestartAttempts = 0;
    };
    
    recognition.onresult = (event: any) => {
      this.interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          this.finalTranscript += transcript + ' ';
        } else {
          this.interimTranscript += transcript;
        }
      }
      
      const fullTranscript = (this.finalTranscript + this.interimTranscript).trim();
      if (fullTranscript) {
        this.userSpeechText = this.capitalizeFirstLetter(fullTranscript);
        this.wordCount = fullTranscript.split(/\s+/).filter(w => w.length > 0).length;
        this.cdr.detectChanges();
      }
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      
      // Don't show error for no-speech - it's normal
      if (event.error === 'no-speech') {
        return;
      }
      
      // Handle aborted error (user stopped)
      if (event.error === 'aborted') {
        console.log('Speech recognition aborted by user');
        return;
      }
      
      // Try to restart on certain errors
      if (event.error === 'network' && this.isRecording && this.recognitionRestartAttempts < this.maxRestartAttempts) {
        console.log('Attempting to restart speech recognition...');
        this.recognitionRestartAttempts++;
        
        setTimeout(() => {
          if (this.isRecording && this.recognitionInstance) {
            try {
              this.recognitionInstance.start();
            } catch (e) {
              console.log('Could not restart recognition:', e);
            }
          }
        }, 1000);
        
        return;
      }
      
      // Show error for other cases
      if (this.isRecording) {
        this.errorHandler.showError(
          new Error(event.error),
          ErrorType.RECORDING_FAILED
        );
      }
    };
    
    recognition.onend = () => {
      console.log('Speech recognition ended');
      
      // Auto-restart if still recording and not manually stopped
      if (this.isRecording && this.recognitionRestartAttempts < this.maxRestartAttempts) {
        console.log('Auto-restarting speech recognition...');
        this.recognitionRestartAttempts++;
        
        setTimeout(() => {
          if (this.isRecording && this.recognitionInstance) {
            try {
              this.recognitionInstance.start();
            } catch (e) {
              console.log('Could not restart recognition:', e);
            }
          }
        }, 100);
      }
    };
    
    this.recognitionInstance = recognition;
    return recognition;
  }

  toggleInstructions() {
    this.showInstructions = !this.showInstructions;
  }

  toggleTips() {
    this.isTipsVisible = !this.isTipsVisible;
  }
  
  setPracticeReady() {
    this.isPracticeReady = true;
    this.currentPracticeStep = 3;
  }

  onPracticeTypeChange(event: any) {
    this.selectedPracticeType = event.detail.value;
    this.isPracticeReady = false;
    this.currentPracticeStep = 1;
    this.loadStructuredPractice();
    this.practiceStateService.updatePracticeSetup(this.selectedPracticeType, this.selectedDifficulty);
  }

  onDifficultyChange(event: any) {
    this.selectedDifficulty = event.detail.value;
    this.isPracticeReady = false;
    this.currentPracticeStep = 2;
    this.loadStructuredPractice();
    this.practiceStateService.updatePracticeSetup(this.selectedPracticeType, this.selectedDifficulty);
  }
  
  onStepChange(step: number) {
    this.currentPracticeStep = step;
    if (step === 1) {
      this.isPracticeReady = false;
    } else if (step === 2) {
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
    // Check capabilities before starting
    if (!this.browserCapabilities.hasSpeechRecognition || !this.browserCapabilities.hasMediaRecorder) {
      await this.checkCompatibilityAndWarn();
      return;
    }
    
    // Request microphone permission
    const hasPermission = await this.requestMicrophonePermission();
    if (!hasPermission) {
      return;
    }
    
    this.isPracticing = true;
    this.sessionResults = null;
    this.currentPracticeStep = 3;
    
    // Unlock audio context on iOS
    if (this.isIOS && this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
        console.log('Audio context resumed');
      } catch (error) {
        console.error('Failed to resume audio context:', error);
      }
    }
    
    const prefs = this.preferencesService.getPreferences();
    if (prefs.autoStartRecording) {
      await this.startStructuredRecording();
    }
  }

  async stopStructuredPractice() {
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
              if (this.sessionResults && this.currentStructuredPractice) {
                const finalTranscript = this.userSpeechText || this.sessionResults.transcript || '';
                const userWords = finalTranscript.split(/\s+/).filter((w: string) => w.length > 0).length;
                const overallAccuracy = this.calculateOverallAccuracy({
                  wordAccuracy: this.calculateWordAccuracy(finalTranscript, this.currentStructuredPractice.targetText),
                  punctuationAccuracy: this.calculatePunctuationAccuracy(finalTranscript, this.currentStructuredPractice.targetText),
                  confidence: this.sessionResults.confidence,
                  duration: this.sessionResults.duration
                });

                this.showSessionComplete({
                  accuracy: overallAccuracy,
                  duration: (this.sessionResults.duration || 0) / 1000,
                  wordsSpoken: userWords,
                  previousAccuracy: this.previousSessionAccuracy,
                  practiceType: this.selectedPracticeType
                });
              }
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
    this.cleanupAllResources();
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
        type: this.selectedPracticeType as 'monologue' | 'public-speaking' | 'storytelling',
        difficulty: this.selectedDifficulty as 'beginner' | 'intermediate' | 'advanced',
        practiceText: this.customTargetText
      };
      this.isPracticeReady = true;
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
            this.undoService.registerAction(
              UndoActionType.DELETE_CUSTOM_TEXT,
              { text: savedText },
              `"${savedText.name}" deleted`,
              async (data: any) => {
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
    if (this.isPlaybackStarting || this.isPlayingRecording) {
      return;
    }
    this.isPlaybackStarting = true;
    
    // Verify we have recording data
    if (!this.currentRecordingBlob && !this.currentRecordingUrl) {
      await this.errorHandler.showWarning(
        'No audio recording available to play. Please record your speech first.'
      );
      this.isPlaybackStarting = false;
      return;
    }

    try {
      this.isPlayingRecording = true;
      this.cdr.detectChanges();
      
      await this.playRecordingUniversal();
      
      console.log('Recording playback completed');
    } catch (error: any) {
      console.error('Error playing recording:', error);
      const msg = (error && (error.name || error.message)) ? (error.name || error.message) : '';
      if (msg !== 'AbortError' && msg !== 'NotAllowedError') {
        await this.errorHandler.showError(
          error,
          ErrorType.AUDIO_PLAYBACK_FAILURE
        );
      }
    } finally {
      this.isPlayingRecording = false;
      this.isPlaybackStarting = false;
      this.cdr.detectChanges();
    }
  }
  
  private async playRecordingUniversal(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Clean up previous audio element
        if (this.audioElement) {
          this.audioElement.pause();
          this.audioElement.src = '';
        }
        
        this.audioElement = new Audio();
        
        // Set source
        if (this.currentRecordingBlob) {
          const url = URL.createObjectURL(this.currentRecordingBlob);
          this.audioElement.src = url;
          
          // Clean up old URL
          if (this.currentRecordingUrl && this.currentRecordingUrl !== url) {
            URL.revokeObjectURL(this.currentRecordingUrl);
          }
          this.currentRecordingUrl = url;
        } else if (this.currentRecordingUrl) {
          this.audioElement.src = this.currentRecordingUrl;
        } else {
          reject(new Error('No audio source available'));
          return;
        }
        
        // Configure audio element
        this.audioElement.preload = 'auto';
        this.audioElement.controls = false;
        
        // Event handlers
        this.audioElement.onended = () => {
          console.log('Audio playback ended');
          resolve();
        };
        
        this.audioElement.onpause = () => {
          resolve();
        };
        
        this.audioElement.onerror = (e) => {
          console.error('Audio playback error:', e);
          reject(new Error('Audio playback failed'));
        };
        
        // Load and play
        this.audioElement.load();
        
        const playPromise = this.audioElement.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Audio playing successfully');
            })
            .catch(error => {
              console.error('Play failed:', error);
              reject(error);
            });
        }
      } catch (error) {
        console.error('Audio setup failed:', error);
        reject(error);
      }
    });
  }
  
  stopPlayingRecording() {
    if (this.isStoppingPlayback) return;
    this.isStoppingPlayback = true;
    try {
      if (this.audioElement) {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
      }
      this.isPlayingRecording = false;
    } finally {
      this.isStoppingPlayback = false;
    }
  }

  async togglePlayback() {
    if (this.isPlaybackStarting && !this.isPlayingRecording) return;
    if (this.isPlayingRecording) {
      this.stopPlayingRecording();
      return;
    }
    await this.listenToRecording();
  }

  async speakWord(word: string, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    
    const cleanWord = word.replace(/[.,!?;:]/g, '').trim();
    if (!cleanWord) return;
    
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
      setTimeout(() => {
        this.highlightedWord = null;
        this.phoneticGuide = '';
      }, 2000);
    }
  }

  getPhoneticGuide(word: string): string {
    const cleanWord = word.replace(/[.,!?;:]/g, '').toLowerCase();
    
    const phoneticMap: {[key: string]: string} = {
      'hello': '/həˈloʊ/',
      'world': '/wɜːrld/',
      'education': '/ˌedʒuˈkeɪʃn/',
      'technology': '/tekˈnɑːlədʒi/',
      'communication': '/kəˌmjuːnɪˈkeɪʃn/'
    };
    
    return phoneticMap[cleanWord] || `/${cleanWord}/`;
  }

  async clearSpeech() {
    if (!this.userSpeechText || this.userSpeechText.trim() === '' || this.userSpeechText === '🎤 Listening...') {
      return;
    }

    const speechToClear = this.userSpeechText;
    const audioBlob = this.currentRecordingBlob;
    const audioUrl = this.currentRecordingUrl;

    this.undoService.registerAction(
      UndoActionType.CLEAR_SPEECH,
      { text: speechToClear, audioBlob, audioUrl },
      'Speech cleared',
      async (data: any) => {
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
    if (this.currentRecordingUrl) {
      URL.revokeObjectURL(this.currentRecordingUrl);
      this.currentRecordingUrl = null;
    }
    this.currentRecordingBlob = null;
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
    const { data } = await modal.onDidDismiss();
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
    
    if (result?.action === 'tryAgain') {
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
    if (!this.browserCapabilities.hasSpeechRecognition) {
      await this.showSpeechRecognitionError();
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
    if (this.isStartingRecording || this.isRecording) {
      return;
    }
    this.isStartingRecording = true;
    
    try {
      // Request microphone permission first
      const hasPermission = await this.requestMicrophonePermission();
      if (!hasPermission) {
        this.isStartingRecording = false;
        return;
      }
      
      // Check capabilities
      if (!this.browserCapabilities.hasSpeechRecognition || !this.browserCapabilities.hasMediaRecorder) {
        await this.showSpeechRecognitionError();
        this.isStartingRecording = false;
        return;
      }

      // Reset state
      this.userSpeechText = '';
      this.sessionResults = null;
      this.showTargetText = true;
      
      if (this.currentRecordingUrl) {
        URL.revokeObjectURL(this.currentRecordingUrl);
        this.currentRecordingUrl = null;
      }
      this.currentRecordingBlob = null;
      this.finalTranscript = '';
      this.interimTranscript = '';
      
      // Start MediaRecorder for audio capture
      await this.startMediaRecorder();
      
      // Start speech recognition
      const recognition = this.initializeSpeechRecognition();
      if (recognition) {
        try {
          recognition.start();
          console.log('✓ Speech recognition started');
        } catch (e: any) {
          if (e.message && e.message.includes('already started')) {
            console.log('Recognition already running');
          } else {
            throw e;
          }
        }
      } else {
        throw new Error('Could not initialize speech recognition');
      }
      
      this.isRecording = true;
      this.recordingStartTime = Date.now();
      this.recordingDuration = 0;
      this.wordCount = 0;
      
      // Duration counter
      const durationInterval = setInterval(() => {
        if (this.isRecording) {
          this.recordingDuration = Math.floor((Date.now() - this.recordingStartTime) / 1000);
        } else {
          clearInterval(durationInterval);
        }
      }, 1000);
      
      // Transcript updater
      const transcriptInterval = setInterval(() => {
        if (this.isRecording) {
          const currentTranscript = (this.finalTranscript + this.interimTranscript).trim();
          
          if (currentTranscript) {
            const formattedText = this.capitalizeFirstLetter(currentTranscript);
            this.wordCount = formattedText.split(/\s+/).filter(w => w.length > 0).length;
            
            if (this.userSpeechText !== formattedText) {
              this.userSpeechText = formattedText;
              this.cdr.detectChanges();
            }
          } else if (!this.userSpeechText || this.userSpeechText === '') {
            this.userSpeechText = '🎤 Listening...';
            this.cdr.detectChanges();
          }
        } else {
          clearInterval(transcriptInterval);
        }
      }, 100);
      
      (this as any).transcriptInterval = transcriptInterval;
      this.isStartingRecording = false;
      
    } catch (error) {
      console.error('Recording error:', error);
      this.isRecording = false;
      this.isStartingRecording = false;
      
      await this.errorHandler.showError(
        error,
        ErrorType.RECORDING_FAILED
      );
    }
  }

  toggleTargetText() {
    this.showTargetText = !this.showTargetText;
  }
  
  private async startMediaRecorder(): Promise<void> {
    try {
      // Get audio stream with optimal settings
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1
        } 
      });
      
      this.audioChunks = [];
      
      const mimeType = this.browserCapabilities.preferredAudioFormat;
      console.log('Using MIME type:', mimeType);
      
      // Create MediaRecorder with the best supported format
      this.mediaRecorder = new MediaRecorder(this.mediaStream, { 
        mimeType: mimeType
      });
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };
      
      this.mediaRecorder.onstop = () => {
        console.log('MediaRecorder stopped, chunks:', this.audioChunks.length);
        
        if (this.audioChunks.length > 0) {
          const audioBlob = new Blob(this.audioChunks, { type: mimeType });
          this.currentRecordingBlob = audioBlob;
          
          if (this.currentRecordingUrl) {
            URL.revokeObjectURL(this.currentRecordingUrl);
          }
          this.currentRecordingUrl = URL.createObjectURL(audioBlob);
          
          console.log('✓ Audio blob created:', audioBlob.size, 'bytes');
        }
      };
      
      // Start recording with time slices
      this.mediaRecorder.start(100);
      console.log('✓ MediaRecorder started');
      
    } catch (error) {
      console.error('Failed to start MediaRecorder:', error);
      throw error;
    }
  }

  async stopStructuredRecording() {
    if (this.isStoppingRecording) return;
    this.isStoppingRecording = true;
    
    this.isRecording = false;
    
    if ((this as any).transcriptInterval) {
      clearInterval((this as any).transcriptInterval);
      (this as any).transcriptInterval = null;
    }
    
    try {
      // Stop MediaRecorder
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
        console.log('MediaRecorder stopped');
        
        // Wait for processing
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Stop speech recognition
      if (this.recognitionInstance) {
        try {
          this.recognitionInstance.stop();
          console.log('Speech recognition stopped');
        } catch (e) {
          console.log('Recognition already stopped');
        }
      }
      
      // Stop media stream tracks
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(track => track.stop());
        this.mediaStream = null;
      }
      
      // Wait for final processing
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Get final transcript
      const finalTranscript = (this.finalTranscript + this.interimTranscript).trim();
      
      console.log('Final transcript:', finalTranscript);
      console.log('Audio blob:', this.currentRecordingBlob?.size || 0, 'bytes');
      
      if (!finalTranscript || finalTranscript === '') {
        console.error('❌ Empty transcript detected!');
        this.userSpeechText = '';
        
        await this.errorHandler.showError(
          new Error('No speech detected'),
          ErrorType.EMPTY_TRANSCRIPT
        );
        
        this.isStoppingRecording = false;
        return;
      }
      
      this.userSpeechText = this.capitalizeFirstLetter(finalTranscript);
      
      // Create result object
      const result: SpeechRecognitionResult = {
        transcript: finalTranscript,
        confidence: 0.9,
        duration: Date.now() - this.recordingStartTime,
        audioBlob: this.currentRecordingBlob || undefined,
        audioUrl: this.currentRecordingUrl || undefined
      };
      
      await this.handleStructuredRecordingResult(result);
      this.cdr.detectChanges();
      
    } catch (error) {
      console.error('Error stopping recording:', error);
      
      // Try to salvage transcript
      const finalTranscript = (this.finalTranscript + this.interimTranscript).trim();
      
      if (finalTranscript) {
        this.userSpeechText = this.capitalizeFirstLetter(finalTranscript);
        
        await this.errorHandler.showWarning(
          'Speech captured but audio recording may have failed. You can still get feedback.'
        );
        this.cdr.detectChanges();
      } else {
        await this.errorHandler.showError(
          new Error('Recording failed'),
          ErrorType.RECORDING_FAILED
        );
      }
    } finally {
      this.isStoppingRecording = false;
    }
  }

  private async handleStructuredRecordingResult(result: SpeechRecognitionResult) {
    const finalTranscript = this.userSpeechText || result.transcript;
    
    this.sessionResults = {
      transcript: finalTranscript,
      confidence: result.confidence,
      duration: result.duration,
      practiceType: this.selectedPracticeType,
      difficulty: this.selectedDifficulty,
      timestamp: new Date().toISOString()
    };

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
  
  private async showMicrophonePermissionError(error?: any) {
    let message = '';
    
    if (this.isIOS) {
      message = 'Microphone permission is required:\n\n';
      message += '1. Go to iPhone Settings\n';
      message += '2. Find Safari (or your browser)\n';
      message += '3. Enable Microphone access\n';
      message += '4. Reload this page';
    } else if (this.isAndroid) {
      if (this.browserName === 'chrome') {
        message = 'Chrome needs microphone permission:\n\n';
        message += '1. Tap the lock icon 🔒 in the address bar\n';
        message += '2. Tap "Permissions"\n';
        message += '3. Enable "Microphone"\n';
        message += '4. Reload this page';
      } else {
        message = 'Please enable microphone permission in your browser settings and reload the page.';
      }
    } else {
      message = 'Please allow microphone access when prompted by your browser.';
    }
    
    const alert = await this.alertController.create({
      header: 'Microphone Permission Required',
      message: message,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Reload Page',
          handler: () => {
            window.location.reload();
          }
        }
      ]
    });
    
    await alert.present();
  }

  private async showSpeechRecognitionError() {
    let message = 'Speech recognition is not available in this browser.\n\n';
    message += 'Recommended browsers:\n';
    
    if (this.isIOS) {
      message += '• Safari (iOS 14.5+)\n';
      message += '• Chrome for iOS may have limited support';
    } else if (this.isAndroid) {
      message += '• Chrome (recommended)\n';
      message += '• Firefox\n';
      message += '• Edge';
    } else {
      message += '• Chrome\n';
      message += '• Edge\n';
      message += '• Safari (macOS)';
    }
    
    await this.errorHandler.showError(
      new Error('Speech Recognition not supported'),
      ErrorType.SPEECH_RECOGNITION_NOT_SUPPORTED
    );
  }
}
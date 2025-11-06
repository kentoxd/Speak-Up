import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
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
  
  // Android recording mode toggle
  androidRecordingMode: 'audio-only' | 'transcription-only' = 'transcription-only';
  
  onRecordingModeChange(event: any) {
    const value = event.detail.value;
    if (value === 'audio-only' || value === 'transcription-only') {
      this.androidRecordingMode = value;
    }
  }
  
  // Audio playback
  private audioElement: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  
  // MediaRecorder for better cross-platform support
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private recognitionRestartCount = 0;
  private readonly MAX_RESTART_ATTEMPTS = 3;
  private audioCaptureErrorCount = 0;
  private readonly MAX_AUDIO_CAPTURE_ERRORS = 2; // Stop trying after 2 audio-capture errors
  private speechRecognitionDisabled = false; // Flag to disable speech recognition if audio-capture fails
  // Fallback for speech recognition
  private recognitionFallback: any = null;
  private interimTranscript = '';
  private finalTranscript = '';
  // Interaction guards
  private isPlaybackStarting = false;
  private isStoppingPlayback = false;
  private isStartingRecording = false;
  private isStoppingRecording = false;

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
    // Detect platform (treat any non‑iOS mobile as Android for browser handling)
    this.isIOS = this.platform.is('ios');
    const ua = navigator.userAgent || '';
    const isUAAndroid = /Android/i.test(ua);
    this.isMobile = this.platform.is('mobile') || /Android|iPhone|iPad|iPod/i.test(ua);
    this.isAndroid = this.platform.is('android') || (!this.isIOS && this.isMobile) || isUAAndroid;
    console.log('Platform detection:', {
      isIOS: this.isIOS,
      isAndroid: this.isAndroid,
      isMobile: this.isMobile,
      platforms: this.platform.platforms()
    });
    
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
    
    // Enhanced speech recognition check
    await this.checkSpeechRecognitionSupport();
    
    // Initialize audio context for iOS
    if (this.isIOS) {
      await this.initializeAudioContext();
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
    if ((this as any).currentStream) {
      (this as any).currentStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    }
    
    // Clean up audio resources
    this.cleanupAudioResources();
  }
  
  private cleanupAudioResources() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
      this.audioElement = null;
    }
    
    if (this.currentRecordingUrl) {
      URL.revokeObjectURL(this.currentRecordingUrl);
      this.currentRecordingUrl = null;
    }
    
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  }
  
  private async initializeAudioContext() {
    try {
      // Try standard API first
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      
      if (!AudioContextClass) {
        console.warn('AudioContext not supported in this browser');
        return;
      }
      
      this.audioContext = new AudioContextClass();
      
      // iOS requires user interaction to unlock audio context
      if (this.audioContext && this.audioContext.state === 'suspended') {
        console.log('Audio context suspended, will resume on user interaction');
      }
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      // Don't throw - audio context is optional for basic functionality
    }
  }
  
  private async checkSpeechRecognitionSupport() {
    const isSupported = this.speechService.isSpeechRecognitionSupported();
    
    if (!isSupported) {
      // Check for alternative speech recognition with better error handling
      try {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        
        if (SpeechRecognition) {
          console.log('Alternative speech recognition available');
          this.recognitionFallback = new SpeechRecognition();
          this.setupFallbackRecognition();
        } else {
          console.warn('No speech recognition available on this device');
          
          // Show browser-specific instructions
          if (this.isAndroid) {
            await this.showAndroidRecordingInstructions();
          } else if (this.isIOS) {
            await this.showIOSRecordingInstructions();
          } else {
            // Desktop browsers
            await this.showDesktopRecordingInstructions();
          }
        }
      } catch (error) {
        console.error('Error setting up speech recognition fallback:', error);
        console.warn('Speech recognition not available');
      }
    }
  }
  
  private async showIOSRecordingInstructions() {
    const alert = await this.alertController.create({
      header: 'Speech Recognition Not Available',
      message: 'Speech recognition is not available in Safari on iOS. Please use Chrome or another supported browser, or use the app on a desktop computer.',
      buttons: ['OK']
    });
    
    await alert.present();
  }
  
  private async showDesktopRecordingInstructions() {
    const alert = await this.alertController.create({
      header: 'Speech Recognition Not Available',
      message: 'Speech recognition requires a supported browser:\n\n' +
               '• Chrome (recommended)\n' +
               '• Edge\n' +
               '• Safari (macOS)\n\n' +
               'Firefox does not support speech recognition natively.',
      buttons: ['OK']
    });
    
    await alert.present();
  }
  
  private setupFallbackRecognition() {
    if (!this.recognitionFallback) return;
    
    this.recognitionFallback.continuous = true;
    this.recognitionFallback.interimResults = true;
    this.recognitionFallback.lang = 'en-US';
    
    // ANDROID FIX: Critical settings for Android Chrome
    if (this.isAndroid) {
      this.recognitionFallback.maxAlternatives = 1;
      // Don't set continuous on Android - it causes issues
      this.recognitionFallback.continuous = false;
    }
    
    this.recognitionFallback.onstart = () => {
      console.log('✓ Speech recognition started');
      this.recognitionRestartCount = 0;
    };
    
    this.recognitionFallback.onaudiostart = () => {
      console.log('✓ Audio capture started');
    };
    
    this.recognitionFallback.onsoundstart = () => {
      console.log('✓ Sound detected');
    };
    
    this.recognitionFallback.onspeechstart = () => {
      console.log('✓ Speech detected');
    };
    
    this.recognitionFallback.onresult = (event: any) => {
      console.log('📝 Speech result received, results:', event.results.length);
      
      // CRITICAL FIX: Reset interim on each result event
      this.interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence;
        
        if (event.results[i].isFinal) {
          console.log('✓ Final result:', transcript, 'confidence:', confidence);
          this.finalTranscript += transcript + ' ';
        } else {
          console.log('⏳ Interim result:', transcript);
          this.interimTranscript += transcript;
        }
      }
      
      // ANDROID FIX: Immediately update UI
      const fullTranscript = (this.finalTranscript + this.interimTranscript).trim();
      console.log('📊 Current full transcript:', fullTranscript.length, 'chars');
      
      if (fullTranscript) {
        this.userSpeechText = this.capitalizeFirstLetter(fullTranscript);
        this.wordCount = fullTranscript.split(/\s+/).filter(w => w.length > 0).length;
        
        // Force change detection
        if (this.isAndroid) {
          setTimeout(() => {
            this.cdr.detectChanges();
          }, 0);
        } else {
          this.cdr.detectChanges();
        }
      }
      
      // NOTE: Do not restart here to avoid duplicate restart loops; handled in onend
    };
    
    this.recognitionFallback.onspeechend = () => {
      console.log('Speech ended');
    };
    
    this.recognitionFallback.onsoundend = () => {
      console.log('Sound ended');
    };
    
    this.recognitionFallback.onaudioend = () => {
      console.log('Audio capture ended');
    };
    
     this.recognitionFallback.onerror = (event: any) => {
       console.error('❌ Recognition error:', event.error);
       
       if (event.error === 'no-speech') {
         console.log('No speech detected, waiting...');
         return;
       }
       
       if (event.error === 'network') {
         console.warn('Network error in speech recognition');
         return;
       }
       
       // ANDROID FIX: Auto-restart on aborted error
       if (event.error === 'aborted' && this.isRecording) {
         console.log('Recognition aborted, restarting...');
         this.restartRecognition();
         return;
       }
       
       // ANDROID FIX: Handle audio-capture error gracefully
       // This happens when MediaRecorder has exclusive access to microphone
       if (event.error === 'audio-capture') {
         this.audioCaptureErrorCount++;
         console.warn(`⚠️ Audio capture error (${this.audioCaptureErrorCount}/${this.MAX_AUDIO_CAPTURE_ERRORS}) - MediaRecorder has exclusive microphone access`);
         console.warn('⚠️ Audio recording will continue, but transcription may not work');
         console.warn('⚠️ This is normal on Android when both are running');
         
         // After max errors, stop trying to restart recognition
         if (this.audioCaptureErrorCount >= this.MAX_AUDIO_CAPTURE_ERRORS) {
           console.warn('⚠️ Disabling speech recognition after multiple audio-capture errors');
           console.warn('⚠️ Audio recording will continue without transcription');
           this.speechRecognitionDisabled = true;
           // Stop the recognition to prevent further errors
           try {
             this.recognitionFallback.stop();
           } catch (e) {
             // Ignore
           }
         }
         // Don't show error to user - recording still works
         // Don't stop recording - just continue without transcription
         return;
       }
       
       // For other critical errors, show warning but don't stop recording
       console.warn('Speech recognition error:', event.error);
       console.warn('Audio recording will continue');
     };
    
     this.recognitionFallback.onend = () => {
       console.log('Speech recognition ended');
       
       // ANDROID FIX: Auto-restart if still recording AND not disabled due to audio-capture errors
       if (this.isRecording && this.isAndroid && !this.speechRecognitionDisabled) {
         console.log('🔄 Recognition ended, auto-restarting...');
         this.restartRecognition();
       } else if (this.speechRecognitionDisabled) {
         console.log('⚠️ Speech recognition disabled due to audio-capture errors');
         console.log('⚠️ Audio recording continues without transcription');
       }
     };
  }
  private restartRecognition() {
    if (!this.isRecording || !this.recognitionFallback || this.speechRecognitionDisabled) {
      if (this.speechRecognitionDisabled) {
        console.log('⚠️ Speech recognition disabled, skipping restart');
      }
      return;
    }
    
    if (this.recognitionRestartCount >= this.MAX_RESTART_ATTEMPTS) {
      console.error('❌ Max restart attempts reached');
      console.warn('⚠️ Audio recording will continue without transcription');
      this.speechRecognitionDisabled = true;
      return; // Don't stop recording, just disable transcription
    }
    
    this.recognitionRestartCount++;
    console.log(`Restart attempt ${this.recognitionRestartCount}/${this.MAX_RESTART_ATTEMPTS}`);
    
    setTimeout(() => {
      if (this.isRecording && this.recognitionFallback && !this.speechRecognitionDisabled) {
        try {
          this.recognitionFallback.start();
          console.log('✓ Recognition restarted successfully');
        } catch (e: any) {
          console.error('Failed to restart recognition:', e);
          if (e.name !== 'InvalidStateError') {
            // Only retry if not disabled
            if (!this.speechRecognitionDisabled) {
              this.restartRecognition();
            }
          }
        }
      }
    }, 100);
  }
  
  private async showAndroidRecordingInstructions() {
    const alert = await this.alertController.create({
      header: 'Chrome Permissions Required',
      message: 'To use speech recording on Android Chrome:\n\n' +
              '1. Tap the 🔒 lock icon in the address bar\n' +
              '2. Enable "Microphone" permission\n' +
              '3. Reload the page\n\n' +
              'Alternative: Use Chrome on desktop or Firefox on Android.',
      buttons: ['OK']
    });
    
    await alert.present();
  }

  toggleInstructions() {
    this.showInstructions = !this.showInstructions;
  }

  toggleTips() {
    this.isTipsVisible = !this.isTipsVisible;
  }

  toggleTargetText() {
    this.showTargetText = !this.showTargetText;
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
            // Show session complete when explicitly ending the session
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
    this.cleanupAudioResources();
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
    
    // ANDROID: Show message that audio playback is not available
    if (this.isAndroid) {
      await this.errorHandler.showWarning(
        'This feature doesn\'t work on Android. Use iOS for full features including audio recording and playback.'
      );
      return;
    }
    
    this.isPlaybackStarting = true;
    // Verify we have recording data
    if (!this.currentRecordingBlob && !this.currentRecordingUrl) {
      const audioBlob = this.speechService.getAudioBlob();
      const audioUrl = this.speechService.getAudioUrl();
      
      if (!audioBlob && !audioUrl) {
        await this.errorHandler.showWarning(
          'No audio recording available to play. Please record your speech first.'
        );
        this.isPlaybackStarting = false;
        return;
      }
      
      if (audioBlob) {
        this.currentRecordingBlob = audioBlob;
      }
      if (audioUrl) {
        if (this.currentRecordingUrl) {
          URL.revokeObjectURL(this.currentRecordingUrl);
        }
        this.currentRecordingUrl = audioUrl;
      }
    }
    
    if (!this.currentRecordingBlob && !this.currentRecordingUrl) {
      await this.errorHandler.showWarning(
        'Audio recording is not available. Please record again.'
      );
      return;
    }
    


    try {
      this.isPlayingRecording = true;
      this.cdr.detectChanges();
      
      // Use different playback methods based on platform
      if (this.isIOS) {
        await this.playRecordingIOS();
      } else {
        await this.playRecordingDesktop();
      }
      
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
  
  private async playRecordingIOS(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // iOS requires direct user interaction for audio playback
        // Create fresh audio element each time
        if (this.audioElement) {
          this.audioElement.pause();
          this.audioElement.src = '';
        }
        
        this.audioElement = new Audio();
        
        // Use blob directly for iOS
        if (this.currentRecordingBlob) {
          const url = URL.createObjectURL(this.currentRecordingBlob);
          this.audioElement.src = url;
        } else if (this.currentRecordingUrl) {
          this.audioElement.src = this.currentRecordingUrl;
        } else {
          reject(new Error('No audio source available'));
          return;
        }
        
        // iOS-specific audio settings
        this.audioElement.preload = 'auto';
        this.audioElement.controls = false;
        
        // Set up event listeners
        this.audioElement.onended = () => {
          console.log('iOS audio playback ended');
          resolve();
        };
        // Resolve also on manual pause/stop so toggle can replay immediately
        this.audioElement.onpause = () => {
          resolve();
        };
        
        this.audioElement.onerror = (e) => {
          console.error('iOS audio error:', e);
          reject(new Error('iOS audio playback failed'));
        };
        
        this.audioElement.oncanplaythrough = () => {
          console.log('iOS audio can play through');
        };
        
        // Load and play
        this.audioElement.load();
        
        const playPromise = this.audioElement.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('iOS audio playing successfully');
            })
            .catch(error => {
              console.error('iOS play() failed:', error);
              reject(error);
            });
        }
      } catch (error) {
        console.error('iOS playback setup failed:', error);
        reject(error);
      }
    });
  }
  
  private async playRecordingAndroid(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Android Chrome has specific audio handling
        if (this.audioElement) {
          this.audioElement.pause();
          this.audioElement.src = '';
        }
        
        this.audioElement = new Audio();
        
        if (this.currentRecordingBlob) {
          // For Android, create a fresh URL each time
          const url = URL.createObjectURL(this.currentRecordingBlob);
          this.audioElement.src = url;
          
          // Clean up old URL after setting new one
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
        
        this.audioElement.onended = () => {
          console.log('Android audio playback ended');
          resolve();
        };
        this.audioElement.onpause = () => {
          resolve();
        };
        
        this.audioElement.onerror = (e) => {
          console.error('Android audio error:', e);
          reject(new Error('Android audio playback failed'));
        };
        
        // Android may need a slight delay
        setTimeout(() => {
          const playPromise = this.audioElement!.play();
          
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log('Android audio playing');
              })
              .catch(error => {
                console.error('Android play() failed:', error);
                reject(error);
              });
          }
        }, 100);
      } catch (error) {
        console.error('Android playback failed:', error);
        reject(error);
      }
    });
  }
  
  private async playRecordingDesktop(): Promise<void> {
    // Always use a direct Audio element so we control the playing state
    return new Promise((resolve, reject) => {
      if (this.audioElement) {
        this.audioElement.pause();
        this.audioElement.src = '';
      }
      
      this.audioElement = new Audio();
      
      if (this.currentRecordingUrl) {
        this.audioElement.src = this.currentRecordingUrl;
      } else if (this.currentRecordingBlob) {
        const url = URL.createObjectURL(this.currentRecordingBlob);
        this.audioElement.src = url;
        this.currentRecordingUrl = url;
      } else {
        reject(new Error('No audio source'));
        return;
      }
      
      this.audioElement.onended = () => resolve();
      this.audioElement.onpause = () => resolve();
      this.audioElement.onerror = (e) => reject(e);
      
      this.audioElement.play().catch(reject);
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
      this.speechService.stopPlaying();
      this.isPlayingRecording = false;
    } finally {
      this.isStoppingPlayback = false;
    }
  }

  async togglePlayback() {
    // Single toggle with spam protection; never block stopping
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
      overallAccuracy
    );
  
    const repeatedWords = this.speechService.detectRepeatedWords(userTranscript);
    const clarityFeedbackArray = this.speechService.getClarityFeedback(
      clarityScore.clarityScore,
      repeatedWords.count
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
        analysis: analysis, // Add this
        fillerAnalysis: fillerAnalysis,
        clarityAnalysis: clarityAnalysis,
        practiceType: this.selectedPracticeType, // Add this
        difficulty: this.selectedDifficulty // Add this
      },
      cssClass: 'feedback-modal'
    });
  
    await modal.present();
    this.showFeedback = true;
    
    const { data } = await modal.onDidDismiss();
    
    // Handle the "Add to History" action
    if (data?.action === 'addToHistory' && data?.sessionData) {
      await this.saveSessionToHistory(data.sessionData);
      await this.errorHandler.showSuccess('Session added to practice history!');
    }
    
    this.previousSessionAccuracy = overallAccuracy;
  }
  
  private async saveSessionToHistory(sessionData: any) {
    try {
      // Create a comprehensive session object
      const historySession = {
        transcript: sessionData.transcript,
        targetText: sessionData.targetText,
        confidence: this.sessionResults?.confidence || 0.9,
        duration: this.sessionResults?.duration || 0,
        practiceType: sessionData.practiceType,
        difficulty: sessionData.difficulty,
        timestamp: sessionData.timestamp,
        analysis: {
          overallAccuracy: sessionData.overallAccuracy,
          wordAccuracy: sessionData.wordAccuracy,
          punctuationAccuracy: sessionData.punctuationAccuracy,
          wordsPerMinute: sessionData.analysis?.wordsPerMinute || 0,
          totalWords: sessionData.analysis?.totalWords || 0,
          fillerWords: sessionData.fillerAnalysis?.fillerBreakdown?.map((item: string) => {
            // Parse "word: X times" format
            const match = item.match(/(.+): (\d+) time/);
            if (match) {
              return { word: match[1], count: parseInt(match[2]) };
            }
            return null;
          }).filter((item: any) => item !== null) || [],
          fillerCount: sessionData.fillerAnalysis?.fillerCount || 0,
          clarityScore: sessionData.clarityAnalysis?.clarityScore || 0,
          clarityFeedback: sessionData.clarityAnalysis?.feedbackArray || []
        },
        // Store audio if available
        audioBlob: this.currentRecordingBlob,
        audioUrl: this.currentRecordingUrl
      };
  
      // Save to storage
      await this.storageService.addPracticeSession(historySession);
      
      // Reload history to show the new session
      await this.loadPracticeHistory();
      
      // Update user progression
      const durationMinutes = historySession.duration / 60000;
      const practiceType = this.selectedPracticeType === 'public-speaking' ? 'publicSpeaking' : 
                          this.selectedPracticeType === 'debate-speech' ? 'debate' : 'monologue';
      
      await this.userProgressionService.updatePracticeSession(
        sessionData.overallAccuracy,
        durationMinutes,
        practiceType as 'monologue' | 'publicSpeaking' | 'debate',
        this.selectedDifficulty as 'beginner' | 'intermediate' | 'advanced'
      );
      
      console.log('✓ Session saved to practice history');
    } catch (error) {
      console.error('Error saving session to history:', error);
      await this.errorHandler.showError(
        error,
        ErrorType.RECORDING_FAILED
      );
    }
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
    // ANDROID: Use structured transcription-only flow to avoid MediaRecorder conflicts
    if (this.isAndroid) {
      await this.startStructuredRecording();
      return;
    }
    if (!this.speechService.isSpeechRecognitionSupported() && !this.recognitionFallback) {
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
    // ANDROID: Use structured stop to match the safe flow
    if (this.isAndroid) {
      this.stopStructuredRecording();
      return;
    }
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
    
     // Reset restart counters and flags
     this.recognitionRestartCount = 0;
     this.audioCaptureErrorCount = 0;
     this.speechRecognitionDisabled = false;
    
    // DIAGNOSTIC: Log environment info
    console.log('🎤 Starting recording on Android Chrome');
    console.log('Environment:', {
      protocol: window.location.protocol,
      hostname: window.location.hostname,
      userAgent: navigator.userAgent.substring(0, 80),
      platform: navigator.platform,
      mediaDevices: !!navigator.mediaDevices,
      getUserMedia: !!navigator.mediaDevices?.getUserMedia,
      SpeechRecognition: !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition,
      MediaRecorder: typeof MediaRecorder !== 'undefined'
    });
    
    // ANDROID FIX: Check HTTPS requirement first
    if (this.isAndroid && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      await this.errorHandler.showError(
        new Error('Recording requires HTTPS on Android. Please use https:// or test on localhost.'),
        ErrorType.RECORDING_FAILED
      );
      this.isStartingRecording = false;
      return;
    }
    
    // Check permissions first on mobile (with better Android handling)
    if (this.isMobile) {
      try {
        let stream: MediaStream;
        
        // ANDROID FIX: Use simpler constraints for Android
        const audioConstraints = this.isAndroid ? { audio: true } : {
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        };
        
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia(audioConstraints);
        } else {
          const getUserMedia = (navigator as any).getUserMedia || 
                              (navigator as any).webkitGetUserMedia || 
                              (navigator as any).mozGetUserMedia || 
                              (navigator as any).msGetUserMedia;
          
          if (!getUserMedia) {
            throw new Error('getUserMedia not supported');
          }
          
          stream = await new Promise<MediaStream>((resolve, reject) => {
            getUserMedia.call(navigator, audioConstraints, resolve, reject);
          });
        }
        
        // ANDROID FIX: Check if stream has audio tracks
        if (!stream.getAudioTracks().length) {
          throw new Error('No audio tracks available');
        }
        
        // Test that track is actually working
        const track = stream.getAudioTracks()[0];
        if (track.readyState !== 'live') {
          throw new Error('Audio track not live');
        }
        
        stream.getTracks().forEach(track => track.stop());
        console.log('✓ Microphone permission granted and tested');
      } catch (error: any) {
        console.error('Microphone permission check failed:', error);
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          await this.showMicrophonePermissionError();
        } else if (error.name === 'NotFoundError') {
          await this.errorHandler.showError(
            new Error('No microphone found. Please connect a microphone and try again.'),
            ErrorType.RECORDING_FAILED
          );
        } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
          await this.errorHandler.showError(
            new Error('Microphone is already in use by another application. Please close other apps using the microphone.'),
            ErrorType.RECORDING_FAILED
          );
        } else {
          await this.showMicrophonePermissionError();
        }
        
        this.isStartingRecording = false;
        return;
      }
    }
    
    // ANDROID FIX: Ensure recognition fallback is set up if needed
    if (!this.speechService.isSpeechRecognitionSupported()) {
      if (!this.recognitionFallback) {
        // Try to set up fallback again
        try {
          const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
          if (SpeechRecognition) {
            this.recognitionFallback = new SpeechRecognition();
            this.setupFallbackRecognition();
            console.log('✓ Recognition fallback set up');
          } else {
            await this.showSpeechRecognitionError();
            this.isStartingRecording = false;
            return;
          }
        } catch (error) {
          console.error('Failed to set up recognition fallback:', error);
          await this.showSpeechRecognitionError();
          this.isStartingRecording = false;
          return;
        }
      }
    }
  
    try {
      this.userSpeechText = '🎤 Listening...';
      this.sessionResults = null;
      this.showTargetText = true;
      
      if (this.currentRecordingUrl) {
        URL.revokeObjectURL(this.currentRecordingUrl);
        this.currentRecordingUrl = null;
      }
      this.currentRecordingBlob = null;
      this.speechService.clearTranscript();
      this.finalTranscript = '';
      this.interimTranscript = '';
      
      if (this.currentStructuredPractice?.targetText) {
        this.speechService.setTargetText(this.currentStructuredPractice.targetText);
      }
      
      this.isRecording = true;
      this.recordingStartTime = Date.now();
      this.recordingDuration = 0;
      this.wordCount = 0;
      
      // ANDROID FIX: Use mode-specific recording approach
      // iOS: Always use both (works fine)
      // Android: Always use transcription-only mode
      if (this.isAndroid) {
        // Android only supports transcription-only mode
        await this.startTranscriptionOnlyMode();
      } else {
        // iOS: Use both (original behavior)
        await this.startBothModes();
      }
      
      // Start duration timer
      const durationInterval = setInterval(() => {
        if (this.isRecording) {
          this.recordingDuration = Math.floor((Date.now() - this.recordingStartTime) / 1000);
        } else {
          clearInterval(durationInterval);
        }
      }, 1000);
      
      // Start transcript polling
      const transcriptInterval = setInterval(() => {
        if (this.isRecording) {
          let currentTranscript = '';
          
          if (this.recognitionFallback) {
            if (!this.speechRecognitionDisabled) {
              currentTranscript = (this.finalTranscript + ' ' + this.interimTranscript).trim();
            }
          } else {
            currentTranscript = this.speechService.getCurrentTranscript();
          }
          
          if (currentTranscript && currentTranscript.trim() !== '') {
            const formattedText = this.capitalizeFirstLetter(currentTranscript);
            this.wordCount = formattedText.split(/\s+/).filter(w => w.length > 0).length;
            
            if (this.userSpeechText !== formattedText) {
              this.userSpeechText = formattedText;
              this.cdr.detectChanges();
            }
          } else if (this.userSpeechText !== '🎤 Listening...' && this.androidRecordingMode !== 'audio-only') {
            if (!this.finalTranscript || this.finalTranscript.trim() === '') {
              this.userSpeechText = '🎤 Listening...';
              this.cdr.detectChanges();
            }
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
        ErrorType.RECORDING_FAILED,
        async () => {
          await this.startStructuredRecording();
        }
      );
    }
  }
  
  // ANDROID: Transcription-only mode (no MediaRecorder)
  private async startTranscriptionOnlyMode(): Promise<void> {
    console.log('📝 Starting transcription-only mode (Android)');
    
    // Start speech recognition
    if (this.recognitionFallback) {
      this.finalTranscript = '';
      this.interimTranscript = '';
      
      try {
        this.recognitionFallback.start();
        console.log('✓ Started transcription-only recognition');
      } catch (error: any) {
        console.error('Failed to start recognition:', error);
        throw error;
      }
    } else {
      try {
        await this.speechService.startRecognitionOnly(
          true,
          () => this.isRecording && !this.speechRecognitionDisabled
        );
        console.log('✓ Started transcription-only via speech service (auto-restart)');
      } catch (error: any) {
        console.error('Failed to start speech service:', error);
        throw error;
      }
    }
  }
  
  // ANDROID: Audio-only mode (no SpeechRecognition)
  private async startAudioOnlyMode(): Promise<void> {
    console.log('🎙️ Starting audio-only mode (Android)');
    
    // Disable speech recognition
    this.speechRecognitionDisabled = true;
    
    // Start MediaRecorder
    await this.startMediaRecorder();
    console.log('✓ Audio-only recording started');
  }
  
  // iOS: Both modes (original behavior)
  private async startBothModes(): Promise<void> {
    console.log('🎤 Starting both modes (iOS)');
    
    // Start speech recognition first
    if (this.recognitionFallback) {
      this.finalTranscript = '';
      this.interimTranscript = '';
      
      try {
        this.recognitionFallback.start();
        console.log('✓ Started fallback speech recognition');
      } catch (recognitionError: any) {
        if (recognitionError.name === 'InvalidStateError') {
          console.warn('Recognition already running, continuing...');
        } else {
          console.warn('Speech recognition failed, continuing with audio only');
        }
      }
    } else {
      try {
        await this.speechService.startRecognitionOnly();
        console.log('✓ Started speech recognition');
      } catch (speechError: any) {
        console.warn('Speech recognition failed, continuing with audio only');
      }
    }
    
    // Wait a bit for recognition to initialize
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Start MediaRecorder
    await this.startMediaRecorder();
  }

private async startMediaRecorder(): Promise<void> {
  let stream: MediaStream | undefined;
  try {
    
    // ANDROID FIX: Use simpler constraints for Android
    const audioConstraints = this.isAndroid ? { audio: true } : {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    };
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const getUserMedia = (navigator as any).getUserMedia || 
                          (navigator as any).webkitGetUserMedia || 
                          (navigator as any).mozGetUserMedia || 
                          (navigator as any).msGetUserMedia;
      
      if (!getUserMedia) {
        throw new Error('getUserMedia not supported in this browser');
      }
      
      stream = await new Promise<MediaStream>((resolve, reject) => {
        getUserMedia.call(navigator, audioConstraints, resolve, reject);
      });
    } else {
      stream = await navigator.mediaDevices.getUserMedia(audioConstraints);
    }
    
    // ANDROID FIX: Verify stream has audio tracks
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) {
      stream.getTracks().forEach(track => track.stop());
      throw new Error('No audio tracks in stream');
    }
    
    console.log('✓ Stream obtained:', {
      audioTracks: audioTracks.length,
      trackId: audioTracks[0].id,
      trackLabel: audioTracks[0].label,
      trackReadyState: audioTracks[0].readyState,
      trackEnabled: audioTracks[0].enabled
    });
    
    if (typeof MediaRecorder === 'undefined') {
      console.warn('MediaRecorder not supported, audio recording disabled');
      stream.getTracks().forEach(track => track.stop());
      throw new Error('MediaRecorder not supported in this browser');
    }
    
    this.audioChunks = [];
    
    // ANDROID FIX: Enhanced MIME type priority with better logging
    const mimeTypes = this.isAndroid ? [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/aac',
      'audio/ogg;codecs=opus',
      'audio/ogg'
    ] : [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/ogg',
      'audio/mp4',
      'audio/wav',
      'audio/aac'
    ];
    
    // Test each MIME type
    const supportedTypes: string[] = [];
    for (const mimeType of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        supportedTypes.push(mimeType);
      }
    }
    
    console.log('Supported MIME types:', supportedTypes);
    
    if (supportedTypes.length === 0) {
      stream.getTracks().forEach(track => track.stop());
      throw new Error('No supported MIME types found for MediaRecorder');
    }
    
    const selectedMimeType = supportedTypes[0];
    console.log('Using MIME type:', selectedMimeType, 'on', this.isAndroid ? 'Android' : 'iOS/Desktop');
    
    const finalMimeType = selectedMimeType;
    
    // ANDROID FIX: Simplified options - don't force bitrate if not needed
    const recorderOptions: any = { 
      mimeType: finalMimeType 
    };
    
    // ANDROID FIX: Only set bitrate if explicitly supported
    if (this.isAndroid && MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
      // Opus codec supports bitrate setting
      try {
        recorderOptions.audioBitsPerSecond = 128000;
      } catch (e) {
        console.warn('Could not set audioBitsPerSecond:', e);
      }
    }
    
    try {
      this.mediaRecorder = new MediaRecorder(stream, recorderOptions);
      console.log('✓ MediaRecorder created:', {
        state: this.mediaRecorder.state,
        mimeType: this.mediaRecorder.mimeType,
        audioBitsPerSecond: this.mediaRecorder.audioBitsPerSecond
      });
    } catch (error: any) {
      console.error('MediaRecorder creation failed:', error);
      stream.getTracks().forEach(track => track.stop());
      throw new Error(`Failed to create MediaRecorder: ${error.message}`);
    }
    
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.audioChunks.push(event.data);
        console.log('Audio chunk received:', event.data.size, 'bytes');
      }
    };
    
    // CRITICAL: Add error handler for Android
    this.mediaRecorder.onerror = (event: any) => {
      console.error('MediaRecorder error:', event);
      // Don't stop stream here, handle in stopStructuredRecording
    };
    
    // Store stream reference for cleanup
    (this as any).currentStream = stream;
    
    this.mediaRecorder.onstop = () => {
      console.log('MediaRecorder stopped, total chunks:', this.audioChunks.length);
      
      if (this.audioChunks.length > 0) {
        const audioBlob = new Blob(this.audioChunks, { type: finalMimeType });
        this.currentRecordingBlob = audioBlob;
        
        if (this.currentRecordingUrl) {
          URL.revokeObjectURL(this.currentRecordingUrl);
        }
        this.currentRecordingUrl = URL.createObjectURL(audioBlob);
        
        console.log('✓ Audio blob created:', audioBlob.size, 'bytes');
      } else {
        console.warn('⚠ No audio chunks collected');
      }
      
      // Clean up stream
      if ((this as any).currentStream) {
        (this as any).currentStream.getTracks().forEach((track: MediaStreamTrack) => {
          track.stop();
          console.log('Track stopped:', track.kind);
        });
        (this as any).currentStream = null;
      }
    };
    
    // ANDROID FIX: Start with appropriate time slice and add error handling
    const timeSlice = this.isAndroid ? 250 : 100;
    
    try {
      this.mediaRecorder.start(timeSlice);
      console.log('✓ MediaRecorder started with', timeSlice, 'ms time slice');
      
      // ANDROID FIX: Verify recorder actually started
      if (this.mediaRecorder.state !== 'recording') {
        throw new Error(`MediaRecorder failed to start. State: ${this.mediaRecorder.state}`);
      }
      
      // ANDROID FIX: Add state change listener for debugging
      (this.mediaRecorder as any).onstatechange = () => {
        console.log('MediaRecorder state changed:', this.mediaRecorder?.state);
      };
      
    } catch (startError: any) {
      console.error('MediaRecorder.start() failed:', startError);
      if (stream) {
        stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      }
      throw new Error(`Failed to start MediaRecorder: ${startError.message}`);
    }
    
  } catch (error: any) {
    console.error('Failed to start MediaRecorder:', error);
    console.error('Error stack:', error.stack);
    
    // Clean up stream if it exists
    if (stream) {
      stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    }
    
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      throw new Error('Microphone permission denied. Please allow microphone access and try again.');
    } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      throw new Error('No microphone found. Please connect a microphone and try again.');
    } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
      throw new Error('Microphone is already in use by another application.');
    } else if (error.message) {
      throw error;
    } else {
      throw new Error(`Recording failed: ${error.name || 'Unknown error'}`);
    }
  }
}

async stopStructuredRecording() {
  console.log('🛑 Stopping recording...');
  
  if ((this as any).transcriptInterval) {
    clearInterval((this as any).transcriptInterval);
    (this as any).transcriptInterval = null;
  }
  
  try {
    // STEP 1: Stop speech recognition and wait for final results
    let finalTranscript = '';
    
    if (this.recognitionFallback) {
      // Create a promise that resolves when we get the final transcript
      const transcriptPromise = new Promise<string>((resolve) => {
        // Set up a one-time handler for the final result
        const originalOnResult = this.recognitionFallback.onresult;
        let lastTranscript = '';
        
        this.recognitionFallback.onresult = (event: any) => {
          console.log('📝 Speech result received, results:', event.results.length);
          
          // CRITICAL FIX: Reset interim on each result event
          this.interimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            const confidence = event.results[i][0].confidence;
            
            if (event.results[i].isFinal) {
              console.log('✓ Final result:', transcript, 'confidence:', confidence);
              this.finalTranscript += transcript + ' ';
            } else {
              console.log('⏳ Interim result:', transcript);
              this.interimTranscript += transcript;
            }
          }
          
          // ANDROID FIX: Immediately update UI
          const fullTranscript = (this.finalTranscript + this.interimTranscript).trim();
          console.log('📊 Current full transcript:', fullTranscript.length, 'chars');
          
          if (fullTranscript) {
            this.userSpeechText = this.capitalizeFirstLetter(fullTranscript);
            this.wordCount = fullTranscript.split(/\s+/).filter(w => w.length > 0).length;
            
            // Force change detection on Android
            if (this.isAndroid) {
              setTimeout(() => {
                this.cdr.detectChanges();
              }, 0);
            } else {
              this.cdr.detectChanges();
            }
          }
        };
        
        // Set up onend handler to resolve with final transcript
        const originalOnEnd = this.recognitionFallback.onend;
        this.recognitionFallback.onend = () => {
          if (originalOnEnd) {
            originalOnEnd.call(this.recognitionFallback);
          }
          
          const finalResult = lastTranscript || (this.finalTranscript + ' ' + this.interimTranscript).trim();
          console.log('✓ Recognition ended, final transcript:', finalResult.substring(0, 100));
          resolve(finalResult);
        };
        
        // Stop recognition
        try {
          this.recognitionFallback.stop();
          console.log('Recognition stop() called');
        } catch (e) {
          console.log('Recognition already stopped');
          resolve((this.finalTranscript + ' ' + this.interimTranscript).trim());
        }
        
        // Timeout fallback
        setTimeout(() => {
          const fallbackResult = lastTranscript || (this.finalTranscript + ' ' + this.interimTranscript).trim();
          console.warn('⏱️ Recognition timeout, using:', fallbackResult.substring(0, 100));
          resolve(fallbackResult);
        }, 1000);
      });
      
      finalTranscript = await transcriptPromise;
      console.log('Final transcript from fallback:', finalTranscript.substring(0, 100));
    } else {
      await this.speechService.stopRecording();
      const result = this.speechService.getRecordingResult();
      finalTranscript = this.speechService.getCurrentTranscript() || result.transcript;
      console.log('Speech service stopped');
    }
    
    // STEP 2: Now safe to set isRecording false
    this.isRecording = false;
    
    // STEP 3: Stop MediaRecorder (only if it was started)
    const audioStopPromise = new Promise<void>((resolve) => {
      // ANDROID FIX: Skip MediaRecorder stop for transcription-only mode
      if (this.isAndroid && this.androidRecordingMode === 'transcription-only') {
        console.log('✓ Transcription-only mode: No MediaRecorder to stop');
        resolve();
        return;
      }
      
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        const recorder = this.mediaRecorder;
        
        const onStopHandler = () => {
          console.log('MediaRecorder onstop fired');
          resolve();
        };
        
        const originalOnStop = recorder.onstop;
        recorder.onstop = (event) => {
          if (originalOnStop) {
            originalOnStop.call(recorder, event);
          }
          onStopHandler();
        };
        
        if (this.isAndroid) {
          recorder.requestData();
        }
        
        recorder.stop();
        console.log('MediaRecorder.stop() called');
        
        setTimeout(() => {
          console.warn('MediaRecorder stop timeout, forcing resolve');
          resolve();
        }, this.isAndroid ? 2000 : 1000);
      } else {
        resolve();
      }
    });
    
    await audioStopPromise;
    console.log('✓ MediaRecorder stopped and processed');
    
    if (this.isAndroid) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    console.log('Final transcript length:', finalTranscript.length);
    console.log('Audio blob size:', this.currentRecordingBlob?.size || 0);
    
    // ANDROID FIX: Handle empty transcript based on recording mode
    if (!finalTranscript || finalTranscript.trim() === '' || finalTranscript === '🎤 Listening...') {
      if (this.isAndroid && this.androidRecordingMode === 'audio-only') {
        // Audio-only mode: Empty transcript is expected
        console.log('✓ Audio-only mode: No transcript expected');
        finalTranscript = '';
      } else if (this.isAndroid && this.androidRecordingMode === 'transcription-only') {
        // Transcription-only mode: Transcript is required
        console.error('❌ Transcription-only mode: No transcript captured!');
        this.userSpeechText = '';
        
        await this.errorHandler.showError(
          new Error('No speech detected. Please speak more clearly and try again.'),
          ErrorType.EMPTY_TRANSCRIPT,
          async () => {
            await this.startStructuredRecording();
          }
        );
        return;
      } else {
        // iOS or fallback: Check if we have audio
        if (this.currentRecordingBlob && this.currentRecordingBlob.size > 0) {
          console.log('✓ Audio recording available despite empty transcript');
          finalTranscript = '';
        } else {
          console.error('❌ No audio and no transcript!');
          this.userSpeechText = '';
          
          await this.errorHandler.showError(
            new Error('No speech detected. Please speak more clearly and try again.'),
            ErrorType.EMPTY_TRANSCRIPT,
            async () => {
              await this.startStructuredRecording();
            }
          );
          return;
        }
      }
    }
    
    if (this.currentRecordingBlob) {
      console.log('✓ Audio available:', this.currentRecordingBlob.size, 'bytes');
    } else {
      console.warn('⚠ No audio blob - recording may have failed');
    }
    
    this.userSpeechText = this.capitalizeFirstLetter(finalTranscript);
    
    const result: SpeechRecognitionResult = {
      transcript: finalTranscript,
      confidence: 0.9,
      duration: Date.now() - this.recordingStartTime,
      audioBlob: this.currentRecordingBlob || undefined,
      audioUrl: this.currentRecordingUrl || undefined
    };
    
    this.handleStructuredRecordingResult(result);
    this.cdr.detectChanges();
    
  } catch (error) {
    console.error('Error stopping recording:', error);
    
    let finalTranscript = '';
    
    if (this.recognitionFallback) {
      finalTranscript = (this.finalTranscript + this.interimTranscript).trim();
    } else {
      finalTranscript = this.speechService.getCurrentTranscript();
    }
    
    if (finalTranscript && finalTranscript.trim() !== '') {
      this.userSpeechText = this.capitalizeFirstLetter(finalTranscript);
      
      await this.errorHandler.showWarning(
        'Speech captured but audio recording may be incomplete.'
      );
      this.cdr.detectChanges();
    } else {
      await this.errorHandler.showError(
        new Error('Recording failed. Please try again.'),
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
  
  // Create session results but DON'T save yet
  this.sessionResults = {
    transcript: finalTranscript,
    confidence: result.confidence,
    duration: result.duration,
    practiceType: this.selectedPracticeType,
    difficulty: this.selectedDifficulty,
    timestamp: new Date().toISOString()
  };

  // Keep user progression update (optional - you could move this to saveSessionToHistory instead)
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
    
    // Normalize word by removing punctuation and hyphens for comparison
    const normalizeWordForComparison = (word: string): string => {
      return word.toLowerCase().replace(/[.,!?;:\-]/g, '').trim();
    };
    
    // Split text into words
    const splitIntoWords = (text: string): string[] => {
      if (!text) return [];
      return text.trim().split(/\s+/).filter(w => w.length > 0);
    };
    
    const targetWords = splitIntoWords(targetText);
    const userWords = splitIntoWords(userText);
    
    let correct = 0;
    let targetIndex = 0;
    let userIndex = 0;
    
    // Enhanced matching algorithm that handles compound and hyphenated words
    while (targetIndex < targetWords.length && userIndex < userWords.length) {
      const targetWord = targetWords[targetIndex];
      const targetNormalized = normalizeWordForComparison(targetWord);
      const userNormalized = normalizeWordForComparison(userWords[userIndex]);
      
      // Check for exact match
      if (targetNormalized === userNormalized) {
        correct++;
        targetIndex++;
        userIndex++;
      } else {
        // Try to match combined user words (e.g., "nano" + "silver" = "nanosilver")
        let combinedMatchCount = 0;
        const maxCombine = 3;
        
        // Try combining 1, 2, 3 user words
        for (let combineCount = 1; combineCount <= maxCombine && userIndex + combineCount <= userWords.length; combineCount++) {
          const combined = userWords.slice(userIndex, userIndex + combineCount)
            .map(w => normalizeWordForComparison(w))
            .join('');
          
          if (combined === targetNormalized) {
            combinedMatchCount = combineCount;
            break;
          }
        }
        
        if (combinedMatchCount > 0) {
          // Found a match when combining user words
          correct++;
          targetIndex++;
          userIndex += combinedMatchCount;
        } else if (targetWord.includes('-')) {
          // Target word is hyphenated (e.g., "longer-lasting")
          // Try matching combined user words against hyphenated target
          const hyphenatedParts = targetWord.split('-').filter(p => p.length > 0);
          const combinedParts = hyphenatedParts.map(p => normalizeWordForComparison(p)).join('');
          
          let hyphenatedMatchCount = 0;
          for (let combineCount = 1; combineCount <= maxCombine && userIndex + combineCount <= userWords.length; combineCount++) {
            const combined = userWords.slice(userIndex, userIndex + combineCount)
              .map(w => normalizeWordForComparison(w))
              .join('');
            
            if (combined === combinedParts) {
              hyphenatedMatchCount = combineCount;
              break;
            }
          }
          
          if (hyphenatedMatchCount > 0) {
            // Match found
            correct++;
            targetIndex++;
            userIndex += hyphenatedMatchCount;
          } else {
            // Try matching individual parts
            let allPartsMatched = true;
            let partsMatched = 0;
            
            for (let partIndex = 0; partIndex < hyphenatedParts.length; partIndex++) {
              const partNormalized = normalizeWordForComparison(hyphenatedParts[partIndex]);
              if (userIndex + partsMatched < userWords.length) {
                const currentUserNormalized = normalizeWordForComparison(userWords[userIndex + partsMatched]);
                
                if (partNormalized === currentUserNormalized) {
                  partsMatched++;
                } else {
                  allPartsMatched = false;
                  break;
                }
              } else {
                allPartsMatched = false;
                break;
              }
            }
            
            if (allPartsMatched && partsMatched === hyphenatedParts.length) {
              // All parts matched
              correct++;
              targetIndex++;
              userIndex += partsMatched;
            } else {
              // No match - advance both
              targetIndex++;
              userIndex++;
            }
          }
        } else {
          // No match found - advance both
          targetIndex++;
          userIndex++;
        }
      }
    }
    
    // Calculate accuracy based on target words (what should have been said)
    return targetWords.length > 0 ? (correct / targetWords.length) * 100 : 0;
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
  
  private async showMicrophonePermissionError() {
    const message = this.isAndroid 
      ? 'Please enable microphone permission in your browser settings:\n\n' +
        '1. Tap the lock icon 🔒 in the address bar\n' +
        '2. Enable "Microphone" permission\n' +
        '3. Reload the page\n\n' +
        'Note: Recording requires HTTPS on Android. Make sure you\'re using https:// or testing on localhost.'
      : 'Please enable microphone permission in Settings > Safari > Microphone';
    
    const alert = await this.alertController.create({
      header: 'Microphone Permission Required',
      message: message,
      buttons: ['OK']
    });
    
    await alert.present();
  }

  private async showSpeechRecognitionError() {
    let message = 'Speech recognition is not available in this browser.\n\n';
    message += 'Recommended browsers:\n';
    
    if (this.isIOS) {
      message += '• Chrome for iOS\n';
      message += '• Note: Safari on iOS does not support speech recognition';
    } else if (this.isAndroid) {
      message += '• Chrome (recommended)\n';
      message += '• Edge\n';
      message += '• Note: Firefox on Android has limited support';
    } else {
      message += '• Chrome (recommended)\n';
      message += '• Edge\n';
      message += '• Safari (macOS)\n';
      message += '• Note: Firefox does not support speech recognition';
    }
    
    const alert = await this.alertController.create({
      header: 'Speech Recognition Not Supported',
      message: message,
      buttons: ['OK']
    });
    
    await alert.present();
  }
}


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
import speechRecognitionPolyfill from 'speech-recognition-polyfill';

declare const window: any;
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

  // ... (all your original properties unchanged)
  exercises: PracticeExercise[] = [];
  selectedExercise?: PracticeExercise;
  practiceTypes = [
    { value: 'monologue', label: 'Monologue' },
    { value: 'public-speaking', label: 'Public Speaking' },
    { value: 'storytelling', label: 'Storytelling' }
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
  recordingDuration = 0;
  recordingStartTime = 0;
  wordCount = 0;
  showTargetText = true;
  currentPracticeStep = 1;
  previousSessionAccuracy: number | undefined = undefined;
  isIOS = false;
  isAndroid = false;
  isMobile = false;
  micPermissionState: 'unknown' | 'granted' | 'denied' | 'prompt' | 'unsupported' = 'unknown';
  private audioElement: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private recognitionFallback: any = null;
  private interimTranscript = '';
  private finalTranscript = '';
  private isPlaybackStarting = false;
  private isStoppingPlayback = false;
  private isStartingRecording = false;
  private isStoppingRecording = false;

  // New capability flags
  private hasMediaRecorder = typeof (window as any).MediaRecorder !== 'undefined';
  private hasGetUserMedia = !!(navigator && (navigator as any).mediaDevices && (navigator as any).mediaDevices.getUserMedia);
  private hasPermissionsAPI = !!(navigator && (navigator as any).permissions && (navigator as any).permissions.query);
  private hasNativeSpeechRecognition = !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  recognizedText = '';
  isListening = false;
  private recognition: any;

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
    private platform: Platform,
    private zone: NgZone // ✅ added — fixes "zone does not exist" error
  ) { }

  async ngOnInit() {
    // Detect platform
    this.isIOS = this.platform.is('ios');
    this.isAndroid = this.platform.is('android');
    this.isMobile = this.platform.is('mobile');

    // Detect runtime capabilities once
    await this.detectCapabilities();

    // Update permission state (safe if unsupported)
    await this.updateMicPermissionState();

    // Initialize audio context only if necessary (iOS/resume logic requires user gesture)
    if (this.isIOS) {
      await this.initializeAudioContext();
    }

    this.initializeSpeechRecognition();
    
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

    // Auth init
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
    this.cleanupAudioResources();
  }
  private initializeSpeechRecognition() {
    if ((window as any).plugins?.speechRecognition) {
      console.log('✅ Using Cordova SpeechRecognition');
    } else if ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) {
      console.log('✅ Using Web SpeechRecognition');
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'en-US';
      this.recognition.continuous = false;
      this.recognition.interimResults = false;

      this.recognition.onresult = (event: any) => {
        this.zone.run(() => {
          this.recognizedText = event.results[0][0].transcript;
          console.log('Recognized (Web):', this.recognizedText);
        });
      };

      this.recognition.onerror = (err: any) =>
        console.error('Web Speech error:', err);
    } else {
      console.warn('❌ Speech recognition not supported on this platform');
    }
  }

  async startSpeechRecognition() {
    if (this.isListening) return;

    if ((window as any).plugins?.speechRecognition) {
      // --- Cordova (Android APK) ---
      try {
        const hasPerm = await window.plugins.speechRecognition.hasPermission();
        if (!hasPerm) {
          await window.plugins.speechRecognition.requestPermission();
        }

        this.isListening = true;
        window.plugins.speechRecognition.startListening(
          (matches: string[]) => {
            this.zone.run(() => {
              this.isListening = false;
              this.recognizedText = matches && matches.length ? matches[0] : '';
              console.log('Recognized (Cordova):', this.recognizedText);
            });
          },
          (err: any) => {
            console.error('Cordova speech error:', err);
            this.isListening = false;
          },
          {
            language: 'en-US',
            matches: 1,
            showPopup: true,
            prompt: 'Speak now...',
          }
        );
      } catch (e) {
        console.error('Cordova startListening failed:', e);
      }

    } else if (this.recognition) {
      // --- Web Speech API ---
      try {
        this.isListening = true;
        this.recognition.start();
      } catch (e) {
        console.error('Web Speech start failed:', e);
        this.isListening = false;
      }

    } else {
      const toast = await this.toastController.create({
        message: 'Speech recognition not supported on this device.',
        duration: 3000,
        color: 'warning',
      });
      await toast.present();
    }
  }

  // ✅ Stop Listening (separate method)
  stopSpeechRecognition() {
    if ((window as any).plugins?.speechRecognition) {
      try {
        window.plugins.speechRecognition.stopListening();
      } catch (e) {
        console.warn('Cordova stopListening error:', e);
      }
    } else if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn('Web stopListening error:', e);
      }
    }
    this.isListening = false;
  }

  private async detectCapabilities(): Promise<void> {
    // Re-check runtime flags; keep them defensive
    this.hasMediaRecorder = typeof (window as any).MediaRecorder !== 'undefined';
    this.hasGetUserMedia = !!(navigator && (navigator as any).mediaDevices && (navigator as any).mediaDevices.getUserMedia);
    this.hasPermissionsAPI = !!(navigator && (navigator as any).permissions && (navigator as any).permissions.query);
    this.hasNativeSpeechRecognition = !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

    // If speech service reports support, prefer that
    if (this.speechService && this.speechService.isSpeechRecognitionSupported && this.speechService.isSpeechRecognitionSupported()) {
      this.hasNativeSpeechRecognition = true;
    }

    // Attempt to wire a fallback recognition (webkit / polyfill) if native not present
    if (!this.hasNativeSpeechRecognition) {
      const WebkitSpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      if (WebkitSpeechRecognition) {
        try {
          this.recognitionFallback = new WebkitSpeechRecognition();
          this.setupFallbackRecognition();
          this.hasNativeSpeechRecognition = true;
          return;
        } catch (err) {
          console.warn('webkitSpeechRecognition create failed', err);
        }
      }

      // Try polyfill only if it looks callable
      try {
        if (typeof speechRecognitionPolyfill === 'function') {
          const Polyfill = (speechRecognitionPolyfill as any)(window);
          // ensure the polyfill returns a constructor-like function
          if (typeof Polyfill === 'function') {
            this.recognitionFallback = new Polyfill();
            this.setupFallbackRecognition();
            this.hasNativeSpeechRecognition = true;
          }
        }
      } catch (err) {
        console.warn('speechRecognitionPolyfill failed to initialize', err);
      }
    }
  }

  private cleanupAudioResources() {
    if (this.audioElement) {
      try {
        this.audioElement.pause();
      } catch { /* ignore */ }
      this.audioElement.src = '';
      this.audioElement = null;
    }
    if (this.currentRecordingUrl) {
      try { URL.revokeObjectURL(this.currentRecordingUrl); } catch { /* ignore */ }
      this.currentRecordingUrl = null;
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try { this.mediaRecorder.stop(); } catch { /* ignore */ }
    }
  }

  private async initializeAudioContext() {
    try {
      // @ts-ignore - webkit prefix for iOS
      const AudioContextClass =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
  
      this.audioContext = new AudioContextClass();
  
      // ✅ Add this guard
      if (this.audioContext && this.audioContext.state === 'suspended') {
        console.log(
          'AudioContext suspended (iOS). Will be resumed on user interaction if needed.'
        );
      }
    } catch (error) {
      console.warn('Failed to initialize AudioContext:', error);
    }
  }
  

  private async ensureRecordingCompatibility(): Promise<void> {
    // Consolidated compatibility strategy:
    // - If speechService knows how to handle it, prefer that.
    // - Otherwise ensure one of: native SpeechRecognition, webkit prefixed, polyfill or at least MediaRecorder + getUserMedia for audio-only.
    if (this.speechService && this.speechService.isSpeechRecognitionSupported && this.speechService.isSpeechRecognitionSupported()) {
      // Native service covers recognition
      return;
    }

    // If we already created fallback recognition during detectCapabilities, we're good
    if (this.recognitionFallback) {
      return;
    }

    // Try to create a webkit SpeechRecognition if possible
    const WebkitSR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (WebkitSR) {
      try {
        this.recognitionFallback = new WebkitSR();
        this.setupFallbackRecognition();
        return;
      } catch (err) {
        console.warn('Failed to create Webkit SpeechRecognition instance:', err);
      }
    }

    // Try polyfill as last attempt for recognition
    try {
      if (typeof speechRecognitionPolyfill === 'function') {
        const Polyfill = (speechRecognitionPolyfill as any)(window);
        if (typeof Polyfill === 'function') {
          this.recognitionFallback = new Polyfill();
          this.setupFallbackRecognition();
          return;
        }
      }
    } catch (err) {
      console.warn('Polyfill initialization failed:', err);
    }

    // If no recognition available, still allow audio recording if possible
    if (!this.hasGetUserMedia) {
      console.warn('getUserMedia not available; audio recording disabled');
      await this.errorHandler.showInfo(
        'Your browser does not support required audio APIs. Recording is not available.'
      );
      return;
    }

    if (!this.hasMediaRecorder) {
      // MediaRecorder is unavailable in some Safari and embedded webviews.
      // We gracefully degrade: allow speech recording via speechService (if it provides an alternative),
      // otherwise inform the user.
      console.warn('MediaRecorder not available; audio-only mode may be limited.');
      await this.errorHandler.showInfo(
        'Your browser does not support MediaRecorder. Speech recognition (if available) will still work; audio file recording may not be available on this device.'
      );
    }
  }

  private async checkSpeechRecognitionSupport() {
    // Keep this thin: prefer speechService but double-check window
    const isSupported = this.speechService?.isSpeechRecognitionSupported?.() ?? false;
    if (isSupported) return;
    // If we have prefixed or polyfill available we already set recognitionFallback in detectCapabilities()
    if (this.recognitionFallback) return;

    // If on Android and no recognition, show helpful instructions
    if (this.isAndroid) {
      await this.showAndroidRecordingInstructions();
    }

    await this.errorHandler.showInfo(
      'Speech recognition is not supported on this browser. Audio will still be recorded for playback if supported.'
    );
  }

  private setupFallbackRecognition() {
    if (!this.recognitionFallback) return;

    try {
      this.recognitionFallback.continuous = true;
      this.recognitionFallback.interimResults = true;
      this.recognitionFallback.lang = 'en-US';
    } catch { /* ignore if properties not writable on polyfill */ }

    this.recognitionFallback.onresult = (event: any) => {
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

    this.recognitionFallback.onerror = (event: any) => {
      console.error('Fallback recognition error:', event && event.error ? event.error : event);
      if (event && event.error === 'no-speech') {
        // ignore
        return;
      }
      this.errorHandler.showError(new Error(event && event.error ? event.error : 'Recognition error'), ErrorType.RECORDING_FAILED);
    };
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

  toggleInstructions() { this.showInstructions = !this.showInstructions; }
  setPracticeReady() { this.isPracticeReady = true; this.currentPracticeStep = 3; }

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
    if (step === 1) this.isPracticeReady = false;
    else if (step === 2) this.isPracticeReady = false;
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
        if (this.isPracticing && !this.isRecording) this.startStructuredRecording();
        else if (this.isRecording) this.stopStructuredRecording();
        break;
      case 'practice:stop-practice':
        if (this.isPracticing) this.stopStructuredPractice();
        break;
      case 'practice:retry':
        if (this.userSpeechText) this.clearSpeech();
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

    // On iOS we try to resume audioContext (requires user gesture)
    if (this.isIOS && this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
        console.log('AudioContext resumed');
      } catch (error) {
        console.warn('Unable to resume AudioContext now; will try again on user interaction.');
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
          { text: 'Cancel', role: 'cancel' },
          {
            text: 'End Session', role: 'destructive', handler: () => {
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
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete', role: 'destructive', handler: async () => {
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
      await this.errorHandler.showError(error, ErrorType.AUDIO_PLAYBACK_FAILURE);
    } finally {
      this.isListeningToText = false;
    }
  }

  stopListening() {
    this.speechService.stopSpeaking();
    this.isListeningToText = false;
  }

  async listenToRecording() {
    if (this.isPlaybackStarting || this.isPlayingRecording) return;
    this.isPlaybackStarting = true;
    // Ensure we have recording data
    if (!this.currentRecordingBlob && !this.currentRecordingUrl) {
      const audioBlob = this.speechService.getAudioBlob?.();
      const audioUrl = this.speechService.getAudioUrl?.();
      if (!audioBlob && !audioUrl) {
        await this.errorHandler.showWarning('No audio recording available to play. Please record your speech first.');
        this.isPlaybackStarting = false;
        return;
      }
      if (audioBlob) this.currentRecordingBlob = audioBlob;
      if (audioUrl) {
        if (this.currentRecordingUrl) {
          try { URL.revokeObjectURL(this.currentRecordingUrl); } catch { /* ignore */ }
        }
        this.currentRecordingUrl = audioUrl;
      }
    }

    if (!this.currentRecordingBlob && !this.currentRecordingUrl) {
      await this.errorHandler.showWarning('Audio recording is not available. Please record again.');
      this.isPlaybackStarting = false;
      return;
    }

    try {
      this.isPlayingRecording = true;
      this.cdr.detectChanges();
      if (this.isIOS) await this.playRecordingIOS();
      else if (this.isAndroid) await this.playRecordingAndroid();
      else await this.playRecordingDesktop();
      console.log('Recording playback completed');
    } catch (error: any) {
      console.error('Error playing recording:', error);
      const msg = (error && (error.name || error.message)) ? (error.name || error.message) : '';
      if (msg !== 'AbortError' && msg !== 'NotAllowedError') {
        await this.errorHandler.showError(error, ErrorType.AUDIO_PLAYBACK_FAILURE);
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
        if (this.audioElement) {
          try { this.audioElement.pause(); } catch { /* ignore */ }
          this.audioElement.src = '';
        }
        this.audioElement = new Audio();
        if (this.currentRecordingBlob) {
          const url = URL.createObjectURL(this.currentRecordingBlob);
          this.audioElement.src = url;
        } else if (this.currentRecordingUrl) {
          this.audioElement.src = this.currentRecordingUrl;
        } else {
          reject(new Error('No audio source available'));
          return;
        }
        this.audioElement.preload = 'auto';
        this.audioElement.controls = false;
        this.audioElement.onended = () => resolve();
        this.audioElement.onpause = () => resolve();
        this.audioElement.onerror = (e) => reject(new Error('iOS audio playback failed'));
        this.audioElement.load();
        const playPromise = this.audioElement.play();
        if (playPromise !== undefined) {
          playPromise.then(() => { /* playing */ }).catch(err => reject(err));
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  private async playRecordingAndroid(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (this.audioElement) {
          try { this.audioElement.pause(); } catch { /* ignore */ }
          this.audioElement.src = '';
        }
        this.audioElement = new Audio();
        if (this.currentRecordingBlob) {
          const url = URL.createObjectURL(this.currentRecordingBlob);
          this.audioElement.src = url;
          if (this.currentRecordingUrl && this.currentRecordingUrl !== url) {
            try { URL.revokeObjectURL(this.currentRecordingUrl); } catch { /* ignore */ }
          }
          this.currentRecordingUrl = url;
        } else if (this.currentRecordingUrl) {
          this.audioElement.src = this.currentRecordingUrl;
        } else {
          reject(new Error('No audio source available'));
          return;
        }
        this.audioElement.onended = () => resolve();
        this.audioElement.onpause = () => resolve();
        this.audioElement.onerror = (e) => reject(new Error('Android audio playback failed'));
        setTimeout(() => {
          const playPromise = this.audioElement!.play();
          if (playPromise !== undefined) {
            playPromise.then(() => { /* playing */ }).catch(err => reject(err));
          }
        }, 100);
      } catch (error) {
        reject(error);
      }
    });
  }

  private async playRecordingDesktop(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (this.audioElement) {
          try { this.audioElement.pause(); } catch { /* ignore */ }
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
      } catch (error) {
        reject(error);
      }
    });
  }

  stopPlayingRecording() {
    if (this.isStoppingPlayback) return;
    this.isStoppingPlayback = true;
    try {
      if (this.audioElement) {
        try { this.audioElement.pause(); this.audioElement.currentTime = 0; } catch { /* ignore */ }
      }
      this.speechService.stopPlaying?.();
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
    if (event) event.stopPropagation();
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
    const phoneticMap: { [key: string]: string } = {
      'hello': '/həˈloʊ/',
      'world': '/wɜːrld/',
      'education': '/ˌedʒuˈkeɪʃn/',
      'technology': '/tekˈnɑːlədʒi/',
      'communication': '/kəˌmjuːnɪˈkeɪʃn/'
    };
    return phoneticMap[cleanWord] || `/${cleanWord}/`;
  }

  async clearSpeech() {
    if (!this.userSpeechText || this.userSpeechText.trim() === '' || this.userSpeechText === '🎤 Listening...') return;
    const speechToClear = this.userSpeechText;
    const audioBlob = this.currentRecordingBlob;
    const audioUrl = this.currentRecordingUrl;
    this.undoService.registerAction(
      UndoActionType.CLEAR_SPEECH,
      { text: speechToClear, audioBlob, audioUrl },
      'Speech cleared',
      async (data: any) => {
        this.userSpeechText = data.text;
        if (data.audioUrl) this.currentRecordingUrl = data.audioUrl;
        if (data.audioBlob) this.currentRecordingBlob = data.audioBlob;
        this.cdr.detectChanges();
      }
    );
    this.userSpeechText = '';
    if (this.currentRecordingUrl) {
      try { URL.revokeObjectURL(this.currentRecordingUrl); } catch { /* ignore */ }
      this.currentRecordingUrl = null;
    }
    this.currentRecordingBlob = null;
    this.speechService.clearRecording?.();
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
    const analysis = this.speechService.analyzeSpeech(userTranscript, this.sessionResults.duration);
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
    const clarityScore = this.speechService.calculateClarityScore(userTranscript, overallAccuracy, analysis.wordsPerMinute);
    const repeatedWords = this.speechService.detectRepeatedWords(userTranscript);
    const rhythmAnalysis = this.speechService.analyzeSpeakingRhythm(userTranscript);
    const clarityFeedbackArray = this.speechService.getClarityFeedback(clarityScore.clarityScore, repeatedWords.count, rhythmAnalysis.feedback);
    const clarityAnalysis = { ...clarityScore, feedbackArray: clarityFeedbackArray };
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
        { text: 'Cancel', role: 'cancel', handler: () => this.stopPractice() },
        { text: 'Start', handler: () => this.startPracticeSession() }
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
    const canRecognize = await this.speechService.isAnyRecognitionAvailable();
    if (!canRecognize && !this.recognitionFallback) {
      await this.showSpeechRecognitionError();
      this.isStartingRecording = false;
      return;
    }
    const ok = await this.ensureMicrophoneAccess();
    if (!ok) return;
    try {
      this.isRecording = true;
      this.userSpeechText = '🎤 Listening...';
      await this.speechService.startRecording();
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
      await this.errorHandler.showError(error, ErrorType.RECORDING_FAILED, async () => { await this.startRecording(); });
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
    // Ensure capabilities are checked (fast-return if already ok)
    await this.ensureRecordingCompatibility();

    if (!this.speechService.isSpeechRecognitionSupported() && !this.recognitionFallback) {
      await this.showSpeechRecognitionError();
      this.isStartingRecording = false;
      return;
    }

    if (this.isStartingRecording || this.isRecording) return;
    this.isStartingRecording = true;

    if (this.isMobile) {
      const ok = await this.ensureMicrophoneAccess();
      if (!ok) {
        this.isStartingRecording = false;
        return;
      }
    }

    try {
      this.userSpeechText = '';
      this.sessionResults = null;
      this.showTargetText = true;
      if (this.currentRecordingUrl) {
        try { URL.revokeObjectURL(this.currentRecordingUrl); } catch { /* ignore */ }
        this.currentRecordingUrl = null;
      }
      this.currentRecordingBlob = null;
      this.speechService.clearTranscript?.();
      this.finalTranscript = '';
      this.interimTranscript = '';

      if (this.currentStructuredPractice?.targetText) {
        this.speechService.setTargetText?.(this.currentStructuredPractice.targetText);
      }

      // Start MediaRecorder only if available
      if (this.hasGetUserMedia && this.hasMediaRecorder) {
        await this.startMediaRecorder();
      } else {
        // If MediaRecorder unavailable, we'll still attempt recognition (audio file won't be produced)
        console.warn('MediaRecorder unavailable: audio blob will not be produced on this platform.');
      }

      // Start recognition (fallback or service)
      if (this.recognitionFallback) {
        try { this.recognitionFallback.start(); } catch (e) { console.warn('Fallback recognition start failed', e); }
        console.log('Started fallback speech recognition');
      } else {
        await this.speechService.startRecording();
      }

      this.isRecording = true;
      this.recordingStartTime = Date.now();
      this.recordingDuration = 0;
      this.wordCount = 0;

      const durationInterval = setInterval(() => {
        if (this.isRecording) this.recordingDuration = Math.floor((Date.now() - this.recordingStartTime) / 1000);
        else clearInterval(durationInterval);
      }, 1000);

      const transcriptInterval = setInterval(() => {
        if (!this.isRecording) { clearInterval(transcriptInterval); return; }
        let currentTranscript = '';
        if (this.recognitionFallback) currentTranscript = (this.finalTranscript + this.interimTranscript).trim();
        else currentTranscript = this.speechService.getCurrentTranscript?.() ?? '';
        if (currentTranscript) {
          const formattedText = currentTranscript.trim() !== '' ? this.capitalizeFirstLetter(currentTranscript) : '🎤 Listening...';
          if (formattedText !== '🎤 Listening...') this.wordCount = formattedText.split(/\s+/).filter(w => w.length > 0).length;
          if (this.userSpeechText !== formattedText) { this.userSpeechText = formattedText; this.cdr.detectChanges(); }
        } else if (!this.userSpeechText || this.userSpeechText === '') {
          this.userSpeechText = '🎤 Listening...';
          this.cdr.detectChanges();
        }
      }, 100);

      (this as any).transcriptInterval = transcriptInterval;
      this.isStartingRecording = false;
    } catch (error) {
      console.error('Recording error:', error);
      this.isRecording = false;
      this.isStartingRecording = false;
      await this.errorHandler.showError(error, ErrorType.RECORDING_FAILED, async () => { await this.startStructuredRecording(); });
    }
  }

  toggleTargetText() { this.showTargetText = !this.showTargetText; }

  private async startMediaRecorder(): Promise<void> {
    // Defensive checks and graceful fallback
    if (!this.hasGetUserMedia) {
      throw new Error('getUserMedia not supported on this browser');
    }
    if (!this.hasMediaRecorder) {
      console.warn('MediaRecorder not supported in this environment; continuing without audio blob recording.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      this.audioChunks = [];

      // Determine MIME type in a safe way
      let mimeType = 'audio/webm';
      try {
        if (this.isIOS) {
          if ((window as any).MediaRecorder && (MediaRecorder as any).isTypeSupported && (MediaRecorder as any).isTypeSupported('audio/mp4')) {
            mimeType = 'audio/mp4';
          } else if ((window as any).MediaRecorder && (MediaRecorder as any).isTypeSupported && (MediaRecorder as any).isTypeSupported('audio/wav')) {
            mimeType = 'audio/wav';
          }
        } else if (this.isAndroid) {
          if ((window as any).MediaRecorder && (MediaRecorder as any).isTypeSupported && (MediaRecorder as any).isTypeSupported('audio/webm;codecs=opus')) {
            mimeType = 'audio/webm;codecs=opus';
          }
        } else {
          // Desktop prefer webm if supported
          if ((window as any).MediaRecorder && (MediaRecorder as any).isTypeSupported && (MediaRecorder as any).isTypeSupported('audio/webm;codecs=opus')) {
            mimeType = 'audio/webm;codecs=opus';
          }
        }
      } catch (err) {
        // If isTypeSupported is missing or throws, ignore and use default
        console.warn('isTypeSupported check failed, using default MIME type', err);
      }

      console.log('Using MIME type for MediaRecorder:', mimeType);
      try {
        this.mediaRecorder = new MediaRecorder(stream, { mimeType: mimeType });
      } catch (err) {
        // If construction fails, try without mimeType (some browsers reject unknown types)
        try {
          console.warn('MediaRecorder constructor with mimeType failed, trying default constructor', err);
          this.mediaRecorder = new MediaRecorder(stream);
        } catch (innerErr) {
          console.error('Failed to construct MediaRecorder:', innerErr);
          stream.getTracks().forEach((t: any) => t.stop());
          throw innerErr;
        }
      }

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
          console.log('Audio chunk received:', event.data.size, 'bytes');
        }
      };

      this.mediaRecorder.onstop = () => {
        console.log('MediaRecorder stopped, total chunks:', this.audioChunks.length);
        if (this.audioChunks.length > 0) {
          const audioBlob = new Blob(this.audioChunks, { type: mimeType });
          this.currentRecordingBlob = audioBlob;
          if (this.currentRecordingUrl) {
            try { URL.revokeObjectURL(this.currentRecordingUrl); } catch { /* ignore */ }
          }
          this.currentRecordingUrl = URL.createObjectURL(audioBlob);
          console.log('Audio blob created:', audioBlob.size, 'bytes');
        }
        // Stop all tracks for cleanup
        try { stream.getTracks().forEach((track: any) => track.stop()); } catch { /* ignore */ }
      };

      // start with small timeslice for reliability if supported
      try {
        this.mediaRecorder.start(100);
      } catch (err) {
        // some implementations don't accept timeslice; start with no param
        try { this.mediaRecorder.start(); } catch (inner) { throw inner; }
      }
      console.log('MediaRecorder started successfully');
    } catch (error) {
      console.error('Failed to start MediaRecorder:', error);
      throw error;
    }
  }

  async stopStructuredRecording() {
    this.isRecording = false;
    if ((this as any).transcriptInterval) {
      clearInterval((this as any).transcriptInterval);
      (this as any).transcriptInterval = null;
    }
    try {
      // Stop MediaRecorder (if active)
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        try { this.mediaRecorder.stop(); console.log('MediaRecorder stopped'); } catch (e) { console.warn('mediaRecorder stop failed', e); }
        // small delay to allow onstop to run
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Stop recognition
      if (this.recognitionFallback) {
        try { this.recognitionFallback.stop(); } catch (e) { console.warn('recognition stop failed', e); }
      } else {
        await this.speechService.stopRecording();
      }

      // Wait for final processing
      await new Promise(resolve => setTimeout(resolve, 300));

      // Get final transcript
      let finalTranscript = '';
      if (this.recognitionFallback) finalTranscript = (this.finalTranscript + this.interimTranscript).trim();
      else {
        const result = this.speechService.getRecordingResult();
        finalTranscript = this.speechService.getCurrentTranscript?.() || result.transcript || '';
      }

      console.log('Final transcript:', finalTranscript);

      if (!finalTranscript || finalTranscript.trim() === '' || finalTranscript === '🎤 Listening...') {
        console.error('Empty transcript detected!');
        this.userSpeechText = '';
        await this.errorHandler.showError(new Error('Empty transcript'), ErrorType.EMPTY_TRANSCRIPT, async () => { await this.startStructuredRecording(); });
        return;
      }

      if (this.currentRecordingBlob) console.log('Audio available:', this.currentRecordingBlob.size, 'bytes');

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

      // Try to salvage transcript
      let finalTranscript = '';
      if (this.recognitionFallback) finalTranscript = (this.finalTranscript + this.interimTranscript).trim();
      else finalTranscript = this.speechService.getCurrentTranscript?.() || '';

      if (finalTranscript && finalTranscript.trim() !== '') {
        this.userSpeechText = this.capitalizeFirstLetter(finalTranscript);
        await this.errorHandler.showWarning('Speech captured but audio recording failed. You can still get feedback.');
        this.cdr.detectChanges();
      } else {
        await this.errorHandler.showError(new Error('Recording and transcript failed'), ErrorType.RECORDING_FAILED, async () => { await this.startStructuredRecording(); });
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
    await this.storageService.addPracticeSession(this.sessionResults);
    await this.loadPracticeHistory();
    if (!this.sessionResults || !this.currentStructuredPractice) return;
    const wordAccuracy = this.calculateWordAccuracy(finalTranscript, this.currentStructuredPractice.targetText);
    const punctuationAccuracy = this.calculatePunctuationAccuracy(finalTranscript, this.currentStructuredPractice.targetText);
    const accuracy = this.calculateOverallAccuracy({
      wordAccuracy,
      punctuationAccuracy,
      confidence: result.confidence,
      duration: result.duration
    });
    const durationMinutes = result.duration / 60000;
    const practiceTypeMap: Record<string, 'monologue' | 'publicSpeaking' | 'storytelling'> = {
      'public-speaking': 'publicSpeaking',
      'storytelling': 'storytelling',
      'monologue': 'monologue'
    };
    const practiceType = practiceTypeMap[this.selectedPracticeType] || 'monologue';
    const difficultyMap: Record<string, 'beginner' | 'intermediate' | 'advanced'> = {
      'beginner': 'beginner',
      'intermediate': 'intermediate',
      'advanced': 'advanced'
    };
    const difficulty = difficultyMap[this.selectedDifficulty] || 'beginner';
    await this.userProgressionService.updatePracticeSession(
      accuracy,
      durationMinutes,
      practiceType === 'storytelling' ? 'monologue' : practiceType,
      difficulty
    );
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

  private async updateMicPermissionState(): Promise<void> {
    try {
      const anyNav: any = navigator as any;
      if (!anyNav.permissions || !anyNav.permissions.query) {
        this.micPermissionState = 'unsupported';
        return;
      }
      const status = await anyNav.permissions.query({ name: 'microphone' as any });
      this.micPermissionState = (status.state as any) || 'unknown';
      status.onchange = () => {
        this.micPermissionState = (status.state as any) || 'unknown';
        this.cdr.detectChanges();
      };
    } catch {
      this.micPermissionState = 'unsupported';
    }
  }

  async requestMicrophonePermission(): Promise<boolean> {
    try {
      if (!this.hasGetUserMedia) {
        await this.showMicFixInstructions(new Error('getUserMedia unsupported'));
        return false;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
      this.micPermissionState = 'granted';
      this.cdr.detectChanges();
      return true;
    } catch (error: any) {
      console.error('Microphone request failed:', error);
      await this.updateMicPermissionState();
      await this.showMicFixInstructions(error);
      return false;
    }
  }

  private async ensureMicrophoneAccess(): Promise<boolean> {
    try {
      if (!this.hasGetUserMedia) {
        await this.showMicFixInstructions(new Error('getUserMedia unsupported'));
        return false;
      }
      if ((navigator as any).permissions && this.micPermissionState === 'granted') return true;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
      this.micPermissionState = 'granted';
      return true;
    } catch (error: any) {
      console.warn('ensureMicrophoneAccess failed:', error);
      await this.updateMicPermissionState();
      await this.showMicFixInstructions(error);
      return false;
    }
  }

  private async showMicFixInstructions(error?: any) {
    const isNotFound = error && (error.name === 'NotFoundError' || /no device/i.test(String(error)));
    const platformMsg = this.isAndroid
      ? 'Chrome > Lock (🔒) > Site settings > Microphone > Allow, then reload.'
      : 'iOS Settings > Safari > Microphone > Allow, then reopen the site.';
    const extra = isNotFound
      ? '\nNo input device found. Ensure a microphone is available and not in use by another app.'
      : '';
    const msg = `Microphone Permission Required\n\n${platformMsg}${extra}`;
    await this.errorHandler.showInfo(msg);
  }

  private async showMicrophonePermissionError() {
    const message = this.isAndroid
      ? 'Please enable microphone permission in your browser settings:\n\n' +
      '1. Tap the lock icon 🔒 in the address bar\n' +
      '2. Enable "Microphone" permission\n' +
      '3. Reload the page'
      : 'Please enable microphone permission in Settings > Safari > Microphone';

    const alert = await this.alertController.create({
      header: 'Microphone Permission Required',
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }

  private async showSpeechRecognitionError() {
    await this.errorHandler.showError(
      new Error('Speech Recognition not supported'),
      ErrorType.SPEECH_RECOGNITION_NOT_SUPPORTED
    );
  }

}

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
    
    // Audio playback
    private audioElement: HTMLAudioElement | null = null;
    private audioContext: AudioContext | null = null;
    
    // MediaRecorder for better cross-platform support
    private mediaRecorder: MediaRecorder | null = null;
    private audioChunks: Blob[] = [];
    
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
      // Detect platform
      this.isIOS = this.platform.is('ios');
      this.isAndroid = this.platform.is('android');
      this.isMobile = this.platform.is('mobile');
      
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
        // @ts-ignore - webkit prefix for iOS
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContextClass();
        
        // iOS requires user interaction to unlock audio context
        if (this.audioContext.state === 'suspended') {
          console.log('Audio context suspended, will resume on user interaction');
        }
      } catch (error) {
        console.error('Failed to initialize audio context:', error);
      }
    }
    
    private async checkSpeechRecognitionSupport() {
      const isSupported = this.speechService.isSpeechRecognitionSupported();
      
      if (!isSupported) {
        // Check for alternative speech recognition
        // @ts-ignore
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (SpeechRecognition) {
          console.log('Alternative speech recognition available');
          this.recognitionFallback = new SpeechRecognition();
          this.setupFallbackRecognition();
        } else {
          console.warn('No speech recognition available on this device');
          
          if (this.isAndroid) {
            await this.showAndroidRecordingInstructions();
          }
        }
      }
    }
    
    private setupFallbackRecognition() {
      if (!this.recognitionFallback) return;
      
      this.recognitionFallback.continuous = true;
      this.recognitionFallback.interimResults = true;
      this.recognitionFallback.lang = 'en-US';
      
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
        console.error('Fallback recognition error:', event.error);
        
        if (event.error === 'no-speech') {
          // Don't show error for no-speech, just continue
          return;
        }
        
        this.errorHandler.showError(
          new Error(event.error),
          ErrorType.RECORDING_FAILED
        );
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

    toggleInstructions() {
      this.showInstructions = !this.showInstructions;
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
        } else if (this.isAndroid) {
          await this.playRecordingAndroid();
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
      // No auto session-complete here; it will be shown only when the user ends the session
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
      // Use service-level capability check (web or native)
      const canRecognize = await this.speechService.isAnyRecognitionAvailable();
      if (!canRecognize && !this.recognitionFallback) {
        await this.showSpeechRecognitionError();
        this.isStartingRecording = false;
        return;
      }

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
      // Check permissions first on mobile
      if (this.isMobile) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop()); // Stop immediately, just checking permission
          console.log('✓ Microphone permission granted');
        } catch (error) {
          console.error('Microphone permission denied:', error);
          await this.showMicrophonePermissionError();
          this.isStartingRecording = false;
          return;
        }
      }
      
      if (!this.speechService.isSpeechRecognitionSupported() && !this.recognitionFallback) {
        await this.showSpeechRecognitionError();
        this.isStartingRecording = false;
        return;
      }

      try {
        this.userSpeechText = '';
        this.sessionResults = null;
        // Ensure target text is visible (compact) while recording
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
        
        // Start MediaRecorder for audio capture (works on both platforms)
        await this.startMediaRecorder();
        
        // Start speech recognition (use fallback if available)
        if (this.recognitionFallback) {
          this.recognitionFallback.start();
          console.log('Started fallback speech recognition');
        } else {
          await this.speechService.startRecording();
        }
        
        this.isRecording = true;
        this.recordingStartTime = Date.now();
        this.recordingDuration = 0;
        this.wordCount = 0;
        
        const durationInterval = setInterval(() => {
          if (this.isRecording) {
            this.recordingDuration = Math.floor((Date.now() - this.recordingStartTime) / 1000);
          } else {
            clearInterval(durationInterval);
          }
        }, 1000);
        
        const transcriptInterval = setInterval(() => {
          if (this.isRecording) {
            let currentTranscript = '';
            
            if (this.recognitionFallback) {
              currentTranscript = (this.finalTranscript + this.interimTranscript).trim();
            } else {
              currentTranscript = this.speechService.getCurrentTranscript();
            }
            
            if (currentTranscript) {
              const formattedText = currentTranscript.trim() !== '' 
                ? this.capitalizeFirstLetter(currentTranscript)
                : '🎤 Listening...';
              
              if (formattedText !== '🎤 Listening...') {
                this.wordCount = formattedText.split(/\s+/).filter(w => w.length > 0).length;
              }
              
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
          ErrorType.RECORDING_FAILED,
          async () => {
            await this.startStructuredRecording();
          }
        );
      }
    }

    toggleTargetText() {
      this.showTargetText = !this.showTargetText;
    }
    
    private async startMediaRecorder(): Promise<void> {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
        
        this.audioChunks = [];
        
        // Use different MIME types based on platform
        let mimeType = 'audio/webm';
        
        if (this.isIOS) {
          // iOS Safari supports these formats
          if (MediaRecorder.isTypeSupported('audio/mp4')) {
            mimeType = 'audio/mp4';
          } else if (MediaRecorder.isTypeSupported('audio/wav')) {
            mimeType = 'audio/wav';
          }
        } else if (this.isAndroid) {
          // Android Chrome prefers webm
          if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
            mimeType = 'audio/webm;codecs=opus';
          }
        }
        
        console.log('Using MIME type:', mimeType);
        
        this.mediaRecorder = new MediaRecorder(stream, { 
          mimeType: mimeType 
        });
        
        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
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
              URL.revokeObjectURL(this.currentRecordingUrl);
            }
            this.currentRecordingUrl = URL.createObjectURL(audioBlob);
            
            console.log('✓ Audio blob created:', audioBlob.size, 'bytes');
          }
          
          // Stop all tracks
          stream.getTracks().forEach(track => track.stop());
        };
        
        // Start recording with small time slices for better reliability
        this.mediaRecorder.start(100);
        console.log('✓ MediaRecorder started');
        
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
        // Stop MediaRecorder first
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
          this.mediaRecorder.stop();
          console.log('MediaRecorder stopped');
          
          // Wait for onstop event to process
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Stop speech recognition
        if (this.recognitionFallback) {
          try {
            this.recognitionFallback.stop();
          } catch (e) {
            console.log('Recognition already stopped');
          }
        } else {
          await this.speechService.stopRecording();
        }
        
        // Wait for final processing
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Get final transcript
        let finalTranscript = '';
        
        if (this.recognitionFallback) {
          finalTranscript = (this.finalTranscript + this.interimTranscript).trim();
        } else {
          const result = this.speechService.getRecordingResult();
          finalTranscript = this.speechService.getCurrentTranscript() || result.transcript;
        }
        
        console.log('Final transcript:', finalTranscript);
        
        if (!finalTranscript || finalTranscript.trim() === '' || finalTranscript === '🎤 Listening...') {
          console.error('❌ Empty transcript detected!');
          this.userSpeechText = '';
          
          await this.errorHandler.showError(
            new Error('Empty transcript'),
            ErrorType.EMPTY_TRANSCRIPT,
            async () => {
              await this.startStructuredRecording();
            }
          );
          
          return;
        }
        
        // Verify audio blob (no intrusive warning; playback button will handle notification if needed)
        if (this.currentRecordingBlob) {
          console.log('✓ Audio available:', this.currentRecordingBlob.size, 'bytes');
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
        
        this.handleStructuredRecordingResult(result);
        this.cdr.detectChanges();
        
      } catch (error) {
        console.error('Error stopping recording:', error);
        
        // Try to salvage transcript
        let finalTranscript = '';
        
        if (this.recognitionFallback) {
          finalTranscript = (this.finalTranscript + this.interimTranscript).trim();
        } else {
          finalTranscript = this.speechService.getCurrentTranscript();
        }
        
        if (finalTranscript && finalTranscript.trim() !== '') {
          this.userSpeechText = this.capitalizeFirstLetter(finalTranscript);
          
          await this.errorHandler.showWarning(
            'Speech captured but audio recording failed. You can still get feedback.'
          );
          this.cdr.detectChanges();
        } else {
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
    
      // Use the transcript from the result if userSpeechText is empty
      const finalTranscript = this.userSpeechText || result.transcript;
    
      // Store session result
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
    
      // Calculate accuracies
      const wordAccuracy = this.calculateWordAccuracy(finalTranscript, this.currentStructuredPractice.targetText);
      const punctuationAccuracy = this.calculatePunctuationAccuracy(finalTranscript, this.currentStructuredPractice.targetText);
    
      const accuracy = this.calculateOverallAccuracy({
        wordAccuracy,
        punctuationAccuracy,
        confidence: result.confidence,
        duration: result.duration
      });
    
      const durationMinutes = result.duration / 60000;
    
      // Map selectedPracticeType to API type
      const practiceTypeMap: Record<string, 'monologue' | 'publicSpeaking' | 'storytelling'> = {
        'public-speaking': 'publicSpeaking',
        'storytelling': 'storytelling',
        'monologue': 'monologue'
      };
      const practiceType = practiceTypeMap[this.selectedPracticeType] || 'monologue';
    
      // Map selectedDifficulty safely
      const difficultyMap: Record<string, 'beginner' | 'intermediate' | 'advanced'> = {
        'beginner': 'beginner',
        'intermediate': 'intermediate',
        'advanced': 'advanced'
      };
      const difficulty = difficultyMap[this.selectedDifficulty] || 'beginner';
    
      // Update user progression
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
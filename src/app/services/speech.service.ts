import { Injectable } from '@angular/core';

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  duration: number;
}

export interface TextToSpeechOptions {
  text: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SpeechService {
  private isRecording = false;
  private recognition: any;
  private synthesis: SpeechSynthesis;
  private currentTranscript = '';
  private interimTranscript = '';
  private recordingStartTime = 0;
  private targetText = '';

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.initSpeechRecognition();
  }

  private initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
    }
  }

  // Speech Recognition (Speech-to-Text) - Returns immediately, doesn't wait for completion
  startRecording(): void {
    // Don't start if already recording
    if (this.isRecording) {
      return;
    }

    this.isRecording = true;
    this.currentTranscript = '';
    this.interimTranscript = '';
    this.recordingStartTime = Date.now();

    if (!this.recognition) {
      // Mock implementation for browsers that don't support speech recognition
      // Simulate real-time transcript updates with proper punctuation
      const mockText = "Practice makes perfect when it comes to delivering effective presentations.";
      const words = mockText.split(' ');
      let wordIndex = 0;
      
      // Start immediately with first word (capitalize first letter)
      this.currentTranscript = this.capitalizeFirstLetter(words[0]);
      wordIndex = 1;
      
      // Use a simpler approach - add words one by one with setTimeout
      const addNextWord = () => {
        if (this.isRecording && wordIndex < words.length) {
          // Add word directly to current transcript for immediate display
          this.currentTranscript += ' ' + words[wordIndex];
          wordIndex++;
          
          // Schedule next word
          setTimeout(addNextWord, 400);
        }
      };
      
      // Start adding words after a short delay
      setTimeout(addNextWord, 400);
      
      return;
    }

    this.recognition.onresult = (event: any) => {
      console.log('Speech recognition result received:', event);
      let newInterimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        let transcript = result[0].transcript;
        console.log('Transcript result:', transcript, 'isFinal:', result.isFinal);
        
        // Add intelligent punctuation based on target text
        if (result.isFinal) {
          // Use target text for better punctuation matching
          if (this.targetText) {
            transcript = this.addPunctuationIfNeeded(transcript, this.targetText);
          } else {
            // Fallback: Add period at end of sentences if missing
            if (transcript && !transcript.match(/[.!?]$/)) {
              transcript += '.';
            }
          }
          
          // Add space before final transcript if current transcript doesn't end with space
          if (this.currentTranscript && !this.currentTranscript.match(/\s$/)) {
            transcript = ' ' + transcript;
          }
          finalTranscript += transcript;
        } else {
          newInterimTranscript += transcript;
        }
      }
      
      // Update the current transcript for real-time display
      // Add final results to the permanent transcript
      this.currentTranscript += finalTranscript;
      
      // Update interim transcript for real-time display
      this.interimTranscript = newInterimTranscript;
      
      console.log('Updated currentTranscript:', this.currentTranscript);
      console.log('Updated interimTranscript:', this.interimTranscript);
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      this.isRecording = false;
    };

    this.recognition.onend = () => {
      // Don't stop recording automatically - let user control it
      if (this.isRecording) {
        // Restart recognition if it ended unexpectedly
        try {
          this.recognition.start();
        } catch (error) {
          console.error('Failed to restart recognition:', error);
          this.isRecording = false;
        }
      }
    };

    try {
      this.recognition.start();
    } catch (error) {
      console.error('Failed to start recognition:', error);
      this.isRecording = false;
    }
  }

  // Get the final result when user stops recording
  getRecordingResult(): SpeechRecognitionResult {
    const duration = this.getRecordingDuration();
    return {
      transcript: this.currentTranscript, // Only final transcript, no interim results
      confidence: 0.8, // Default confidence
      duration
    };
  }

  private getRecordingDuration(): number {
    return this.recordingStartTime > 0 ? Date.now() - this.recordingStartTime : 0;
  }

  stopRecording(): void {
    if (this.recognition && this.isRecording) {
      this.recognition.stop();
      this.isRecording = false;
    }
    
    // Stop mock recording
    this.isRecording = false;
  }

  getIsRecording(): boolean {
    return this.isRecording;
  }

  getCurrentTranscript(): string {
    // Combine final transcript with interim results for real-time display
    const combined = this.currentTranscript + this.interimTranscript;
    return combined;
  }

  clearTranscript(): void {
    this.currentTranscript = '';
    this.interimTranscript = '';
    this.targetText = '';
  }

  // Helper method to intelligently add punctuation based on target text
  private addPunctuationIfNeeded(transcript: string, targetText: string): string {
    if (!transcript || !targetText) return transcript;
    
    // Get the current word count in transcript
    const transcriptWords = transcript.trim().split(/\s+/).length;
    const targetWords = targetText.trim().split(/\s+/);
    
    // If we have words, try to match punctuation from target text
    if (transcriptWords > 0 && transcriptWords <= targetWords.length) {
      const targetWord = targetWords[transcriptWords - 1];
      
      // Check if target word ends with punctuation
      const punctuationMatch = targetWord.match(/[.,!?;:]$/);
      if (punctuationMatch && !transcript.match(/[.,!?;:]$/)) {
        return transcript + punctuationMatch[0];
      }
    }
    
    return transcript;
  }

  private capitalizeFirstLetter(text: string): string {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  // Text-to-Speech
  async speak(options: TextToSpeechOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Text-to-speech not supported'));
        return;
      }

      // Cancel any ongoing speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(options.text);
      
      // Set voice properties
      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;

      // Set voice if specified
      if (options.voice) {
        const voices = this.synthesis.getVoices();
        const selectedVoice = voices.find(voice => voice.name === options.voice);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`));

      this.synthesis.speak(utterance);
    });
  }

  stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  // Get available voices
  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return [];
    return this.synthesis.getVoices();
  }

  // Check if speech services are supported
  isSpeechRecognitionSupported(): boolean {
    // Force mock mode for testing
    return false;
    // return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  isTextToSpeechSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  // Mock recording timer for practice sessions
  async startPracticeTimer(durationMinutes: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, durationMinutes * 60 * 1000);
    });
  }

  // Analyze speech for feedback (mock implementation)
  analyzeSpeech(transcript: string, duration: number) {
    const words = transcript.split(' ').length;
    const wordsPerMinute = Math.round((words / duration) * 60000);
    
    const feedback = {
      wordsPerMinute,
      totalWords: words,
      duration: Math.round(duration / 1000),
      suggestions: this.generateSuggestions(wordsPerMinute, words, transcript)
    };

    return feedback;
  }

  private generateSuggestions(wpm: number, wordCount: number, transcript: string): string[] {
    const suggestions: string[] = [];

    if (wpm < 120) {
      suggestions.push("Try speaking a bit faster to maintain audience engagement.");
    } else if (wpm > 180) {
      suggestions.push("Slow down slightly to ensure clarity and comprehension.");
    }

    if (wordCount < 10) {
      suggestions.push("Try to elaborate more on your points for better impact.");
    }

    const fillerWords = ['um', 'uh', 'like', 'you know'];
    const hasFillers = fillerWords.some(filler => 
      transcript.toLowerCase().includes(filler)
    );
    
    if (hasFillers) {
      suggestions.push("Work on reducing filler words for more confident delivery.");
    }

    if (suggestions.length === 0) {
      suggestions.push("Great job! Your pacing and content length are well-balanced.");
    }

    return suggestions;
  }
}

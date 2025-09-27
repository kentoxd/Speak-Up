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

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.initSpeechRecognition();
  }

  private initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
    }
  }

  // Speech Recognition (Speech-to-Text)
  async startRecording(): Promise<SpeechRecognitionResult> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        // Mock implementation for browsers that don't support speech recognition
        setTimeout(() => {
          resolve({
            transcript: "This is a mock transcript since speech recognition is not supported in this browser.",
            confidence: 0.95,
            duration: 3000
          });
        }, 3000);
        return;
      }

      this.isRecording = true;
      const startTime = Date.now();

      this.recognition.onresult = (event: any) => {
        const result = event.results[0];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence;
        const duration = Date.now() - startTime;

        resolve({
          transcript,
          confidence,
          duration
        });
      };

      this.recognition.onerror = (event: any) => {
        this.isRecording = false;
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      this.recognition.onend = () => {
        this.isRecording = false;
      };

      try {
        this.recognition.start();
      } catch (error) {
        this.isRecording = false;
        reject(error);
      }
    });
  }

  stopRecording(): void {
    if (this.recognition && this.isRecording) {
      this.recognition.stop();
      this.isRecording = false;
    }
  }

  getIsRecording(): boolean {
    return this.isRecording;
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
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
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

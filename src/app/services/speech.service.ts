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
      this.recognition.maxAlternatives = 1;
    }
  }

  startRecording(): void {
    if (this.isRecording) {
      return;
    }

    if (!this.isSpeechRecognitionSupported()) {
      console.error('Speech Recognition not supported');
      return;
    }

    this.isRecording = true;
    this.currentTranscript = '';
    this.interimTranscript = '';
    this.recordingStartTime = Date.now();

    this.recognition.onstart = () => {
      console.log('Speech recognition started');
    };

    this.recognition.onresult = (event: any) => {
      let interimText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        let transcript = event.results[i][0].transcript.trim();
        const isFinal = event.results[i].isFinal;

        console.log(`%cResult ${i}:`, 'color: blue', `"${transcript}" | isFinal: ${isFinal}`);

        if (isFinal) {
          // Add punctuation to final results
          transcript = this.addSmartPunctuation(transcript);
          console.log(`%cAfter punctuation:`, 'color: green', `"${transcript}"`);
          
          // Append to current transcript with space
          if (this.currentTranscript && !this.currentTranscript.endsWith(' ')) {
            this.currentTranscript += ' ';
          }
          this.currentTranscript += transcript;
          
          console.log(`%cUpdated currentTranscript:`, 'color: red', `"${this.currentTranscript}"`);
        } else {
          // Also add punctuation to interim results for display (but only if matches found)
          const enhancedInterim = this.addSmartPunctuation(transcript, true);
          interimText += enhancedInterim + ' ';
        }
      }

      // Set interim for real-time preview
      this.interimTranscript = interimText.trim();
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
    };

    this.recognition.onend = () => {
      if (this.isRecording) {
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

  getRecordingResult(): SpeechRecognitionResult {
    const duration = this.getRecordingDuration();
    return {
      transcript: this.currentTranscript,
      confidence: this.calculateConfidence(this.currentTranscript),
      duration
    };
  }

  private getRecordingDuration(): number {
    return this.recordingStartTime > 0 ? Date.now() - this.recordingStartTime : 0;
  }

  stopRecording(): void {
    if (this.recognition && this.isRecording) {
      this.recognition.stop();
    }
    this.isRecording = false;
  }

  getIsRecording(): boolean {
    return this.isRecording;
  }

  getCurrentTranscript(): string {
    const combined = this.currentTranscript + (this.interimTranscript ? ' ' + this.interimTranscript : '');
    return combined.trim();
  }

  clearTranscript(): void {
    this.currentTranscript = '';
    this.interimTranscript = '';
    this.targetText = '';
  }

  setTargetText(text: string): void {
    this.targetText = text;
  }

  private addSmartPunctuation(text: string, isInterim: boolean = false): string {
    if (!text) return text;

    // Don't reprocess text that already has punctuation marks throughout
    // Only enhance the last word
    const words = text.split(/\s+/);
    if (words.length === 0) return text;

    const lastWord = words[words.length - 1];
    const precedingText = words.slice(0, -1).join(' ');

    // Check if last word already ends with punctuation
    if (lastWord.match(/[.!?;:]$/)) {
      return text;
    }

    // Match the last word against target text for punctuation
    if (this.targetText) {
      const lastWordClean = lastWord.toLowerCase();
      const targetWords = this.targetText.toLowerCase().split(/\s+/);

      console.log(`%cLast user word: "${lastWordClean}"`, 'color: purple');

      // Find matching word in target to get its punctuation
      for (let j = 0; j < targetWords.length; j++) {
        const targetWord = targetWords[j];
        const cleanTargetWord = targetWord.replace(/[.,!?;:]/g, '');

        if (lastWordClean === cleanTargetWord) {
          // Extract punctuation from target word
          const punctuation = targetWord.match(/[.,!?;:]+$/);
          console.log(`%cMATCH FOUND! Target word: "${targetWord}", Punctuation: "${punctuation ? punctuation[0] : 'none'}"`, 'color: lime; font-weight: bold');
          
          if (punctuation) {
            const result = precedingText ? precedingText + ' ' + lastWord + punctuation[0] : lastWord + punctuation[0];
            return result;
          }
          // If word matches but has no punctuation, don't add anything
          return text;
        }
      }
    }

    // Only add default period if this is a FINAL result, not interim
    if (!isInterim) {
      console.log(`%cNo target match, adding default period`, 'color: orange');
      return text + '.';
    }
    
    // For interim results, don't add punctuation if no match found
    return text;
  }

  private normalizeCommonPatterns(text: string): string {
    let result = text;

    // Fix common contractions
    result = result.replace(/\b(dont)\b/gi, "don't");
    result = result.replace(/\b(cant)\b/gi, "can't");
    result = result.replace(/\b(wont)\b/gi, "won't");
    result = result.replace(/\b(isnt)\b/gi, "isn't");
    result = result.replace(/\b(doesnt)\b/gi, "doesn't");
    result = result.replace(/\b(havent)\b/gi, "haven't");
    result = result.replace(/\b(hasnt)\b/gi, "hasn't");
    result = result.replace(/\b(im)\b/gi, "I'm");
    result = result.replace(/\b(youre)\b/gi, "you're");
    result = result.replace(/\b(theres)\b/gi, "there's");
    result = result.replace(/\b(lets)\b/gi, "let's");

    // Capitalize "I"
    result = result.replace(/\b(i)\b/g, 'I');

    // Remove extra spaces
    result = result.replace(/\s+/g, ' ').trim();

    return result;
  }

  private calculateConfidence(transcript: string): number {
    if (!transcript) return 0;

    const length = transcript.length;
    const words = transcript.split(' ').length;
    const hasPunctuation = /[.!?;:]/.test(transcript);

    let confidence = 0.7;

    if (length > 50) confidence += 0.15;
    if (words > 10) confidence += 0.1;
    if (hasPunctuation) confidence += 0.05;

    return Math.min(0.99, confidence);
  }

  // Text-to-Speech
  async speak(options: TextToSpeechOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Text-to-speech not supported'));
        return;
      }

      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(options.text);
      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;

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

  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return [];
    return this.synthesis.getVoices();
  }

  isSpeechRecognitionSupported(): boolean {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  isTextToSpeechSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  async startPracticeTimer(durationMinutes: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, durationMinutes * 60 * 1000);
    });
  }

  analyzeSpeech(transcript: string, duration: number) {
    const words = transcript.trim().split(/\s+/).filter((w: string) => w.length > 0).length;
    const durationSeconds = duration / 1000;
    const wordsPerMinute = durationSeconds > 0 ? Math.round((words / durationSeconds) * 60) : 0;

    const feedback = {
      wordsPerMinute,
      totalWords: words,
      duration: Math.round(durationSeconds),
      suggestions: this.generateSuggestions(wordsPerMinute, words, transcript)
    };

    return feedback;
  }

  private generateSuggestions(wpm: number, wordCount: number, transcript: string): string[] {
    const suggestions: string[] = [];

    if (wpm < 120) {
      suggestions.push('Try speaking a bit faster to maintain audience engagement (aim for 120-150 WPM).');
    } else if (wpm > 180) {
      suggestions.push('Slow down slightly to ensure clarity and comprehension (aim for 120-150 WPM).');
    } else {
      suggestions.push('Excellent pacing! Your speech rate is well-balanced.');
    }

    if (wordCount < 20) {
      suggestions.push('Try to elaborate more on your points for better impact.');
    } else if (wordCount > 500) {
      suggestions.push('Consider breaking down your speech into shorter, more digestible segments.');
    }

    const fillerWords = ['um', 'uh', 'like', 'you know', 'basically', 'literally'];
    const fillerCount = fillerWords.filter((filler: string) => 
      new RegExp(`\\b${filler}\\b`, 'gi').test(transcript)
    ).length;

    if (fillerCount > 2) {
      suggestions.push('Work on reducing filler words for more confident delivery.');
    }

    const punctuationMarks = (transcript.match(/[.!?]/g) || []).length;
    if (punctuationMarks === 0) {
      suggestions.push('Add more sentence variation with proper punctuation.');
    }

    if (suggestions.length === 0) {
      suggestions.push('Great job overall! Your speech demonstrates good delivery fundamentals.');
    }

    return suggestions;
  }
}
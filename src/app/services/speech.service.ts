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
  private lastProcessedWordIndex = 0;

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
    this.lastProcessedWordIndex = 0;

    this.recognition.onstart = () => {
      console.log('Speech recognition started');
    };

    this.recognition.onresult = (event: any) => {
      let interimText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        let transcript = event.results[i][0].transcript.trim();
        const isFinal = event.results[i].isFinal;

        console.log(`Result ${i}: "${transcript}" | isFinal: ${isFinal}`);

        if (isFinal) {
          // Add punctuation to all words in final result
          transcript = this.addPunctuationToAllWords(transcript);
          console.log(`After punctuation: "${transcript}"`);
          
          // Append to current transcript with space
          if (this.currentTranscript && !this.currentTranscript.endsWith(' ')) {
            this.currentTranscript += ' ';
          }
          this.currentTranscript += transcript;
          
          console.log(`Updated currentTranscript: "${this.currentTranscript}"`);
        } else {
          // For interim results, show live with punctuation
          const enhancedInterim = this.addPunctuationToAllWords(transcript, true);
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

  private addPunctuationToAllWords(text: string, isInterim: boolean = false): string {
    if (!text || !this.targetText) {
      return text;
    }

    const userWords = text.split(/\s+/);
    const targetWords = this.targetText.toLowerCase().split(/\s+/);
    let result = '';
    let targetIndex = 0;

    for (let i = 0; i < userWords.length; i++) {
      const userWord = userWords[i].toLowerCase().replace(/[.,!?;:]/g, '');
      
      if (!userWord) continue;

      let foundMatch = false;
      let matchedPunctuation = '';

      // Try to find matching word in target (with fuzzy matching)
      for (let j = targetIndex; j < Math.min(targetIndex + 5, targetWords.length); j++) {
        const targetWord = targetWords[j].toLowerCase();
        const cleanTargetWord = targetWord.replace(/[.,!?;:]/g, '');
        const punctuation = targetWord.match(/[.,!?;:]+$/)?.[0] || '';

        // Exact match or similar match
        if (userWord === cleanTargetWord || this.isSimilarWord(userWord, cleanTargetWord)) {
          matchedPunctuation = punctuation;
          targetIndex = j + 1;
          foundMatch = true;
          console.log(`✓ Word match: "${userWord}" → "${cleanTargetWord}" (punctuation: "${punctuation}")`);
          break;
        }
      }

      // Add word with punctuation
      if (result) result += ' ';
      result += userWords[i];

      if (foundMatch && matchedPunctuation) {
        result += matchedPunctuation;
      } else if (!isInterim && i === userWords.length - 1 && !userWords[i].match(/[.!?;:]$/)) {
        // Add default period to last word if no match found
        result += '.';
      }
    }

    return result;
  }

  private isSimilarWord(word1: string, word2: string): boolean {
    // Exact match
    if (word1 === word2) return true;

    // Allow small Levenshtein distance
    const distance = this.levenshteinDistance(word1, word2);
    const maxDistance = Math.max(word1.length, word2.length) > 5 ? 2 : 1;
    
    return distance <= maxDistance;
  }

  private levenshteinDistance(s1: string, s2: string): number {
    const track = Array(s2.length + 1).fill(null).map(() => 
      Array(s1.length + 1).fill(0)
    );

    for (let i = 0; i <= s1.length; i++) {
      track[0][i] = i;
    }
    for (let j = 0; j <= s2.length; j++) {
      track[j][0] = j;
    }

    for (let j = 1; j <= s2.length; j++) {
      for (let i = 1; i <= s1.length; i++) {
        const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
        track[j][i] = Math.min(
          track[j][i - 1] + 1,
          track[j - 1][i] + 1,
          track[j - 1][i - 1] + indicator
        );
      }
    }

    return track[s2.length][s1.length];
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
    this.lastProcessedWordIndex = 0;
  }

  setTargetText(text: string): void {
    this.targetText = text;
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
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

  /**
   * Detect filler words in a transcript
   * @param transcript The speech transcript to analyze
   * @returns Object with count, words breakdown, and percentage
   */
  detectFillerWords(transcript: string): { count: number; words: string[]; percentage: number } {
    if (!transcript || transcript.trim() === '') {
      return { count: 0, words: [], percentage: 0 };
    }

    // Define filler words to detect
    const fillerWords = [
      'um', 'uh', 'er', 'like', 'you know', 'so', 'basically', 'literally', 'actually'
    ];

    const totalWords = transcript.trim().split(/\s+/).filter((w: string) => w.length > 0).length;
    const foundFillers: { [key: string]: number } = {};
    let totalFillerCount = 0;

    // Check each filler word
    fillerWords.forEach(filler => {
      // Use word boundaries to avoid partial matches
      const regex = new RegExp(`\\b${filler.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = transcript.match(regex);
      
      if (matches) {
        const count = matches.length;
        foundFillers[filler] = count;
        totalFillerCount += count;
      }
    });

    // Convert to array format for display
    const wordsBreakdown = Object.entries(foundFillers).map(([word, count]) => `${word}: ${count}`);

    // Calculate percentage
    const percentage = totalWords > 0 ? (totalFillerCount / totalWords) * 100 : 0;

    return {
      count: totalFillerCount,
      words: wordsBreakdown,
      percentage: Math.round(percentage * 10) / 10 // Round to 1 decimal place
    };
  }

  /**
   * Get user-friendly feedback based on filler word usage
   * @param fillerCount Number of filler words found
   * @param percentage Percentage of speech that is filler words
   * @returns Feedback string
   */
  getFillerWordFeedback(fillerCount: number, percentage: number): string {
    if (fillerCount === 0) {
      return "Excellent! No filler words detected.";
    } else if (percentage < 2) {
      return `Good job! Only ${fillerCount} filler word${fillerCount > 1 ? 's' : ''} detected (${percentage}%).`;
    } else if (percentage < 5) {
      return `You used ${fillerCount} filler word${fillerCount > 1 ? 's' : ''} (${percentage}%). Try to reduce them.`;
    } else {
      return `You used ${fillerCount} filler word${fillerCount > 1 ? 's' : ''} (${percentage}%). Practice speaking more deliberately to eliminate filler words.`;
    }
  }

  /**
   * Analyze filler words in a transcript and return comprehensive results
   * @param transcript The speech transcript to analyze
   * @returns Object with filler analysis results
   */
  analyzeFillerWords(transcript: string): {
    fillerCount: number;
    fillerPercentage: number;
    fillerBreakdown: string[];
    fillerFeedback: string;
  } {
    const detection = this.detectFillerWords(transcript);
    const feedback = this.getFillerWordFeedback(detection.count, detection.percentage);

    return {
      fillerCount: detection.count,
      fillerPercentage: detection.percentage,
      fillerBreakdown: detection.words,
      fillerFeedback: feedback
    };
  }

  /**
   * Detect repeated words in a transcript
   * @param transcript The speech transcript to analyze
   * @returns Object with count and examples of repeated words
   */
  detectRepeatedWords(transcript: string): { count: number; examples: string[] } {
    if (!transcript || transcript.trim() === '') {
      return { count: 0, examples: [] };
    }

    const words = transcript.trim().split(/\s+/).filter((w: string) => w.length > 0);
    const repeatedWords: { [key: string]: number } = {};
    let totalRepeats = 0;

    // Check for consecutive duplicates
    for (let i = 0; i < words.length - 1; i++) {
      const currentWord = words[i].toLowerCase().replace(/[.,!?;:]/g, '');
      const nextWord = words[i + 1].toLowerCase().replace(/[.,!?;:]/g, '');

      // Only count words longer than 2 characters
      if (currentWord === nextWord && currentWord.length > 2) {
        if (repeatedWords[currentWord]) {
          repeatedWords[currentWord]++;
        } else {
          repeatedWords[currentWord] = 1;
        }
        totalRepeats++;
        i++; // Skip the next word since we've already counted it
      }
    }

    // Convert to examples array (max 3 examples)
    const examples = Object.entries(repeatedWords)
      .slice(0, 3)
      .map(([word, count]) => `"${word}" repeated ${count} time${count > 1 ? 's' : ''}`);

    return {
      count: totalRepeats,
      examples
    };
  }

  /**
   * Analyze speaking rhythm based on sentence length variation
   * @param transcript The speech transcript to analyze
   * @returns Object with rhythm score and feedback
   */
  analyzeSpeakingRhythm(transcript: string): { rhythmScore: number; feedback: string } {
    if (!transcript || transcript.trim() === '') {
      return { rhythmScore: 0.5, feedback: 'Not enough content to analyze rhythm.' };
    }

    // Split into sentences using punctuation
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (sentences.length < 2) {
      return { rhythmScore: 0.5, feedback: 'Not enough sentences to analyze rhythm.' };
    }

    // Calculate word count for each sentence
    const sentenceLengths = sentences.map(sentence => 
      sentence.trim().split(/\s+/).filter(w => w.length > 0).length
    );

    // Calculate average and standard deviation
    const average = sentenceLengths.reduce((sum, len) => sum + len, 0) / sentenceLengths.length;
    const variance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - average, 2), 0) / sentenceLengths.length;
    const stdDev = Math.sqrt(variance);

    // Normalize rhythm score (0-1 scale)
    const rhythmScore = Math.min(stdDev / 10, 1);

    // Generate feedback based on score
    let feedback: string;
    if (rhythmScore < 0.3) {
      feedback = 'Your sentences are very similar in length. Try varying sentence length for better rhythm.';
    } else if (rhythmScore <= 0.7) {
      feedback = 'Your rhythm is decent. You could add more variation for better engagement.';
    } else {
      feedback = 'Great! Your speaking has good rhythm and variation.';
    }

    return { rhythmScore, feedback };
  }

  /**
   * Calculate comprehensive clarity score based on multiple metrics
   * @param transcript The speech transcript
   * @param accuracy Accuracy score (0-100)
   * @param pace Words per minute
   * @returns Object with clarity score and breakdown
   */
  calculateClarityScore(transcript: string, accuracy: number, pace: number): {
    clarityScore: number;
    breakdown: { accuracy: number; pace: number; repetition: number; rhythm: number };
  } {
    // Get repeated words count
    const repeatedWords = this.detectRepeatedWords(transcript);
    const repeatCount = repeatedWords.count;

    // Get rhythm analysis
    const rhythmAnalysis = this.analyzeSpeakingRhythm(transcript);
    const rhythmScore = rhythmAnalysis.rhythmScore;

    // Normalize all scores to 0-1 scale
    const accuracyScore = accuracy / 100;
    const paceScore = Math.min(pace / 150, 1); // Ideal WPM = 150
    const repetitionScore = Math.max(1 - (repeatCount * 0.05), 0.5); // Penalty per repeat, min 0.5

    // Apply weights (must add to 100%)
    // Accuracy: 35%, Pace: 25%, Repetition: 20%, Rhythm: 20%
    const clarityScore = (accuracyScore * 0.35) + (paceScore * 0.25) + (repetitionScore * 0.2) + (rhythmScore * 0.2);

    // Convert to 0-100 scale and round to 2 decimals
    const finalClarityScore = Math.round(clarityScore * 100 * 100) / 100;

    // Return all individual scores also scaled to 0-100
    return {
      clarityScore: finalClarityScore,
      breakdown: {
        accuracy: Math.round(accuracyScore * 100),
        pace: Math.round(paceScore * 100),
        repetition: Math.round(repetitionScore * 100),
        rhythm: Math.round(rhythmScore * 100)
      }
    };
  }

  /**
   * Get clarity feedback based on analysis results
   * @param clarityScore Overall clarity score (0-100)
   * @param repeatedCount Number of repeated words
   * @param rhythmFeedback Rhythm feedback text
   * @returns Array of feedback strings
   */
  getClarityFeedback(clarityScore: number, repeatedCount: number, rhythmFeedback: string): string[] {
    const feedback: string[] = [];

    // Add opening feedback based on score
    if (clarityScore >= 80) {
      feedback.push('Excellent clarity! Your speech was clear and well-delivered.');
    } else if (clarityScore >= 60) {
      feedback.push('Good clarity overall. Minor improvements could help.');
    } else {
      feedback.push('Focus on improving clarity in your next session.');
    }

    // Add repetition feedback if needed
    if (repeatedCount > 2) {
      feedback.push(`Avoid repeating words - detected ${repeatedCount} instances.`);
    }

    // Always add rhythm feedback
    feedback.push(rhythmFeedback);

    return feedback;
  }
}
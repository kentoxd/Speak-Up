import { Injectable } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/compat/functions';

@Injectable({
  providedIn: 'root'
})
export class AiPromptService {
  constructor(private functions: AngularFireFunctions) {}

  async generatePracticePrompt(userInput: string): Promise<string> {
    if (!userInput || !userInput.trim()) {
      throw new Error('Please enter a topic for the prompt');
    }

    try {
      // Use compat syntax
      const generatePrompt = this.functions.httpsCallable('generatePracticePrompt');
      const response: any = await generatePrompt({ userInput: userInput.trim() });

      console.log('✅ Generated Prompt:', response);

      if (!response?.prompt) {
        throw new Error('No prompt generated');
      }
      return response.prompt;

    } catch (error: any) {
      console.error('❌ Error generating prompt:', error);
      throw new Error(
        error?.message || 'Unable to generate a practice prompt. Please try again.'
      );
    }
  }
}

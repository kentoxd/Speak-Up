import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG } from '../config/emailjs.config';

export interface OTPData {
  code: string;
  email: string;
  timestamp: number;
  validationAttempts: number; // Number of times user tried to validate OTP
  sendAttempts: number; // Number of times OTP was sent
  expiresAt: number;
}

@Injectable({
  providedIn: 'root'
})
export class EmailJSService {
  private otpStorage: Map<string, OTPData> = new Map();
  private readonly OTP_EXPIRY_MINUTES = 10;
  private readonly MAX_VALIDATION_ATTEMPTS = 3; // Max attempts to validate OTP
  private readonly MAX_SEND_ATTEMPTS = 3; // Max attempts to send OTP

  constructor() {
    // Initialize EmailJS with config values
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
  }

  // Send password reset OTP
  async sendPasswordResetOTP(email: string): Promise<string> {
    try {
      // Check if email has too many recent send attempts
      const existingOTP = this.otpStorage.get(email);
      if (existingOTP && existingOTP.sendAttempts >= this.MAX_SEND_ATTEMPTS) {
        throw new Error('Too many send attempts. Please try again later.');
      }

      // Generate 6-digit OTP
      const otpCode = this.generateOTP();
      const timestamp = Date.now();
      const expiresAt = timestamp + (this.OTP_EXPIRY_MINUTES * 60 * 1000);

      // Store OTP data
      const otpData: OTPData = {
        code: otpCode,
        email: email,
        timestamp: timestamp,
        validationAttempts: 0, // Reset validation attempts for new OTP
        sendAttempts: existingOTP ? existingOTP.sendAttempts + 1 : 1,
        expiresAt: expiresAt
      };

      this.otpStorage.set(email, otpData);

      // Send email via EmailJS
      const templateParams = {
        email: email,
        passcode: otpCode,
        time: `${this.OTP_EXPIRY_MINUTES} minutes`
      };

      await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams
      );

      console.log('OTP sent successfully to:', email);
      return otpCode;

    } catch (error: any) {
      console.error('Error sending OTP:', error);
      
      // Provide more specific error messages
      if (error.status === 400) {
        throw new Error('Invalid email address or template configuration.');
      } else if (error.status === 401) {
        throw new Error('EmailJS authentication failed. Please check your configuration.');
      } else if (error.status === 403) {
        throw new Error('EmailJS service access denied. Please check your permissions.');
      } else if (error.status === 404) {
        throw new Error('EmailJS service or template not found. Please check your configuration.');
      } else if (error.status === 429) {
        throw new Error('Too many requests. Please try again later.');
      } else if (error.status >= 500) {
        throw new Error('EmailJS service is temporarily unavailable. Please try again later.');
      } else {
        throw new Error('Failed to send OTP. Please check your internet connection and try again.');
      }
    }
  }

  // Resend password reset OTP
  async resendPasswordOTP(email: string): Promise<string> {
    try {
      const existingOTP = this.otpStorage.get(email);
      
      // Check if resend is allowed
      if (existingOTP && existingOTP.sendAttempts >= this.MAX_SEND_ATTEMPTS) {
        throw new Error('Maximum resend attempts reached. Please try again later.');
      }

      // Clear existing OTP and send new one
      this.otpStorage.delete(email);
      return await this.sendPasswordResetOTP(email);

    } catch (error: any) {
      console.error('Error resending OTP:', error);
      throw new Error('Failed to resend OTP. Please try again.');
    }
  }

  // Validate OTP
  validateOTP(email: string, inputOTP: string): boolean {
    try {
      const otpData = this.otpStorage.get(email);
      
      if (!otpData) {
        throw new Error('OTP not found. Please request a new one.');
      }

      // Check if OTP has expired
      if (Date.now() > otpData.expiresAt) {
        this.otpStorage.delete(email);
        throw new Error('OTP has expired. Please request a new one.');
      }

      // Check if too many validation attempts
      if (otpData.validationAttempts >= this.MAX_VALIDATION_ATTEMPTS) {
        this.otpStorage.delete(email);
        throw new Error('Too many validation attempts. Please request a new OTP.');
      }

      // Increment validation attempts
      otpData.validationAttempts++;

      // Check if OTP matches
      if (otpData.code === inputOTP) {
        // Clear OTP after successful validation
        this.otpStorage.delete(email);
        return true;
      } else {
        // Update validation attempts count
        this.otpStorage.set(email, otpData);
        throw new Error('Invalid OTP. Please try again.');
      }

    } catch (error: any) {
      console.error('OTP validation error:', error);
      throw error;
    }
  }

  // Check if OTP exists and is valid (not expired)
  isOTPValid(email: string): boolean {
    const otpData = this.otpStorage.get(email);
    return otpData ? Date.now() <= otpData.expiresAt : false;
  }

  // Get remaining time for OTP
  getOTPRemainingTime(email: string): number {
    const otpData = this.otpStorage.get(email);
    if (!otpData) return 0;
    
    const remaining = otpData.expiresAt - Date.now();
    return Math.max(0, Math.floor(remaining / 1000)); // Return seconds
  }

  // Clear OTP for email
  clearOTP(email: string): void {
    this.otpStorage.delete(email);
  }

  // Clear all OTP data (useful for testing or reset)
  clearAllOTP(): void {
    this.otpStorage.clear();
  }

  // Generate 6-digit OTP
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Check if user can request new OTP (rate limiting)
  canRequestNewOTP(email: string): boolean {
    const otpData = this.otpStorage.get(email);
    if (!otpData) return true;
    
    // Allow new request if OTP is expired or send attempts exceeded
    return Date.now() > otpData.expiresAt || otpData.sendAttempts >= this.MAX_SEND_ATTEMPTS;
  }

  // Send email verification OTP
  async sendEmailVerificationOTP(email: string): Promise<string> {
    try {
      // Check if email has too many recent send attempts
      const existingOTP = this.otpStorage.get(email);
      if (existingOTP && existingOTP.sendAttempts >= this.MAX_SEND_ATTEMPTS) {
        throw new Error('Too many send attempts. Please try again later.');
      }

      // Generate 6-digit OTP
      const otpCode = this.generateOTP();
      const timestamp = Date.now();
      const expiresAt = timestamp + (this.OTP_EXPIRY_MINUTES * 60 * 1000);

      // Store OTP data
      const otpData: OTPData = {
        code: otpCode,
        email: email,
        timestamp: timestamp,
        validationAttempts: 0, // Reset validation attempts for new OTP
        sendAttempts: existingOTP ? existingOTP.sendAttempts + 1 : 1,
        expiresAt: expiresAt
      };

      this.otpStorage.set(email, otpData);

      // Send email via EmailJS
      const templateParams = {
        email: email,
        passcode: otpCode,
        time: `${this.OTP_EXPIRY_MINUTES} minutes`
      };

      await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams
      );

      console.log('Email verification OTP sent successfully to:', email);
      return otpCode;

    } catch (error: any) {
      console.error('Error sending email verification OTP:', error);
      
      // Provide more specific error messages
      if (error.status === 400) {
        throw new Error('Invalid email address or template configuration.');
      } else if (error.status === 401) {
        throw new Error('EmailJS authentication failed. Please check your configuration.');
      } else if (error.status === 403) {
        throw new Error('EmailJS service access denied. Please check your permissions.');
      } else if (error.status === 404) {
        throw new Error('EmailJS service or template not found. Please check your configuration.');
      } else if (error.status === 429) {
        throw new Error('Too many requests. Please try again later.');
      } else if (error.status >= 500) {
        throw new Error('EmailJS service is temporarily unavailable. Please try again later.');
      } else {
        throw new Error('Failed to send verification code. Please check your internet connection and try again.');
      }
    }
  }

  // Verify email OTP
  async verifyEmailOTP(email: string, otpCode: string): Promise<boolean> {
    try {
      const otpData = this.otpStorage.get(email);
      
      if (!otpData) {
        throw new Error('No verification code found. Please request a new one.');
      }

      // Check if OTP has expired
      if (Date.now() > otpData.expiresAt) {
        this.otpStorage.delete(email);
        throw new Error('Verification code has expired. Please request a new one.');
      }

      // Check if too many validation attempts
      if (otpData.validationAttempts >= this.MAX_VALIDATION_ATTEMPTS) {
        this.otpStorage.delete(email);
        throw new Error('Too many verification attempts. Please request a new code.');
      }

      // Increment validation attempt count
      otpData.validationAttempts++;
      this.otpStorage.set(email, otpData);

      // Verify OTP
      if (otpData.code === otpCode) {
        // Clear OTP after successful verification
        this.otpStorage.delete(email);
        console.log('Email verification successful for:', email);
        return true;
      } else {
        throw new Error('Invalid verification code. Please try again.');
      }

    } catch (error: any) {
      console.error('Error verifying email OTP:', error);
      throw error;
    }
  }

  // Debug method to test EmailJS configuration
  async testEmailJSConfiguration(): Promise<boolean> {
    try {
      console.log('Testing EmailJS configuration...');
      console.log('Service ID:', EMAILJS_CONFIG.SERVICE_ID);
      console.log('Template ID:', EMAILJS_CONFIG.TEMPLATE_ID);
      console.log('Public Key:', EMAILJS_CONFIG.PUBLIC_KEY ? 'Set' : 'Not set');

      const testParams = {
        email: 'test@example.com',
        passcode: '123456',
        time: '10 minutes'
      };

      await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        testParams
      );

      console.log('EmailJS configuration test successful!');
      return true;
    } catch (error: any) {
      console.error('EmailJS configuration test failed:', error);
      return false;
    }
  }
}

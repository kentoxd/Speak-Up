import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { User } from 'firebase/auth';

export interface AuthUser {
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  photoURL?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseAuthService {
  user$: Observable<AuthUser | null>;

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore
  ) {
    this.user$ = this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.firestore.doc<AuthUser>(`users/${user.uid}`).valueChanges().pipe(
            map(userData => userData || null)
          );
        } else {
          return of(null);
        }
      })
    );
  }

  // Get current user
  getCurrentUser(): Observable<AuthUser | null> {
    return this.user$;
  }

  // Check if user is authenticated
  isAuthenticated(): Observable<boolean> {
    return this.user$.pipe(map(user => {
      console.log('Auth state check:', !!user, user?.uid);
      return !!user;
    }));
  }

  // Register with email and password
  async register(email: string, password: string, firstName: string, lastName: string): Promise<void> {
    try {
      const result = await this.afAuth.createUserWithEmailAndPassword(email, password);
      
      if (result.user) {
        // Update display name
        const displayName = `${firstName} ${lastName}`;
        await result.user.updateProfile({ displayName });

        // Create user document in Firestore
        await this.createUserDocument(result.user, firstName, lastName);
        
        console.log('Registration successful:', result.user.uid);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<void> {
    try {
      console.log('Attempting to sign in with:', email);
      const result = await this.afAuth.signInWithEmailAndPassword(email, password);
      console.log('Sign in successful:', result.user?.uid);
      
      if (result.user) {
        // Ensure user document exists in Firestore
        await this.ensureUserDocument(result.user);
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      console.log('Firebase error code:', error.code);
      console.log('Firebase error message:', error.message);
      
      // Handle auth/invalid-credential by checking if email exists
      if (error.code === 'auth/invalid-credential') {
        const errorMessage = await this.checkEmailExists(email);
        console.log('Converted error message:', errorMessage);
        throw new Error(errorMessage);
      } else {
        const errorMessage = this.getErrorMessage(error.code);
        console.log('Converted error message:', errorMessage);
        throw new Error(errorMessage);
      }
    }
  }

  // Sign out
  async logout(): Promise<void> {
    try {
      await this.afAuth.signOut();
      console.log('Successfully signed out');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  // Send password reset email (for checking if email exists)
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await this.afAuth.sendPasswordResetEmail(email);
    } catch (error: any) {
      console.error('Password reset email error:', error);
      throw error; // Re-throw to let caller handle the error
    }
  }

  // Reset password for authenticated user
  async resetPassword(email: string, newPassword: string): Promise<void> {
    try {
      // Get the current user
      const user = await this.afAuth.currentUser;
      if (user && user.email === email) {
        // Update password for authenticated user
        await user.updatePassword(newPassword);
        console.log('Password updated successfully');
      } else {
        throw new Error('User not found or email mismatch');
      }
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Update password for unauthenticated user (after OTP verification)
  async updatePasswordWithOTP(email: string, newPassword: string): Promise<void> {
    try {
      // For a simplified flow, we'll use Firebase's password reset email
      // but handle it more gracefully to avoid rate limiting issues
      
      // First, try to send password reset email
      await this.sendPasswordResetEmail(email);
      
      console.log('Password reset email sent successfully');
      
    } catch (error: any) {
      console.error('Password update error:', error);
      
      // If it's a rate limiting error, provide a helpful message
      if (error.code === 'auth/too-many-requests') {
        throw new Error('Firebase has temporarily blocked requests from this device due to unusual activity. Please wait 15-30 minutes, clear your browser cache, and try again. You can also try using a different browser or incognito mode.');
      }
      
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Complete password reset using the reset code from email
  async confirmPasswordReset(code: string, newPassword: string): Promise<void> {
    try {
      // Use Firebase's confirmPasswordReset method
      await this.afAuth.confirmPasswordReset(code, newPassword);
      console.log('Password reset completed successfully');
    } catch (error: any) {
      console.error('Password reset confirmation error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Handle password reset completion from email link
  async handlePasswordResetFromEmail(code: string): Promise<string | null> {
    try {
      // Verify the reset code
      const email = await this.afAuth.verifyPasswordResetCode(code);
      
      // Check if we have a pending password reset for this email
      const pendingReset = localStorage.getItem('pendingPasswordReset');
      if (pendingReset) {
        const resetData = JSON.parse(pendingReset);
        
        // Check if the email matches and the reset is not expired
        if (resetData.email === email && Date.now() < resetData.expiresAt) {
          // Use the stored new password
          await this.confirmPasswordReset(code, resetData.newPassword);
          
          // Clear the pending reset data
          localStorage.removeItem('pendingPasswordReset');
          
          console.log('Password reset completed with stored password');
          return email;
        }
      }
      
      // If no pending reset found, return the email for manual password entry
      return email;
      
    } catch (error: any) {
      console.error('Password reset verification error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Alternative method: Update password using temporary authentication
  async updatePasswordWithTemporaryAuth(email: string, oldPassword: string, newPassword: string): Promise<void> {
    try {
      // Sign in with old password
      const result = await this.afAuth.signInWithEmailAndPassword(email, oldPassword);
      
      if (result.user) {
        // Update password
        await result.user.updatePassword(newPassword);
        console.log('Password updated successfully');
        
        // Sign out the user
        await this.afAuth.signOut();
      }
    } catch (error: any) {
      console.error('Password update error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Create user document in Firestore
  private async createUserDocument(user: any, firstName?: string, lastName?: string): Promise<void> {
    const userData: AuthUser = {
      uid: user.uid,
      email: user.email!,
      firstName: firstName || '',
      lastName: lastName || '',
      displayName: firstName && lastName ? `${firstName} ${lastName}` : user.displayName || '',
      photoURL: user.photoURL || ''
    };

    console.log('Creating user document:', userData);
    await this.firestore.doc(`users/${user.uid}`).set(userData, { merge: true });
    console.log('User document created successfully');
  }

  // Ensure user document exists (for existing users)
  private async ensureUserDocument(user: any): Promise<void> {
    try {
      const userDoc = await this.firestore.doc(`users/${user.uid}`).get().toPromise();
      
      if (!userDoc?.exists) {
        console.log('User document does not exist, creating it...');
        const userData: AuthUser = {
          uid: user.uid,
          email: user.email!,
          firstName: '',
          lastName: '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || ''
        };
        
        await this.firestore.doc(`users/${user.uid}`).set(userData, { merge: true });
        console.log('User document created for existing user');
      } else {
        console.log('User document already exists');
      }
    } catch (error) {
      console.error('Error ensuring user document:', error);
    }
  }

  // Check if email exists by attempting password reset
  private async checkEmailExists(email: string): Promise<string> {
    try {
      // Try to send password reset email - this will fail if email doesn't exist
      await this.afAuth.sendPasswordResetEmail(email);
      // If we get here, email exists but password is wrong
      return 'Invalid password';
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        return 'No account found';
      }
      // If it's a different error, assume email exists but password is wrong
      return 'Invalid password';
    }
  }

  // Get error message for user-friendly display
  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'This email is already registered. Please use a different email.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-not-found':
        return 'No account found';
      case 'auth/wrong-password':
        return 'Invalid password';
      case 'auth/invalid-credential':
        return 'Invalid password'; // Firebase returns this for both wrong password and user not found
      case 'auth/too-many-requests':
        return 'Firebase has temporarily blocked requests from this device due to unusual activity. Please wait 15-30 minutes, clear your browser cache, and try again. You can also try using a different browser or incognito mode.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/requires-recent-login':
        return 'Please sign in again to change your password.';
      default:
        return 'An error occurred. Please try again.';
    }
  }
}

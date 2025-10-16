import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { User } from 'firebase/auth';

export interface AuthUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<AuthUser | null>;

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router
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

  // Sign up with email and password
  async signUp(email: string, password: string, displayName?: string): Promise<any> {
    try {
      const result = await this.afAuth.createUserWithEmailAndPassword(email, password);
      
      if (result.user) {
        // Update display name
        if (displayName) {
          await result.user.updateProfile({ displayName });
        }

        // Create user document in Firestore
        await this.createUserDocument(result.user, displayName);
        
        return { success: true, user: result.user };
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<any> {
    try {
      console.log('Attempting to sign in with:', email);
      const result = await this.afAuth.signInWithEmailAndPassword(email, password);
      console.log('Sign in successful:', result.user?.uid);
      
      if (result.user) {
        // Ensure user document exists in Firestore
        await this.ensureUserDocument(result.user);
      }
      
      return { success: true, user: result.user };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await this.afAuth.signOut();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  // Create user document in Firestore
  private async createUserDocument(user: any, displayName?: string): Promise<void> {
    const userData: AuthUser = {
      uid: user.uid,
      email: user.email!,
      displayName: displayName || user.displayName || '',
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
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      default:
        return 'An error occurred. Please try again.';
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<any> {
    try {
      await this.afAuth.sendPasswordResetEmail(email);
      return { success: true, message: 'Password reset email sent!' };
    } catch (error: any) {
      console.error('Password reset error:', error);
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }
}

# 🔥 Firebase Setup Guide for SpeakUp

## 📋 **Prerequisites**
- Firebase project created at [https://console.firebase.google.com/u/0/project/speakup-32e64/overview](https://console.firebase.google.com/u/0/project/speakup-32e64/overview)
- Node.js and npm installed
- Firebase CLI installed

## 🚀 **Step 1: Install Firebase CLI**
```bash
npm install -g firebase-tools
```

## 🔧 **Step 2: Configure Firebase Project**

### 1. **Get Firebase Config**
1. Go to your Firebase Console: [https://console.firebase.google.com/u/0/project/speakup-32e64/overview](https://console.firebase.google.com/u/0/project/speakup-32e64/overview)
2. Click **Project Settings** (gear icon)
3. Scroll down to **Your apps** section
4. Click **Add app** → **Web** (</>) 
5. Register your app with a nickname like "SpeakUp Web"
6. Copy the Firebase config object

### 2. **Update Firebase Config**
Replace the placeholder values in `src/environments/firebase.config.ts`:

```typescript
export const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "speakup-32e64.firebaseapp.com",
  projectId: "speakup-32e64",
  storageBucket: "speakup-32e64.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id"
};
```

## 🔐 **Step 3: Enable Authentication**
1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Email/Password** authentication
3. Optionally enable **Google** sign-in for easier login

## 🗄️ **Step 4: Set up Firestore Database**
1. Go to **Firestore Database** in Firebase Console
2. Click **Create database**
3. Choose **Start in test mode** (for development)
4. Select a location (choose closest to your users)

## 📊 **Step 5: Deploy Firestore Rules**
```bash
# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init

# Deploy rules and indexes
firebase deploy --only firestore
```

## 🌐 **Step 6: Deploy to Firebase Hosting**
```bash
# Build your app
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

## 📱 **Step 7: Configure PWA (Optional)**
1. In Firebase Console, go to **Project Settings**
2. Scroll to **Web apps** section
3. Click on your web app
4. Add **App check** for additional security
5. Configure **Analytics** if desired

## 🔧 **Step 8: Environment Variables (Production)**
For production deployment, set these environment variables:

```bash
# In your deployment platform (Vercel, Netlify, etc.)
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=speakup-32e64.firebaseapp.com
FIREBASE_PROJECT_ID=speakup-32e64
FIREBASE_STORAGE_BUCKET=speakup-32e64.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
```

## 📈 **Step 9: Enable Analytics (Optional)**
1. In Firebase Console, go to **Analytics**
2. Click **Get started**
3. Follow the setup wizard
4. This will track user engagement and app performance

## 🛡️ **Step 10: Security Rules (Production)**
Update `firestore.rules` for production:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /userProgressions/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public leaderboard (read-only)
    match /leaderboards/{document} {
      allow read: if request.auth != null;
    }
  }
}
```

## 🎯 **Features Enabled**

### ✅ **User Progression Tracking**
- **Level System**: Users gain XP and level up
- **Achievements**: Unlock badges for milestones
- **Streaks**: Track daily practice streaks
- **Goals**: Weekly/monthly practice goals
- **Analytics**: Detailed progress dashboard

### ✅ **Real-time Data**
- **Live Updates**: Progress syncs across devices
- **Offline Support**: Works without internet
- **Cloud Backup**: Data never lost

### ✅ **Advanced Analytics**
- **Practice Statistics**: Accuracy, time, sessions
- **Progress Trends**: Weekly/monthly charts
- **Achievement System**: Gamified learning
- **Leaderboards**: Compare with other users

## 🚀 **Deployment Commands**

```bash
# Build and deploy to Firebase
npm run build
firebase deploy

# Deploy only hosting
firebase deploy --only hosting

# Deploy only Firestore rules
firebase deploy --only firestore

# Deploy everything
firebase deploy
```

## 🔍 **Testing Your Setup**

1. **Build the app**: `npm run build`
2. **Test locally**: `firebase serve`
3. **Check Firebase Console**: Verify data is being saved
4. **Test authentication**: Try signing up/logging in
5. **Test progression**: Complete a practice session

## 📞 **Support**

If you encounter issues:
1. Check Firebase Console for errors
2. Verify your config values
3. Check browser console for errors
4. Ensure Firestore rules are deployed

Your SpeakUp app now has a complete database backend with user progression tracking! 🎉

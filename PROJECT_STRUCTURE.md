# 📁 SpeakUp Project Structure

## 🎯 **Core Application Files**
```
src/
├── app/                          # Main application code
│   ├── components/              # Reusable components
│   │   └── feedback-modal/      # Practice feedback modal
│   ├── models/                  # TypeScript interfaces
│   │   └── user-progression.model.ts
│   ├── pages/                   # Page components
│   │   ├── splash/              # Splash screen
│   │   ├── welcome/             # Onboarding flow
│   │   ├── tabs/                # Main navigation
│   │   ├── home/                # Dashboard
│   │   ├── lessons/             # Lesson list
│   │   ├── lesson-content/      # Individual lessons
│   │   ├── practice/            # Speech practice
│   │   ├── profile/             # User profile & analytics
│   │   ├── faq/                 # Help & FAQ
│   │   └── not-found/           # 404 page
│   ├── services/                # Business logic
│   │   ├── storage.service.ts   # Local storage
│   │   ├── data.service.ts      # Mock data
│   │   ├── speech.service.ts    # Speech recognition
│   │   └── user-progression.service.ts # Firebase integration
│   ├── app.module.ts            # Root module
│   └── app-routing.module.ts    # Main routing
├── assets/                      # Static assets
│   └── icon/                    # App icons
├── environments/                # Environment configs
│   ├── environment.ts           # Development
│   ├── environment.prod.ts      # Production
│   └── firebase.config.ts       # Firebase config
├── theme/                       # Styling
│   └── variables.scss           # Ionic theme variables
├── global.scss                  # Global styles
├── index.html                   # Main HTML
└── main.ts                      # App entry point
```

## 🔧 **Configuration Files**
```
├── angular.json                 # Angular CLI config
├── capacitor.config.ts          # Capacitor config
├── ionic.config.json           # Ionic CLI config
├── package.json                 # Dependencies
├── tsconfig.json               # TypeScript config
└── firebase.json               # Firebase hosting config
```

## 🗄️ **Database & Hosting**
```
├── firestore.rules             # Database security rules
├── firestore.indexes.json      # Database indexes
└── .firebaserc                 # Firebase project config
```

## 📱 **Mobile Development**
```
android/                        # Android platform
├── app/                        # Android app code
├── build.gradle               # Build configuration
├── gradle.properties          # Gradle settings
└── variables.gradle           # SDK versions
```

## 📚 **Documentation**
```
├── README.md                   # Project overview
├── FIREBASE_SETUP.md          # Firebase setup guide
├── CONTENT_EXPANSION_GUIDE.md # Content management guide
└── PROJECT_STRUCTURE.md       # This file
```

## 🚫 **Ignored Files**
```
├── dist/                       # Build output (auto-generated)
├── node_modules/               # Dependencies (auto-installed)
├── .firebase/                  # Firebase cache
├── .angular/                   # Angular cache
└── .git/                       # Git repository data
```

## 🎯 **Key Features by Directory**

### **Speech Practice** (`src/app/pages/practice/`)
- Real-time speech recognition
- Practice type selection (monologue, public speaking, debate)
- Difficulty levels (beginner, intermediate, advanced)
- Detailed feedback with accuracy metrics
- Progress tracking integration

### **User Analytics** (`src/app/pages/profile/`)
- User progression dashboard
- Achievement system
- Level and XP tracking
- Practice statistics
- Goal progress monitoring

### **Database Integration** (`src/app/services/user-progression.service.ts`)
- Firebase Firestore integration
- Real-time data synchronization
- User progression tracking
- Achievement system
- Analytics and reporting

### **Mobile Support** (`android/`)
- Android APK generation
- Native device features
- Capacitor integration
- PWA capabilities

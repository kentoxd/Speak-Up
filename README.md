# SpeakUp

Modern Ionic + Angular app for mastering public speaking, featuring lessons, guided practice, progress tracking, and profile management.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Ionic CLI (`npm install -g @ionic/cli`)
- Angular CLI (`npm install -g @angular/cli`)

### Installation

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd speakup-app
   npm install
   ```

2. **Run Development Server**
   ```bash
   ionic serve
   ```
   App will open at `http://localhost:8100`

3. **Build for Production**
   ```bash
   ionic build --prod
   ```

### Mobile Development

4. **Add Platforms**
   ```bash
   ionic capacitor add ios
   ionic capacitor add android
   ```

5. **Run on Device**
   ```bash
   ionic capacitor run ios
   ionic capacitor run android
   ```

## 📱 Features

### Core Pages
- **Splash Screen**: App branding and loading
- **Welcome Flow**: Onboarding with user setup
- **Home Dashboard**: Progress overview and quick actions
- **Lessons**: Structured learning with quizzes
- **Practice**: Guided speaking exercises with mock recording
- **Profile**: User stats, achievements, and settings
- **FAQ**: Frequently asked questions

### Key Functionality
- ✅ **Tabs Navigation**: Bottom tab bar with 5 main sections
- ✅ **Progress Tracking**: Lesson completion and streaks
- ✅ **Dark Theme**: Toggle between light and dark modes
- ✅ **Storage**: Persistent data with Ionic Storage
- ✅ **Speech Services**: Mock speech recognition and text-to-speech
- ✅ **PWA Ready**: Manifest and service worker configuration
- ✅ **Responsive**: Works on mobile, tablet, and desktop

## 🏗️ Project Structure

```
src/
├── app/
│   ├── pages/
│   │   ├── splash/           # App loading screen
│   │   ├── welcome/          # Onboarding flow
│   │   ├── home/             # Main dashboard
│   │   ├── lessons/          # Lessons list
│   │   ├── lesson-content/   # Individual lesson view
│   │   ├── practice/         # Practice exercises
│   │   ├── profile/          # User profile & settings
│   │   ├── faq/              # FAQ page
│   │   └── not-found/        # 404 page
│   ├── services/
│   │   ├── data.service.ts     # Mock data and content
│   │   ├── storage.service.ts  # Persistent storage
│   │   └── speech.service.ts   # Speech recognition/synthesis
│   ├── tabs/                 # Main tabs layout
│   ├── app.component.*       # Root component
│   ├── app.module.ts         # Main app module
│   └── app-routing.module.ts # App routing configuration
├── theme/
│   └── variables.scss        # Ionic theme variables
├── global.scss              # Global styles and dark theme
├── index.html              # PWA configuration
├── manifest.json           # PWA manifest
└── main.ts                # App bootstrap
```

## 🎨 Styling & Theming

### Typography
- **Headings**: Playfair Display (serif)
- **Body Text**: Source Sans 3 (sans-serif)  
- **Quotes**: Cormorant Garamond (serif)

### Theme Support
- Light and dark themes with automatic system detection
- Custom color palette optimized for accessibility
- Consistent spacing and border radius variables

### Dark Mode
```typescript
// Toggle programmatically
await this.storageService.setDarkModeEnabled(true);
document.body.classList.toggle('dark', true);
```

## 📊 Data & Services

### StorageService
```typescript
// User profile management
await storageService.setUserProfile(profile);
const profile = await storageService.getUserProfile();

// Progress tracking
await storageService.setLessonProgress(lessonId, progress);
const progress = await storageService.getLessonProgress(lessonId);

// Settings
await storageService.setDarkModeEnabled(true);
```

### DataService
```typescript
// Get lessons and content
const lessons = dataService.getLessons();
const lesson = dataService.getLesson(id);

// Practice exercises
const exercises = dataService.getPracticeExercises();

// Motivational content
const quote = dataService.getRandomQuote();
```

### SpeechService
```typescript
// Speech recognition (with fallback)
const result = await speechService.startRecording();

// Text-to-speech
await speechService.speak({ text: "Hello world" });

// Feature detection
const isSupported = speechService.isSpeechRecognitionSupported();
```

## 🚀 Deployment

### PWA Deployment
1. Build the app: `ionic build --prod`
2. Deploy `dist/` folder to any static hosting service
3. Ensure HTTPS for full PWA functionality

### Mobile App Deployment
1. Add platforms: `ionic capacitor add ios android`
2. Build: `ionic capacitor build ios android`
3. Open in native IDE: `ionic capacitor open ios`
4. Follow platform-specific deployment guides

## 🧪 Development

### Development Scripts
```bash
npm start          # Start dev server
npm run build      # Build for production
npm run test       # Run unit tests
npm run lint       # Run ESLint
ionic generate page example  # Generate new page
ionic generate service example  # Generate new service
```

### Adding New Content

#### Add a New Lesson
```typescript
// In data.service.ts, add to getLessons() array:
{
  id: 'new-lesson',
  title: 'Lesson Title',
  description: 'Lesson description',
  duration: '15 min',
  difficulty: 'beginner',
  category: 'New Category',
  content: [
    {
      type: 'text',
      title: 'Section Title',
      content: 'Section content...'
    }
  ]
}
```

#### Add a Practice Exercise
```typescript
// In data.service.ts, add to getPracticeExercises() array:
{
  id: 'new-exercise',
  title: 'Exercise Title',
  description: 'Exercise description',
  type: 'speech',
  timeLimit: 5,
  prompts: ['Prompt 1', 'Prompt 2'],
  tips: ['Tip 1', 'Tip 2']
}
```

## 🔧 Customization

### Changing Colors
Edit `src/theme/variables.scss` to modify the color palette:
```scss
:root {
  --ion-color-primary: #your-color;
  --ion-color-secondary: #your-color;
}
```

### Adding New Pages
```bash
ionic generate page pages/your-page-name
```
Don't forget to add routing in `app-routing.module.ts` or `tabs-routing.module.ts`.

## 📝 Next Steps

### Potential Enhancements
- Real audio recording and playback
- Backend integration for user accounts
- Advanced analytics dashboard  
- Offline support with background sync
- Push notifications for practice reminders
- Social features and community
- AI-powered feedback analysis

### Known Limitations
- Speech recognition is browser-dependent
- Audio recording uses mock implementation
- No real-time audio analysis
- Limited offline functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ using Ionic + Angular

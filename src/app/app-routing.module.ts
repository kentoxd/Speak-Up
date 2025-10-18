import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/splash',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    children: [
      { 
        path: 'splash', 
        loadChildren: () => import('./pages/auth/splash-screen/splash-screen.module').then(m => m.SplashScreenComponentModule) 
      },
      { 
        path: 'landing', 
        loadChildren: () => import('./pages/auth/landing-page/landing-page.module').then(m => m.LandingPageComponentModule) 
      },
      { 
        path: 'register', 
        loadChildren: () => import('./pages/auth/registration-page/registration-page.module').then(m => m.RegistrationPageComponentModule) 
      },
      { 
        path: 'signin', 
        loadChildren: () => import('./pages/auth/signin-page/signin-page.module').then(m => m.SignInPageComponentModule) 
      },
      { 
        path: 'forgot-password', 
        loadChildren: () => import('./pages/auth/forgot-password-page/forgot-password-page.module').then(m => m.ForgotPasswordPageComponentModule) 
      },
      { 
        path: 'otp', 
        loadChildren: () => import('./pages/auth/otp-page/otp-page.module').then(m => m.OTPPageComponentModule) 
      },
            {
              path: 'create-password',
              loadChildren: () => import('./pages/auth/create-new-password-page/create-new-password-page.module').then(m => m.CreateNewPasswordPageComponentModule)
            },
            {
              path: 'email-verification',
              loadChildren: () => import('./pages/auth/email-verification-page/email-verification-page.module').then(m => m.EmailVerificationPageComponentModule)
            },
            {
              path: '',
              redirectTo: 'splash',
              pathMatch: 'full'
            }
    ]
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'lesson-content/:id',
    loadChildren: () => import('./pages/lesson-content/lesson-content.module').then(m => m.LessonContentPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'faq',
    loadChildren: () => import('./pages/faq/faq.module').then(m => m.FaqPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'not-found',
    loadChildren: () => import('./pages/not-found/not-found.module').then(m => m.NotFoundPageModule)
  },
  {
    path: 'topic-lessons/:id',
    loadChildren: () => import('./pages/topic-lessons/topic-lessons.module').then( m => m.TopicLessonsPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'topic-quiz/:id',
    loadChildren: () => import('./pages/topic-quiz/topic-quiz.module').then( m => m.TopicQuizPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'quiz-results/:id',
    loadChildren: () => import('./pages/quiz-results/quiz-results.module').then( m => m.QuizResultsPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: '/not-found'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}

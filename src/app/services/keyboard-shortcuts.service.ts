import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean; // Cmd on Mac
  action: string;
  params?: any[];
  description: string;
  category: 'navigation' | 'practice' | 'general';
}

@Injectable({
  providedIn: 'root'
})
export class KeyboardShortcutsService {
  private shortcuts: KeyboardShortcut[] = [
    // Navigation shortcuts
    {
      key: 'h',
      ctrl: true,
      action: 'navigate',
      params: ['/tabs/home'],
      description: 'Go to Home',
      category: 'navigation'
    },
    {
      key: 'l',
      ctrl: true,
      action: 'navigate',
      params: ['/tabs/lessons'],
      description: 'Go to Lessons',
      category: 'navigation'
    },
    {
      key: 'p',
      ctrl: true,
      action: 'navigate',
      params: ['/tabs/practice'],
      description: 'Go to Practice',
      category: 'navigation'
    },
    {
      key: 'u',
      ctrl: true,
      action: 'navigate',
      params: ['/tabs/profile'],
      description: 'Go to Profile',
      category: 'navigation'
    },
    // Practice shortcuts
    {
      key: ' ',
      ctrl: false,
      action: 'practice:start-recording',
      description: 'Start/Stop Recording (Space)',
      category: 'practice'
    },
    {
      key: 'Escape',
      action: 'practice:stop-practice',
      description: 'Stop Practice Session',
      category: 'practice'
    },
    {
      key: 'r',
      ctrl: true,
      action: 'practice:retry',
      description: 'Retry Practice (Ctrl+R)',
      category: 'practice'
    },
    // General shortcuts
    {
      key: '?',
      action: 'show-help',
      description: 'Show Keyboard Shortcuts',
      category: 'general'
    }
  ];

  private shortcutSubject = new Subject<KeyboardShortcut>();
  public shortcut$ = this.shortcutSubject.asObservable();

  constructor(
    private router: Router,
    private platform: Platform
  ) {
    if (!this.platform.is('cordova') && !this.platform.is('capacitor')) {
      // Only enable on web platform
      this.init();
    }
  }

  private init(): void {
    document.addEventListener('keydown', (event: KeyboardEvent) => {
      this.handleKeyPress(event);
    });
  }

  private handleKeyPress(event: KeyboardEvent): void {
    // Don't handle shortcuts when user is typing in input/textarea
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      // Allow Escape key to work even in inputs
      if (event.key !== 'Escape') {
        return;
      }
    }

    const shortcut = this.findShortcut(event);
    if (shortcut) {
      event.preventDefault();
      event.stopPropagation();
      this.executeShortcut(shortcut, event);
    }
  }

  private findShortcut(event: KeyboardEvent): KeyboardShortcut | null {
    return this.shortcuts.find(s => {
      const keyMatch = s.key.toLowerCase() === event.key.toLowerCase() || 
                      s.key === event.key;
      const ctrlMatch = (s.ctrl && event.ctrlKey) || (!s.ctrl && !event.ctrlKey);
      const shiftMatch = (s.shift && event.shiftKey) || (!s.shift && !event.shiftKey);
      const altMatch = (s.alt && event.altKey) || (!s.alt && !event.altKey);
      const metaMatch = (s.meta && event.metaKey) || (!s.meta && !event.metaKey);

      return keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch;
    }) || null;
  }

  private executeShortcut(shortcut: KeyboardShortcut, event: KeyboardEvent): void {
    this.shortcutSubject.next(shortcut);

    switch (shortcut.action) {
      case 'navigate':
        if (shortcut.params && shortcut.params[0]) {
          this.router.navigate([shortcut.params[0]]);
        }
        break;
      case 'practice:start-recording':
      case 'practice:stop-practice':
      case 'practice:retry':
      case 'show-help':
        // These actions are handled by components listening to shortcut$
        break;
      default:
        console.log('Unknown shortcut action:', shortcut.action);
    }
  }

  getShortcuts(): KeyboardShortcut[] {
    return [...this.shortcuts];
  }

  getShortcutsByCategory(category: string): KeyboardShortcut[] {
    return this.shortcuts.filter(s => s.category === category);
  }

  formatShortcutDisplay(shortcut: KeyboardShortcut): string {
    const parts: string[] = [];
    
    if (shortcut.ctrl || shortcut.meta) {
      // Check if on Mac (desktop platform and navigator indicates Mac)
      const isMac = this.platform.is('desktop') && 
                   typeof navigator !== 'undefined' && 
                   navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      parts.push(this.platform.is('ios') || isMac ? '⌘' : 'Ctrl');
    }
    if (shortcut.shift) {
      parts.push('Shift');
    }
    if (shortcut.alt) {
      parts.push('Alt');
    }
    if (shortcut.meta && !shortcut.ctrl) {
      parts.push('⌘');
    }
    
    let key = shortcut.key;
    if (key === ' ') {
      key = 'Space';
    }
    parts.push(key);
    
    return parts.join(' + ');
  }
}


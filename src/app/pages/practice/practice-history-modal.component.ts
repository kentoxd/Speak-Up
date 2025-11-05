import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-practice-history-modal',
  templateUrl: './practice-history-modal.component.html',
  styleUrls: ['./practice-history-modal.component.scss']
})
export class PracticeHistoryModalComponent implements OnInit, OnDestroy {
  @Input() sessions: any[] = [];
  expandedIndex: number | null = null;
  playingSessionIndex: number | null = null;
  private currentAudio: HTMLAudioElement | null = null;

  constructor(private modalController: ModalController) {}

  ngOnInit() {
    // Sort sessions by most recent
    this.sessions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  ngOnDestroy() {

  }

  dismiss() {
    this.modalController.dismiss();
  }
  toggleExpand(index: number) {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }

  trackBySessionId(index: number) {
    return index;
  }

  getTotalDuration(): number {
    return Math.round(
      this.sessions.reduce((total, session) => total + (session.duration || 0), 0) / 60000
    );
  }

  getAverageAccuracy(): number {
    if (this.sessions.length === 0) return 0;
    const total = this.sessions.reduce((sum, session) => sum + (session.analysis?.overallAccuracy || session.accuracy || 0), 0);
    return Math.round(total / this.sessions.length);
  }

  formatDate(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  formatFullDateTime(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDuration(ms: number): string {
    const minutes = Math.round(ms / 60000);
    return `${minutes} min`;
  }

  getPracticeTypeLabel(type: string): string {
    const typeMap: { [key: string]: string } = {
      'monologue': 'Monologue',
      'public-speaking': 'Public Speaking',
      'publicSpeaking': 'Public Speaking',
      'debate-speech': 'Debate Speech',
      'debate': 'Debate Speech'
    };
    return typeMap[type] || type || 'Unknown';
  }

  getAccuracyColor(accuracy: number): string {
    if (accuracy >= 80) return 'success';
    if (accuracy >= 60) return 'warning';
    return 'danger';
  }

  getSessionAccuracy(session: any): number {
    // Try multiple sources for accuracy
    const accuracy = session.analysis?.overallAccuracy || 
                     session.accuracy || 
                     session.analysis?.accuracy || 
                     0;
    
    // If accuracy is 0 or undefined, try to calculate from word and punctuation accuracy
    if (accuracy === 0 && session.analysis) {
      const wordAccuracy = session.analysis.wordAccuracy || 0;
      const punctuationAccuracy = session.analysis.punctuationAccuracy || 0;
      if (wordAccuracy > 0 || punctuationAccuracy > 0) {
        // Calculate overall accuracy: 70% word + 30% punctuation
        return Math.round((wordAccuracy * 0.7) + (punctuationAccuracy * 0.3));
      }
    }
    
    return Math.round(accuracy);
  }

  getClarityClass(score: number): string {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    return 'poor';
  }


}
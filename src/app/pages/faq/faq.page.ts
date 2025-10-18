import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.page.html',
  styleUrls: ['./faq.page.scss'],
})
export class FaqPage implements OnInit {

  faqs = [
    {
      question: "How do I complete lessons?",
      answer: "Go to the Lessons tab and select a lesson. Follow the instructions and practice speaking. Each lesson is designed to improve specific aspects of your public speaking skills.",
      expanded: false
    },
    {
      question: "How does practice work?",
      answer: "Use the Practice tab to improve your speaking skills with different exercises. You can practice monologues, public speaking scenarios, and debate topics. The app will provide real-time feedback on your performance.",
      expanded: false
    },
    {
      question: "How do I track my progress?",
      answer: "Your progress is automatically tracked and displayed in your Profile tab. You can see your completed lessons, current streak, achievements, and detailed analytics about your speaking practice.",
      expanded: false
    },
    {
      question: "Can I change my profile?",
      answer: "Yes! Tap the edit button in your Profile tab to update your information including your name, email, bio, and avatar.",
      expanded: false
    },
    {
      question: "How do I reset my password?",
      answer: "Go to Sign In and tap 'Forgot Password' to reset your password via email. You'll receive a link to create a new password.",
      expanded: false
    },
    {
      question: "What types of practice are available?",
      answer: "We offer three main types of practice: Monologue practice for individual speaking, Public Speaking for presentation skills, and Debate practice for argumentative speaking. Each type helps develop different aspects of your communication skills.",
      expanded: false
    },
    {
      question: "How are achievements earned?",
      answer: "Achievements are earned by completing various milestones like finishing your first practice session, maintaining a streak, completing lessons, or reaching accuracy goals. Check your Profile tab to see all available achievements.",
      expanded: false
    },
    {
      question: "Can I practice offline?",
      answer: "Some features require an internet connection for real-time feedback and progress tracking. However, you can review completed lessons and access basic practice materials offline.",
      expanded: false
    },
    {
      question: "How accurate is the speech feedback?",
      answer: "Our speech recognition technology provides detailed feedback on pronunciation, pace, clarity, and confidence. The accuracy improves with each practice session as the system learns your speaking patterns.",
      expanded: false
    },
    {
      question: "Is my data secure?",
      answer: "Yes, we take your privacy seriously. All your practice data and progress are encrypted and stored securely. We never share your personal information with third parties.",
      expanded: false
    }
  ];

  constructor(private router: Router) { }

  ngOnInit() {
  }

  toggleFAQ(index: number) {
    this.faqs[index].expanded = !this.faqs[index].expanded;
  }

}
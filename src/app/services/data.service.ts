import { Injectable } from '@angular/core';

export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  content: LessonContent[];
  quiz?: Quiz;
}

export interface LessonContent {
  type: 'text' | 'video' | 'audio' | 'exercise';
  title: string;
  content: string;
  videoUrl?: string;
  audioUrl?: string;
}

export interface Quiz {
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface PracticeExercise {
  id: string;
  title: string;
  description: string;
  type: 'speech' | 'presentation' | 'impromptu' | 'storytelling';
  timeLimit: number; // in minutes
  prompts: string[];
  tips: string[];
}

export interface MotivationalQuote {
  text: string;
  author: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor() { }

  // Mock Lessons Data
  getLessons(): Lesson[] {
    return [
      {
        id: '1',
        title: 'Introduction to Public Speaking',
        description: 'Learn the fundamentals of effective public speaking',
        duration: '15 min',
        difficulty: 'beginner',
        category: 'Basics',
        content: [
          {
            type: 'text',
            title: 'What is Public Speaking?',
            content: 'Public speaking is the act of delivering a speech or presentation to a live audience. It is a valuable skill that can boost your career, build confidence, and help you connect with others.'
          },
          {
            type: 'text',
            title: 'Key Elements',
            content: 'The three main elements of public speaking are: 1) Content - what you say, 2) Delivery - how you say it, 3) Connection - how you engage your audience.'
          }
        ],
        quiz: {
          questions: [
            {
              question: 'What are the three main elements of public speaking?',
              options: ['Content, Delivery, Connection', 'Voice, Body, Mind', 'Preparation, Practice, Performance'],
              correctAnswer: 0,
              explanation: 'The three main elements are Content (what you say), Delivery (how you say it), and Connection (audience engagement).'
            }
          ]
        }
      },
      {
        id: '2',
        title: 'Overcoming Stage Fright',
        description: 'Techniques to manage anxiety and build confidence',
        duration: '20 min',
        difficulty: 'beginner',
        category: 'Confidence',
        content: [
          {
            type: 'text',
            title: 'Understanding Stage Fright',
            content: 'Stage fright is completely normal and affects even experienced speakers. It\'s your body\'s natural response to a perceived threat.'
          },
          {
            type: 'text',
            title: 'Breathing Techniques',
            content: 'Deep breathing exercises can help calm your nerves. Try the 4-7-8 technique: breathe in for 4 counts, hold for 7, exhale for 8.'
          }
        ]
      },
      {
        id: '3',
        title: 'Voice and Delivery',
        description: 'Master your voice, pace, and delivery techniques',
        duration: '25 min',
        difficulty: 'intermediate',
        category: 'Delivery',
        content: [
          {
            type: 'text',
            title: 'Voice Projection',
            content: 'Learn to project your voice effectively without straining your vocal cords.'
          },
          {
            type: 'text',
            title: 'Pace and Rhythm',
            content: 'Varying your pace keeps your audience engaged and helps emphasize key points.'
          }
        ]
      },
      {
        id: '4',
        title: 'Body Language Mastery',
        description: 'Use gestures, posture, and movement effectively',
        duration: '18 min',
        difficulty: 'intermediate',
        category: 'Body Language',
        content: [
          {
            type: 'text',
            title: 'The Power of Posture',
            content: 'Good posture conveys confidence and authority. Stand tall with shoulders back and feet shoulder-width apart.'
          }
        ]
      },
      {
        id: '5',
        title: 'Advanced Storytelling',
        description: 'Craft compelling narratives that captivate audiences',
        duration: '30 min',
        difficulty: 'advanced',
        category: 'Storytelling',
        content: [
          {
            type: 'text',
            title: 'Story Structure',
            content: 'Every great story has a clear beginning, middle, and end with conflict and resolution.'
          }
        ]
      }
    ];
  }

  getLesson(id: string): Lesson | undefined {
    return this.getLessons().find(lesson => lesson.id === id);
  }

  // Mock Practice Exercises
  getPracticeExercises(): PracticeExercise[] {
    return [
      {
        id: 'p1',
        title: 'Impromptu Speech',
        description: 'Practice speaking spontaneously on random topics',
        type: 'impromptu',
        timeLimit: 3,
        prompts: [
          'Describe your perfect day',
          'If you could have dinner with anyone, who would it be?',
          'What\'s the best advice you\'ve ever received?',
          'Describe a place that makes you feel peaceful'
        ],
        tips: [
          'Take a moment to think before speaking',
          'Use the PREP structure: Point, Reason, Example, Point',
          'Keep it simple and authentic'
        ]
      },
      {
        id: 'p2',
        title: 'Presentation Practice',
        description: 'Practice delivering a structured presentation',
        type: 'presentation',
        timeLimit: 5,
        prompts: [
          'Present your favorite hobby to beginners',
          'Explain a recent news event',
          'Describe the benefits of learning a new skill'
        ],
        tips: [
          'Start with a clear outline',
          'Use visual aids if possible',
          'Practice your transitions'
        ]
      },
      {
        id: 'p3',
        title: 'Storytelling Session',
        description: 'Practice telling engaging personal stories',
        type: 'storytelling',
        timeLimit: 4,
        prompts: [
          'Tell about a time you overcame a challenge',
          'Share a funny childhood memory',
          'Describe a moment that changed your perspective'
        ],
        tips: [
          'Use vivid details and emotions',
          'Have a clear beginning, middle, and end',
          'Practice your pacing and pauses'
        ]
      }
    ];
  }

  getPracticeExercise(id: string): PracticeExercise | undefined {
    return this.getPracticeExercises().find(exercise => exercise.id === id);
  }

  // Motivational Quotes
  getMotivationalQuotes(): MotivationalQuote[] {
    return [
      {
        text: "The only way to do great work is to love what you do.",
        author: "Steve Jobs"
      },
      {
        text: "It usually takes me more than three weeks to prepare a good impromptu speech.",
        author: "Mark Twain"
      },
      {
        text: "There are two types of speakers: those who get nervous and those who are liars.",
        author: "Mark Twain"
      },
      {
        text: "The human brain starts working the moment you are born and never stops until you stand up to speak in public.",
        author: "George Jessel"
      },
      {
        text: "Public speaking is the art of diluting a two-minute idea with a two-hour vocabulary.",
        author: "Evan Esar"
      }
    ];
  }

  getRandomQuote(): MotivationalQuote {
    const quotes = this.getMotivationalQuotes();
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  // FAQ Data
  getFAQs() {
    return [
      {
        question: "How often should I practice public speaking?",
        answer: "Consistency is key! We recommend practicing at least 15-20 minutes daily. Regular practice helps build muscle memory and confidence."
      },
      {
        question: "What if I forget what to say during a speech?",
        answer: "Don't panic! Take a pause, breathe, and refer to your notes if available. You can also acknowledge the moment with humor if appropriate."
      },
      {
        question: "How can I make my speech more engaging?",
        answer: "Use stories, ask questions, vary your voice, include the audience, and use appropriate gestures. Visual aids can also help maintain interest."
      },
      {
        question: "Is it normal to feel nervous before speaking?",
        answer: "Absolutely! Even experienced speakers feel nervous. The key is learning to manage and channel that energy positively."
      },
      {
        question: "How long should my speech be?",
        answer: "It depends on the context, but generally: elevator pitch (30 seconds), short presentation (3-5 minutes), standard speech (10-15 minutes)."
      }
    ];
  }
}

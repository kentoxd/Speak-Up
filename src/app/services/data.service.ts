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

export interface StructuredPractice {
  type: 'monologue' | 'public-speaking' | 'debate-speech';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  title: string;
  description: string;
  practiceText: string;
  targetText: string; // The text the user should read
  timeLimit: number; // in minutes
  tips: string[];
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

  // Structured Practice Content
  getStructuredPracticeContent(): StructuredPractice[] {
    return [
      // MONOLOGUE PRACTICES
      {
        type: 'monologue',
        difficulty: 'beginner',
        title: 'Personal Story Monologue',
        description: 'Share a meaningful personal experience',
        practiceText: 'Tell a story about a time when you overcame a challenge. Focus on the emotions you felt, the obstacles you faced, and what you learned from the experience. Remember to speak clearly and at a comfortable pace.',
        targetText: 'When I was in college, I faced my biggest fear: public speaking. My hands were shaking, my voice was trembling, but I took a deep breath and began my presentation. By the end, I realized that my audience wanted me to succeed, and that gave me the confidence I needed.',
        timeLimit: 3,
        tips: [
          'Start with a clear setting',
          'Include emotional details',
          'End with a lesson learned',
          'Use pauses for emphasis'
        ]
      },
      {
        type: 'monologue',
        difficulty: 'intermediate',
        title: 'Character Monologue',
        description: 'Deliver a monologue from a character\'s perspective',
        practiceText: 'Imagine you are a successful entrepreneur giving advice to your younger self. Speak about the mistakes you made, the lessons you learned, and the wisdom you would share. Embody the confidence and experience of this character.',
        targetText: 'If I could go back and tell my younger self one thing, it would be this: failure is not the opposite of success, it\'s a stepping stone to it. Every mistake I made taught me something valuable, and every setback made me stronger. Trust the process, stay persistent, and never stop learning.',
        timeLimit: 4,
        tips: [
          'Adopt the character\'s mannerisms',
          'Change your vocal tone appropriately',
          'Maintain character consistency',
          'Use appropriate gestures'
        ]
      },
      {
        type: 'monologue',
        difficulty: 'advanced',
        title: 'Dramatic Monologue',
        description: 'Perform an emotionally complex monologue',
        practiceText: 'Deliver a monologue about standing up for something you believe in, even when it was difficult. Show the internal conflict, the moment of decision, and the aftermath. Use dynamic vocal range and powerful gestures to convey deep emotion.',
        targetText: 'I stood there, trembling, knowing that speaking up would cost me everything I had worked for. But silence would cost me my soul. So I took a deep breath, looked into their eyes, and said what needed to be said. The room fell silent, but I had found my voice.',
        timeLimit: 5,
        tips: [
          'Build emotional intensity gradually',
          'Use full vocal range',
          'Incorporate powerful pauses',
          'Connect with personal truth'
        ]
      },

      // PUBLIC SPEAKING PRACTICES
      {
        type: 'public-speaking',
        difficulty: 'beginner',
        title: 'Introduction Speech',
        description: 'Introduce yourself to an audience',
        practiceText: 'Introduce yourself to a group of new colleagues. Share your background, your role, one interesting fact about yourself, and what you hope to contribute to the team. Keep it professional yet personable.',
        targetText: 'Good morning everyone! I\'m excited to be joining this amazing team. I bring five years of experience in project management and a passion for innovative solutions. What makes me unique is my love for mountain climbing, which has taught me that every challenge is just another peak to conquer.',
        timeLimit: 2,
        tips: [
          'Start with a friendly greeting',
          'Speak loudly enough for everyone to hear',
          'Make eye contact with different sections',
          'End with enthusiasm'
        ]
      },
      {
        type: 'public-speaking',
        difficulty: 'intermediate',
        title: 'Informative Presentation',
        description: 'Teach the audience something new',
        practiceText: 'Explain the importance of time management to a group of students. Cover why it matters, provide 3 practical strategies, and conclude with an inspiring call to action. Structure your speech with clear introduction, body, and conclusion.',
        targetText: 'Time management isn\'t just about productivity; it\'s about freedom. First, prioritize your tasks using the urgent-important matrix. Second, eliminate distractions by creating focused work blocks. Third, learn to say no to non-essential commitments. Remember, you can\'t manage time, but you can manage yourself.',
        timeLimit: 5,
        tips: [
          'Use the rule of three',
          'Provide concrete examples',
          'Engage with rhetorical questions',
          'Summarize key points'
        ]
      },
      {
        type: 'public-speaking',
        difficulty: 'advanced',
        title: 'Persuasive Speech',
        description: 'Convince the audience to take action',
        practiceText: 'Persuade a city council to invest in renewable energy infrastructure. Present the environmental benefits, economic advantages, and long-term sustainability. Address potential concerns and end with a compelling call for immediate action.',
        targetText: 'The future of our city depends on the decisions we make today. Renewable energy isn\'t just environmentally responsible; it\'s economically smart. Studies show that every dollar invested in clean energy creates three times more jobs than fossil fuels. The question isn\'t whether we can afford to act, but whether we can afford not to.',
        timeLimit: 7,
        tips: [
          'Use ethos, pathos, and logos',
          'Address counterarguments',
          'Build to a powerful conclusion',
          'Use statistics and emotional appeals'
        ]
      },

      // DEBATE SPEECH PRACTICES
      {
        type: 'debate-speech',
        difficulty: 'beginner',
        title: 'Simple Position Statement',
        description: 'State and defend a clear position',
        practiceText: 'Argue that "Social media has more positive than negative effects on society." Present three clear reasons supporting this position with simple examples. Acknowledge one counterargument and refute it briefly.',
        targetText: 'Social media connects people across the globe, enables instant communication, and provides platforms for learning and growth. While critics argue it causes isolation, the data shows it actually increases social connections by 40%. The benefits far outweigh the drawbacks when used responsibly.',
        timeLimit: 3,
        tips: [
          'State your position clearly',
          'Provide three strong reasons',
          'Use simple, clear language',
          'Address obvious counterarguments'
        ]
      },
      {
        type: 'debate-speech',
        difficulty: 'intermediate',
        title: 'Structured Argument',
        description: 'Present a well-organized debate argument',
        practiceText: 'Defend the position that "Remote work should be the default for knowledge workers." Structure your argument with clear points about productivity, work-life balance, and environmental impact. Refute common objections about collaboration and company culture.',
        targetText: 'Remote work isn\'t just a trend; it\'s the future of productivity. Research demonstrates 23% higher productivity among remote workers, while reducing carbon emissions by 54 million tons annually. The argument that it hurts collaboration ignores the fact that digital tools have made communication more efficient than ever.',
        timeLimit: 5,
        tips: [
          'Use clear signposting',
          'Provide evidence for claims',
          'Anticipate opponent arguments',
          'Maintain confident delivery'
        ]
      },
      {
        type: 'debate-speech',
        difficulty: 'advanced',
        title: 'Complex Policy Debate',
        description: 'Argue a nuanced policy position',
        practiceText: 'Argue for implementing universal basic income as economic policy. Address economic theory, social benefits, implementation challenges, and funding mechanisms. Counter arguments about work incentives, inflation, and political feasibility with sophisticated reasoning.',
        targetText: 'Universal Basic Income represents a fundamental shift from welfare dependency to economic empowerment. Pilot programs in Finland and Kenya show increased entrepreneurship and mental health improvements. The funding mechanism through progressive taxation and automation taxes ensures sustainability while addressing the inevitable displacement of traditional employment.',
        timeLimit: 8,
        tips: [
          'Use sophisticated argumentation',
          'Cite credible sources',
          'Handle complex rebuttals',
          'Demonstrate deep understanding'
        ]
      }
    ];
  }

  getStructuredPractice(type: string, difficulty: string): StructuredPractice | undefined {
    return this.getStructuredPracticeContent().find(
      practice => practice.type === type && practice.difficulty === difficulty
    );
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

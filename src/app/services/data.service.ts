import { Injectable } from '@angular/core';

export interface Topic {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  quiz: Quiz;
  order: number;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  content: LessonContent[];
  topicId: string;
  order: number;
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

  // Get all lessons from all topics
  getAllLessons(): Lesson[] {
    const topics = this.getTopics();
    const allLessons: Lesson[] = [];
    topics.forEach(topic => {
      allLessons.push(...topic.lessons);
    });
    return allLessons;
  }

  getLesson(id: string): Lesson | undefined {
    const allLessons = this.getAllLessons();
    return allLessons.find(lesson => lesson.id === id);
  }

  // Topics Data
  getTopics(): Topic[] {
    return [
      {
        id: 'topic-1',
        title: 'The Importance of Self-Confidence',
        description: 'Build your confidence foundation for effective public speaking',
        order: 1,
        lessons: [
          {
            id: 'lesson-1-1',
            title: 'Understanding Self-Confidence',
            description: 'Learn what self-confidence means and why it matters',
            duration: '10 min',
            difficulty: 'beginner',
            category: 'Confidence',
            topicId: 'topic-1',
            order: 1,
            content: [
              {
                type: 'text',
                title: 'What is Self-Confidence?',
                content: 'Self-confidence is the belief in your own abilities, qualities, and judgment. It\'s the foundation of effective communication and public speaking. When you believe in yourself, you project that confidence to your audience, making your message more compelling and memorable.'
              },
              {
                type: 'text',
                title: 'Why Confidence Matters',
                content: 'Confident speakers are more persuasive, engaging, and memorable. Confidence helps you connect with your audience and deliver your message effectively. Studies show that confident speakers are perceived as more credible and trustworthy by their listeners.'
              },
              {
                type: 'exercise',
                title: 'Confidence Assessment',
                content: 'Take a moment to reflect on your current confidence level. Rate yourself from 1-10 on how confident you feel when speaking in public. This baseline will help you track your progress as you develop your speaking skills.'
              }
            ]
          },
          {
            id: 'lesson-1-2',
            title: 'Building Inner Confidence',
            description: 'Develop techniques to strengthen your self-belief',
            duration: '12 min',
            difficulty: 'beginner',
            category: 'Confidence',
            topicId: 'topic-1',
            order: 2,
            content: [
              {
                type: 'text',
                title: 'Positive Self-Talk',
                content: 'Replace negative thoughts with positive affirmations. Practice saying "I can do this" instead of "I\'m not good enough." The way you talk to yourself directly impacts your confidence level and performance.'
              },
              {
                type: 'text',
                title: 'Confidence Building Techniques',
                content: 'Visualize your success before speaking. Imagine yourself delivering a powerful presentation with confidence. This mental rehearsal prepares your mind for success and reduces anxiety.'
              },
              {
                type: 'exercise',
                title: 'Daily Confidence Practice',
                content: 'Each morning, write down three things you\'re good at or proud of. This simple exercise helps build a positive self-image and reinforces your strengths.'
              }
            ]
          },
          {
            id: 'lesson-1-3',
            title: 'Confidence in Practice',
            description: 'Apply confidence techniques in real speaking situations',
            duration: '15 min',
            difficulty: 'intermediate',
            category: 'Confidence',
            topicId: 'topic-1',
            order: 3,
            content: [
              {
                type: 'text',
                title: 'Confidence Exercises',
                content: 'Practice speaking in front of a mirror, record yourself, and gradually increase your audience size. Start with small groups and work your way up to larger audiences.'
              },
              {
                type: 'text',
                title: 'Body Language and Confidence',
                content: 'Stand tall, make eye contact, and use open gestures. Your body language not only affects how others perceive you but also influences your own confidence level.'
              },
              {
                type: 'exercise',
                title: 'Power Pose Practice',
                content: 'Before any important speaking engagement, spend 2 minutes in a "power pose" - standing tall with your hands on your hips. This simple exercise can boost your confidence and reduce stress hormones.'
              }
            ]
          },
          {
            id: 'lesson-1-4',
            title: 'Overcoming Self-Doubt',
            description: 'Learn to manage and overcome self-doubt',
            duration: '14 min',
            difficulty: 'intermediate',
            category: 'Confidence',
            topicId: 'topic-1',
            order: 4,
            content: [
              {
                type: 'text',
                title: 'Identifying Self-Doubt',
                content: 'Recognize the signs of self-doubt and understand that it\'s normal. Everyone experiences it. The key is not to eliminate self-doubt completely, but to manage it effectively.'
              },
              {
                type: 'text',
                title: 'Reframing Negative Thoughts',
                content: 'When you catch yourself thinking "I\'m not good enough," reframe it to "I\'m learning and improving." This shift in perspective can dramatically change your confidence level.'
              },
              {
                type: 'exercise',
                title: 'Doubt-Busting Journal',
                content: 'Keep a journal of your speaking successes, no matter how small. When self-doubt creeps in, review your past achievements to remind yourself of your capabilities.'
              }
            ]
          },
          {
            id: 'lesson-1-5',
            title: 'Confidence Maintenance',
            description: 'Keep your confidence strong over time',
            duration: '11 min',
            difficulty: 'advanced',
            category: 'Confidence',
            topicId: 'topic-1',
            order: 5,
            content: [
              {
                type: 'text',
                title: 'Long-term Confidence',
                content: 'Develop habits and routines that maintain your confidence levels consistently. Confidence is like a muscle - it needs regular exercise to stay strong.'
              },
              {
                type: 'text',
                title: 'Building a Confidence Routine',
                content: 'Create a daily routine that includes confidence-building activities: morning affirmations, evening reflection on successes, and regular practice sessions.'
              },
              {
                type: 'exercise',
                title: 'Confidence Action Plan',
                content: 'Create a 30-day confidence challenge for yourself. Each day, do one thing that pushes you slightly outside your comfort zone in public speaking. Track your progress and celebrate small wins.'
              }
            ]
          }
        ],
        quiz: {
          questions: [
            {
              question: 'What does self-confidence primarily mean?',
              options: [
                'Belief in your own abilities and judgment',
                'Being louder than others',
                'Never making mistakes',
                'Always being right'
              ],
              correctAnswer: 0,
              explanation: 'Self-confidence is the belief in your own abilities, qualities, and judgment. It\'s about trusting yourself while remaining open to growth.'
            },
            {
              question: 'Which technique helps build confidence?',
              options: [
                'Positive self-talk',
                'Avoiding challenges',
                'Comparing yourself to others',
                'Perfectionism'
              ],
              correctAnswer: 0,
              explanation: 'Positive self-talk helps replace negative thoughts with empowering beliefs. It\'s one of the most effective ways to build lasting confidence.'
            },
            {
              question: 'What is a sign of healthy confidence?',
              options: [
                'Acknowledging areas for improvement',
                'Never admitting mistakes',
                'Always being the loudest',
                'Never asking for help'
              ],
              correctAnswer: 0,
              explanation: 'Healthy confidence includes self-awareness and the ability to grow. It\'s about being secure enough to recognize and work on weaknesses.'
            },
            {
              question: 'How does body language affect confidence?',
              options: [
                'It influences both how others see you and how you feel',
                'It only affects how others perceive you',
                'It has no impact on confidence',
                'It only matters in formal settings'
              ],
              correctAnswer: 0,
              explanation: 'Body language is a two-way street - it affects both how others perceive you and how confident you feel internally.'
            },
            {
              question: 'What is the best approach to overcoming self-doubt?',
              options: [
                'Acknowledge it and use it as motivation to improve',
                'Ignore it completely',
                'Avoid situations that trigger it',
                'Compare yourself to others to feel better'
              ],
              correctAnswer: 0,
              explanation: 'The best approach is to acknowledge self-doubt as normal and use it as motivation to prepare and improve, rather than trying to eliminate it completely.'
            }
          ]
        }
      },
      {
        id: 'topic-2',
        title: 'The Power of Positive Thinking',
        description: 'Harness positive thinking to enhance your speaking abilities',
        order: 2,
        lessons: [
          {
            id: 'lesson-2-1',
            title: 'Understanding Positive Thinking',
            description: 'Learn the fundamentals of positive thinking',
            duration: '10 min',
            difficulty: 'beginner',
            category: 'Mindset',
            topicId: 'topic-2',
            order: 1,
            content: [
              {
                type: 'text',
                title: 'What is Positive Thinking?',
                content: 'Positive thinking is the practice of focusing on the good in any situation and maintaining an optimistic outlook. It\'s not about ignoring problems, but about approaching challenges with a constructive mindset.'
              },
              {
                type: 'text',
                title: 'The Science Behind Positive Thinking',
                content: 'Research shows that positive thinking can reduce stress, improve health, and enhance performance. When you think positively, your brain releases chemicals that boost confidence and creativity.'
              },
              {
                type: 'exercise',
                title: 'Positive Thought Practice',
                content: 'Start each day by writing down three positive things about yourself or your speaking abilities. This simple practice can rewire your brain to focus more on strengths than weaknesses.'
              }
            ]
          },
          {
            id: 'lesson-2-2',
            title: 'Reframing Negative Thoughts',
            description: 'Transform negative thoughts into positive ones',
            duration: '12 min',
            difficulty: 'beginner',
            category: 'Mindset',
            topicId: 'topic-2',
            order: 2,
            content: [
              {
                type: 'text',
                title: 'Thought Reframing Techniques',
                content: 'Learn to identify negative thoughts and reframe them into positive, empowering statements.'
              }
            ]
          },
          {
            id: 'lesson-2-3',
            title: 'Positive Visualization',
            description: 'Use visualization to improve your speaking',
            duration: '15 min',
            difficulty: 'intermediate',
            category: 'Mindset',
            topicId: 'topic-2',
            order: 3,
            content: [
              {
                type: 'text',
                title: 'Visualization Techniques',
                content: 'Practice visualizing successful speaking scenarios to build confidence and reduce anxiety.'
              }
            ]
          },
          {
            id: 'lesson-2-4',
            title: 'Gratitude and Speaking',
            description: 'Use gratitude to enhance your speaking presence',
            duration: '13 min',
            difficulty: 'intermediate',
            category: 'Mindset',
            topicId: 'topic-2',
            order: 4,
            content: [
              {
                type: 'text',
                title: 'Gratitude Practices',
                content: 'Develop gratitude practices that enhance your speaking presence and audience connection.'
              }
            ]
          },
          {
            id: 'lesson-2-5',
            title: 'Maintaining Positive Mindset',
            description: 'Keep a positive mindset in challenging speaking situations',
            duration: '14 min',
            difficulty: 'advanced',
            category: 'Mindset',
            topicId: 'topic-2',
            order: 5,
            content: [
              {
                type: 'text',
                title: 'Resilience in Speaking',
                content: 'Develop resilience to maintain positivity even when speaking doesn\'t go as planned.'
              }
            ]
          }
        ],
        quiz: {
          questions: [
            {
              question: 'What is the primary benefit of positive thinking in speaking?',
              options: [
                'Reduces anxiety and improves performance',
                'Makes you speak louder',
                'Eliminates all nervousness',
                'Guarantees perfect speeches'
              ],
              correctAnswer: 0,
              explanation: 'Positive thinking reduces anxiety and improves overall speaking performance by helping you focus on opportunities rather than obstacles.'
            },
            {
              question: 'What is thought reframing?',
              options: [
                'Transforming negative thoughts into positive ones',
                'Ignoring problems',
                'Pretending everything is perfect',
                'Avoiding difficult topics'
              ],
              correctAnswer: 0,
              explanation: 'Thought reframing is the practice of transforming negative thoughts into positive, empowering statements that support your goals.'
            },
            {
              question: 'How does positive thinking affect your audience?',
              options: [
                'It makes you more engaging and trustworthy',
                'It makes you seem unrealistic',
                'It has no effect on the audience',
                'It makes you appear naive'
              ],
              correctAnswer: 0,
              explanation: 'Positive thinking makes speakers more engaging and trustworthy because it creates an optimistic, approachable energy that audiences respond to.'
            }
          ]
        }
      },
      {
        id: 'topic-3',
        title: 'How to Manage Stress Effectively',
        description: 'Master stress management techniques for better speaking performance',
        order: 3,
        lessons: [
          {
            id: 'lesson-3-1',
            title: 'Understanding Speaking Stress',
            description: 'Learn about stress and its impact on speaking',
            duration: '10 min',
            difficulty: 'beginner',
            category: 'Stress Management',
            topicId: 'topic-3',
            order: 1,
            content: [
              {
                type: 'text',
                title: 'What is Speaking Stress?',
                content: 'Speaking stress is the body\'s natural response to the perceived threat of public speaking. It\'s actually a normal reaction that can be managed and even used to your advantage.'
              },
              {
                type: 'text',
                title: 'The Fight-or-Flight Response',
                content: 'When you feel stressed before speaking, your body is preparing for action. This response can actually enhance your performance by increasing alertness and energy.'
              },
              {
                type: 'exercise',
                title: 'Stress Awareness Exercise',
                content: 'Notice your physical stress signals: rapid heartbeat, sweaty palms, or butterflies. Acknowledge these as your body preparing for peak performance rather than signs of failure.'
              }
            ]
          },
          {
            id: 'lesson-3-2',
            title: 'Breathing Techniques',
            description: 'Master breathing exercises to manage stress',
            duration: '12 min',
            difficulty: 'beginner',
            category: 'Stress Management',
            topicId: 'topic-3',
            order: 2,
            content: [
              {
                type: 'text',
                title: 'Deep Breathing',
                content: 'Practice the 4-7-8 breathing technique: inhale for 4, hold for 7, exhale for 8.'
              }
            ]
          },
          {
            id: 'lesson-3-3',
            title: 'Progressive Muscle Relaxation',
            description: 'Learn to relax your body before speaking',
            duration: '15 min',
            difficulty: 'intermediate',
            category: 'Stress Management',
            topicId: 'topic-3',
            order: 3,
            content: [
              {
                type: 'text',
                title: 'Muscle Relaxation Techniques',
                content: 'Practice tensing and relaxing different muscle groups to release physical tension.'
              }
            ]
          },
          {
            id: 'lesson-3-4',
            title: 'Mindfulness for Speakers',
            description: 'Use mindfulness to stay present while speaking',
            duration: '13 min',
            difficulty: 'intermediate',
            category: 'Stress Management',
            topicId: 'topic-3',
            order: 4,
            content: [
              {
                type: 'text',
                title: 'Mindfulness Practices',
                content: 'Develop mindfulness techniques to stay present and focused during speaking.'
              }
            ]
          },
          {
            id: 'lesson-3-5',
            title: 'Pre-Speech Preparation',
            description: 'Create a pre-speech routine to manage stress',
            duration: '14 min',
            difficulty: 'advanced',
            category: 'Stress Management',
            topicId: 'topic-3',
            order: 5,
            content: [
              {
                type: 'text',
                title: 'Pre-Speech Routine',
                content: 'Develop a consistent pre-speech routine that helps you manage stress and prepare mentally.'
              }
            ]
          }
        ],
        quiz: {
          questions: [
            {
              question: 'What is the 4-7-8 breathing technique?',
              options: [
                'Inhale 4, hold 7, exhale 8',
                'Inhale 8, hold 4, exhale 7',
                'Inhale 7, hold 8, exhale 4',
                'Inhale 4, hold 8, exhale 7'
              ],
              correctAnswer: 0,
              explanation: 'The 4-7-8 technique involves inhaling for 4 counts, holding for 7, and exhaling for 8. This pattern activates the parasympathetic nervous system, promoting calmness.'
            },
            {
              question: 'What is progressive muscle relaxation?',
              options: [
                'Tensing and relaxing muscle groups',
                'Only relaxing muscles',
                'Only tensing muscles',
                'Avoiding muscle work'
              ],
              correctAnswer: 0,
              explanation: 'Progressive muscle relaxation involves systematically tensing and then relaxing different muscle groups to release physical tension and stress.'
            },
            {
              question: 'How can stress actually help your speaking performance?',
              options: [
                'It increases alertness and energy',
                'It makes you speak faster',
                'It eliminates all nervousness',
                'It guarantees perfect delivery'
              ],
              correctAnswer: 0,
              explanation: 'Moderate stress can actually enhance performance by increasing alertness, energy, and focus - it\'s about channeling that energy positively rather than eliminating it.'
            }
          ]
        }
      },
      {
        id: 'topic-4',
        title: 'Body Language Mastery',
        description: 'Master the art of confident body language',
        order: 4,
        lessons: [
          {
            id: 'lesson-4-1',
            title: 'The Power of Posture',
            description: 'Learn how posture affects your speaking presence',
            duration: '10 min',
            difficulty: 'beginner',
            category: 'Body Language',
            topicId: 'topic-4',
            order: 1,
            content: [
              {
                type: 'text',
                title: 'Good Posture Basics',
                content: 'Stand tall with shoulders back, feet shoulder-width apart, and head held high.'
              }
            ]
          },
          {
            id: 'lesson-4-2',
            title: 'Effective Gestures',
            description: 'Use gestures to enhance your message',
            duration: '12 min',
            difficulty: 'beginner',
            category: 'Body Language',
            topicId: 'topic-4',
            order: 2,
            content: [
              {
                type: 'text',
                title: 'Gesture Guidelines',
                content: 'Use natural, purposeful gestures that support your words and engage your audience.'
              }
            ]
          },
          {
            id: 'lesson-4-3',
            title: 'Eye Contact Mastery',
            description: 'Connect with your audience through eye contact',
            duration: '15 min',
            difficulty: 'intermediate',
            category: 'Body Language',
            topicId: 'topic-4',
            order: 3,
            content: [
              {
                type: 'text',
                title: 'Eye Contact Techniques',
                content: 'Practice making meaningful eye contact with different sections of your audience.'
              }
            ]
          },
          {
            id: 'lesson-4-4',
            title: 'Movement and Space',
            description: 'Use movement effectively in your presentations',
            duration: '13 min',
            difficulty: 'intermediate',
            category: 'Body Language',
            topicId: 'topic-4',
            order: 4,
            content: [
              {
                type: 'text',
                title: 'Purposeful Movement',
                content: 'Learn to move with purpose and use space effectively during your presentations.'
              }
            ]
          },
          {
            id: 'lesson-4-5',
            title: 'Advanced Body Language',
            description: 'Master advanced body language techniques',
            duration: '14 min',
            difficulty: 'advanced',
            category: 'Body Language',
            topicId: 'topic-4',
            order: 5,
            content: [
              {
                type: 'text',
                title: 'Advanced Techniques',
                content: 'Develop sophisticated body language skills for high-stakes presentations.'
              }
            ]
          }
        ],
        quiz: {
          questions: [
            {
              question: 'What is the foundation of good speaking posture?',
              options: [
                'Standing tall with shoulders back',
                'Slouching slightly',
                'Leaning forward',
                'Crossing arms'
              ],
              correctAnswer: 0,
              explanation: 'Good posture involves standing tall with shoulders back and feet shoulder-width apart.'
            },
            {
              question: 'How should gestures be used?',
              options: [
                'Naturally and purposefully',
                'As much as possible',
                'Only when nervous',
                'Never'
              ],
              correctAnswer: 0,
              explanation: 'Gestures should be natural and purposeful, supporting your words and engaging your audience.'
            }
          ]
        }
      },
      {
        id: 'topic-5',
        title: 'Voice and Delivery',
        description: 'Perfect your voice and delivery techniques',
        order: 5,
        lessons: [
          {
            id: 'lesson-5-1',
            title: 'Voice Projection',
            description: 'Learn to project your voice effectively',
            duration: '10 min',
            difficulty: 'beginner',
            category: 'Voice',
            topicId: 'topic-5',
            order: 1,
            content: [
              {
                type: 'text',
                title: 'Projection Basics',
                content: 'Learn to project your voice without straining, using your diaphragm effectively.'
              }
            ]
          },
          {
            id: 'lesson-5-2',
            title: 'Pace and Rhythm',
            description: 'Master the art of pacing your speech',
            duration: '12 min',
            difficulty: 'beginner',
            category: 'Voice',
            topicId: 'topic-5',
            order: 2,
            content: [
              {
                type: 'text',
                title: 'Pacing Techniques',
                content: 'Learn to vary your pace to keep your audience engaged and emphasize key points.'
              }
            ]
          },
          {
            id: 'lesson-5-3',
            title: 'Tone and Inflection',
            description: 'Use tone and inflection to enhance your message',
            duration: '15 min',
            difficulty: 'intermediate',
            category: 'Voice',
            topicId: 'topic-5',
            order: 3,
            content: [
              {
                type: 'text',
                title: 'Vocal Variety',
                content: 'Develop vocal variety through changes in tone, pitch, and inflection.'
              }
            ]
          },
          {
            id: 'lesson-5-4',
            title: 'Articulation and Clarity',
            description: 'Speak clearly and articulately',
            duration: '13 min',
            difficulty: 'intermediate',
            category: 'Voice',
            topicId: 'topic-5',
            order: 4,
            content: [
              {
                type: 'text',
                title: 'Clear Speech',
                content: 'Practice articulation exercises to ensure your words are clear and understandable.'
              }
            ]
          },
          {
            id: 'lesson-5-5',
            title: 'Advanced Voice Techniques',
            description: 'Master advanced voice and delivery skills',
            duration: '14 min',
            difficulty: 'advanced',
            category: 'Voice',
            topicId: 'topic-5',
            order: 5,
            content: [
              {
                type: 'text',
                title: 'Professional Voice',
                content: 'Develop a professional speaking voice that commands attention and respect.'
              }
            ]
          }
        ],
        quiz: {
          questions: [
            {
              question: 'What is the key to effective voice projection?',
              options: [
                'Using your diaphragm',
                'Speaking as loud as possible',
                'Shouting',
                'Whispering'
              ],
              correctAnswer: 0,
              explanation: 'Effective voice projection comes from using your diaphragm, not just increasing volume.'
            },
            {
              question: 'Why is vocal variety important?',
              options: [
                'Keeps audience engaged',
                'Makes you sound smarter',
                'Fills time',
                'Shows confidence'
              ],
              correctAnswer: 0,
              explanation: 'Vocal variety keeps your audience engaged and helps emphasize key points.'
            }
          ]
        }
      }
    ];
  }

  getTopic(id: string): Topic | undefined {
    return this.getTopics().find(topic => topic.id === id);
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
        targetText: 'Practice makes perfect when it comes to delivering effective presentations.',
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

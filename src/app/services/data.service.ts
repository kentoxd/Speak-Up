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
  timeLimit: number;
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
  targetText: string;
  timeLimit: number;
  tips: string[];
}

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor() { }

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

  getTopics(): Topic[] {
    return [
      {
        id: 'topic-1',
        title: 'Mastering the Art of Confident Public Speaking',
        description: 'Learn the fundamentals of public speaking from basics to advanced delivery techniques',
        order: 1,
        lessons: [
          {
            id: 'lesson-1-1',
            title: 'Understanding the Basics of Public Speaking',
            description: 'Learn what public speaking is and why it matters',
            duration: '15 min',
            difficulty: 'beginner',
            category: 'Fundamentals',
            topicId: 'topic-1',
            order: 1,
            content: [
              {
                type: 'text',
                title: 'What is Public Speaking?',
                content: 'Public speaking is the process of delivering a structured message to an audience with the intent to inform, influence, or entertain. It plays a vital role in education, business, leadership, and daily communication. Whether presenting in class, leading a meeting, or delivering a speech at a ceremony, public speaking allows you to share ideas clearly and confidently.'
              },
              {
                type: 'text',
                title: 'Types of Speeches',
                content: 'There are four main types of speeches:\n\n1. Informative Speech - Aims to educate or explain a concept (e.g., explaining how climate change affects agriculture)\n\n2. Persuasive Speech - Tries to convince the audience to accept a viewpoint or take action (e.g., encouraging people to recycle)\n\n3. Entertaining Speech - Amuses or engages the audience, often using humor or storytelling (e.g., a host\'s opening speech at an event)\n\n4. Special Occasion Speech - Celebrates or honors people and events (e.g., graduation, wedding, or award speech)'
              },
              {
                type: 'text',
                title: 'Why It Matters',
                content: 'Public speaking develops your ability to think critically, organize ideas, and express yourself with confidence. It also strengthens leadership and interpersonal skills. These abilities are essential in both professional and personal contexts.'
              },
              {
                type: 'text',
                title: 'Common Misconceptions',
                content: 'Let\'s debunk some myths:\n\n• "Great speakers are born" → FALSE. Public speaking is a skill learned through practice.\n\n• "If I make a mistake, I\'ll fail" → Mistakes are normal; what matters is how you recover and continue.\n\n• "I must sound perfect" → Authenticity is more powerful than perfection.'
              },
              {
                type: 'text',
                title: 'Tips for Beginners',
                content: '1. Watch famous speeches and notice how speakers use voice and body language\n\n2. Practice speaking in front of a mirror or a small group of friends\n\n3. Start with topics you are passionate about; it\'s easier to speak about something you care for\n\nKey Takeaway: Public speaking is not about perfection but about connection — sharing your message clearly and confidently with others.'
              }
            ]
          },
          {
            id: 'lesson-1-2',
            title: 'Overcoming Stage Fright and Building Confidence',
            description: 'Learn to manage anxiety and build speaking confidence',
            duration: '15 min',
            difficulty: 'beginner',
            category: 'Confidence',
            topicId: 'topic-1',
            order: 2,
            content: [
              {
                type: 'text',
                title: 'Understanding Stage Fright',
                content: 'Stage fright, or speech anxiety, is one of the most common fears in the world. Even famous speakers and actors feel nervous before facing an audience. The key is learning to manage fear, not eliminate it.'
              },
              {
                type: 'text',
                title: 'Causes of Stage Fright',
                content: 'Common causes include:\n\n• Fear of judgment or criticism\n• Lack of preparation or experience\n• Negative thinking ("What if I forget my lines?")\n• Pressure to perform perfectly\n\nUnderstanding these causes helps you address them directly.'
              },
              {
                type: 'text',
                title: 'Ways to Manage Anxiety',
                content: 'Preparation: The more prepared you are, the less nervous you feel. Rehearse your speech several times and time yourself.\n\nBreathing Exercises: Deep breaths help slow your heartbeat and relax your body. Try inhaling for 4 seconds, holding for 2, and exhaling for 6.\n\nVisualization: Imagine yourself standing confidently, speaking clearly, and receiving applause. Visualization builds positive energy.\n\nPositive Self-Talk: Replace negative thoughts like "I\'ll mess up" with "I\'m ready and capable."\n\nStart Small: Practice in front of friends or classmates before a big audience. Each attempt builds your confidence.'
              },
              {
                type: 'text',
                title: 'Confidence Tips',
                content: '• Arrive early to get comfortable with the environment\n• Make eye contact with friendly faces first\n• Focus on your message, not on yourself\n\nExample: Even professional speakers like TED Talk presenters rehearse dozens of times before stepping on stage. Preparation turns nervousness into excitement.'
              },
              {
                type: 'text',
                title: 'Key Takeaway',
                content: 'Confidence doesn\'t mean you never feel afraid — it means you face fear with preparation, practice, and positive thinking. Remember, every great speaker started exactly where you are now.'
              }
            ]
          },
          {
            id: 'lesson-1-3',
            title: 'Speech Organization and Structure',
            description: 'Master the three-part framework for effective speeches',
            duration: '15 min',
            difficulty: 'intermediate',
            category: 'Structure',
            topicId: 'topic-1',
            order: 3,
            content: [
              {
                type: 'text',
                title: 'The Importance of Structure',
                content: 'A well-organized speech helps your audience follow your message easily. Without structure, even a good topic can sound confusing. Every effective speech follows a three-part framework: Introduction, Body, and Conclusion.'
              },
              {
                type: 'text',
                title: 'Introduction',
                content: 'Your introduction should:\n\n• Capture attention with a quote, question, or story\n• Introduce your topic and purpose clearly\n• Give a brief preview of your main points\n\nExample: "Have you ever imagined a world without books? Reading not only entertains us but also sharpens our minds. Today, I\'ll share three reasons why reading is essential for personal growth."'
              },
              {
                type: 'text',
                title: 'Body',
                content: 'The body of your speech should:\n\n• Present your main ideas in logical order\n• Use examples, data, or stories for support\n• Make transitions clear (e.g., "Next," "In addition," "Finally")\n\nExample structure:\n1. Reading expands our knowledge\n2. It reduces stress and improves focus\n3. It enhances imagination and creativity'
              },
              {
                type: 'text',
                title: 'Conclusion',
                content: 'Your conclusion should:\n\n• Restate your key points\n• End with a strong closing thought, call to action, or memorable quote\n\nExample: "Books are more than paper and ink—they are passports to countless worlds. So pick one up today, and start your next adventure."'
              },
              {
                type: 'text',
                title: 'Additional Tips',
                content: '• Use an outline or cue cards instead of reading a script\n• Keep your ideas simple and focused on one main message\n• Practice transitions for smooth flow\n\nKey Takeaway: A clear and organized speech helps your audience understand your message — and makes you sound more professional and prepared.'
              }
            ]
          },
          {
            id: 'lesson-1-4',
            title: 'Effective Delivery Techniques',
            description: 'Master voice, body language, and presentation skills',
            duration: '15 min',
            difficulty: 'intermediate',
            category: 'Delivery',
            topicId: 'topic-1',
            order: 4,
            content: [
              {
                type: 'text',
                title: 'The Power of Delivery',
                content: 'Your delivery can make or break your speech. Even the best-written message will fail if delivered monotonously or awkwardly. Great speakers combine voice, body language, and facial expression to bring their words to life.'
              },
              {
                type: 'text',
                title: 'Voice Control',
                content: 'Your voice should be clear, expressive, and loud enough for everyone to hear. Avoid speaking too fast or too softly.\n\n• Pitch: Change your tone to show emotion\n• Pace: Slow down for important points\n• Volume: Adjust to suit the size of your audience\n• Pauses: Use pauses for emphasis — silence can be powerful'
              },
              {
                type: 'text',
                title: 'Body Language',
                content: 'Your body communicates confidence before your words do.\n\n• Stand tall with good posture\n• Avoid crossing your arms or fidgeting\n• Use hand gestures to highlight key points\n\nYour physical presence reinforces your verbal message.'
              },
              {
                type: 'text',
                title: 'Eye Contact and Facial Expression',
                content: 'Eye Contact: Maintain eye contact with different parts of the audience. This builds trust and keeps them engaged.\n\nFacial Expression: Let your face reflect the emotion behind your words — smile when appropriate, show concern when serious.\n\nPractice Tip: Record your speech or practice in front of a mirror to observe your gestures and tone.'
              },
              {
                type: 'text',
                title: 'Common Mistakes to Avoid',
                content: '• Reading directly from slides or notes\n• Speaking in a monotone voice\n• Ignoring audience reactions\n\nKey Takeaway: Effective delivery transforms words into impact. Confidence, voice control, and body language make your message unforgettable.'
              }
            ]
          },
          {
            id: 'lesson-1-5',
            title: 'Engaging the Audience and Using Visual Aids',
            description: 'Learn to captivate your audience and use visuals effectively',
            duration: '15 min',
            difficulty: 'advanced',
            category: 'Engagement',
            topicId: 'topic-1',
            order: 5,
            content: [
              {
                type: 'text',
                title: 'The Art of Engagement',
                content: 'Engaging your audience keeps them interested and helps them remember your message. A great speaker interacts with the audience rather than just talking to them.'
              },
              {
                type: 'text',
                title: 'Ways to Engage the Audience',
                content: 'Ask Questions: Encourage participation with rhetorical or direct questions.\n\nUse Stories: People remember stories more than facts. Relate your message to real-life experiences.\n\nShow Enthusiasm: Your passion is contagious; speak with energy and sincerity.\n\nAdapt to Reactions: If the audience looks bored, change your tone or add a short anecdote.'
              },
              {
                type: 'text',
                title: 'Using Visual Aids',
                content: 'Visual aids like PowerPoint slides, props, or posters can make your speech more powerful — but only if used correctly.\n\n• Keep slides simple: 5–6 lines per slide maximum\n• Use large, readable fonts and clear images\n• Avoid reading from your slides — talk to the audience, not at the screen\n• Props should be visible and relevant'
              },
              {
                type: 'text',
                title: 'During Q&A Sessions',
                content: '• Listen carefully to questions\n• Answer briefly and politely\n• If you don\'t know the answer, it\'s okay to admit it and offer to follow up later\n\nThis shows honesty and professionalism.'
              },
              {
                type: 'text',
                title: 'Practical Example',
                content: 'When discussing "Climate Change Awareness," you could use a short video, a chart of global temperature rise, or a recycled item as a prop to reinforce your message.\n\nKey Takeaway: An engaged audience is an attentive audience. Visuals, stories, and interaction make your message memorable and meaningful.'
              }
            ]
          }
        ],
        quiz: {
          questions: [
            {
              question: 'What is the main purpose of public speaking?',
              options: [
                'To inform, influence, or entertain an audience',
                'To show off your knowledge',
                'To speak as long as possible',
                'To impress people with big words'
              ],
              correctAnswer: 0,
              explanation: 'Public speaking is about delivering a structured message to inform, influence, or entertain—not about showing off or using complex language.'
            },
            {
              question: 'Which breathing technique helps manage stage fright?',
              options: [
                'Inhale for 4 seconds, hold for 2, exhale for 6',
                'Breathe as fast as possible',
                'Hold your breath throughout',
                'Only exhale deeply'
              ],
              correctAnswer: 0,
              explanation: 'Deep breathing with the 4-2-6 pattern helps slow your heartbeat and relax your body, reducing anxiety.'
            },
            {
              question: 'What are the three parts of a well-structured speech?',
              options: [
                'Introduction, Body, Conclusion',
                'Start, Middle, Stop',
                'Opening, Talking, Ending',
                'Beginning, Content, Finish'
              ],
              correctAnswer: 0,
              explanation: 'Every effective speech follows the three-part framework: Introduction, Body, and Conclusion.'
            },
            {
              question: 'What is a common mistake to avoid during delivery?',
              options: [
                'Reading directly from slides or notes',
                'Making eye contact',
                'Using hand gestures',
                'Varying your voice tone'
              ],
              correctAnswer: 0,
              explanation: 'Reading directly from slides or notes breaks connection with your audience. Instead, use them as prompts while maintaining engagement.'
            },
            {
              question: 'How can you make visual aids more effective?',
              options: [
                'Keep slides simple with 5-6 lines maximum',
                'Fill slides with as much text as possible',
                'Read everything on the slides',
                'Use small fonts to fit more content'
              ],
              correctAnswer: 0,
              explanation: 'Simple slides with minimal text (5-6 lines max) are more effective. Talk to your audience, not at the screen.'
            }
          ]
        }
      },
      {
        id: 'topic-2',
        title: 'Speaking English Fluently and Confidently',
        description: 'Develop fluency and confidence in English communication',
        order: 2,
        lessons: [
          {
            id: 'lesson-2-1',
            title: 'Understanding English Fluency',
            description: 'Learn what fluency means and how to build it',
            duration: '15 min',
            difficulty: 'beginner',
            category: 'Fluency',
            topicId: 'topic-2',
            order: 1,
            content: [
              {
                type: 'text',
                title: 'What is Fluency?',
                content: 'Fluency means speaking smoothly, at a natural speed, without unnecessary pauses or hesitations. It\'s the ability to express your thoughts clearly and continuously — even when you forget a specific word. Many learners believe they must speak perfectly before they can speak fluently. This is not true. Fluency is built through practice, not perfection.'
              },
              {
                type: 'text',
                title: 'Fluency vs. Accuracy',
                content: 'Fluency focuses on the flow and smoothness of speech. It\'s about communicating ideas easily, keeping a conversation going, and not getting stuck searching for the right words. A fluent speaker may make a few grammar mistakes, but their ideas are understandable.\n\nExample: "I go park yesterday, it was fun!" - Even though the grammar is incorrect, the listener can still understand the message.\n\nAccuracy focuses on correctness — correct grammar, pronunciation, and vocabulary use. Example: "I went to the park yesterday; it was fun."\n\nIn short, fluency helps you communicate easily, while accuracy helps you communicate correctly. Both are important, but fluency should come first.'
              },
              {
                type: 'text',
                title: 'Key Elements of Fluency',
                content: '• Confidence: Believe in your ability to communicate\n• Clarity: Speak clearly and at a steady pace\n• Coherence: Organize your thoughts logically\n• Consistency: Practice regularly to build rhythm and flow'
              },
              {
                type: 'exercise',
                title: 'How to Build Fluency',
                content: '• Think in English. Avoid translating from your native language\n• Speak daily, even for 5 minutes. Talk to yourself, record short audio journals, or practice with a friend\n• Don\'t fear mistakes. Focus on getting your message across rather than being perfect\n• Use natural fillers. Words like "well," "you know," "actually" make your speech sound smoother\n• Listen actively. Exposure to English helps your brain pick up sentence patterns naturally\n\nKey Takeaway: Fluency means speaking smoothly and confidently, not perfectly.'
              }
            ]
          },
          {
            id: 'lesson-2-2',
            title: 'Building Vocabulary and Expressions',
            description: 'Expand your vocabulary for natural communication',
            duration: '15 min',
            difficulty: 'beginner',
            category: 'Vocabulary',
            topicId: 'topic-2',
            order: 2,
            content: [
              {
                type: 'text',
                title: 'The Foundation of Fluent Speech',
                content: 'Vocabulary is the foundation of fluent speech. A strong vocabulary helps you express ideas precisely and naturally. The more words you know, the more clearly and confidently you can express ideas. However, vocabulary isn\'t just about memorizing long lists of words — it\'s about learning words in context and applying them naturally in real conversations.'
              },
              {
                type: 'text',
                title: 'Ways to Build Vocabulary',
                content: 'Read and Listen Daily: Exposure is key. Read articles, watch movies, or listen to podcasts in English. When you enjoy the topic, you remember words better. Example: If you like cooking, watch recipe videos — you\'ll naturally learn words like stir, boil, season, and ingredients.\n\nLearn in Phrases, Not Individual Words: Instead of memorizing single words, learn common combinations. Example: Say "make a decision" instead of just "decision," or "take a break" instead of just "break."\n\nUse Synonyms and Paraphrasing: Instead of repeating "good," try "great," "wonderful," or "fantastic." If you forget a word, use another word or rephrase.'
              },
              {
                type: 'text',
                title: 'Common English Expressions',
                content: '• "By the way" – to add new information\n• "I totally agree." – to show strong agreement\n• "It depends." – to give a balanced opinion\n• "As far as I know…" – to share what you believe is true\n• "What do you mean by that?" – to clarify something'
              },
              {
                type: 'text',
                title: 'Building Your Vocabulary',
                content: 'Create a Vocabulary Journal: Write down new words, their meanings, and examples. Review and use them weekly in sentences.\n\nActive Recall and Speaking Practice: Don\'t just read your list. Cover the meanings and try to recall them from memory, then say them aloud in a sentence.\n\nKey Takeaway: Words build sentences, but phrases build fluency. Learn expressions you can instantly use in real situations.'
              }
            ]
          },
          {
            id: 'lesson-2-3',
            title: 'Improving Pronunciation and Intonation',
            description: 'Speak clearly with proper pronunciation',
            duration: '15 min',
            difficulty: 'intermediate',
            category: 'Pronunciation',
            topicId: 'topic-2',
            order: 3,
            content: [
              {
                type: 'text',
                title: 'The Music of Language',
                content: 'Pronunciation affects how easily others can understand you. It is the music of language — it gives rhythm and melody to your speech. Clear pronunciation makes you easier to understand and builds your confidence. You don\'t have to sound exactly like a native speaker — your goal is clarity and confidence, not imitation.'
              },
              {
                type: 'text',
                title: 'Core Aspects of Pronunciation',
                content: 'Word Stress: Every word has one main stressed syllable. For example: TAble, comPUter, exAMple.\n\nSentence Stress: In sentences, stress important words to show meaning. Example: "I REALLY like your IDEA."\n\nIntonation: The rise and fall of your voice shows emotion or intent. Example: "Are you okay?" ↗ (question) vs "I\'m okay." ↘ (statement)\n\nConnected Speech: Fluent speakers link words naturally. Example: "What are you doing?" → Whatcha doing? "I want to" → I wanna.'
              },
              {
                type: 'text',
                title: 'Practice Tips',
                content: 'Shadowing: Repeat lines from movies or podcasts to copy rhythm and emotion.\n\nRecord Yourself: Play it back to spot unclear sounds.\n\nTongue Twisters: Practice tricky sounds like "She sells seashells by the seashore."\n\nTarget Difficult Sounds: Focus on those you often mispronounce (like /th/, /v/, or /r/).'
              },
              {
                type: 'text',
                title: 'Example Exercise',
                content: 'Say: "I can\'t believe you did that!" — try saying it with surprise, anger, and happiness. Notice how tone changes meaning.\n\nKey Takeaway: Good pronunciation makes your speech clear, engaging, and gives life to your words — it shows confidence, clarity, emotion, and understanding.'
              }
            ]
          },
          {
            id: 'lesson-2-4',
            title: 'Speaking with Confidence and Clarity',
            description: 'Overcome barriers and speak confidently',
            duration: '15 min',
            difficulty: 'intermediate',
            category: 'Confidence',
            topicId: 'topic-2',
            order: 4,
            content: [
              {
                type: 'text',
                title: 'Confidence Transforms Communication',
                content: 'Confidence is the key to fluency. Even if you make grammar mistakes, speaking with energy and clarity makes you sound more fluent and credible. A confident tone makes people pay attention and trust your message.'
              },
              {
                type: 'text',
                title: 'Common Confidence Barriers',
                content: '• Fear of mistakes\n• Comparing yourself to others\n• Lack of practice or feedback\n• Negative self-talk ("I\'ll sound silly")'
              },
              {
                type: 'text',
                title: 'Tips for Speaking Confidently',
                content: 'Prepare Ideas in Advance: Think of key phrases you can use.\n\nDon\'t Fear Mistakes: Focus on communication, not perfection.\n\nMaintain Eye Contact: Shows sincerity and confidence.\n\nUse Gestures: Helps express meaning naturally.\n\nPractice Daily: Even short self-talk in English builds confidence.'
              },
              {
                type: 'text',
                title: 'Tips for Clarity',
                content: '• Speak at a moderate pace\n• Pause between ideas\n• Use simple words when nervous\n• Emphasize key phrases to highlight meaning\n\nExample: Instead of: "Uh, hi, I, um, just want to say…" Say: "Good morning. I\'d like to share something." → Simple, direct, confident.'
              },
              {
                type: 'text',
                title: 'Example Practice',
                content: 'Look in the mirror and introduce yourself as if at an interview. Focus on posture, tone, and calm breathing.\n\nKey Takeaway: Fluency starts when you stop aiming for perfection and start speaking with confidence. Confidence grows with every attempt. Speak more, worry less — your voice deserves to be heard.'
              }
            ]
          },
          {
            id: 'lesson-2-5',
            title: 'Practicing Real-Life Conversations',
            description: 'Apply your skills in practical situations',
            duration: '15 min',
            difficulty: 'advanced',
            category: 'Practice',
            topicId: 'topic-2',
            order: 5,
            content: [
              {
                type: 'text',
                title: 'Real Communication Practice',
                content: 'The best way to become fluent is to practice real communication. Speaking in realistic situations helps you think in English and respond automatically, not mechanically.'
              },
              {
                type: 'text',
                title: 'Examples of Real-Life Speaking Situations',
                content: '• Introductions: "Hi, I\'m [Name]. Nice to meet you!"\n• Ordering Food: "Can I get a cheeseburger and fries, please?"\n• Asking for Help: "Excuse me, could you tell me where the library is?"\n• Giving Opinions: "I think learning English online is very effective."\n• Making Small Talk: "The weather\'s great today, isn\'t it?"\n• Ending Conversations: "It was great talking to you!"'
              },
              {
                type: 'text',
                title: 'Fluency Practice Tips',
                content: '• Join English clubs or online speaking groups\n• Talk to friends in English for a few minutes daily\n• Practice thinking in English instead of translating'
              },
              {
                type: 'text',
                title: 'Conversation Tips',
                content: '• Listen carefully before replying\n• Ask follow-up questions\n• React naturally: "Really?" "That\'s awesome!"\n• Keep your tone warm and friendly'
              },
              {
                type: 'text',
                title: 'Example Practice',
                content: 'Act out two real-life dialogues with a partner. Focus on speaking continuously and sounding natural.\n\nKey Takeaway: Fluency grows through real-life use — speak often, make mistakes, and learn as you go. Every small conversation helps you sound more natural and confident.'
              }
            ]
          }
        ],
        quiz: {
          questions: [
            {
              question: 'What is the difference between fluency and accuracy?',
              options: [
                'Fluency focuses on flow, accuracy on correctness',
                'They are the same thing',
                'Accuracy is more important than fluency',
                'Fluency means perfect grammar'
              ],
              correctAnswer: 0,
              explanation: 'Fluency focuses on smooth communication flow, while accuracy focuses on grammatical correctness. Both are important, but fluency should come first.'
            },
            {
              question: 'What is the best way to build vocabulary?',
              options: [
                'Learn phrases in context, not just individual words',
                'Memorize dictionary pages',
                'Only learn difficult words',
                'Avoid using new words until perfect'
              ],
              correctAnswer: 0,
              explanation: 'Learning phrases and collocations in context helps your brain form natural speaking patterns more effectively than memorizing isolated words.'
            },
            {
              question: 'What does intonation help convey?',
              options: [
                'Emotion and intent',
                'Only volume',
                'Grammar rules',
                'Vocabulary size'
              ],
              correctAnswer: 0,
              explanation: 'Intonation—the rise and fall of your voice—conveys emotion and intent, helping differentiate questions from statements and showing feelings.'
            },
            {
              question: 'What should you focus on when speaking English?',
              options: [
                'Communication over perfection',
                'Perfect grammar always',
                'Never making mistakes',
                'Speaking as fast as possible'
              ],
              correctAnswer: 0,
              explanation: 'Focus on communication and getting your message across. Fluency comes from practice and confidence, not from waiting until you\'re perfect.'
            },
            {
              question: 'How can you practice real-life English conversations?',
              options: [
                'Join speaking groups and practice daily scenarios',
                'Only study grammar books',
                'Avoid speaking until fluent',
                'Only write, never speak'
              ],
              correctAnswer: 0,
              explanation: 'Practicing real-life scenarios through speaking groups, daily conversations, and thinking in English helps build natural fluency.'
            }
          ]
        }
      },
      {
  id: 'topic-3',
  title: 'Mastering the Art of Communication: Conversing with Confidence and Respect',
  description: 'Learn how to communicate effectively, listen actively, express yourself clearly, and build lasting connections.',
  order: 3,
  lessons: [
    {
      id: 'lesson-3-1',
      title: 'Understanding the Basics of Communication',
      description: 'Learn the core principles and process of effective communication.',
      duration: '12 min',
      difficulty: 'beginner',
      category: 'Communication Skills',
      topicId: 'topic-3',
      order: 1,
      content: [
        {
          type: 'text',
          title: 'The Communication Process',
          content: 'Communication is the process of exchanging ideas, feelings, and information between people. It includes both verbal and non-verbal signals such as body language, tone, and facial expressions.'
        },
        {
          type: 'text',
          title: 'Common Barriers to Communication',
          content: 'Noise, assumptions, emotional stress, and cultural differences can interfere with effective communication.'
        },
        {
          type: 'text',
          title: 'Example Practice',
          content: 'Think of a time when someone misunderstood you. Rewrite your original message to make it clearer.'
        }
      ]
    },
    {
      id: 'lesson-3-2',
      title: 'The Power of Active Listening',
      description: 'Master the skill of listening to understand, not just to respond.',
      duration: '12 min',
      difficulty: 'beginner',
      category: 'Communication Skills',
      topicId: 'topic-3',
      order: 2,
      content: [
        {
          type: 'text',
          title: 'Why Listening Matters',
          content: 'Active listening builds trust, avoids misunderstandings, and strengthens relationships.'
        },
        {
          type: 'text',
          title: 'How to Listen Actively',
          content: 'Focus completely, avoid interruptions, reflect feelings, and ask clarifying questions.'
        },
        {
          type: 'text',
          title: 'Example Practice',
          content: 'Ask a friend to share a recent experience. Practice active listening and summarize what you heard.'
        }
      ]
    },
    {
      id: 'lesson-3-3',
      title: 'Expressing Yourself Clearly and Confidently',
      description: 'Learn how to speak clearly and confidently to convey your ideas effectively.',
      duration: '13 min',
      difficulty: 'intermediate',
      category: 'Communication Skills',
      topicId: 'topic-3',
      order: 3,
      content: [
        {
          type: 'text',
          title: 'How to Speak with Confidence',
          content: 'Prepare your thoughts, maintain good posture, speak clearly, and believe in your message.'
        },
        {
          type: 'text',
          title: 'Tone and Body Language',
          content: 'Your tone and gestures communicate emotion and attitude. Keep them positive and aligned with your message.'
        },
        {
          type: 'text',
          title: 'Practice Exercise',
          content: 'Deliver a one-minute talk on your favorite activity. Focus on clarity, tone, and body language.'
        }
      ]
    },
    {
      id: 'lesson-3-4',
      title: 'Conversing with Respect and Empathy',
      description: 'Develop empathy and respect in your conversations to create understanding.',
      duration: '14 min',
      difficulty: 'intermediate',
      category: 'Communication Skills',
      topicId: 'topic-3',
      order: 4,
      content: [
        {
          type: 'text',
          title: 'Practicing Empathy',
          content: 'Empathy means seeing from another person’s perspective and responding with understanding.'
        },
        {
          type: 'text',
          title: 'Handling Conflict Gracefully',
          content: 'Use “I” statements, stay calm, and focus on solutions rather than blame.'
        },
        {
          type: 'text',
          title: 'Example Practice',
          content: 'Role-play an emotional conversation and practice staying calm, listening, and responding with empathy.'
        }
      ]
    },
    {
      id: 'lesson-3-5',
      title: 'Building Meaningful and Lasting Connections',
      description: 'Learn to create genuine, trust-based relationships through communication.',
      duration: '15 min',
      difficulty: 'advanced',
      category: 'Communication Skills',
      topicId: 'topic-3',
      order: 5,
      content: [
        {
          type: 'text',
          title: 'Moving Beyond Small Talk',
          content: 'Ask open-ended questions to create deeper connections: “What inspires you lately?” or “What are you proud of?”'
        },
        {
          type: 'text',
          title: 'Building Rapport and Trust',
          content: 'Use names, remember details, and follow up — small gestures show genuine care.'
        },
        {
          type: 'text',
          title: 'Example Practice',
          content: 'Reach out to someone you haven’t spoken to recently and send a warm message checking in on them.'
        }
      ]
    }
  ],
  quiz: {
    questions: [
      {
        question: 'What is the most important part of active listening?',
        options: [
          'Planning your response while they talk',
          'Focusing on understanding both words and emotions',
          'Talking more to show engagement',
          'Offering advice quickly'
        ],
        correctAnswer: 1,
        explanation: 'Active listening involves fully focusing on the speaker’s message and emotions before responding.'
      },
      {
        question: 'Which statement shows empathy?',
        options: [
          '“That’s not a big deal.”',
          '“You always get upset over small things.”',
          '“I can see why you’d feel that way.”',
          '“You shouldn’t feel that way.”'
        ],
        correctAnswer: 2,
        explanation: 'Empathy means acknowledging another person’s feelings with understanding and respect.'
      }
    ]
  }
},
{
  id: 'topic-4',
  title: 'Mastering Phone Conversations with Clarity, Warmth, and Respect',
  description: 'Develop your ability to communicate effectively over the phone with professionalism and empathy.',
  order: 4,
  lessons: [
    {
      id: 'lesson-4-1',
      title: 'The Nature of Phone Conversations',
      description: 'Learn how tone and pacing replace body language in phone communication.',
      duration: '10 min',
      difficulty: 'beginner',
      category: 'Phone Communication',
      topicId: 'topic-4',
      order: 1,
      content: [
        {
          type: 'text',
          title: 'The Emotional Side of Voice',
          content: 'Your tone conveys warmth, calmness, or irritation — it shapes how others feel on the call.'
        },
        {
          type: 'text',
          title: 'Tips for Sounding Clear and Warm',
          content: 'Smile while speaking, use pauses, maintain good posture, and avoid distractions.'
        },
        {
          type: 'text',
          title: 'Example Practice',
          content: 'Call a friend for 3 minutes focusing on tone and pacing. Ask afterward if you sounded friendly and calm.'
        }
      ]
    },
    {
      id: 'lesson-4-2',
      title: 'Creating a Positive First Impression on the Phone',
      description: 'Start your calls with warmth, clarity, and confidence.',
      duration: '12 min',
      difficulty: 'beginner',
      category: 'Phone Communication',
      topicId: 'topic-4',
      order: 2,
      content: [
        {
          type: 'text',
          title: 'Polite Introductions and Transitions',
          content: 'Introduce yourself clearly and use smooth transitions like “By the way…” or “Before I forget…”'
        },
        {
          type: 'text',
          title: 'Creating Emotional Connection',
          content: 'Ask genuine questions like “How are you feeling lately?” to show care and connection.'
        },
        {
          type: 'text',
          title: 'Example Practice',
          content: 'Role-play two phone calls: one casual, one formal. Adjust your tone and words for each.'
        }
      ]
    },
    {
      id: 'lesson-4-3',
      title: 'Listening and Responding with Care',
      description: 'Show attentiveness through verbal cues and empathy during calls.',
      duration: '13 min',
      difficulty: 'intermediate',
      category: 'Phone Communication',
      topicId: 'topic-4',
      order: 3,
      content: [
        {
          type: 'text',
          title: 'Verbal Feedback that Shows Engagement',
          content: 'Use small phrases like “I see,” “That must be tough,” and “Tell me more.”'
        },
        {
          type: 'text',
          title: 'Tips for Empathetic Listening',
          content: 'Avoid multitasking, don’t rush to give advice, and paraphrase for clarity.'
        },
        {
          type: 'text',
          title: 'Example Practice',
          content: 'Call a family member and listen actively. Summarize what you heard to confirm understanding.'
        }
      ]
    },
    {
      id: 'lesson-4-4',
      title: 'Handling Misunderstandings and Emotional Conversations',
      description: 'Manage tense or emotional phone talks with calmness and empathy.',
      duration: '14 min',
      difficulty: 'intermediate',
      category: 'Phone Communication',
      topicId: 'topic-4',
      order: 4,
      content: [
        {
          type: 'text',
          title: 'Staying Calm During Conflict',
          content: 'Listen first, respond with kindness, and clarify misunderstandings instead of defending yourself.'
        },
        {
          type: 'text',
          title: 'Repairing Hurt Feelings',
          content: 'Apologize sincerely and take responsibility when something came across wrong.'
        },
        {
          type: 'text',
          title: 'Example Practice',
          content: 'Write a short call script where you calmly clarify a misunderstanding and apologize.'
        }
      ]
    },
    {
      id: 'lesson-4-5',
      title: 'Ending Calls with Warmth and Connection',
      description: 'Leave a positive and lasting impression when ending your calls.',
      duration: '10 min',
      difficulty: 'beginner',
      category: 'Phone Communication',
      topicId: 'topic-4',
      order: 5,
      content: [
        {
          type: 'text',
          title: 'Showing Gratitude and Affection',
          content: 'End calls with appreciation or affection: “It was great catching up!” or “Thanks for your time.”'
        },
        {
          type: 'text',
          title: 'Following Up After Calls',
          content: 'Send a message or email to express gratitude or continue the connection.'
        },
        {
          type: 'text',
          title: 'Example Practice',
          content: 'Call a friend and end with a kind or appreciative closing. Ask how it made them feel.'
        }
      ]
    }
  ],
  quiz: {
    questions: [
      {
        question: 'Why is tone especially important on the phone?',
        options: [
          'Because body language isn’t visible',
          'Because people can’t hear your words',
          'Because tone doesn’t matter',
          'Because it replaces clarity'
        ],
        correctAnswer: 0,
        explanation: 'Without visual cues, tone carries emotional meaning and determines how your message is received.'
      },
      {
        question: 'What’s a good way to end a phone call?',
        options: [
          'Hang up abruptly',
          'End with gratitude or warmth',
          'Say nothing',
          'Complain about the time'
        ],
        correctAnswer: 1,
        explanation: 'A kind and appreciative closing leaves a lasting positive impression.'
      }
    ]
  }
},
{
  id: 'topic-5',
  title: 'Respectful and Effective Debating Skills',
  description: 'Learn how to express your ideas clearly, listen actively, manage emotions, and find common ground in any debate with confidence and respect.',
  order: 5,
  lessons: [
    {
      id: 'lesson-5-1',
      title: 'Understanding the Purpose of a Debate',
      description: 'Discover what debating truly means — not to win, but to learn, understand, and connect through respectful discussion.',
      duration: '14 min',
      difficulty: 'beginner',
      category: 'Debating Skills',
      topicId: 'topic-5',
      order: 1,
      content: [
        {
          type: 'text',
          title: 'The True Meaning of Debate',
          content: 'Debate is not a verbal battle to determine who is right or wrong. It is a respectful exchange of ideas that deepens understanding and encourages open-mindedness.'
        },
        {
          type: 'text',
          title: 'Separating Ideas from Identity',
          content: 'Disagreement with your viewpoint is not a rejection of you as a person. Respectful debaters focus on arguments, not egos.'
        },
        {
          type: 'text',
          title: 'Tips for Respectful Debating',
          content: '• Enter debates with curiosity, not hostility.\n• Focus on understanding the “why” behind others’ opinions.\n• Avoid dominating the conversation.\n• Use respectful transitions like, “I understand your point, but I see it differently because…”'
        },
        {
          type: 'text',
          title: 'Scenario Example',
          content: 'Friend: “Technology is ruining real communication.”\nYour response: “I can see why you think that — people do rely on screens a lot. But technology also helps families stay connected. Maybe it’s not the tool that’s the problem, but how people use it.”'
        },
        {
          type: 'text',
          title: 'Key Takeaways',
          content: 'Debating respectfully begins with understanding. Focus on learning, not winning. The best debates are bridges, not battles.'
        }
      ]
    },
    {
      id: 'lesson-5-2',
      title: 'Listening Before Responding',
      description: 'Learn how active listening strengthens debates and creates mutual respect.',
      duration: '12 min',
      difficulty: 'beginner',
      category: 'Debating Skills',
      topicId: 'topic-5',
      order: 2,
      content: [
        {
          type: 'text',
          title: 'The Power of Listening in Debate',
          content: 'The best debaters listen deeply before responding. Listening ensures understanding and shows respect.'
        },
        {
          type: 'text',
          title: 'Active Listening Techniques',
          content: 'Maintain eye contact, nod to show engagement, and paraphrase the speaker’s points (“So what you mean is…”). This proves you value their view.'
        },
        {
          type: 'text',
          title: 'Tips for Better Listening',
          content: '• Don’t interrupt.\n• Use short affirmations (“I see,” “That makes sense”).\n• Listen for emotions as well as words.\n• Focus on understanding, not rebutting.'
        },
        {
          type: 'text',
          title: 'Scenario Example',
          content: 'Classmate: “Uniforms should be banned because they restrict freedom.”\nYour response: “I understand your perspective — freedom of expression matters. But uniforms can also reduce bullying. Maybe there’s a balance, like having optional casual days.”'
        },
        {
          type: 'text',
          title: 'Key Takeaways',
          content: 'Listening is strength, not passivity. It reduces conflict, increases understanding, and builds fairness in discussion.'
        }
      ]
    },
    {
      id: 'lesson-5-3',
      title: 'Expressing Your Ideas Clearly and Calmly',
      description: 'Develop clarity, structure, and composure when presenting your points during debates.',
      duration: '13 min',
      difficulty: 'intermediate',
      category: 'Debating Skills',
      topicId: 'topic-5',
      order: 3,
      content: [
        {
          type: 'text',
          title: 'The Importance of Clarity and Calmness',
          content: 'Even strong points lose impact when delivered emotionally. Clear, calm expression helps others truly hear your message.'
        },
        {
          type: 'text',
          title: 'Using the P.R.E. Method',
          content: '• Point – State what you believe.\n• Reason – Explain why you believe it.\n• Example – Support with evidence or experience.'
        },
        {
          type: 'text',
          title: 'Tips for Calm, Clear Delivery',
          content: '• Avoid filler words (“uhm,” “like”).\n• Speak at a steady pace.\n• Use transitions (“for example,” “on the other hand”).\n• Breathe before replying emotionally.'
        },
        {
          type: 'text',
          title: 'Scenario Example',
          content: 'Family member: “Young people today are lazy.”\nYour response: “I understand that view. But many young people juggle work and study. What may look like laziness could be burnout from too many responsibilities.”'
        },
        {
          type: 'text',
          title: 'Key Takeaways',
          content: 'Persuade through reason, not volume. Calm clarity earns respect and makes your arguments more powerful.'
        }
      ]
    },
    {
      id: 'lesson-5-4',
      title: 'Managing Emotions and Avoiding Personal Attacks',
      description: 'Learn emotional control techniques that keep debates productive and respectful.',
      duration: '14 min',
      difficulty: 'intermediate',
      category: 'Debating Skills',
      topicId: 'topic-5',
      order: 4,
      content: [
        {
          type: 'text',
          title: 'Emotional Control in Debate',
          content: 'Strong emotions can cloud logic. Respectful debaters notice their feelings and respond thoughtfully, not reactively.'
        },
        {
          type: 'text',
          title: 'Targeting Ideas, Not Individuals',
          content: 'Avoid insults or mockery. Say, “I disagree with that point” instead of “That’s ridiculous.” Focus on reasoning, not personalities.'
        },
        {
          type: 'text',
          title: 'Tips for Managing Emotions',
          content: '• Pause before responding in anger.\n• Use “I” statements (“I feel that…”).\n• Suggest short breaks if things get heated.\n• Remember: understanding, not dominance, is the goal.'
        },
        {
          type: 'text',
          title: 'Scenario Example',
          content: 'Classmate: “That’s ridiculous — you always exaggerate.”\nYour response: “I’m sorry if it came across that way. I just feel strongly about this topic. Let me explain my reasoning.”'
        },
        {
          type: 'text',
          title: 'Key Takeaways',
          content: 'Self-control shows strength. Calmness keeps debates respectful and productive. Defend ideas, not egos.'
        }
      ]
    },
    {
      id: 'lesson-5-5',
      title: 'Finding Common Ground and Ending Respectfully',
      description: 'Learn how to conclude debates positively by acknowledging shared values and maintaining respect.',
      duration: '12 min',
      difficulty: 'beginner',
      category: 'Debating Skills',
      topicId: 'topic-5',
      order: 5,
      content: [
        {
          type: 'text',
          title: 'The Importance of a Respectful Ending',
          content: 'A meaningful debate ends with understanding, not victory. Respectful closings leave lasting positive impressions.'
        },
        {
          type: 'text',
          title: 'Finding Common Ground',
          content: 'Identify shared goals or values, even in disagreement. This builds bridges rather than walls.'
        },
        {
          type: 'text',
          title: 'Tips for Ending Gracefully',
          content: '• Thank the other person (“I appreciate your time and insight”).\n• Summarize shared beliefs (“We both care about fairness”).\n• Avoid abrupt endings.\n• Reflect afterward on lessons learned.'
        },
        {
          type: 'text',
          title: 'Scenario Example',
          content: 'Friend: debating about climate change.\nYour closing: “We may differ on methods, but we both agree the environment matters. Thanks for helping me see another perspective.”'
        },
        {
          type: 'text',
          title: 'Key Takeaways',
          content: 'Respectful debating connects people. True victory lies not in defeating others but in strengthening understanding and civility.'
        }
      ]
    }
  ],
  quiz: {
    questions: [
      {
        question: 'What is the true purpose of a debate?',
        options: [
          'To prove you are right',
          'To understand and learn from differing perspectives',
          'To convince others at any cost',
          'To dominate the conversation'
        ],
        correctAnswer: 1,
        explanation: 'The goal of debate is mutual understanding and learning, not victory or dominance.'
      },
      {
        question: 'What should you do if you feel angry during a debate?',
        options: [
          'Raise your voice to show confidence',
          'Take a pause and refocus on understanding',
          'Ignore the other person’s points',
          'Walk away immediately without comment'
        ],
        correctAnswer: 1,
        explanation: 'Pausing helps you regain calmness and ensures the discussion remains respectful.'
      }
    ]
  }
}
    ];  }

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

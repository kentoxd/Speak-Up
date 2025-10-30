import { Injectable } from '@angular/core';

export interface Topic {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
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
            ],
            quiz: {
              questions: [
                {
                  question: 'What is the primary purpose of a Persuasive Speech?',
                  options: [
                    'To celebrate or honor an individual or an event.',
                    'To educate the audience on a complex concept.',
                    'To amuse or engage the audience with humor and storytelling.',
                    'To encourage the audience to accept a specific viewpoint or take action.'
                  ],
                  correctAnswer: 3,
                  explanation: 'A persuasive speech aims to convince the audience to accept a viewpoint or take action.'
                },
                {
                  question: 'According to the lesson, which of the following is listed as a common misconception about public speaking?',
                  options: [
                    'Mistakes are a normal part of the process.',
                    'A clear message is key to an effective speech.',
                    'Great speakers are born with a natural ability.',
                    'Public speaking develops your leadership skills.'
                  ],
                  correctAnswer: 2,
                  explanation: 'The lesson debunks the myth that great speakers are born—public speaking is a learned skill.'
                },
                {
                  question: 'Which type of speech is primarily focused on sharing a story or making the audience laugh?',
                  options: [
                    'Special Occasion Speech',
                    'Entertaining Speech',
                    'Informative Speech',
                    'Persuasive Speech'
                  ],
                  correctAnswer: 1,
                  explanation: 'Entertaining speeches amuse or engage the audience, often using humor or storytelling.'
                },
                {
                  question: 'A speech explaining the steps of the photosynthesis process is an example of which type of speech?',
                  options: [
                    'Informative',
                    'Persuasive',
                    'Special Occasion',
                    'Entertaining'
                  ],
                  correctAnswer: 0,
                  explanation: 'An informative speech aims to educate or explain a concept to the audience.'
                },
                {
                  question: 'What does the Key Takeaway of Lesson 1 state about the essence of public speaking?',
                  options: [
                    'It is about mastery of voice and body language.',
                    'It is about connection—sharing your message clearly and confidently.',
                    'It is about perfect articulation and grammar.',
                    'It is about critical thinking and organization.'
                  ],
                  correctAnswer: 1,
                  explanation: 'Public speaking is about connection—sharing your message clearly and confidently with others.'
                },
                {
                  question: 'Which of the following is listed as a vital role of public speaking?',
                  options: [
                    'Education, business, and leadership.',
                    'Scientific research and laboratory testing.',
                    'Manual labor and physical conditioning.',
                    'Technical writing and data analysis.'
                  ],
                  correctAnswer: 0,
                  explanation: 'Public speaking plays a vital role in education, business, leadership, and daily communication.'
                },
                {
                  question: 'What does the lesson suggest is more powerful than striving for perfection in a speech?',
                  options: [
                    'Authenticity in your expression.',
                    'Ignoring audience feedback.',
                    'Using highly technical vocabulary.',
                    'Memorization of the entire script.'
                  ],
                  correctAnswer: 0,
                  explanation: 'Authenticity is more powerful than perfection when connecting with an audience.'
                },
                {
                  question: 'A speaker delivering a toast at a wedding is giving which type of speech?',
                  options: [
                    'Special Occasion Speech',
                    'Entertaining Speech',
                    'Persuasive Speech',
                    'Informative Speech'
                  ],
                  correctAnswer: 0,
                  explanation: 'Special occasion speeches celebrate or honor people and events like weddings.'
                },
                {
                  question: 'What is one specific skill that public speaking is said to develop?',
                  options: [
                    'Your ability to type faster.',
                    'Your ability to swim long distances.',
                    'Your ability to remember phone numbers.',
                    'Your ability to think critically.'
                  ],
                  correctAnswer: 3,
                  explanation: 'Public speaking develops critical thinking, along with organizing ideas and expressing yourself confidently.'
                },
                {
                  question: 'What is the best tip for a beginner speaker to start with, according to the lesson?',
                  options: [
                    'Choose a highly controversial topic to capture attention.',
                    'Only watch foreign language speeches.',
                    'Start with topics you are passionate about.',
                    'Attempt to sound exactly like a famous speaker.'
                  ],
                  correctAnswer: 2,
                  explanation: 'Starting with topics you are passionate about makes it easier to speak confidently and authentically.'
                }
              ]
            }
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
            ],
            quiz: {
              questions: [
                {
                  question: 'Which one of these is identified as a cause of stage fright?',
                  options: [
                    'The feeling of excitement and anticipation.',
                    'Being overly prepared and rehearsed.',
                    'Making eye contact with friendly faces.',
                    'Fear of judgment or criticism from the audience.'
                  ],
                  correctAnswer: 3,
                  explanation: 'Fear of judgment or criticism from the audience is one of the main causes of stage fright listed in the lesson.'
                },
                {
                  question: 'How does the lesson suggest using visualization to manage anxiety?',
                  options: [
                    'By imagining yourself speaking clearly, confidently, and receiving applause.',
                    'By imagining yourself forgetting your lines and recovering.',
                    'By imagining the audience in silly clothes to make them seem less intimidating.',
                    'By counting the number of people in the audience.'
                  ],
                  correctAnswer: 0,
                  explanation: 'Visualization involves imagining yourself standing confidently, speaking clearly, and receiving applause to build positive energy.'
                },
                {
                  question: 'What is the recommended timing for the breathing exercise mentioned in the lesson?',
                  options: [
                    'Inhaling for 2, holding for 4, and exhaling for 8 seconds.',
                    'Inhaling for 6, holding for 6, and exhaling for 6 seconds.',
                    'Inhaling for 4, holding for 2, and exhaling for 6 seconds.',
                    'Rapid, shallow breaths to increase oxygen flow.'
                  ],
                  correctAnswer: 2,
                  explanation: 'The lesson recommends inhaling for 4 seconds, holding for 2, and exhaling for 6 seconds to help slow your heartbeat and relax your body.'
                },
                {
                  question: 'According to the Key Takeaway, what does confidence in public speaking not mean?',
                  options: [
                    'It means you face fear with positive thinking.',
                    'It means you are well-prepared.',
                    'It means you never feel afraid.',
                    'It means you have rehearsed your speech multiple times.'
                  ],
                  correctAnswer: 2,
                  explanation: 'Confidence doesn\'t mean you never feel afraid—it means you face fear with preparation, practice, and positive thinking.'
                },
                {
                  question: 'The example of professional speakers like TED Talk presenters rehearsing dozens of times illustrates the importance of which anxiety management technique?',
                  options: [
                    'Preparation',
                    'Breathing Exercises',
                    'Positive Self-Talk',
                    'Visualization'
                  ],
                  correctAnswer: 0,
                  explanation: 'The TED Talk example demonstrates that preparation is crucial—even professional speakers rehearse extensively before presenting.'
                },
                {
                  question: 'What is a good strategy to replace the negative thought, "I\'ll mess up"?',
                  options: [
                    'Focusing intensely on past mistakes.',
                    'Trying to completely empty your mind of all thoughts.',
                    'Telling yourself, "I\'m ready and capable."',
                    'Immediately consuming a caffeinated beverage.'
                  ],
                  correctAnswer: 2,
                  explanation: 'Positive self-talk involves replacing negative thoughts like "I\'ll mess up" with affirming statements like "I\'m ready and capable."'
                },
                {
                  question: 'What is one confidence tip for a speaker when they first arrive at the presentation space?',
                  options: [
                    'Arrive early to get comfortable with the environment.',
                    'Avoid looking at the stage or podium.',
                    'Immediately start greeting every audience member personally.',
                    'Only focus on the people you know in the room.'
                  ],
                  correctAnswer: 0,
                  explanation: 'Arriving early allows you to get comfortable with the environment, which helps build confidence before speaking.'
                },
                {
                  question: 'When you are speaking, the lesson suggests you should shift your focus onto:',
                  options: [
                    'The message you want to deliver.',
                    'How your clothes and appearance look.',
                    'The judgmental faces in the crowd.',
                    'Your own nervousness and physical feelings.'
                  ],
                  correctAnswer: 0,
                  explanation: 'Focus on your message, not on yourself—this reduces self-consciousness and helps manage anxiety.'
                },
                {
                  question: 'What is the recommended strategy for a beginner to "start small" when building confidence?',
                  options: [
                    'Only rehearse the conclusion of the speech.',
                    'Practice only in front of a mirror.',
                    'Practice in front of friends or classmates first.',
                    'Give a speech to an audience of over 100 people immediately.'
                  ],
                  correctAnswer: 2,
                  explanation: 'Starting small means practicing in front of friends or classmates before facing a larger audience—each attempt builds confidence.'
                },
                {
                  question: 'One of the causes of stage fright is pressure to perform perfectly. What does the lesson suggest is more powerful than perfection?',
                  options: [
                    'Authenticity in your presentation.',
                    'Strict adherence to a written script.',
                    'Avoiding all pauses or silence.',
                    'Pretending that you are not nervous.'
                  ],
                  correctAnswer: 0,
                  explanation: 'Authenticity is more powerful than perfection—being genuine creates better connection with your audience.'
                }
              ]
            }
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
            ],
            quiz: {
              questions: [
                {
                  question: 'What is the function of giving a brief preview of your main points in the Introduction?',
                  options: [
                    'To serve as the call to action.',
                    'To capture the audience\'s attention with a story.',
                    'To help the audience follow and anticipate the message\'s structure.',
                    'To restate the key points of the presentation.'
                  ],
                  correctAnswer: 2,
                  explanation: 'A brief preview in the introduction helps the audience follow and anticipate the structure of your message, making it easier to understand.'
                },
                {
                  question: 'Which section of the speech is described as using examples, data, or stories for support?',
                  options: [
                    'Introduction',
                    'Conclusion',
                    'Body',
                    'Transition'
                  ],
                  correctAnswer: 2,
                  explanation: 'The body of the speech presents your main ideas supported by examples, data, or stories.'
                },
                {
                  question: 'What is a specific, recommended way to make the conclusion strong?',
                  options: [
                    'Introduce an entirely new, surprising main point.',
                    'End with a strong closing thought or call to action.',
                    'Start a long, detailed story to entertain the audience.',
                    'Ask the audience if they have any questions.'
                  ],
                  correctAnswer: 1,
                  explanation: 'A strong conclusion ends with a memorable closing thought, call to action, or quote—not new information.'
                },
                {
                  question: 'The use of phrases like "Next," "In addition," and "Finally" primarily serves what purpose in the speech structure?',
                  options: [
                    'To capture the audience\'s attention.',
                    'To signal a shift between main points.',
                    'To introduce the topic and purpose.',
                    'To expand on supporting data or evidence.'
                  ],
                  correctAnswer: 1,
                  explanation: 'Transition phrases like "Next," "In addition," and "Finally" signal shifts between main points, helping the speech flow smoothly.'
                },
                {
                  question: 'According to the lesson, what is the best alternative to reading a complete script during a speech?',
                  options: [
                    'A teleprompter.',
                    'Memorizing the speech word-for-word.',
                    'Using an outline or cue cards.',
                    'Nothing at all, relying only on memory.'
                  ],
                  correctAnswer: 2,
                  explanation: 'Using an outline or cue cards allows you to speak naturally while staying organized, which is better than reading a script.'
                },
                {
                  question: 'A speaker begins their speech by asking, "Have you ever imagined a world without books?" This technique is primarily fulfilling which specific role of the Introduction?',
                  options: [
                    'Restating key points.',
                    'Giving a brief preview of the main points.',
                    'Presenting the main ideas in a logical order.',
                    'Capturing the audience\'s attention.'
                  ],
                  correctAnswer: 3,
                  explanation: 'Starting with a question is a technique to capture the audience\'s attention at the beginning of the speech.'
                },
                {
                  question: 'To ensure an effective speech, the lesson advises that you should keep your ideas:',
                  options: [
                    'Complex and multi-layered to show expertise.',
                    'Detailed and focused on every possible sub-topic.',
                    'Simple and focused on one main message.',
                    'Open-ended, without a clear purpose or conclusion.'
                  ],
                  correctAnswer: 2,
                  explanation: 'Keeping ideas simple and focused on one main message makes your speech clearer and more effective.'
                },
                {
                  question: 'Which component is NOT listed as a key part of the three-part framework for every effective speech?',
                  options: [
                    'Introduction',
                    'Summary',
                    'Body',
                    'Conclusion'
                  ],
                  correctAnswer: 1,
                  explanation: 'The three-part framework consists of Introduction, Body, and Conclusion—not Summary.'
                },
                {
                  question: 'What makes a speech sound confusing, even if the topic is good?',
                  options: [
                    'A lack of a clear structure and organization.',
                    'Using too many humorous stories.',
                    'Speaking with too much enthusiasm.',
                    'Reading directly from a script.'
                  ],
                  correctAnswer: 0,
                  explanation: 'Without clear structure and organization, even a good topic can sound confusing to the audience.'
                },
                {
                  question: 'Why is it important to "Practice transitions for smooth flow"?',
                  options: [
                    'To keep the audience guessing about the next topic.',
                    'To ensure the audience understands that you have finished your speech.',
                    'To make the speaker sound more professional and prepared.',
                    'To use every piece of data available to you.'
                  ],
                  correctAnswer: 2,
                  explanation: 'Practicing transitions helps you sound more professional and prepared, making your speech flow smoothly.'
                }
              ]
            }
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
            ],
            quiz: {
              questions: [
                {
                  question: 'The lesson suggests using pauses during a speech primarily for what effect?',
                  options: [
                    'To allow the speaker to quickly read the next line from their notes.',
                    'To emphasize a key point, allowing the message to be absorbed.',
                    'To completely break eye contact with the audience.',
                    'To signal that the speech is about to end.'
                  ],
                  correctAnswer: 1,
                  explanation: 'Pauses emphasize key points and give the audience time to absorb your message—silence can be powerful.'
                },
                {
                  question: 'What is one common mistake that can significantly weaken a speech\'s delivery, according to the lesson?',
                  options: [
                    'Speaking with too much passion.',
                    'Using a variety of gestures.',
                    'Reading directly from slides or notes.',
                    'Using a strong, clear volume.'
                  ],
                  correctAnswer: 2,
                  explanation: 'Reading directly from slides or notes breaks connection with your audience and significantly weakens delivery.'
                },
                {
                  question: 'When adjusting your Pace, what is the recommended technique for important points?',
                  options: [
                    'Speeding up to create excitement.',
                    'Slowing down to highlight their significance.',
                    'Maintaining a constant, rapid speed throughout.',
                    'Changing your pitch instead of your pace.'
                  ],
                  correctAnswer: 1,
                  explanation: 'Slowing down for important points helps emphasize them and gives the audience time to process the information.'
                },
                {
                  question: 'Which body language action does the lesson advise a speaker to avoid?',
                  options: [
                    'Standing tall with good posture.',
                    'Using hand gestures to highlight points.',
                    'Fidgeting or crossing your arms.',
                    'Letting your face reflect the emotion.'
                  ],
                  correctAnswer: 2,
                  explanation: 'Fidgeting or crossing your arms conveys nervousness or defensiveness and should be avoided.'
                },
                {
                  question: 'What is the primary purpose of maintaining eye contact with different parts of the audience?',
                  options: [
                    'To help the speaker find their next point on their notes.',
                    'To build trust and keep the audience engaged.',
                    'To signal that the speech is moving from the Introduction to the Body.',
                    'To identify which audience members are easily distracted.'
                  ],
                  correctAnswer: 1,
                  explanation: 'Maintaining eye contact with different parts of the audience builds trust and keeps them engaged throughout your presentation.'
                },
                {
                  question: 'The lesson emphasizes that a great speaker must combine which three elements to bring their words to life?',
                  options: [
                    'Storytelling, Humor, and Data.',
                    'Voice, Body Language, and Facial Expression.',
                    'Pitch, Pace, and Volume.',
                    'Outline, Cue Cards, and Script.'
                  ],
                  correctAnswer: 1,
                  explanation: 'Great speakers combine voice, body language, and facial expression to bring their words to life.'
                },
                {
                  question: 'Which technique is a useful tip for a speaker to observe and improve their own gestures and tone?',
                  options: [
                    'Asking friends to take notes on every mistake.',
                    'Only focusing on the tone of a famous speech.',
                    'Recording your speech or practicing in front of a mirror.',
                    'Using a very soft volume so you can hear yourself better.'
                  ],
                  correctAnswer: 2,
                  explanation: 'Recording your speech or practicing in front of a mirror helps you observe and improve your gestures and tone.'
                },
                {
                  question: 'To communicate confidence through posture, what does the lesson recommend?',
                  options: [
                    'Leaning heavily on the podium for support.',
                    'Crossing your legs tightly to limit movement.',
                    'Standing tall with good posture.',
                    'Keeping your hands hidden in your pockets.'
                  ],
                  correctAnswer: 2,
                  explanation: 'Standing tall with good posture communicates confidence before you even speak.'
                },
                {
                  question: 'Why is it important to use Pitch effectively?',
                  options: [
                    'To change your tone to show emotion.',
                    'To adjust your speed to slow down for important points.',
                    'To use silence for emphasis.',
                    'To ensure everyone can hear you clearly.'
                  ],
                  correctAnswer: 0,
                  explanation: 'Pitch variation helps you change your tone to show emotion, making your delivery more expressive and engaging.'
                },
                {
                  question: 'The Key Takeaway of Lesson 4 states that effective delivery transforms words into what?',
                  options: [
                    'A perfect memory of every line.',
                    'An outline for future presentations.',
                    'Impact.',
                    'A personal self-critique.'
                  ],
                  correctAnswer: 2,
                  explanation: 'Effective delivery transforms words into impact, making your message unforgettable.'
                }
              ]
            }
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
            ],
            quiz: {
              questions: [
                {
                  question: 'Which engagement technique is highlighted as being easier for an audience to remember than facts alone?',
                  options: [
                    'Listing complex data points.',
                    'Using stories and real-life experiences.',
                    'Speaking in a monotone voice.',
                    'Avoiding all eye contact.'
                  ],
                  correctAnswer: 1,
                  explanation: 'People remember stories more than facts—relating your message to real-life experiences makes it memorable.'
                },
                {
                  question: 'What is the primary rule for the text content on visual aids like PowerPoint slides?',
                  options: [
                    'The slides must contain the entire speech script word-for-word.',
                    'Keep slides simple, with a maximum of 5–6 lines per slide.',
                    'Use the smallest font possible to fit more information.',
                    'Make all text a dark color on a dark background.'
                  ],
                  correctAnswer: 1,
                  explanation: 'Keep slides simple with 5-6 lines maximum to avoid overwhelming the audience and maintain focus.'
                },
                {
                  question: 'What is the recommended strategy if the audience appears bored during your speech?',
                  options: [
                    'Pretend you don\'t notice and continue speaking as planned.',
                    'Stop the speech and ask them why they are bored.',
                    'Change your tone or add a short anecdote to re-engage them.',
                    'Immediately read the conclusion to end the speech faster.'
                  ],
                  correctAnswer: 2,
                  explanation: 'Adapt to audience reactions by changing your tone or adding anecdotes to re-engage them and maintain interest.'
                },
                {
                  question: 'What is a critical mistake to avoid when using slides?',
                  options: [
                    'Making eye contact with the audience.',
                    'Using a chart to display data.',
                    'Reading all the text directly from your slides.',
                    'Keeping the slides simple and focused.'
                  ],
                  correctAnswer: 2,
                  explanation: 'Avoid reading from slides—talk to the audience, not at the screen, to maintain engagement and connection.'
                },
                {
                  question: 'Which quality is described as being "contagious" and a key way to engage the audience?',
                  options: [
                    'Anxiety',
                    'A complex vocabulary',
                    'Enthusiasm and sincerity',
                    'A neutral, detached tone'
                  ],
                  correctAnswer: 2,
                  explanation: 'Your passion is contagious—speaking with enthusiasm and sincerity engages and energizes your audience.'
                },
                {
                  question: 'During a Q&A session, what should you do if you don\'t know the answer to a question?',
                  options: [
                    'Make up a plausible answer to avoid looking unprepared.',
                    'Ignore the question and move to the next one.',
                    'Admit it is okay not to know and offer to follow up later.',
                    'Ask the audience member to answer their own question.'
                  ],
                  correctAnswer: 2,
                  explanation: 'It\'s okay to admit you don\'t know—offering to follow up later shows honesty and professionalism.'
                },
                {
                  question: 'What should be ensured regarding the font on visual aids?',
                  options: [
                    'It should be an elegant, decorative font that is difficult to read.',
                    'It must be large and clear enough for everyone to read.',
                    'It should be smaller than the rest of the text on the slide.',
                    'It should only be the speaker\'s favorite color.'
                  ],
                  correctAnswer: 1,
                  explanation: 'Use large, readable fonts and clear images so everyone in the audience can see and understand your visuals.'
                },
                {
                  question: 'Why does the lesson recommend using rhetorical or direct questions as a way to engage the audience?',
                  options: [
                    'To fill time when the speaker forgets their lines.',
                    'To encourage participation and interaction.',
                    'To force the audience to leave the room.',
                    'To introduce new material into the speech body.'
                  ],
                  correctAnswer: 1,
                  explanation: 'Asking questions encourages participation and interaction, keeping the audience actively engaged with your message.'
                },
                {
                  question: 'Which of the following is not a recommended practice for handling questions during a Q&A session?',
                  options: [
                    'Listening carefully to the question.',
                    'Answering briefly and politely.',
                    'Giving a lengthy, in-depth explanation for every question.',
                    'Being honest if you don\'t know the answer.'
                  ],
                  correctAnswer: 2,
                  explanation: 'Answer questions briefly and politely—lengthy explanations for every question can lose audience interest.'
                },
                {
                  question: 'The Key Takeaway of Lesson 5 states that visuals, stories, and interaction make your message what?',
                  options: [
                    'Longer and more technical.',
                    'Subjective and difficult to follow.',
                    'Memorable and meaningful.',
                    'More focused on the speaker\'s performance.'
                  ],
                  correctAnswer: 2,
                  explanation: 'Visuals, stories, and interaction make your message memorable and meaningful to the audience.'
                }
              ]
            }
          }
        ],
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
                type: 'text',
                title: 'How to Build Fluency',
                content: '• Think in English. Avoid translating from your native language\n• Speak daily, even for 5 minutes. Talk to yourself, record short audio journals, or practice with a friend\n• Don\'t fear mistakes. Focus on getting your message across rather than being perfect\n• Use natural fillers. Words like "well," "you know," "actually" make your speech sound smoother\n• Listen actively. Exposure to English helps your brain pick up sentence patterns naturally\n\nKey Takeaway: Fluency means speaking smoothly and confidently, not perfectly.'
              }
            ],
            quiz: {
              questions: [
                {
                  question: 'What is the primary focus of Fluency in speech?',
                  options: [
                    'Correct grammar, pronunciation, and vocabulary use.',
                    'Speaking smoothly, at a natural speed, without unnecessary pauses.',
                    'The ability to write complex, grammatically perfect sentences.',
                    'Memorizing long lists of technical vocabulary.'
                  ],
                  correctAnswer: 1,
                  explanation: 'Fluency is about speaking smoothly and naturally, not focusing on perfect grammar.'
                },
                {
                  question: 'According to the lesson, which statement about fluency is true?',
                  options: [
                    'You must speak perfectly before you can speak fluently.',
                    'Fluency is built through practice, not perfection.',
                    'Fluency should be mastered only after achieving complete accuracy.',
                    'Fluency means translating every thought from your native language first.'
                  ],
                  correctAnswer: 1,
                  explanation: 'Fluency develops through consistent speaking practice — not by waiting for perfection.'
                },
                {
                  question: 'In the example, "I go park yesterday, it was fun!"—what does this illustrate?',
                  options: [
                    'Perfect accuracy.',
                    'A lack of clarity.',
                    'Fluency despite incorrect grammar.',
                    'Coherence without consistency.'
                  ],
                  correctAnswer: 2,
                  explanation: 'The example shows that communication can still be fluent even with grammar errors.'
                },
                {
                  question: 'Which element focuses on correctness, aiming to be precise and grammatically proper?',
                  options: [
                    'Consistency',
                    'Coherence',
                    'Fluency',
                    'Accuracy'
                  ],
                  correctAnswer: 3,
                  explanation: 'Accuracy is about using correct grammar, pronunciation, and vocabulary.'
                },
                {
                  question: 'What is the recommended approach for learners regarding fluency and accuracy?',
                  options: [
                    'Focus only on accuracy from the very beginning.',
                    'Fluency should come first, with accuracy improving later.',
                    'Treat them as completely separate skills that never overlap.',
                    'Both must be achieved simultaneously before communicating.'
                  ],
                  correctAnswer: 1,
                  explanation: 'Fluency should come first; accuracy develops gradually with practice.'
                },
                {
                  question: 'In real-life communication, what is often valued more than perfect grammar?',
                  options: [
                    'A very fast speaking speed.',
                    'Being understood and engaged in conversation.',
                    'Using highly formal, academic vocabulary.',
                    'Eliminating all natural fillers.'
                  ],
                  correctAnswer: 1,
                  explanation: 'In real communication, clarity and understanding matter more than grammatical perfection.'
                },
                {
                  question: 'Which of the following is listed as a Key Element of Fluency?',
                  options: [
                    'Perfection',
                    'Translation',
                    'Coherence',
                    'Elimination'
                  ],
                  correctAnswer: 2,
                  explanation: 'Coherence—organizing your thoughts logically—is one of the key elements of fluency.'
                },
                {
                  question: 'What does the lesson recommend as a technique to build fluency by changing a mental habit?',
                  options: [
                    'Thinking in your native language first.',
                    'Thinking in English.',
                    'Speaking only when you are sure you are perfect.',
                    'Waiting for a teacher to correct every mistake.'
                  ],
                  correctAnswer: 1,
                  explanation: 'Thinking directly in English helps reduce hesitation and builds fluency naturally.'
                },
                {
                  question: 'How do words like "well," "you know," and "actually" help improve speech flow?',
                  options: [
                    'They are examples of bad habits that must be removed.',
                    'They are used to signal a deliberate pause for emphasis.',
                    'They are natural fillers that make your speech sound smoother.',
                    'They replace complicated vocabulary words.'
                  ],
                  correctAnswer: 2,
                  explanation: 'Natural fillers make speech flow more smoothly and sound more natural.'
                },
                {
                  question: 'What is the main point of the Key Takeaway for Lesson 1?',
                  options: [
                    'Fluency means achieving perfect grammar.',
                    'Fluency means translating thoughts quickly.',
                    'Fluency means speaking smoothly and confidently, not perfectly.',
                    'Fluency requires speaking faster than a native speaker.'
                  ],
                  correctAnswer: 2,
                  explanation: 'Fluency is about speaking confidently and smoothly, not about perfection.'
                }
              ]
            }
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
            ],
            quiz: {
              questions: [
                {
                  question: 'What is the recommended way to learn new vocabulary, according to the lesson?',
                  options: [
                    'Memorizing single words in a list, without context.',
                    'Learning words in context and applying them naturally.',
                    'Avoiding all new words until older words are perfected.',
                    'Only learning words that have 10 or more letters.'
                  ],
                  correctAnswer: 1,
                  explanation: 'The lesson emphasizes learning vocabulary in context and applying it naturally, not just memorizing lists.'
                },
                {
                  question: 'If a learner likes cooking, the lesson suggests watching recipe videos to naturally learn words like stir and boil. This is an example of which technique?',
                  options: [
                    'Active Recall and Speaking Practice',
                    'Learning in Phrases, Not Individual Words',
                    'Reading and Listening Daily',
                    'Using Synonyms and Paraphrasing'
                  ],
                  correctAnswer: 2,
                  explanation: 'Watching or listening to English content you enjoy is part of the "Read and Listen Daily" technique.'
                },
                {
                  question: 'Why is it recommended to learn in phrases (e.g., "make a decision") instead of individual words (e.g., "decision")?',
                  options: [
                    'It reduces the overall number of words you need to learn.',
                    'It helps your brain form automatic speaking patterns.',
                    'It ensures your grammar is immediately perfect.',
                    'It is the only way to use synonyms effectively.'
                  ],
                  correctAnswer: 1,
                  explanation: 'Learning in phrases helps your brain form natural language patterns and improves fluency.'
                },
                {
                  question: 'If you forget the word "exhausted" while speaking, which technique allows you to say "really tired" instead?',
                  options: [
                    'Connected Speech',
                    'Using Synonyms and Paraphrasing',
                    'Sentence Stress',
                    'Active Recall'
                  ],
                  correctAnswer: 1,
                  explanation: 'Using synonyms or paraphrasing helps you express yourself even when you forget a specific word.'
                },
                {
                  question: 'What is the purpose of creating a Vocabulary Journal?',
                  options: [
                    'To only write down words you already know well.',
                    'To write down new words, meanings, and examples, then review them weekly.',
                    'To write long, complex essays to show off new vocabulary.',
                    'To keep track of all your grammatical mistakes.'
                  ],
                  correctAnswer: 1,
                  explanation: 'A Vocabulary Journal helps you record, review, and use new words in context regularly.'
                },
                {
                  question: 'What does the practice tip Active Recall involve?',
                  options: [
                    'Listening to a podcast while driving.',
                    'Covering word meanings and trying to recall them from memory, then saying them aloud.',
                    'Reading the list over and over without any test.',
                    'Only using the new word in writing, not speaking.'
                  ],
                  correctAnswer: 1,
                  explanation: 'Active Recall means testing your memory by recalling meanings and using them aloud.'
                },
                {
                  question: 'The expression "By the way" is used for what purpose?',
                  options: [
                    'To strongly disagree with a statement.',
                    'To ask for clarification on a topic.',
                    'To add new information or shift topics slightly.',
                    'To give a balanced, non-committal opinion.'
                  ],
                  correctAnswer: 2,
                  explanation: '"By the way" is used to add new information or gently change the topic in conversation.'
                },
                {
                  question: 'If you say "I totally agree," you are demonstrating which aspect of communication?',
                  options: [
                    'Sharing what you believe is true.',
                    'Asking someone to clarify their statement.',
                    'Showing strong agreement.',
                    'Giving a balanced opinion.'
                  ],
                  correctAnswer: 2,
                  explanation: '"I totally agree" is an expression used to show strong agreement.'
                },
                {
                  question: 'According to the lesson, what is the foundation of fluent speech?',
                  options: [
                    'Pitch and intonation.',
                    'Grammatical accuracy.',
                    'Vocabulary.',
                    'Memorizing native speech.'
                  ],
                  correctAnswer: 2,
                  explanation: 'Vocabulary is described as the foundation of fluent and confident speech.'
                },
                {
                  question: 'What is the main point of the Key Takeaway for Lesson 2?',
                  options: [
                    'Only single words matter for quick communication.',
                    'Words build sentences, but phrases build fluency.',
                    'Vocabulary building should stop once you can read articles.',
                    'Memorize 100 long words before speaking.'
                  ],
                  correctAnswer: 1,
                  explanation: 'The key takeaway reminds learners that phrases — not just words — are the key to real fluency.'
                }
              ]
            }
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
            ],
            quiz: {
              questions: [
                {
                  question: 'What is the main goal of pronunciation when learning to speak English confidently?',
                  options: [
                    'To sound exactly like a specific native speaker.',
                    'To achieve clarity and confidence, not imitation.',
                    'To use the lowest voice pitch possible.',
                    'To speak so quickly that others cannot interrupt.'
                  ],
                  correctAnswer: 1,
                  explanation: 'The goal of pronunciation is clarity and confidence, not imitation of a native accent.'
                },
                {
                  question: 'What is Word Stress?',
                  options: [
                    'The rise and fall of your voice to show emotion.',
                    'The natural linking of words in quick speech.',
                    'One main stressed syllable in every word (e.g., comPUter).',
                    'The emphasis placed on a word in a sentence to show meaning.'
                  ],
                  correctAnswer: 2,
                  explanation: 'Word stress means one syllable in each word is pronounced more strongly, as in comPUter.'
                },
                {
                  question: 'When a speaker says, "I REALLY like your IDEA," what are they primarily using to convey meaning?',
                  options: [
                    'Connected Speech',
                    'Tongue Twisters',
                    'Sentence Stress',
                    'Intonation'
                  ],
                  correctAnswer: 2,
                  explanation: 'Sentence stress emphasizes important words to convey meaning and emotion.'
                },
                {
                  question: 'What does the example "Are you okay?" ↗ (question) and "I\'m okay." ↘ (statement) illustrate?',
                  options: [
                    'Word Stress',
                    'Volume Control',
                    'Intonation',
                    'Connected Speech'
                  ],
                  correctAnswer: 2,
                  explanation: 'The rise and fall of your voice to show emotion or type of sentence is called intonation.'
                },
                {
                  question: 'The change from "What are you doing?" to "Whatcha doing?" is an example of which core aspect?',
                  options: [
                    'Word Stress',
                    'Sentence Stress',
                    'Connected Speech',
                    'Shadowing'
                  ],
                  correctAnswer: 2,
                  explanation: 'This is an example of connected speech—how fluent speakers link words naturally.'
                },
                {
                  question: 'Which Practice Tip involves repeating lines from movies or podcasts to copy rhythm and emotion?',
                  options: [
                    'Recording Yourself',
                    'Tongue Twisters',
                    'Shadowing',
                    'Target Difficult Sounds'
                  ],
                  correctAnswer: 2,
                  explanation: 'Shadowing helps you imitate rhythm, emotion, and pronunciation by repeating after real speakers.'
                },
                {
                  question: 'Why does the lesson recommend using Tongue Twisters?',
                  options: [
                    'To help you speak faster than anyone else.',
                    'To practice tricky or difficult sounds.',
                    'To focus on using only rising intonation.',
                    'To train your voice to use connected speech.'
                  ],
                  correctAnswer: 1,
                  explanation: 'Tongue twisters help you practice and master difficult or confusing sounds.'
                },
                {
                  question: 'The Example Exercise of saying "I can\'t believe you did that!" with surprise, anger, and happiness highlights what aspect of speech?',
                  options: [
                    'How volume changes words.',
                    'How tone changes meaning.',
                    'The importance of correct grammar.',
                    'The use of natural fillers.'
                  ],
                  correctAnswer: 1,
                  explanation: 'It shows how tone (intonation) changes the emotional meaning of the same sentence.'
                },
                {
                  question: 'What is the primary benefit of Clear Pronunciation?',
                  options: [
                    'It ensures you speak exactly like the host of a podcast.',
                    'It makes you easier to understand and builds your confidence.',
                    'It removes the need for any vocabulary practice.',
                    'It guarantees you will never make a grammar mistake.'
                  ],
                  correctAnswer: 1,
                  explanation: 'Clear pronunciation improves understanding and helps you speak more confidently.'
                },
                {
                  question: 'What is the main point of the Key Takeaway for Lesson 3?',
                  options: [
                    'Pronunciation should focus only on word-for-word accuracy.',
                    'Good pronunciation makes your speech clear, engaging, and gives life to your words.',
                    'Intonation is only for asking questions.',
                    'Stress must be applied to every single word in a sentence.'
                  ],
                  correctAnswer: 1,
                  explanation: 'Good pronunciation makes speech clear, engaging, and expressive—showing confidence and emotion.'
                }
              ]
            }
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
            ],
            quiz: {
              questions: [
                {
                  question: 'How does confidence transform communication, even if a speaker makes grammatical mistakes?',
                  options: [
                    'It forces the audience to ignore all errors.',
                    'It makes the speaker sound more fluent and credible.',
                    'It allows the speaker to avoid using notes.',
                    'It requires speaking as quickly as possible.'
                  ],
                  correctAnswer: 1,
                  explanation: 'Confidence makes your speech sound more fluent, engaging, and credible, even with small mistakes.'
                },
                {
                  question: 'Which of the following is listed as a common Confidence Barrier?',
                  options: [
                    'Maintaining eye contact.',
                    'Fear of mistakes.',
                    'Using simple words.',
                    'Practicing daily.'
                  ],
                  correctAnswer: 1,
                  explanation: 'Fear of making mistakes is a common barrier that prevents learners from speaking confidently.'
                },
                {
                  question: 'What is the main purpose of maintaining eye contact when speaking?',
                  options: [
                    'To avoid the temptation of looking at notes.',
                    'To make the audience nervous.',
                    'It shows sincerity and confidence.',
                    'To keep your hands free for gesturing.'
                  ],
                  correctAnswer: 2,
                  explanation: 'Eye contact helps you appear sincere, confident, and connected with your listener.'
                },
                {
                  question: 'The confidence tip "Don\'t Fear Mistakes" suggests the speaker should focus on what instead of perfection?',
                  options: [
                    'Writing a perfect speech later.',
                    'Communication.',
                    'Comparing themselves to others.',
                    'Using complex vocabulary.'
                  ],
                  correctAnswer: 1,
                  explanation: 'The focus should always be on effective communication, not flawless grammar or vocabulary.'
                },
                {
                  question: 'Which of these is listed as a tip for improving Clarity?',
                  options: [
                    'Speak as fast as you can to finish quickly.',
                    'Pause between ideas.',
                    'Use the most complicated words available.',
                    'Speak in a quiet whisper.'
                  ],
                  correctAnswer: 1,
                  explanation: 'Pausing between ideas helps your message stay clear and easy to follow.'
                },
                {
                  question: 'When a speaker is nervous, what does the lesson advise they do regarding word choice?',
                  options: [
                    'Translate their thoughts immediately.',
                    'Try to use the longest, most formal words.',
                    'Use simple words when nervous.',
                    'Stop speaking until the nervousness passes.'
                  ],
                  correctAnswer: 2,
                  explanation: 'Using simple words helps maintain clarity and control when you feel nervous.'
                },
                {
                  question: 'The contrast between the hesitant phrase "Uh, hi, I, um, just want to say…" and the clear "Good morning. I\'d like to share something." highlights the importance of:',
                  options: [
                    'Avoiding all grammatical filler words.',
                    'Speaking with a simple, direct, confident tone.',
                    'Only speaking at the beginning of the day.',
                    'Using a very high pitch.'
                  ],
                  correctAnswer: 1,
                  explanation: 'A simple, direct, and confident tone makes you sound more fluent and self-assured.'
                },
                {
                  question: 'What is the purpose of the Example Practice of introducing yourself in the mirror?',
                  options: [
                    'To memorize the exact words.',
                    'To focus on posture, tone, and calm breathing.',
                    'To compare your looks to the interviewer.',
                    'To practice speaking in a silent whisper.'
                  ],
                  correctAnswer: 1,
                  explanation: 'Mirror practice helps improve posture, tone, and breathing for confident delivery.'
                },
                {
                  question: 'Why does the lesson recommend using Gestures?',
                  options: [
                    'To distract the audience from mistakes.',
                    'It helps express meaning naturally.',
                    'To fill time between ideas.',
                    'To keep your hands busy while you speak quickly.'
                  ],
                  correctAnswer: 1,
                  explanation: 'Gestures make your speech more expressive and help convey meaning naturally.'
                },
                {
                  question: 'What is the main point of the Key Takeaway for Lesson 4?',
                  options: [
                    'Fluency starts when you stop aiming for perfection and start speaking with confidence.',
                    'Confidence requires having a flawless vocabulary.',
                    'Never make a mistake or show any hesitation.',
                    'Clarity means speaking as quickly as possible.'
                  ],
                  correctAnswer: 0,
                  explanation: 'True fluency begins when you stop fearing mistakes and start speaking confidently and consistently.'
                }
              ]
            }
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
            ],
            quiz: {
              questions: [
                {
                  question: 'What is the best way to become fluent, according to the lesson?',
                  options: [
                    'Studying grammar rules for several hours a day.',
                    'Practicing real communication in realistic situations.',
                    'Writing and editing complex academic papers.',
                    'Memorizing a long dictionary of words.'
                  ],
                  correctAnswer: 1,
                  explanation: 'Fluency develops fastest through real communication practice, not just study or memorization.'
                },
                {
                  question: 'When you practice thinking in English instead of translating, you are aiming to respond:',
                  options: [
                    'Slowly and mechanically.',
                    'Automatically, not mechanically.',
                    'With perfect grammar every time.',
                    'With long, complex sentences.'
                  ],
                  correctAnswer: 1,
                  explanation: 'Thinking in English trains your brain to respond naturally and automatically during conversations.'
                },
                {
                  question: 'Which of the following is listed as a Real-Life Speaking Situation in the lesson?',
                  options: [
                    'Writing a formal legal brief.',
                    'Ordering Food.',
                    'Reciting an old poem from memory.',
                    'Only talking to friends in your native language.'
                  ],
                  correctAnswer: 1,
                  explanation: 'Ordering food is a common and practical real-life speaking situation mentioned in the lesson.'
                },
                {
                  question: 'What is the purpose of asking follow-up questions in a conversation?',
                  options: [
                    'To signal the conversation must end soon.',
                    'To encourage the other person to continue talking and be engaged.',
                    'To test the other person\'s vocabulary knowledge.',
                    'To change the subject completely.'
                  ],
                  correctAnswer: 1,
                  explanation: 'Follow-up questions show interest and help keep the conversation flowing naturally.'
                },
                {
                  question: 'If someone shares a piece of exciting news, which natural reaction is recommended to keep the conversation flowing?',
                  options: [
                    'Changing the subject to yourself.',
                    'Reacting naturally: "Really?" "That\'s awesome!"',
                    'Staying completely silent to show focus.',
                    'Looking up the grammar of their sentences.'
                  ],
                  correctAnswer: 1,
                  explanation: 'Natural reactions like "Really?" or "That\'s awesome!" make your conversations sound warm and authentic.'
                },
                {
                  question: 'Which of the following is a recommended practice tip for fluency?',
                  options: [
                    'Only speak English when forced to in class.',
                    'Talk to friends in English for a few minutes daily.',
                    'Avoid all speaking practice until your vocabulary is perfect.',
                    'Focus solely on the most formal English possible.'
                  ],
                  correctAnswer: 1,
                  explanation: 'Consistent daily speaking practice helps you build fluency and confidence faster.'
                },
                {
                  question: 'Which phrase is a suggested way to properly End Conversations?',
                  options: [
                    '"I have to leave right now!"',
                    '"It was great talking to you!"',
                    '"I forgot everything you said."',
                    '"Stop talking to me."'
                  ],
                  correctAnswer: 1,
                  explanation: '"It was great talking to you!" is a polite and natural way to end a conversation.'
                },
                {
                  question: 'What should you prioritize when following the Conversation Tips?',
                  options: [
                    'Speaking faster than the other person.',
                    'Correcting the other person\'s grammar.',
                    'Listening carefully before replying.',
                    'Translating every word to your native language first.'
                  ],
                  correctAnswer: 2,
                  explanation: 'Good communication starts with active listening before responding.'
                },
                {
                  question: 'What is the primary benefit of joining English clubs or online speaking groups?',
                  options: [
                    'To isolate yourself from real-life settings.',
                    'To practice thinking in English and interacting with others.',
                    'To only read articles in English.',
                    'To focus solely on writing skills.'
                  ],
                  correctAnswer: 1,
                  explanation: 'English clubs and speaking groups give you real opportunities to practice and improve naturally.'
                },
                {
                  question: 'What is the main point of the Key Takeaway for Lesson 5?',
                  options: [
                    'Fluency grows only when you eliminate all mistakes.',
                    'Fluency grows through real-life use—speak often, make mistakes, and learn as you go.',
                    'Conversation is not as important as silent reading.',
                    'Every conversation must be perfectly formal.'
                  ],
                  correctAnswer: 1,
                  explanation: 'Fluency improves most through real-life practice, not perfection—mistakes are part of the learning process.'
                }
              ]
            }
          }
        ],
      },
    
      {
        "id": "topic-3",
        "title": "Mastering the Art of Communication: Conversing with Confidence and Respect",
        "description": "Learn how to communicate effectively, listen actively, express yourself clearly, and build lasting connections.",
        "order": 3,
        "lessons": [
          {
            "id": "lesson-3-1",
            "title": "Understanding the Basics of Communication",
            "description": "Learn the fundamentals of communication, including verbal and non-verbal signals, the communication process, barriers, and tips for effective exchanges.",
            "duration": "15 min",
            "difficulty": "beginner",
            "category": "Communication Skills",
            "topicId": "topic-3",
            "order": 1,
            "content": [
              {
                "type": "text",
                "title": "What is Communication?",
                "content": "Communication is the process of exchanging ideas, feelings, and information between people. It's not just about speaking — it's also about understanding and being understood. Effective communication includes both verbal (spoken or written words) and non-verbal (body language, tone, gestures, facial expressions) signals.\nFor example, if you say \"I'm fine\" while smiling warmly, people will believe you're okay. But if you say the same words while looking down or frowning, it might send the opposite message. Your body language can either support or contradict your words."
              },
              {
                "type": "text",
                "title": "The Communication Process",
                "content": "Every conversation follows this cycle:\nSender – the person sharing the message\nMessage – what's being said\nReceiver – the listener interpreting it\nFeedback – the response that shows understanding\nIf feedback is missing, communication is incomplete. For instance, nodding, saying \"I understand,\" or asking a follow-up question shows that you received and processed the message correctly."
              },
              {
                "type": "text",
                "title": "Common Barriers to Communication",
                "content": "Some barriers that cause confusion or conflict include:\nNoise and distractions – loud sounds, phone notifications, or multitasking.\nAssumptions and biases – jumping to conclusions without confirming facts.\nEmotional stress – anger, fear, or frustration that blocks understanding.\nCultural differences – gestures or phrases that mean different things to different people."
              },
              {
                "type": "text",
                "title": "Tips for Better Communication",
                "content": "Focus fully on the person you're speaking with.\nAvoid multitasking — put your phone away.\nUse polite words and appropriate tone.\nBe clear and concise.\nAlways ask for clarification if something is unclear."
              },
              {
                "type": "text",
                "title": "Example Practice",
                "content": "Think of a time when someone misunderstood you. What caused it?\nNow, rewrite your original message to make it clearer.\nExample:\n❌ \"You never listen to me.\" \n✅ \"I feel unheard when I talk about my day. Can we discuss it calmly?\""
              },
              {
                "type": "text",
                "title": "Key Takeaways",
                "content": "Communication involves both words and actions — what you say and how you say it. Clarity, patience, and mutual respect are the building blocks of every successful exchange. Remember, good communication doesn't just transfer information — it creates understanding."
              }
            ],
            "quiz": {
              "questions": [
                {
                  "question": "Communication is the process of exchanging what between people?",
                  "options": [
                    "Only facts and figures.",
                    "Only written messages.",
                    "Ideas, feelings, and information.",
                    "Financial transactions."
                  ],
                  "correctAnswer": 2,
                  "explanation": "Communication involves sharing ideas, feelings, and information, not just facts or texts."
                },
                {
                  "question": "What can happen if your non-verbal signals contradict your words (e.g., saying 'I'm fine' while frowning)?",
                  "options": [
                    "The non-verbal message is always ignored.",
                    "It makes the communication clearer.",
                    "It might send the opposite message.",
                    "It completes the communication cycle."
                  ],
                  "correctAnswer": 2,
                  "explanation": "Non-verbal signals can reinforce or contradict spoken words, affecting clarity."
                },
                {
                  "question": "In the communication process cycle, what step shows the Sender that the message has been received and understood?",
                  "options": [
                    "Noise",
                    "Message",
                    "Feedback",
                    "Assumption"
                  ],
                  "correctAnswer": 2,
                  "explanation": "Feedback indicates to the sender that the message was received and understood."
                },
                {
                  "question": "Which of the following is an example of a Feedback signal?",
                  "options": [
                    "Speaking louder than the other person.",
                    "Nodding, saying 'I understand,' or asking a follow-up question.",
                    "Avoiding eye contact.",
                    "Checking your phone for notifications."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Feedback can be verbal or non-verbal signals showing comprehension."
                },
                {
                  "question": "Which of the following is listed as a common Barrier to Communication?",
                  "options": [
                    "Clarity and conciseness.",
                    "Cultural differences.",
                    "Asking for clarification.",
                    "Focusing fully on the person."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Cultural differences can create misunderstandings in communication."
                },
                {
                  "question": "When someone changes the message from 'You never listen to me' to 'I feel unheard when I talk about my day. Can we discuss it calmly?' they are primarily aiming for:",
                  "options": [
                    "Emotional stress.",
                    "Assumptions and biases.",
                    "Clarity and reduced conflict.",
                    "Multitasking."
                  ],
                  "correctAnswer": 2,
                  "explanation": "The revised message improves clarity and reduces conflict."
                },
                {
                  "question": "Which of the following is a recommended Tip for Better Communication?",
                  "options": [
                    "Avoid asking for clarification if unsure.",
                    "Be unclear and vague.",
                    "Always ask for clarification if something is unclear.",
                    "Let your emotions control your tone."
                  ],
                  "correctAnswer": 2,
                  "explanation": "Asking for clarification ensures understanding and reduces confusion."
                },
                {
                  "question": "Verbal communication primarily refers to:",
                  "options": [
                    "Body language.",
                    "Spoken or written words.",
                    "Facial expressions.",
                    "Gestures and posture."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Verbal communication is conveyed through spoken or written words."
                },
                {
                  "question": "When a listener is multitasking (e.g., checking a phone), this primarily acts as what?",
                  "options": [
                    "A strong feedback signal.",
                    "A form of polite communication.",
                    "A common barrier to communication.",
                    "A way to strengthen the relationship."
                  ],
                  "correctAnswer": 2,
                  "explanation": "Multitasking distracts from the message and acts as a barrier."
                },
                {
                  "question": "According to the Key Takeaways, what is the building block of every successful exchange?",
                  "options": [
                    "Noise and distractions.",
                    "Assumptions and biases.",
                    "Clarity, patience, and mutual respect.",
                    "Transferring only information."
                  ],
                  "correctAnswer": 2,
                  "explanation": "Effective communication relies on clarity, patience, and mutual respect."
                }
              ]
            }
          },
          {
            "id": "lesson-3-2",
            "title": "The Power of Active Listening",
            "description": "Learn how active listening differs from hearing, why it matters, and practical strategies to improve your listening skills and build stronger relationships.",
            "duration": "15 min",
            "difficulty": "beginner",
            "category": "Communication Skills",
            "topicId": "topic-3",
            "order": 2,
            "content": [
              {
                "type": "text",
                "title": "Hearing vs. Listening",
                "content": "Hearing is passive; listening is active. You hear sounds every day, but you listen when you give someone your full attention and try to understand their message — both the words and the feelings behind them."
              },
              {
                "type": "text",
                "title": "Why Listening Matters",
                "content": "Active listening helps you:\n- Avoid misunderstandings\n- Strengthen relationships\n- Earn respect and trust\n- Learn more effectively\nWhen people feel truly heard, they open up and communicate more honestly."
              },
              {
                "type": "text",
                "title": "How to Listen Actively",
                "content": "Focus completely – put away distractions.\nShow attentiveness – maintain eye contact and nod occasionally.\nAvoid interrupting – allow silence and pauses.\nAsk questions – \"Can you explain that further?\"\nReflect feelings – \"That sounds frustrating,\" or \"I can see why you'd feel that way.\""
              },
              {
                "type": "text",
                "title": "Example",
                "content": "A: \"I'm really nervous about my report.\"\nB: \"I get that. What part of it worries you the most?\"\nThis response shows empathy and engagement instead of dismissiveness."
              },
              {
                "type": "text",
                "title": "Tips to Improve Listening",
                "content": "Repeat what the person said in your own words.\nControl your urge to \"fix\" the problem — sometimes people just want to be heard.\nWatch non-verbal cues like tone or body posture.\nListen without planning your reply in your head."
              },
              {
                "type": "text",
                "title": "Example Practice",
                "content": "Ask a friend to tell you about something that happened to them recently. Practice staying silent, nodding, and asking clarifying questions. Afterward, summarize what you heard and ask if you understood correctly."
              },
              {
                "type": "text",
                "title": "Key Takeaways",
                "content": "Listening is the heart of real communication. It's not about waiting for your turn to speak — it's about making others feel understood. Through eye contact, attention, empathy, and thoughtful responses, active listening builds trust and prevents conflict. When you truly listen, you learn more about others and about yourself."
              }
            ],
            "quiz": {
              "questions": [
                {
                  "question": "What is the fundamental difference between Hearing and Listening?",
                  "options": [
                    "Hearing is active; listening is passive.",
                    "Hearing is about sounds; listening is about giving full attention to understand the message.",
                    "Hearing requires eye contact; listening does not.",
                    "Hearing strengthens relationships; listening avoids them."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Listening involves giving full attention to both the words and feelings of the speaker, unlike passive hearing."
                },
                {
                  "question": "Why does active listening matter in communication?",
                  "options": [
                    "It allows you to plan your reply without distraction.",
                    "It helps you avoid misunderstandings and strengthen relationships.",
                    "It gives you the chance to interrupt and fix problems.",
                    "It ensures you only talk about yourself."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Active listening reduces misunderstandings and builds trust and relationships."
                },
                {
                  "question": "Which action is a key technique for Active Listening?",
                  "options": [
                    "Interrupting to speed up the conversation.",
                    "Maintaining eye contact and nodding occasionally.",
                    "Looking at your phone for distractions.",
                    "Planning your reply in your head."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Maintaining eye contact and showing attentiveness signals active listening."
                },
                {
                  "question": "If a person says, 'That sounds frustrating,' or 'I can see why you'd feel that way,' what technique are they using?",
                  "options": [
                    "Interrupting the speaker.",
                    "Reflecting feelings (showing empathy).",
                    "Controlling the urge to 'fix' the problem.",
                    "Avoiding all non-verbal cues."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Reflecting feelings demonstrates empathy and understanding."
                },
                {
                  "question": "A speaker says, 'I'm really nervous about my report.' A good active listening response would be:",
                  "options": [
                    "Don't worry, just stop being nervous.",
                    "I get that. What part of it worries you the most?",
                    "Well, my report is much more difficult than yours.",
                    "I'm sorry, I wasn't really paying attention."
                  ],
                  "correctAnswer": 1,
                  "explanation": "The response shows engagement and encourages further sharing."
                },
                {
                  "question": "To prevent yourself from planning your reply, which tip should you practice?",
                  "options": [
                    "Speak daily for 5 minutes.",
                    "Control your urge to 'fix' the problem.",
                    "Focus completely on the speaker's words and non-verbal cues.",
                    "Use natural filler words."
                  ],
                  "correctAnswer": 2,
                  "explanation": "Focusing fully on the speaker prevents distraction and encourages active listening."
                },
                {
                  "question": "Which statement reflects a common mistake people make while listening?",
                  "options": [
                    "Listening without planning your reply in your head.",
                    "Controlling the urge to 'fix' the problem.",
                    "Being unable to watch non-verbal cues.",
                    "Waiting for your turn to speak instead of fully processing the message."
                  ],
                  "correctAnswer": 3,
                  "explanation": "Failing to fully process what is said reduces understanding and engagement."
                },
                {
                  "question": "What is the primary benefit of making others feel truly heard?",
                  "options": [
                    "They will stop talking to you.",
                    "They open up and communicate more honestly.",
                    "They will always agree with you.",
                    "They will immediately solve their own problem."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Feeling heard encourages openness and honest communication."
                },
                {
                  "question": "What does the practice tip of 'Repeating what the person said in your own words' primarily help to achieve?",
                  "options": [
                    "Making the other person confused.",
                    "Showing you were listening and checking for correct understanding.",
                    "Speeding up the conversation flow.",
                    "Avoiding all eye contact."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Paraphrasing confirms understanding and shows attentiveness."
                },
                {
                  "question": "According to the Key Takeaways, what is the 'heart of real communication'?",
                  "options": [
                    "Speaking clearly.",
                    "Listening.",
                    "Using perfect grammar.",
                    "Knowing all the facts."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Active listening is central to understanding and building trust."
                }
              ]
            }
          },
          {
            "id": "lesson-3-3",
            "title": "Expressing Yourself Clearly and Confidently",
            "description": "Learn how to communicate your thoughts clearly and confidently through organized speech, appropriate tone, and positive body language.",
            "duration": "15 min",
            "difficulty": "beginner",
            "category": "Communication Skills",
            "topicId": "topic-3",
            "order": 3,
            "content": [
              {
                "type": "text",
                "title": "Clear Expression",
                "content": "Clear expression helps others understand your message easily. Confusing or rushed speech can lead to misunderstanding. Organize your thoughts before speaking and use simple, straightforward language."
              },
              {
                "type": "text",
                "title": "How to Speak with Confidence",
                "content": "Prepare your thoughts – think before you talk.\nMaintain good posture – stand or sit upright.\nSpeak slowly and clearly – don't rush.\nSmile genuinely – it helps you relax and sound approachable.\nBelieve in your message – confidence grows when you mean what you say."
              },
              {
                "type": "text",
                "title": "Tone and Body Language",
                "content": "Your tone conveys attitude, and your body language shows emotion. Speak in a tone that matches your intention — friendly, calm, or assertive, but never aggressive. Avoid crossing your arms, frowning, or slouching. Instead, use gestures that match your message."
              },
              {
                "type": "text",
                "title": "Tips for Clear Expression",
                "content": "Practice speaking in front of a mirror or recording yourself.\nReplace filler words (\"uh,\" \"like\") with short pauses.\nMake your sentences shorter and more direct.\nAsk for feedback from trusted friends or teachers."
              },
              {
                "type": "text",
                "title": "Example Practice",
                "content": "Deliver a 1-minute talk about your favorite activity. Focus on pronunciation, clarity, and tone. Then, replay or ask for feedback on:\n- Did I sound confident and natural?\n- Did my gestures and tone match my message?"
              },
              {
                "type": "text",
                "title": "Key Takeaways",
                "content": "Clear and confident expression makes you more persuasive and credible. By choosing your words carefully and using positive body language, you ensure your message is understood and respected. Speaking with clarity shows not only intelligence but also respect for your listener's time and attention."
              }
            ],
            "quiz": {
              "questions": [
                {
                  "question": "What is the recommended action to prevent confusing or rushed speech?",
                  "options": [
                    "Use the most complex words possible.",
                    "Rush through your sentences to save time.",
                    "Organize your thoughts before speaking.",
                    "Avoid all gestures and body language."
                  ],
                  "correctAnswer": 2,
                  "explanation": "Organizing your thoughts before speaking ensures clarity and reduces misunderstanding."
                },
                {
                  "question": "To sound approachable and help yourself relax, what non-verbal cue is recommended?",
                  "options": [
                    "Crossing your arms.",
                    "Frowning.",
                    "Smile genuinely.",
                    "Slouching."
                  ],
                  "correctAnswer": 2,
                  "explanation": "Smiling genuinely helps convey warmth and makes your speech more approachable."
                },
                {
                  "question": "What is one key tip for speaking with Confidence?",
                  "options": [
                    "Avoid maintaining eye contact.",
                    "Speak very quickly to hide nervousness.",
                    "Maintain good posture.",
                    "Use a tone that contradicts your message."
                  ],
                  "correctAnswer": 2,
                  "explanation": "Good posture supports confidence and positively influences your tone and presence."
                },
                {
                  "question": "What does your Tone primarily convey in a conversation?",
                  "options": [
                    "Grammar accuracy.",
                    "Your attitude.",
                    "Your word choice.",
                    "The length of your sentences."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Tone communicates your attitude and intention behind the message."
                },
                {
                  "question": "What is the recommended way to handle filler words like \"uh\" or \"like\"?",
                  "options": [
                    "Replace them with long, complex sentences.",
                    "Replace them with short pauses.",
                    "Use them more frequently to sound natural.",
                    "Speak louder to cover them up."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Replacing filler words with short pauses improves clarity and flow."
                },
                {
                  "question": "To improve clarity, what does the lesson suggest doing with your sentences?",
                  "options": [
                    "Make them very long and rambling.",
                    "Make them shorter and more direct.",
                    "Make them sound aggressive.",
                    "Use many filler words."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Short and direct sentences are easier to understand."
                },
                {
                  "question": "What is the purpose of practicing speaking in front of a mirror or recording yourself?",
                  "options": [
                    "To avoid asking anyone for feedback.",
                    "To check that your tone and clarity are effective.",
                    "To ensure you are only using filler words.",
                    "To learn how to speak aggressively."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Practicing allows you to monitor clarity, tone, and body language."
                },
                {
                  "question": "Which of these is a recommended action when delivering a message?",
                  "options": [
                    "Speak aggressively, not assertively.",
                    "Speak slowly and clearly—don't rush.",
                    "Use gestures that conflict with your message.",
                    "Never prepare your thoughts beforehand."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Speaking slowly and clearly ensures your message is understood."
                },
                {
                  "question": "According to the Key Takeaways, what does speaking with clarity show your listener?",
                  "options": [
                    "Disrespect for their time.",
                    "Your willingness to argue.",
                    "Intelligence and respect for their time and attention.",
                    "Your ability to use aggression."
                  ],
                  "correctAnswer": 2,
                  "explanation": "Clear speech shows both intelligence and consideration for the listener."
                },
                {
                  "question": "What is the primary benefit of clear and confident expression?",
                  "options": [
                    "It makes you seem quieter and more hesitant.",
                    "It makes you more persuasive and credible.",
                    "It allows you to avoid organizing your thoughts.",
                    "It guarantees you will never make a mistake."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Clear and confident expression enhances persuasiveness and credibility."
                }
              ]
            }
          },
          {
            "id": "lesson-3-4",
            "title": "Conversing with Respect and Empathy",
            "description": "Learn how to communicate with respect and empathy, handling conflicts gracefully and understanding others' perspectives.",
            "duration": "15 min",
            "difficulty": "intermediate",
            "category": "Communication Skills",
            "topicId": "topic-3",
            "order": 4,
            "content": [
              {
                "type": "text",
                "title": "Respectful Communication",
                "content": "Respectful communication values everyone's voice. It involves listening before responding, avoiding rude interruptions, and using polite language even when you disagree. A calm and respectful tone can turn tense conversations into productive ones."
              },
              {
                "type": "text",
                "title": "Practicing Empathy",
                "content": "Empathy is the ability to see things from another person's perspective. It doesn't mean you have to agree — it means you try to understand how they feel.\nExample:\nA: \"I\'m so upset I didn't get the role in the play.\"\nB: \"I can see how disappointed you must feel. You worked hard for it.\"\nThis response shows care and understanding rather than criticism."
              },
              {
                "type": "text",
                "title": "Handling Conflict Gracefully",
                "content": "Take deep breaths before responding.\nUse \"I\" statements instead of \"You\" (e.g., \"I felt hurt when…\").\nStay focused on the issue, not the person.\nAgree to disagree when needed."
              },
              {
                "type": "text",
                "title": "Tips for Respectful Conversation",
                "content": "Avoid raising your voice or using harsh words.\nBe patient when explaining your side.\nRecognize the other person's emotions before defending your own."
              },
              {
                "type": "text",
                "title": "Example Practice",
                "content": "Role-play with a friend: one person plays someone angry about a misunderstanding, the other practices staying calm, listening, and responding with empathy and respect."
              },
              {
                "type": "text",
                "title": "Key Takeaways",
                "content": "Respect and empathy are the foundation of every positive relationship. Understanding others' feelings allows for healthier communication and prevents unnecessary conflict. Empathy doesn't just make you a better speaker — it makes you a better person."
              }
            ],
            "quiz": {
              "questions": [
                {
                  "question": "Respectful communication involves which key action, even when you disagree?",
                  "options": [
                    "Raising your voice to dominate the discussion.",
                    "Using polite language.",
                    "Avoiding all listening before responding.",
                    "Using harsh or rude words."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Polite language ensures respect and constructive dialogue even in disagreement."
                },
                {
                  "question": "What is Empathy?",
                  "options": [
                    "The ability to force others to agree with you.",
                    "The ability to see things from another person's perspective.",
                    "Only agreeing with everything someone says.",
                    "Focusing solely on your own emotions."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Empathy is understanding another person's feelings without necessarily agreeing."
                },
                {
                  "question": "When handling conflict, what is the suggested method for taking ownership of your feelings without blaming the other person?",
                  "options": [
                    "Take deep breaths before responding.",
                    "Use 'You' statements (e.g., 'You made me feel...').",
                    "Use 'I' statements (e.g., 'I felt hurt when…').",
                    "Stay focused on the person, not the issue."
                  ],
                  "correctAnswer": 2,
                  "explanation": "'I' statements help communicate your feelings without blaming others."
                },
                {
                  "question": "What is the recommended tone for turning tense conversations into productive ones?",
                  "options": [
                    "Angry and aggressive.",
                    "Loud and demanding.",
                    "Calm and respectful.",
                    "Extremely hesitant."
                  ],
                  "correctAnswer": 2,
                  "explanation": "A calm and respectful tone promotes understanding and resolution."
                },
                {
                  "question": "What should you avoid doing when practicing respectful conversation?",
                  "options": [
                    "Being patient when explaining your side.",
                    "Raising your voice or using harsh words.",
                    "Recognizing the other person's emotions.",
                    "Staying focused on the issue."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Harsh words or raising your voice undermines respectful communication."
                },
                {
                  "question": "What should you do before defending your own emotions or position?",
                  "options": [
                    "Immediately raise your voice.",
                    "Recognize the other person's emotions.",
                    "Focus on blaming the other person.",
                    "Start interrupting immediately."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Recognizing others' emotions helps maintain empathy and respect."
                },
                {
                  "question": "If a person responds to disappointment by saying, 'I can see how disappointed you must feel. You worked hard for it,' what is their primary aim?",
                  "options": [
                    "To criticize the other person's effort.",
                    "To show care and understanding (empathy).",
                    "To shift the focus to a new issue.",
                    "To immediately fix the problem."
                  ],
                  "correctAnswer": 1,
                  "explanation": "The response demonstrates empathy, validating the other person's feelings."
                },
                {
                  "question": "When handling conflict, if you cannot reach an agreement, what is the respectful course of action?",
                  "options": [
                    "Keep arguing until the other person gives up.",
                    "Use 'You' statements to assert your position.",
                    "Agree to disagree when needed.",
                    "Walk away without saying anything."
                  ],
                  "correctAnswer": 2,
                  "explanation": "Agreeing to disagree allows respect and closure even without consensus."
                },
                {
                  "question": "What is the main point of the Key Takeaway for Lesson 4?",
                  "options": [
                    "Only arguing assertively leads to resolution.",
                    "Respect and empathy are the foundation of every positive relationship.",
                    "Empathy means you must always agree with the other person.",
                    "Conflict should always be avoided at all costs."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Respect and empathy build healthy relationships and constructive communication."
                },
                {
                  "question": "What is the primary benefit of understanding others' feelings in conversation?",
                  "options": [
                    "It ensures you always get your way.",
                    "It makes your opinion seem more aggressive.",
                    "It allows for healthier communication and prevents unnecessary conflict.",
                    "It requires you to always be silent."
                  ],
                  "correctAnswer": 2,
                  "explanation": "Understanding feelings helps prevent misunderstandings and supports healthier interactions."
                }
              ]
            }
          },
          {
            "id": "lesson-3-5",
            "title": "Building Meaningful and Lasting Connections",
            "description": "Learn how to form relationships built on trust, empathy, and mutual respect, fostering genuine understanding in communication.",
            "duration": "18 min",
            "difficulty": "intermediate",
            "category": "Communication Skills",
            "topicId": "topic-3",
            "order": 5,
            "content": [
              {
                "type": "text",
                "title": "The Foundation of Connection",
                "content": "In a world where communication is faster than ever but genuine understanding is often lost, building meaningful and lasting connections has become both a rare skill and a powerful advantage. True connection goes beyond casual conversation or social media interaction — it's about forming relationships built on trust, empathy, and mutual respect. Whether in friendships, family bonds, or professional networks, meaningful connections help us feel valued, supported, and understood."
              },
              {
                "type": "text",
                "title": "Moving Beyond Small Talk",
                "content": "Small talk is a great start, but deeper conversations create stronger bonds. Ask open-ended questions like: \"What inspires you lately?\" or \"What's something you're proud of?\" These questions invite people to share more about themselves."
              },
              {
                "type": "text",
                "title": "Building Rapport and Trust",
                "content": "Rapport grows through consistency, kindness, and genuine interest. Use a person's name, remember details from past talks, and follow up when you can. These small acts show that you care."
              },
              {
                "type": "text",
                "title": "Maintaining Healthy Connections",
                "content": "Stay in touch — check in occasionally, send messages of encouragement, and express gratitude. Relationships need effort to grow; communication is the sunlight that keeps them alive."
              },
              {
                "type": "text",
                "title": "Tips for Connection",
                "content": "Be genuine — don't pretend to be someone you're not. Show appreciation often (\"Thanks for listening!\"). Share a little about yourself — connection goes both ways."
              },
              {
                "type": "text",
                "title": "Example Practice",
                "content": "Think of someone you haven't spoken to in a while. Send a short, sincere message like: \"Hey, it's been a while! I was just thinking about you. How have you been?\" Notice how even simple gestures can restart meaningful connections."
              },
              {
                "type": "text",
                "title": "Key Takeaways",
                "content": "Communication isn't just about words — it's about relationships. Trust, kindness, and consistency turn ordinary conversations into meaningful bonds. The best communicators don't just speak well — they make others feel valued, heard, and respected."
              }
            ],
            "quiz": {
              "questions": [
                {
                  "question": "What is the goal of building True Connection in communication?",
                  "options": [
                    "To only engage in casual conversation.",
                    "To form relationships built on trust, empathy, and mutual respect.",
                    "To avoid sharing any personal details.",
                    "To interact only on social media platforms."
                  ],
                  "correctAnswer": 1,
                  "explanation": "True connection is about trust, empathy, and respect."
                },
                {
                  "question": "What kind of questions are recommended for moving beyond small talk?",
                  "options": [
                    "Simple \"Yes/No\" questions.",
                    "Highly technical, formal questions.",
                    "Open-ended questions (e.g., \"What inspires you lately?\").",
                    "Questions that are difficult to answer."
                  ],
                  "correctAnswer": 2,
                  "explanation": "Open-ended questions create deeper, moremeaningful conversations."
                },
                {
                  "question": "What is an example of a small act that helps build Rapport and Trust?",
                  "options": [
                    "Avoiding checking in on the person.",
                    "Ignoring their name and key details.",
                    "Remembering details from past talks and using a person's name.",
                    "Focusing only on future conversations."
                  ],
                "correctAnswer": 2,
                "explanation": "Remembering small details shows you care and builds rapport."
                },
                {
                  "question": "According to the lesson, what is the \"sunlight\" that keeps relationships alive?",
                  "options": [
                    "Formal contracts.",
                    "Avoidance of all issues.",
                    "Communication.",
                    "Small talk only."
                  ],
                "correctAnswer": 2,
                "explanation": "Communication nourishes and sustains relationships."
                },
                {
                  "question": "Which of the following is a recommended Tip for Connection?",
                  "options": [
                    "Avoid sharing any information about yourself.",
                    "Share a little about yourself—connection goes both ways.",
                    "Pretend to be someone you're not.",
                    "Never express appreciation for the conversation."
                ],
                  "correctAnswer": 1,
                  "explanation": "Sharing a bit about yourself creates balance and authenticity."
                },
                {
                  "question": "Why do deeper conversations create stronger bonds than small talk?",
                  "options": [
                    "Deeper conversations take much longer.",
                    "They force people to share their personal secrets.",
                    "They invite people to share more about themselves.",
                    "They eliminate the need for future contact."
                ],
                  "correctAnswer": 2,
                  "explanation": "Deeper talks foster understanding and connection."
                },
                {
                  "question": "To maintain healthy connections, what does the lesson recommend doing occasionally?",
                  "options": [
                    "Staying silent for long periods.",
                    "Checking in and sending messages of encouragement.",
                    "Criticizing their efforts.",
                    "Only interacting through complex legal documents."
                ],
                  "correctAnswer": 1,
                  "explanation": "Simple check-ins show that you care and help maintain bonds."
                },
                {
                  "question": "When using the Example Practice of sending a sincere message to someone you haven't spoken to in a while, what is the goal?",
                  "options": [
                    "To immediately get a job offer.",
                    "To restart a meaningful connection.",
                    "To show that you are only interested in formal updates.",
                    "To pretend you forgot their name."
                ],
                  "correctAnswer": 1,
                  "explanation": "The goal is to rekindle authentic communication and connection."
                },
                {
                  "question": "The lesson states that true connection helps people feel which three ways?",
                  "options": [
                    "Critical, challenged, and formal.",
                    "Nervous, quiet, and hesitant.",
                    "Valued, supported, and understood.",
                    "Distant, isolated, and ignored."
                ],
                  "correctAnswer": 2,
                  "explanation": "True connection makes people feel valued, supported, and understood."
                },
                {
                  "question": "What is the main point of the Key Takeaway for Lesson 5?",
                  "options": [
                    "The best communicators make others feel valued, heard, and respected.",
                    "Trust is not necessary for a strong relationship.",
                    "Communication is only about the words being spoken.",
                    "Social media interaction is always better than in-person talks."
                ],
                  "correctAnswer": 0,
                  "explanation": "Great communication builds relationships that make others feel heard and respected."
                }
              ]
            }
          }
        ]
      },
      {
        "id": "topic-4",
        "title": "Mastering Emotional Intelligence: Managing Feelings for Better Relationships",
        "description": "Understand your emotions, build self-awareness, and strengthen your ability to manage relationships with empathy and balance.",
        "order": 4,
        "lessons": [
          {
            "id": "lesson-4-1",
            "title": "The Nature of Phone Conversations",
            "description": "Understand the importance of tone, pacing, and clarity in phone conversations to convey meaning and emotion.",
            "duration": "15 min",
            "difficulty": "beginner",
            "category": "Communication Skills",
            "topicId": "topic-4",
            "order": 1,
            "content": [
              {
                "type": "text",
                "title": "Challenges of Phone Communication",
                "content": "Phone communication removes the visual part of conversation — no facial expressions, body language, or eye contact. That means your tone, pacing, and choice of words must do all the work to express what you mean. A cheerful “Hey, how are you?” can sound friendly in person, but tired or uninterested if said flatly over the phone."
              },
              {
                "type": "text",
                "title": "The Emotional Side of Voice",
                "content": "Your voice carries feelings. A warm, calm tone makes others feel comfortable and valued; a tense or rushed tone may sound cold or impatient. When speaking to loved ones, your tone can express care and affection even more than your words."
              },
              {
                "type": "text",
                "title": "Common Causes of Misunderstanding",
                "content": "Speaking too fast or too softly.\nMultitasking or sounding distracted.\nOverusing sarcasm or jokes that don’t translate well.\nNot giving enough verbal feedback (“Uh-huh,” “I see,” etc.)."
              },
              {
                "type": "text",
                "title": "Tips for Sounding Clear and Warm",
                "content": "Smile when speaking — people can hear it.\nSpeak slowly and clearly, especially during emotional or serious talks.\nUse short pauses to let others respond.\nSit or stand up straight — posture affects tone."
              },
              {
                "type": "text",
                "title": "Example Practice",
                "content": "Call a friend or relative and have a short 3-minute conversation about their day. Focus on keeping your tone friendly and interested. Ask afterward if you sounded relaxed and engaged."
              },
              {
                "type": "text",
                "title": "Key Takeaways",
                "content": "Phone conversations rely heavily on how your voice sounds. A calm, pleasant voice shows respect, care, and focus — whether you’re comforting a loved one or speaking professionally. The heart of phone communication lies in your ability to make someone feel seen, even when they can’t see you."
              }
            ],
            "quiz": {
              "questions": [
                {
                  "question": "In phone communication, what must do all the work to express what you mean, since visual cues are removed?",
                  "options": [
                    "Facial expressions and body language.",
                    "Your tone, pacing, and choice of words.",
                    "Only the volume of your voice.",
                    "Only the silence between words."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Without visual cues, tone, pacing, and word choice carry the full meaning of the message."
                },
                {
                  "question": "How does a warm, calm tone affect the listener on the phone?",
                  "options": [
                    "It sounds cold and impersonal.",
                    "It makes them feel comfortable and valued.",
                    "It shows you are speaking too fast.",
                    "It encourages multitasking."
                  ],
                  "correctAnswer": 1,
                  "explanation": "A calm tone conveys care and makes the listener feel comfortable."
                },
                {
                  "question": "Why does the lesson suggest that you 'smile when speaking' on the phone?",
                  "options": [
                    "To use up time on the call.",
                    "Because people can hear the effect it has on your tone.",
                    "To encourage speaking faster.",
                    "To eliminate all pauses."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Smiling changes the tone of your voice, making it sound friendly and pleasant."
                },
                {
                  "question": "Which of the following is listed as a common Cause of Misunderstanding in phone conversations?",
                  "options": [
                    "Speaking slowly and clearly.",
                    "Using short pauses.",
                    "Overusing sarcasm or jokes that don’t translate well.",
                    "Sitting or standing up straight."
                  ],
                  "correctAnswer": 2,
                  "explanation": "Sarcasm or jokes can be misinterpreted without visual cues."
                },
                {
                  "question": "What non-verbal action is recommended to positively affect your tone on the phone?",
                  "options": [
                    "Leaning back in your chair.",
                    "Slouching while speaking.",
                    "Sitting or standing up straight (posture).",
                    "Walking around the room."
                  ],
                  "correctAnswer": 2,
                  "explanation": "Good posture affects your breathing and tone, making your voice sound more confident and clear."
                },
                {
                  "question": "What does a tense or rushed tone often sound like to the listener?",
                  "options": [
                    "Cheerful and engaged.",
                    "Calm and comforting.",
                    "Cold or impatient.",
                    "Warm and affectionate."
                  ],
                  "correctAnswer": 2,
                  "explanation": "Tense or rushed speech can convey impatience or discomfort."
                },
                {
                  "question": "Which action is an essential form of verbal feedback to give the listener?",
                  "options": [
                    "Multitasking while they speak.",
                    "Saying, “Uh-huh,” or “I see,” to show you're following.",
                    "Speaking as fast as possible.",
                    "Not giving any responses until the end."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Short verbal cues confirm that you are listening and understanding."
                },
                {
                  "question": "The Key Takeaway states that the heart of phone communication lies in your ability to make someone feel:",
                  "options": [
                    "Rushed and impatient.",
                    "Seen, even when they can’t see you.",
                    "Tense and emotional.",
                    "Unsure of your words."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Phone communication relies on conveying presence and attention through your voice."
                },
                {
                  "question": "For which type of phone conversation is it especially important to speak slowly and clearly?",
                  "options": [
                    "Only short, simple calls.",
                    "Emotional or serious talks.",
                    "Calls where you are multitasking.",
                    "Calls with people you don't know well."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Serious or emotional calls require clarity to ensure understanding."
                },
                {
                  "question": "What does a calm, pleasant voice show in a phone conversation?",
                  "options": [
                    "Disrespect and distraction.",
                    "Confusion and emotional stress.",
                    "Respect, care, and focus.",
                    "That you want the conversation to end quickly."
                  ],
                  "correctAnswer": 2,
                  "explanation": "A calm voice communicates attentiveness, care, and professionalism."
                }
              ]
            }
          },          
          {
            "id": "lesson-4-2",
            "title": "Creating a Positive First Impression on the Phone",
            "description": "Learn how to start phone calls effectively, creating warmth in personal calls and clarity in professional calls.",
            "duration": "15 min",
            "difficulty": "beginner",
            "category": "Communication Skills",
            "topicId": "topic-4",
            "order": 2,
            "content": [
              {
                "type": "text",
                "title": "Importance of the First Few Seconds",
                "content": "The first few seconds of a call can shape the entire mood. A kind greeting like “Hi! How have you been?” instantly puts people at ease. For personal calls, warmth matters more than formality; for formal ones, structure and clarity matter more."
              },
              {
                "type": "text",
                "title": "Examples of Greetings",
                "content": "Friends/Family: “Hey! It’s been a while — how are you?”\nFormal/School/Work: “Good afternoon, this is [Your Name] from the communication group. May I speak with Ms. Cruz, please?”"
              },
              {
                "type": "text",
                "title": "Polite Introductions and Transitions",
                "content": "If the person might not recognize your voice, always identify yourself early. Example: “Hi, this is Sophia — we met at the seminar last week.”\nTransition politely between topics: “By the way, I wanted to ask…” or “Before I forget…”"
              },
              {
                "type": "text",
                "title": "Creating Emotional Connection in Personal Calls",
                "content": "When talking to friends or family, start with simple emotional check-ins: “How are you feeling lately?” or “I miss hearing from you — how’s everything at home?” These short phrases show genuine care and keep relationships strong despite distance."
              },
              {
                "type": "text",
                "title": "Tips for a Great Start",
                "content": "Avoid calling when you’re distracted or in a noisy place.\nBegin with warmth and sincerity, not just small talk.\nMirror the other person’s tone — if they’re calm, stay calm; if cheerful, match their energy.\nUse their name — it personalizes your call."
              },
              {
                "type": "text",
                "title": "Example Practice",
                "content": "Role-play two phone calls: one to a close friend, one to a teacher or coworker. Practice adjusting your tone and wording for each type of relationship. Which one felt easier or more natural?"
              },
              {
                "type": "text",
                "title": "Key Takeaways",
                "content": "First impressions on the phone depend on tone, timing, and care. How you start a call sets the emotional temperature for the entire conversation. A warm “hello” can strengthen friendships and comfort family members, while a polite, confident introduction builds credibility in professional situations. Every call begins with an opportunity to show respect and kindness."
              }
            ],
            "quiz": {
              "questions": [
                {
                  "question": "For a formal or professional call, what matters more than personal warmth?",
                  "options": [
                    "Emotional check-ins.",
                    "Talking about the weather.",
                    "Structure and clarity.",
                    "Overusing sarcasm."
                  ],
                  "correctAnswer": 2,
                  "explanation": "Formal calls prioritize structure and clarity to convey professionalism and efficiency."
                },
                {
                  "question": "If the person might not recognize your voice, what should you always do early in the call?",
                  "options": [
                    "Avoid using your name.",
                    "Identify yourself politely.",
                    "Start talking about a new topic immediately.",
                    "Speak in a quiet whisper."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Identifying yourself helps the listener know who they are speaking with."
                },
                {
                  "question": "Which phrase is a good example of a Polite Transition between topics?",
                  "options": [
                    "Stop talking about that now.",
                    "By the way, I wanted to ask…",
                    "I don't care about that part.",
                    "I'll talk to you later."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Polite transitions maintain smooth, respectful conversation flow."
                },
                {
                  "question": "For friends or family, which of these check-ins shows genuine care and keeps relationships strong?",
                  "options": [
                    "“Good afternoon, this is [Your Name].”",
                    "“How are you feeling lately?”",
                    "“I'll follow up by email tomorrow.”",
                    "“May I speak with Ms. Cruz, please?”"
                  ],
                  "correctAnswer": 1,
                  "explanation": "Emotional check-ins show care and strengthen personal bonds."
                },
                {
                  "question": "Which tip is recommended for getting a Great Start to a call?",
                  "options": [
                    "Call when you are heavily distracted.",
                    "Begin with warmth and sincerity, not just small talk.",
                    "Speak in a monotone voice.",
                    "Avoid using the person's name."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Warmth and sincerity create a positive atmosphere right away."
                },
                {
                  "question": "The lesson suggests that you should mirror the other person’s tone. What does this mean?",
                  "options": [
                    "If they are loud, speak softly.",
                    "Match their energy—if they're calm, stay calm.",
                    "Interrupt them if they sound cheerful.",
                    "Tell them they are speaking too slowly."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Mirroring tone helps the listener feel understood and comfortable."
                },
                {
                  "question": "What is the primary purpose of using the listener's name during a call?",
                  "options": [
                    "To show them you are the leader of the conversation.",
                    "To personalize your call.",
                    "To signal the end of the conversation.",
                    "To check if they are paying attention."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Using the listener's name makes the interaction personal and engaging."
                },
                {
                  "question": "What does the Key Takeaway state is essential for a good first impression on the phone?",
                  "options": [
                    "Being as formal as possible in every call.",
                    "Tone, timing, and care.",
                    "Speaking faster than the other person.",
                    "Avoiding all emotional check-ins."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Tone, timing, and care set the mood and credibility for the conversation."
                },
                {
                  "question": "Which example shows the correct level of formality for a Formal/Work introduction?",
                  "options": [
                    "Hey! It’s been a while — how are you?",
                    "Good afternoon, this is [Your Name] from the communication group.",
                    "What inspires you lately?",
                    "Tell me more about that."
                  ],
                  "correctAnswer": 1,
                  "explanation": "A formal introduction is polite, clear, and professional."
                },
                {
                  "question": "How quickly can the mood of the entire conversation be shaped?",
                  "options": [
                    "Over several hours.",
                    "By the first few words you say.",
                    "Not until the very end.",
                    "In the first few seconds of the call."
                  ],
                  "correctAnswer": 3,
                  "explanation": "The first few seconds of a call often set the tone for the entire conversation."
                }
              ]
            }
          },
          
          {
            "id": "lesson-4-3",
            "title": "Listening and Responding with Care",
            "description": "Master the art of listening on the phone to strengthen connections and build understanding.",
            "duration": "15 min",
            "difficulty": "intermediate",
            "category": "Emotional Intelligence",
            "topicId": "topic-4",
            "order": 3,
            "content": [
              {
                "type": "text",
                "title": "Verbal Feedback that Shows Engagement",
                "content": "In face-to-face talks, we rely on nods and facial cues. On the phone, you show attentiveness through verbal signals and tone. Active listening builds understanding — and in personal calls, it strengthens emotional connection.\n\nUse small responses like:\n\n- “Really?”\n- “I understand.”\n- “That must’ve been tough.”\n- “Tell me more about that.”\n\nThese simple words encourage others to keep talking and feel heard."
              },
              {
                "type": "text",
                "title": "Balancing Talking and Listening",
                "content": "Avoid dominating the conversation. Let pauses breathe — silence gives space for the other person’s thoughts. Don’t interrupt, and respond thoughtfully instead of rushing to fill every gap."
              },
              {
                "type": "text",
                "title": "Tips for Empathetic Listening",
                "content": "Focus on the person’s tone to understand emotions behind words.\n\nAvoid multitasking — people can hear when you’re distracted.\n\nDon’t rush to give advice; sometimes, listening is enough.\n\nRepeat or paraphrase for clarity: “So you’re saying you felt left out?”"
              },
              {
                "type": "text",
                "title": "Example Practice",
                "content": "Call a family member or close friend. Let them talk about something important to them for a few minutes. Focus on listening and responding empathetically — without turning the topic back to yourself."
              },
              {
                "type": "text",
                "title": "Key Takeaways",
                "content": "Good phone conversations are built on active listening. Without facial cues, your attentiveness must be heard through your voice. Responding gently and showing interest builds trust and emotional connection. Whether you’re listening to a loved one vent or a classmate explain a task, empathy and patience make every call meaningful."
              }
            ],
            "quiz": {
              "questions": [
                {
                  "question": "On the phone, how do you primarily show attentiveness since you cannot use nods or facial cues?",
                  "options": [
                    "By ignoring what they say.",
                    "Through verbal signals and tone.",
                    "By constantly interrupting the speaker.",
                    "By speaking louder than the person."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Verbal signals and tone are the primary ways to show attentiveness over the phone."
                },
                {
                  "question": "What is the effect of using verbal feedback like 'Really?' or 'I understand'?",
                  "options": [
                    "It makes the speaker stop talking.",
                    "It encourages others to keep talking and feel heard.",
                    "It shows you are distracted.",
                    "It signals that you are about to give advice."
                  ],
                  "correctAnswer": 1,
                  "explanation": "These responses show that you're engaged and encourage the speaker to share more."
                },
                {
                  "question": "When balancing talking and listening, what does the lesson advise you to do with pauses?",
                  "options": [
                    "Rush to fill every gap with your own words.",
                    "Let pauses breathe and give space for the other person’s thoughts.",
                    "Immediately change the topic.",
                    "Speak faster to eliminate them entirely."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Pauses are important for giving the other person space to think and respond."
                },
                {
                  "question": "What is the main advice for using the person’s tone to your advantage?",
                  "options": [
                    "To copy their exact volume.",
                    "To understand the emotions behind their words.",
                    "To tell them to change their pitch.",
                    "To interrupt them immediately."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Understanding the tone helps you grasp the underlying emotions behind their words."
                },
                {
                  "question": "If you are trying to be an Empathetic Listener, what should you avoid doing immediately?",
                  "options": [
                    "Asking a follow-up question.",
                    "Using short, encouraging words.",
                    "Rushing to give advice.",
                    "Focusing on their tone of voice."
                  ],
                  "correctAnswer": 2,
                  "explanation": "Sometimes, the best response is just listening and not rushing to give advice."
                },
                {
                  "question": "Which phrase is an example of Repeating or Paraphrasing for Clarity?",
                  "options": [
                    "\"That's not what I think.\"",
                    "“So you’re saying you felt left out?”",
                    "\"I have to talk now.\"",
                    "\"I already know the answer.\""
                  ],
                  "correctAnswer": 1,
                  "explanation": "Repeating or paraphrasing helps ensure clarity and shows that you’re actively listening."
                },
                {
                  "question": "What does active listening build in personal calls?",
                  "options": [
                    "Arguments and conflict.",
                    "Emotional connection.",
                    "Multitasking skills.",
                    "The desire to interrupt."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Active listening helps to create a deeper emotional connection in conversations."
                },
                {
                  "question": "Why does the lesson advise against multitasking on the phone?",
                  "options": [
                    "It sounds cold and impersonal.",
                    "People can hear when you’re distracted.",
                    "It makes the call too short.",
                    "It helps the conversation flow better."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Multitasking makes the conversation feel impersonal and shows that you’re not fully engaged."
                },
                {
                  "question": "What is the main point of the Key Takeaway for Lesson 3?",
                  "options": [
                    "Good phone conversations are built on giving advice quickly.",
                    "Good phone conversations are built on active listening.",
                    "Attentiveness should be shown only through silence.",
                    "You must talk more than the other person."
                  ],
                  "correctAnswer": 1,
                  "explanation": "The key to great conversations is active listening, not dominating the discussion."
                },
                {
                  "question": "What is the goal when you gently respond with 'That must’ve been tough'?",
                  "options": [
                    "To interrupt the speaker.",
                    "To show empathy and encouragement.",
                    "To switch the topic to yourself.",
                    "To tell them they are wrong."
                  ],
                  "correctAnswer": 1,
                  "explanation": "This phrase shows empathy and lets the speaker know that you understand their feelings."
                }
              ]
            }
          },
          
          {
            "id": "lesson-4-4",
            "title": "Using Empathy to Strengthen Relationships",
            "description": "Understand others’ perspectives and build stronger, more supportive connections.",
            "duration": "15 min",
            "difficulty": "intermediate",
            "category": "Emotional Intelligence",
            "topicId": "topic-4",
            "order": 4,
            "content": [
              {
                "type": "text",
                "title": "The Power of Empathy",
                "content": "Empathy is about seeing the world through someone else’s eyes. It’s not just about agreeing but understanding their feelings."
              },
              {
                "type": "text",
                "title": "Empathy in Action",
                "content": "When someone shares their problem, focus on listening before speaking. Respond with care—“That sounds really tough. I’m here for you.”"
              },
              {
                "type": "text",
                "title": "Handling Misunderstandings and Emotional Conversations",
                "content": "Tone can be misinterpreted easily — what you meant as a joke may sound rude; what you meant as concern may sound like criticism. When that happens, clarify gently instead of defending yourself immediately.\nExample:\n✅ “I didn’t mean it that way — I’m really sorry if it sounded harsh.”\n✅ “I think we might’ve misunderstood each other. Can we start over?”"
              },
              {
                "type": "text",
                "title": "Staying Calm During Conflict",
                "content": "If a friend or family member calls while upset, focus on listening before responding. Let them express themselves without interruption. When you reply, keep your voice even and kind.\nExample:\n“I understand you’re frustrated. Let’s talk about how we can fix this.”"
              },
              {
                "type": "text",
                "title": "Repairing Hurt Feelings Over the Phone",
                "content": "Sometimes, an apology over the phone feels more genuine than a text. Be specific and heartfelt:\n“I’m really sorry for what I said earlier. I didn’t realize how it came across.”"
              },
              {
                "type": "text",
                "title": "Tips for Difficult Calls",
                "content": "Don’t raise your voice, even if the other person does.\nUse calm, empathetic phrases: “I hear you,” “That makes sense.”\nTake deep breaths between responses.\nIf needed, politely suggest taking a break and calling again later."
              },
              {
                "type": "text",
                "title": "Example Practice",
                "content": "Imagine a misunderstanding between you and a friend over something you said in a call. Write a short script of how you would calmly clarify and apologize."
              },
              {
                "type": "text",
                "title": "Key Takeaways",
                "content": "Emotional conversations are part of life, especially with loved ones. The key is not to avoid them, but to handle them with grace and empathy. Staying calm, apologizing sincerely, and clarifying misunderstandings show maturity and care. The goal of every phone call should be understanding — not just being right."
              }
            ],
            "quiz": {
              "questions": [
                {
                  "question": "When tone is misinterpreted (e.g., a joke sounds rude), what should you do instead of immediately defending yourself?",
                  "options": [
                    "Immediately hang up the phone.",
                    "Clarify gently.",
                    "Raise your voice.",
                    "Blame the other person for misunderstanding."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Clarifying gently helps prevent escalation and clears up misunderstandings."
                },
                {
                  "question": "When a friend or family member calls while upset, what should you focus on first?",
                  "options": [
                    "Interrupting them to offer advice.",
                    "Listening before responding.",
                    "Raising your voice to match their emotion.",
                    "Defending yourself from past issues."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Listening first shows empathy and allows you to understand their perspective."
                },
                {
                  "question": "What is the best way to respond to an upset person while keeping your voice even and kind?",
                  "options": [
                    "\"You are being too emotional right now.\"",
                    "“I understand you’re frustrated. Let’s talk about how we can fix this.”",
                    "\"Stop talking or I will hang up.\"",
                    "\"It's your fault for feeling that way.\""
                  ],
                  "correctAnswer": 1,
                  "explanation": "A calm and understanding response helps de-escalate the situation."
                },
                {
                  "question": "What is a recommended phrase for Repairing Hurt Feelings over the phone?",
                  "options": [
                    "“I’m glad you’re over it now.”",
                    "“I’m really sorry for what I said earlier. I didn’t realize how it came across.”",
                    "“I didn’t mean it, so it doesn't matter.”",
                    "“It was a joke, so stop being mad.”"
                  ],
                  "correctAnswer": 1,
                  "explanation": "A specific, heartfelt apology conveys sincerity and empathy."
                },
                {
                  "question": "Which action is a key tip for handling Difficult Calls?",
                  "options": [
                    "Raise your voice to establish control.",
                    "Don’t raise your voice, even if the other person does.",
                    "Avoid taking any deep breaths.",
                    "Use critical or blaming phrases."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Keeping your voice calm maintains a respectful and productive conversation."
                },
                {
                  "question": "When attempting to clarify a misunderstanding, what phrase is recommended?",
                  "options": [
                    "\"You misunderstood me completely.\"",
                    "“I think we might’ve misunderstood each other. Can we start over?”",
                    "\"I refuse to apologize for my tone.\"",
                    "\"I know exactly what you meant.\""
                  ],
                  "correctAnswer": 1,
                  "explanation": "This phrase acknowledges mutual misunderstanding and resets the conversation respectfully."
                },
                {
                  "question": "Why does the lesson suggest that a phone apology can sometimes feel more genuine than a text?",
                  "options": [
                    "Because texts are too long.",
                    "Because the person can hear the sincerity in your voice.",
                    "Because a phone call is less specific.",
                    "Because texts are only for formal communication."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Tone and emotion are better conveyed verbally, making apologies feel sincere."
                },
                {
                  "question": "If you need to stop a conflict-ridden call, what is the best strategy?",
                  "options": [
                    "Just hang up immediately without explanation.",
                    "Politely suggest taking a break and calling again later.",
                    "Start yelling to end the call quickly.",
                    "Blame the phone's connection."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Pausing and resuming later helps prevent escalation and maintains respect."
                },
                {
                  "question": "The Key Takeaway states that the goal of every phone call should be:",
                  "options": [
                    "Just being right.",
                    "Achieving complete silence.",
                    "Understanding.",
                    "Always avoiding emotional topics."
                  ],
                  "correctAnswer": 2,
                  "explanation": "Effective communication aims for mutual understanding, not winning an argument."
                },
                {
                  "question": "What is the purpose of using calm, empathetic phrases like “I hear you” during a difficult call?",
                  "options": [
                    "To signal the argument is over.",
                    "To show you are actively listening and focused on them.",
                    "To annoy the other person.",
                    "To make the conversation longer."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Empathetic phrases demonstrate attention and respect for the other person’s feelings."
                }
              ]
            }
          },
          
          {
            "id": "lesson-4-5",
            "title": "Ending Conversations with Warmth and Connection",
            "description": "Learn how to close conversations in a way that leaves a positive, lasting impression and strengthens relationships.",
            "duration": "15 min",
            "difficulty": "intermediate",
            "category": "Emotional Intelligence",
            "topicId": "topic-4",
            "order": 5,
            "content": [
              {
                "type": "text",
                "title": "Closing Conversations Thoughtfully",
                "content": "How you end a conversation leaves a lasting impression. Whether formal or personal, your closing words should feel complete and kind.\nPersonal: \"I really enjoyed talking with you. Take care, okay?\"\nFormal: \"Thank you for your time. I'll follow up by email tomorrow.\""
              },
              {
                "type": "text",
                "title": "Showing Gratitude and Affection",
                "content": "For friends and family, closings are opportunities to show appreciation:\n\"It was great catching up with you.\"\n\"Tell Mom I said hi — miss you guys!\"\nA few words of affection strengthen bonds, especially when distance keeps you apart."
              },
              {
                "type": "text",
                "title": "Following Up After Conversations",
                "content": "Send a quick message afterward to show you care:\n\"I really liked talking earlier. Stay safe!\"\nSmall gestures make people feel remembered and valued."
              },
              {
                "type": "text",
                "title": "Tips for Ending Conversations Gracefully",
                "content": "Avoid rushing off; give a short summary before ending.\nEnd on a positive or encouraging note.\nSmile while saying goodbye — it changes your tone.\nUse phrases that match your relationship (\"Talk soon!\" for friends, \"Thank you for your time\" for formal conversations)."
              },
              {
                "type": "text",
                "title": "Example Practice",
                "content": "Call a close friend or relative and focus on ending the conversation thoughtfully. Try adding a phrase that expresses appreciation or affection before hanging up."
              },
              {
                "type": "text",
                "title": "Key Takeaways",
                "content": "A warm goodbye can make someone's entire day. Ending conversations with gratitude, affection, and clarity strengthens personal bonds and builds professionalism. Whether you're telling a friend \"Take care\" or thanking a teacher for their time, kindness at the end of a conversation is what people remember most."
              },
            ],
            "quiz": {
              "questions": [
                {
                  "question": "How should your closing words feel, whether the conversation is formal or personal?",
                  "options": [
                    "Rushed and abrupt.",
                    "Complete and kind.",
                    "Tense and emotional.",
                    "Unclear and vague."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Closing words should be complete and kind to leave a positive impression."
                },
                {
                  "question": "Which closing phrase is best suited for a Formal conversation?",
                  "options": [
                    "Tell Mom I said hi — miss you guys!",
                    "I really enjoyed talking with you. Take care, okay?",
                    "Thank you for your time. I'll follow up by email tomorrow.",
                    "Talk soon!"
                  ],
                  "correctAnswer": 2,
                  "explanation": "Formal conversations should end with professional and polite language."
                },
                {
                  "question": "What does the lesson advise for friends and family closings to strengthen bonds?",
                  "options": [
                    "Avoid saying anything affectionate.",
                    "Include a few words of affection and appreciation.",
                    "Immediately demand a follow-up call.",
                    "End on a negative or neutral note."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Adding affection and appreciation strengthens relationships."
                },
                {
                  "question": "To end a conversation gracefully, what should you do before hanging up?",
                  "options": [
                    "Start a completely new topic.",
                    "Give a short summary.",
                    "Speak in a harsh tone.",
                    "Ask for advice on an unrelated problem."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Providing a summary helps wrap up the conversation clearly."
                },
                {
                  "question": "Why is it recommended to smile while saying goodbye?",
                  "options": [
                    "It helps you quickly forget the conversation.",
                    "It changes your tone to sound warmer.",
                    "It makes the other person confused.",
                    "It signals that you are about to rush off."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Smiling naturally makes your tone warmer and friendlier."
                },
                {
                  "question": "What is the purpose of sending a quick follow-up message after a personal conversation?",
                  "options": [
                    "To criticize the things they said.",
                    "To make people feel remembered and valued.",
                    "To tell them they owe you a call.",
                    "To show you weren't listening during the conversation."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Follow-ups show care and reinforce the relationship."
                },
                {
                  "question": "Which phrase is best suited for an informal, Personal conversation ending?",
                  "options": [
                    "I'll follow up by email.",
                    "Thank you for your valuable time.",
                    "Talk soon!",
                    "Do not call me again."
                  ],
                  "correctAnswer": 2,
                  "explanation": "Informal phrases like 'Talk soon!' are appropriate for friends and family."
                },
                {
                  "question": "How you end a conversation leaves what kind of impression?",
                  "options": [
                    "A temporary impression.",
                    "A lasting impression.",
                    "A confusing impression.",
                    "A neutral impression."
                  ],
                  "correctAnswer": 1,
                  "explanation": "The way you end a conversation impacts how the other person remembers it."
                },
                {
                  "question": "What is the primary benefit of ending conversations with gratitude, affection, and clarity?",
                  "options": [
                    "It creates arguments.",
                    "It only builds professionalism.",
                    "It strengthens personal bonds and builds professionalism.",
                    "It forces the other person to call you first next time."
                  ],
                  "correctAnswer": 2,
                  "explanation": "Kind and clear closings improve relationships and professionalism simultaneously."
                },
                {
                  "question": "What is the main point of the Key Takeaway for Lesson 5?",
                  "options": [
                    "The words at the end of a conversation are the least important part.",
                    "Kindness at the end of a conversation is what people remember most.",
                    "Professional conversations should always end abruptly.",
                    "Gratitude should only be expressed through text."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Ending conversations with kindness leaves the strongest, most memorable impression."
                }
              ]
            }
          }
        ]
      },


      {
        "id": "topic-5",
        "title": "Learn how to express your ideas clearly, listen actively, and engage in respectful, persuasive debates that foster understanding and critical thinking.",
        "description": "Understand your emotions, build self-awareness, and strengthen your ability to manage relationships with empathy and balance.",
        "order": 5,
        "lessons": [
          {
            "id": "lesson-5-1",
            "title": "Understanding the Purpose of a Debate",
            "description": "Learn that a debate is a structured, respectful exchange of ideas aimed at understanding different perspectives, not just winning.",
            "duration": "15 min",
            "difficulty": "beginner",
            "category": "Respectful and Effective Debating Skills",
            "topicId": "topic-5",
            "order": 1,
            "content": [
              {
                "type": "text",
                "title": "What is a Debate?",
                "content": "A debate is more than a verbal competition. It is a structured, respectful exchange of ideas and evidence aimed at helping everyone involved gain a deeper understanding of a topic."
              },
              {
                "type": "text",
                "title": "Separating Ideas from Identity",
                "content": "Disagreement challenges viewpoints, not people. Respectful debaters focus on arguments rather than personal attacks, avoiding conflict fueled by pride or ego."
              },
              {
                "type": "text",
                "title": "Open-Mindedness",
                "content": "Being willing to listen and reconsider your position demonstrates intellectual maturity. Debates are opportunities to share knowledge and discover what you don’t know."
              },
              {
                "type": "text",
                "title": "Tips for Respectful Debating",
                "content": "Enter with curiosity, focus on understanding others’ opinions, avoid competitions of loudness or length, and use respectful transitions like, 'I understand your point, but I see it differently because...'"
              },
              {
                "type": "text",
                "title": "Example Practice",
                "content": "Scenario: A friend says, 'Technology is ruining real communication.' Your respectful response: 'I can see why you think that — people do rely on screens a lot. But technology also helps families stay in touch across distances. Maybe it’s not the tool that’s the problem, but how people use it.'"
              }
            ],
            "quiz": {
              "questions": [
                {
                  "question": "In reality, what is the primary purpose of a debate?",
                  "options": [
                    "To determine who is 'right' in a verbal competition.",
                    "A structured, respectful exchange to gain deeper understanding.",
                    "A challenge to a person's identity.",
                    "To win at all costs, regardless of the outcome."
                  ],
                  "correctAnswer": 1,
                  "explanation": "The main goal of a debate is understanding and exploring ideas, not simply winning."
                },
                {
                  "question": "What must you separate to understand the purpose of a debate truly?",
                  "options": [
                    "Tone from pacing.",
                    "Ideas from identity.",
                    "Evidence from examples.",
                    "Winning from losing."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Separating ideas from identity prevents debates from becoming personal conflicts."
                },
                {
                  "question": "What is the sign of true intellectual maturity in a debate?",
                  "options": [
                    "Refusing to change your position.",
                    "Being unwilling to listen to counterpoints.",
                    "Being willing to listen and reconsider your position.",
                    "Focusing on pride and ego."
                  ],
                  "correctAnswer": 2,
                  "explanation": "Open-mindedness and willingness to reconsider positions shows maturity."
                },
                {
                  "question": "Which of the following is a recommended tip for starting a debate?",
                  "options": [
                    "Always enter with hostility.",
                    "Avoid understanding the 'why' behind an opinion.",
                    "Always enter a debate with curiosity, not hostility.",
                    "Immediately turn the discussion into a personal competition."
                  ],
                  "correctAnswer": 2,
                  "explanation": "Curiosity fosters learning and respectful dialogue."
                },
                {
                  "question": "What should effective debaters focus on, rather than pride or ego?",
                  "options": [
                    "Who talks the loudest.",
                    "The strength of arguments.",
                    "Who talks the longest.",
                    "Rejecting the other person completely."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Focus on argument quality ensures discussions remain respectful and productive."
                },
                {
                  "question": "Which phrase is an example of a respectful transition when offering a differing viewpoint?",
                  "options": [
                    "\"You are completely wrong, and here's why.\"",
                    "“I understand your point, but I see it differently because…”",
                    "\"That's a stupid idea, but let me talk.\"",
                    "\"I'm going to win this argument.\""
                  ],
                  "correctAnswer": 1,
                  "explanation": "Respectful transitions acknowledge the other perspective before presenting yours."
                },
                {
                  "question": "What does the respectful response to the scenario about technology illustrate?",
                  "options": [
                    "Turning the discussion into a personal conflict.",
                    "Focusing on a complex issue by appreciating both sides.",
                    "Attacking the person's identity.",
                    "Ignoring the friend's viewpoint entirely."
                  ],
                  "correctAnswer": 1,
                  "explanation": "The response considers both perspectives and demonstrates empathy."
                },
                {
                  "question": "According to the Key Takeaways, what should you focus on to create an environment where both sides can express themselves freely?",
                  "options": [
                    "Winning.",
                    "Learning.",
                    "Attacking.",
                    "Hostility."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Focusing on learning promotes open, respectful dialogue."
                },
                {
                  "question": "What do the best debates end with?",
                  "options": [
                    "One person dominating the conversation.",
                    "Both participants are learning something new and appreciating complexity.",
                    "The participants feeling rejected.",
                    "The participants avoiding future communication."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Successful debates foster mutual understanding and appreciation of differing viewpoints."
                },
                {
                  "question": "The Key Takeaways describe the best debates as:",
                  "options": [
                    "Battles.",
                    "Bridges.",
                    "Conflicts.",
                    "Competitions."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Debates act as bridges connecting differing minds through respectful dialogue."
                }
              ]
            }
          },
          
          {
            "id": "lesson-5-2",
            "title": "Listening Before Responding",
            "description": "Discover how active listening before speaking strengthens your debating skills by promoting understanding, respect, and thoughtful responses.",
            "duration": "15 min",
            "difficulty": "beginner",
            "category": "Respectful and Effective Debating Skills",
            "topicId": "topic-5",
            "order": 2,
            "content": [
              {
                "type": "text",
                "title": "Why Listening Matters",
                "content": "Listening is often underrated in debates, but you can’t respond effectively without fully understanding the other person's message. Active listening ensures respect, intelligence, and calmness in discussion."
              },
              {
                "type": "text",
                "title": "Active Listening Techniques",
                "content": "Maintain eye contact, nod to show engagement, avoid distractions, and summarize what the other person said before responding. Use empathy to understand both emotional and logical content."
              },
              {
                "type": "text",
                "title": "Tips for Effective Listening",
                "content": "Don’t interrupt, even if you strongly disagree. Listen for emotional undertones as well as logical content. Stay focused on understanding rather than formulating a rebuttal immediately. Use gestures or short affirmations like 'I see' or 'That makes sense.'"
              },
              {
                "type": "text",
                "title": "Example Practice",
                "content": "Scenario: During a class debate, a classmate says, 'Uniforms should be banned because they restrict freedom.' Your respectful response: 'I understand your perspective — freedom of expression is important. But uniforms also reduce social pressure and bullying. Maybe there’s a way to balance both sides, like having optional casual days.'"
              }
            ],
            "quiz": {
              "questions": [
                {
                  "question": "What is the primary reason why listening is considered the most underrated debating skill?",
                  "options": [
                    "You should only focus on speaking.",
                    "You can’t respond effectively if you don’t fully understand the message.",
                    "It shows weakness in an argument.",
                    "It encourages interruptions."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Without understanding the message, responses are ineffective and may escalate conflict."
                },
                {
                  "question": "What does Active Listening in a debate involve besides just using your ears?",
                  "options": [
                    "Planning your rebuttal immediately.",
                    "Using empathy.",
                    "Avoiding eye contact.",
                    "Interrupting frequently."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Empathy ensures you process both emotional and logical content."
                },
                {
                  "question": "How can you show you value the other person's point of view while actively listening?",
                  "options": [
                    "Avoiding all gestures.",
                    "Summarizing what they said before giving your response.",
                    "Staying silent and looking away.",
                    "Formulating a rebuttal immediately."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Summarizing demonstrates attention and respect for their viewpoint."
                },
                {
                  "question": "Which is a recommended Tip for listening effectively in a debate?",
                  "options": [
                    "Immediately interrupt if you strongly disagree.",
                    "Listen for emotional undertones as well as logical content.",
                    "Focus only on formulating your rebuttal.",
                    "Avoid short affirmations like 'I see.'"
                  ],
                  "correctAnswer": 1,
                  "explanation": "Acknowledging both emotions and logic allows for sensitive and informed responses."
                },
                {
                  "question": "What is the benefit of letting a pause 'breathe' instead of interrupting?",
                  "options": [
                    "It creates an emotional argument.",
                    "It allows you to spot weaknesses in their argument.",
                    "It makes the conversation unproductive.",
                    "It shows you aren't paying attention."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Pausing helps you process the message and prepare a thoughtful response."
                },
                {
                  "question": "When a classmate says, 'Uniforms should be banned because they restrict freedom,' what does the respectful response aim to do?",
                  "options": [
                    "Completely shut down their idea.",
                    "Find a way to balance both sides of the issue.",
                    "Immediately insult their viewpoint.",
                    "Talk only about personal experiences."
                  ],
                  "correctAnswer": 1,
                  "explanation": "The goal is to acknowledge their point while offering a balanced perspective."
                },
                {
                  "question": "According to the Key Takeaways, active listening helps you craft responses that are:",
                  "options": [
                    "Impulsive.",
                    "Thoughtful.",
                    "Emotional.",
                    "Hostile."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Thoughtful responses are a result of truly understanding the other person's perspective."
                },
                {
                  "question": "What does not interrupting, even when you strongly disagree, demonstrate?",
                  "options": [
                    "Weakness.",
                    "Respect.",
                    "Distraction.",
                    "Impatience."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Allowing others to speak fully shows respect and maturity in debate."
                },
                {
                  "question": "How does active listening help keep a conversation calm and productive?",
                  "options": [
                    "By ignoring the other person.",
                    "By forcing them to agree.",
                    "By avoiding misunderstandings.",
                    "By constantly distracting yourself."
                  ],
                  "correctAnswer": 2,
                  "explanation": "Understanding fully prevents conflicts and maintains productive dialogue."
                },
                {
                  "question": "The lesson states that a respectful debate begins not with your voice, but with:",
                  "options": [
                    "Your pride.",
                    "Your anger.",
                    "Your ears and open mind.",
                    "Your need to win."
                  ],
                  "correctAnswer": 2,
                  "explanation": "Listening first establishes respect, understanding, and a calm environment for debate."
                }
              ]
            }
          },
          {
            "id": "lesson-5-3",
            "title": "Expressing Your Ideas Clearly and Calmly",
            "description": "Learn to present your arguments in a structured, calm, and clear way to ensure your points are understood and respected.",
            "duration": "15 min",
            "difficulty": "beginner",
            "category": "Respectful and Effective Debating Skills",
            "topicId": "topic-5",
            "order": 3,
            "content": [
              {
                "type": "text",
                "title": "Why Clarity and Calmness Matter",
                "content": "Strong points lose impact when delivered in a messy or emotional way. Clarity ensures logic drives your argument, and calmness ensures your message is heard, not dismissed."
              },
              {
                "type": "text",
                "title": "Using the P.R.E. Method",
                "content": "Point: State your belief clearly. Reason: Explain why you believe it. Example: Support it with evidence or personal experience. This structure helps your argument flow logically and avoids rambling."
              },
              {
                "type": "text",
                "title": "Tone and Delivery Tips",
                "content": "Use a calm, polite tone to communicate confidence. Avoid filler words like 'uhm' or 'like.' Maintain a moderate pace, breathe before responding to emotional statements, and use transitional phrases such as 'for example' or 'on the other hand.'"
              },
              {
                "type": "text",
                "title": "Example Practice",
                "content": "Scenario: A family member says, 'I think young people today are lazy.' Your response: 'I understand that perspective. However, many young people work multiple jobs or study while helping their families. Maybe what we see as laziness is actually burnout from too many responsibilities.'"
              }
            ],
            "quiz": {
              "questions": [
                {
                  "question": "What is the main result of delivering strong points in a messy or emotional way?",
                  "options": [
                    "Your points gain more power.",
                    "Your points lose power.",
                    "Your message is immediately respected.",
                    "Your logic stands out clearly."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Emotional or messy delivery weakens the clarity and persuasiveness of your argument."
                },
                {
                  "question": "The P.R.E. method stands for:",
                  "options": [
                    "Pride, Reason, Emotion.",
                    "Point, Reason, Example.",
                    "Pacing, Response, Evidence.",
                    "Pressure, Rhetoric, Expression."
                  ],
                  "correctAnswer": 1,
                  "explanation": "The P.R.E. method helps structure your argument logically."
                },
                {
                  "question": "What is the purpose of structuring your arguments using the P.R.E. method?",
                  "options": [
                    "To encourage rambling and emotional outbursts.",
                    "To create a logical flow that's easy to follow.",
                    "To make your audience feel defensive.",
                    "To eliminate all evidence."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Structured arguments are easier for listeners to understand and respect."
                },
                {
                  "question": "Which element of delivery communicates confidence and approachability?",
                  "options": [
                    "A loud, angry tone.",
                    "A calm, polite tone.",
                    "A nervous, rushed tone.",
                    "A hesitant, uncertain tone."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Calm and polite tones make your audience more receptive to your message."
                },
                {
                  "question": "What should you do to stay composed when responding to emotionally charged statements?",
                  "options": [
                    "Speed up your pace.",
                    "Use more filler words.",
                    "Breathe before responding.",
                    "Raise your voice."
                  ],
                  "correctAnswer": 2,
                  "explanation": "Taking a breath helps maintain calm and ensures a respectful, clear response."
                },
                {
                  "question": "What is a good way to improve clarity and avoid rambling?",
                  "options": [
                    "Use transitional phrases like 'for example,' 'on the other hand,' and 'to clarify.'",
                    "Avoid all transitional phrases.",
                    "Speak as fast as you can.",
                    "Avoid all examples."
                  ],
                  "correctAnswer": 0,
                  "explanation": "Transitional phrases guide listeners and make your argument easier to follow."
                },
                {
                  "question": "According to the Key Takeaways, true debaters don't shout louder; they:",
                  "options": [
                    "Use more pressure.",
                    "Speak smarter.",
                    "Get angrier.",
                    "Speak faster."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Intelligent, calm speaking is more persuasive than aggression or volume."
                },
                {
                  "question": "What does remaining respectful and measured while speaking ensure?",
                  "options": [
                    "Your audience becomes defensive.",
                    "Your audience is more likely to listen with an open mind.",
                    "Your tone sounds weak.",
                    "Your argument is dismissed."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Respectful and calm delivery keeps the audience attentive and receptive."
                },
                {
                  "question": "What is the primary purpose of using filler words like 'uhm' and 'like'?",
                  "options": [
                    "To add power and confidence to your speech.",
                    "They should be avoided because they weaken clarity.",
                    "They are essential transitional phrases.",
                    "They help structure your P.R.E. argument."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Filler words can distract from your message and reduce clarity."
                },
                {
                  "question": "The Key Takeaway states the goal is to persuade through:",
                  "options": [
                    "Pressure.",
                    "Emotion.",
                    "Reason.",
                    "Shouting."
                  ],
                  "correctAnswer": 2,
                  "explanation": "Reasoned arguments persuade more effectively than emotional pressure or volume."
                }
              ]
            }
          },
          
          {
            "id": "lesson-5-4",
            "title": "Managing Emotions and Avoiding Personal Attacks",
            "description": "Learn to maintain composure and focus on ideas, not individuals, to keep debates respectful and productive.",
            "duration": "15 min",
            "difficulty": "beginner",
            "category": "Respectful and Effective Debating Skills",
            "topicId": "topic-5",
            "order": 4,
            "content": [
              {
                "type": "text",
                "title": "Why Emotional Control Matters",
                "content": "When emotions dominate, logic disappears and debates turn into personal conflicts. Staying calm, collected, and composed distinguishes respectful debaters from argumentative ones."
              },
              {
                "type": "text",
                "title": "Managing Your Emotions",
                "content": "Be self-aware: notice when you feel defensive, irritated, or attacked. Pause, take a deep breath, or smile to reset your tone. Passion is acceptable, but must be guided by control."
              },
              {
                "type": "text",
                "title": "Avoiding Personal Attacks",
                "content": "Target the idea, not the individual. Use 'I' statements instead of 'You' accusations (e.g., 'I feel that…' instead of 'You always…'). If things get too heated, suggest a short break."
              },
              {
                "type": "text",
                "title": "Example Practice",
                "content": "Scenario: Your classmate says, 'That’s ridiculous — you always exaggerate.' Your response: 'I’m sorry if it came across that way. I just feel strongly about this topic. Let me explain my reasoning clearly.'"
              }
            ],
            "quiz": {
              "questions": [
                {
                  "question": "What happens to logic when emotions dominate a debate?",
                  "options": [
                    "Logic becomes stronger.",
                    "Logic disappears.",
                    "Logic is clarified.",
                    "Logic is strengthened by pride."
                  ],
                  "correctAnswer": 1,
                  "explanation": "When emotions take over, rational thinking diminishes and arguments lose clarity."
                },
                {
                  "question": "The ability to stay calm, collected, and composed separates a respectful debater from what?",
                  "options": [
                    "An assertive person.",
                    "An argumentative person.",
                    "An intellectually mature person.",
                    "A passionate person."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Calm composure differentiates respectful debaters from those who argue aggressively."
                },
                {
                  "question": "What should you target when giving a counterargument?",
                  "options": [
                    "The individual.",
                    "The person's pride.",
                    "The idea.",
                    "The person's identity."
                  ],
                  "correctAnswer": 2,
                  "explanation": "Focusing on ideas keeps the debate respectful and productive."
                },
                {
                  "question": "What is the purpose of using 'I' statements instead of 'you' accusations?",
                  "options": [
                    "To shift blame onto the other person.",
                    "To personalize the attack.",
                    "To avoid personal attacks and keep the focus on your feeling.",
                    "To show dominance in the discussion."
                  ],
                  "correctAnswer": 2,
                  "explanation": "'I' statements express your perspective without attacking the other person."
                },
                {
                  "question": "If you are debating and the discussion becomes too heated, what is the polite suggestion recommended?",
                  "options": [
                    "Raise your voice immediately.",
                    "Insult the other person.",
                    "Politely suggest taking a short break.",
                    "Demand that the person apologize."
                  ],
                  "correctAnswer": 2,
                  "explanation": "Pausing the conversation helps both parties regain composure."
                },
                {
                  "question": "What is the recommended action if you notice you are starting to feel defensive or irritated?",
                  "options": [
                    "Immediately lash out.",
                    "Take a deep breath, pause, or smile to reset your tone.",
                    "Turn the discussion into a competition.",
                    "Mock the other person's idea."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Self-awareness and a pause prevent emotional escalation."
                },
                {
                  "question": "Which statement targets the idea instead of the individual?",
                  "options": [
                    "\"You don’t know what you’re talking about!\"",
                    "“That’s a stupid argument.”",
                    "“I disagree with that point.”",
                    "\"You always exaggerate.\""
                  ],
                  "correctAnswer": 2,
                  "explanation": "Focusing on the argument rather than the person keeps the debate respectful."
                },
                {
                  "question": "What does the Key Takeaway state shows inner strength?",
                  "options": [
                    "Personal attacks.",
                    "Emotional control.",
                    "Shouting louder.",
                    "Defensive reactions."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Controlling emotions demonstrates maturity and strength in debate."
                },
                {
                  "question": "What should you remind yourself is the goal of the conversation?",
                  "options": [
                    "Dominance.",
                    "Insulting the other side.",
                    "Understanding.",
                    "Shouting."
                  ],
                  "correctAnswer": 2,
                  "explanation": "The aim of a debate is mutual understanding, not winning by force."
                },
                {
                  "question": "Respectful debaters defend ideas without damaging what?",
                  "options": [
                    "Their pride.",
                    "Their confidence.",
                    "Relationships.",
                    "Their passion."
                  ],
                  "correctAnswer": 2,
                  "explanation": "Respectful debate protects relationships while addressing ideas."
                }
              ]
            }
          },
          
          {
            "id": "lesson-5-5",
            "title": "Finding Common Ground and Ending Respectfully",
            "description": "Learn to close debates gracefully by identifying agreements and leaving a positive impression, even without full consensus.",
            "duration": "15 min",
            "difficulty": "beginner",
            "category": "Respectful and Effective Debating Skills",
            "topicId": "topic-5",
            "order": 5,
            "content": [
              {
                "type": "text",
                "title": "The Importance of Closing a Debate",
                "content": "The end of a debate is as important as the start. Respectful debaters know how to conclude discussions gracefully, valuing mutual understanding over winning."
              },
              {
                "type": "text",
                "title": "Finding Common Ground",
                "content": "Identify areas of agreement, even if you disagree overall. This demonstrates listening, respect, and a focus on harmony rather than division."
              },
              {
                "type": "text",
                "title": "Ending Respectfully",
                "content": "Acknowledge the other person’s effort, thank them for their insights, and summarize shared beliefs. Avoid walking away abruptly — conclude with politeness and reflect on what you learned."
              },
              {
                "type": "text",
                "title": "Example Practice",
                "content": "Scenario: You and a friend debate about climate change. Respectful closing: 'We may have different ideas on how to handle it, but we both agree the environment needs care. I appreciate hearing your side — it helped me see things from another angle.'"
              }
            ],
            "quiz": {
              "questions": [
                {
                  "question": "What is the most meaningful outcome in a debate?",
                  "options": [
                    "Winning every point.",
                    "Mutual respect and understanding.",
                    "The other person admitting they were wrong.",
                    "Ending the discussion abruptly."
                  ],
                  "correctAnswer": 1,
                  "explanation": "The lesson emphasizes that respect and understanding are more valuable than 'winning.'"
                },
                {
                  "question": "What does finding common ground involve?",
                  "options": [
                    "Agreeing about every single point.",
                    "Identifying areas of agreement, even within disagreement.",
                    "Completely avoiding any mention of disagreement.",
                    "Forcing the other person to accept your goal."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Common ground is about recognizing shared perspectives despite differences."
                },
                {
                  "question": "What does acknowledging the other person’s effort and insights help to build?",
                  "options": [
                    "Division and isolation.",
                    "A positive impression and openness for future discussions.",
                    "Future conflict and arguments.",
                    "A guarantee that you will agree next time."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Respectful acknowledgment fosters trust and maintains the relationship."
                },
                {
                  "question": "Which is a recommended Tip for ending a debate gracefully?",
                  "options": [
                    "Walk away abruptly and dismissively.",
                    "Say thank you, even in disagreement.",
                    "Only summarize the parts you won.",
                    "Refuse to talk about the topic again."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Expressing appreciation ensures a polite and constructive ending."
                },
                {
                  "question": "What should you do when closing a debate, according to the example scenario?",
                  "options": [
                    "Only focus on your differing ideas.",
                    "Summarize the shared belief (e.g., 'We both agree the environment needs care').",
                    "Attack their ideas on how to handle the issue.",
                    "State that they saw things incorrectly."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Highlighting shared beliefs emphasizes respect and understanding."
                },
                {
                  "question": "The Key Takeaways state that the true victory in debate is proving that:",
                  "options": [
                    "You are smarter than the other person.",
                    "Civility and understanding can coexist.",
                    "Others are wrong.",
                    "Pride is more important than progress."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Respectful debating prioritizes mutual civility over proving someone wrong."
                },
                {
                  "question": "To show you value the other person's input, even if you disagree about methods, you should agree on:",
                  "options": [
                    "The winner.",
                    "The goal.",
                    "The level of anger.",
                    "The speed of the discussion."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Agreeing on the goal shows understanding despite methodological differences."
                },
                {
                  "question": "What does ending a discussion with kindness build?",
                  "options": [
                    "Division.",
                    "Trust and maturity.",
                    "Future arguments.",
                    "Arrogance."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Kindness fosters trust and reflects maturity."
                },
                {
                  "question": "After the debate is over, what does the lesson recommend you reflect on?",
                  "options": [
                    "How many times you were insulted.",
                    "What you learned and what you could improve.",
                    "How to get revenge in the next discussion.",
                    "How to avoid the other person completely."
                  ],
                  "correctAnswer": 1,
                  "explanation": "Reflecting helps improve future debating skills and self-awareness."
                },
                {
                  "question": "Respectful debating is not about conquering others but about:",
                  "options": [
                    "Isolating them.",
                    "Connecting with them.",
                    "Judging them.",
                    "Ignoring them."
                  ],
                  "correctAnswer": 1,
                  "explanation": "The goal is to build connections through understanding, not domination."
                }
              ]
            }
          },
        ]
      },
      

    ];
  }
  getTopic(id: string): Topic | undefined {
    return this.getTopics().find(topic => topic.id === id);
  }
  
  getPracticeExercises(): PracticeExercise[] {
    return [
      {
        id: 'ex-1',
        title: 'Impromptu Speech: My Dream',
        description: 'Speak for 2 minutes about your biggest dream',
        type: 'impromptu',
        timeLimit: 120,
        prompts: [
          'What is your biggest dream in life?',
          'Why is this dream important to you?',
          'What steps are you taking to achieve it?'
        ],
        tips: [
          'Start with a clear statement',
          'Use personal examples',
          'End with a call to action',
          'Maintain eye contact'
        ]
      },
      {
        id: 'ex-2',
        title: 'Storytelling: A Memorable Day',
        description: 'Tell a story about a day you will never forget',
        type: 'storytelling',
        timeLimit: 180,
        prompts: [
          'Set the scene - where and when?',
          'What happened that made it memorable?',
          'How did you feel?',
          'What did you learn?'
        ],
        tips: [
          'Use descriptive language',
          'Vary your pace and tone',
          'Show emotions through voice',
          'End with a meaningful conclusion'
        ]
      },
      {
        id: 'ex-3',
        title: 'Persuasive Speech: Take Action',
        description: 'Convince your audience to take action on an important issue',
        type: 'speech',
        timeLimit: 240,
        prompts: [
          'State the problem clearly',
          'Explain why it matters',
          'Provide solutions',
          'Call your audience to action'
        ],
        tips: [
          'Use the P.R.E. method',
          'Provide evidence',
          'Appeal to emotions and logic',
          'End with a strong call to action'
        ]
      },
      {
        id: 'ex-4',
        title: 'Presentation: Teach Something New',
        description: 'Teach your audience something you know well',
        type: 'presentation',
        timeLimit: 300,
        prompts: [
          'Introduce your topic',
          'Break it into simple steps',
          'Use examples',
          'Summarize key points'
        ],
        tips: [
          'Use clear structure',
          'Check for understanding',
          'Use gestures to illustrate',
          'Speak at a moderate pace'
        ]
      }
    ];
  }
  getStructuredPracticeContent(): StructuredPractice[] {
    return [
      {
        type: 'monologue',
        difficulty: 'beginner',
        title: 'Simple Personal Introduction',
        description: 'Practice introducing yourself clearly and confidently',
        practiceText: 'Hello, my name is... I am from... I enjoy...',
        targetText: 'Hello, my name is [Your Name]. I am from [Your Location]. I enjoy [Your Hobbies] and I am learning public speaking to improve my communication skills.',
        timeLimit: 60,
        tips: [
          'Speak slowly and clearly',
          'Make eye contact with your audience',
          'Smile naturally',
          'Stand with good posture'
        ]
      },
      {
        type: 'public-speaking',
        difficulty: 'intermediate',
        title: 'Persuasive Speech on Education',
        description: 'Deliver a short persuasive speech about the importance of education',
        practiceText: 'Education is important because...',
        targetText: 'Education is the foundation of progress. It empowers individuals, strengthens communities, and drives innovation. When we invest in education, we invest in our future.',
        timeLimit: 120,
        tips: [
          'Use the P.R.E. method (Point, Reason, Example)',
          'Vary your tone for emphasis',
          'Use hand gestures naturally',
          'Pause between main points'
        ]
      },
      {
        type: 'debate-speech',
        difficulty: 'advanced',
        title: 'Debate: Technology and Communication',
        description: 'Present arguments about technology\'s impact on communication',
        practiceText: 'Technology has changed how we communicate...',
        targetText: 'While technology has made communication faster and more accessible, we must consider both benefits and drawbacks. Technology connects us globally, but face-to-face interaction remains essential for building deep relationships.',
        timeLimit: 180,
        tips: [
          'Present both sides fairly',
          'Use evidence to support your claims',
          'Maintain a respectful tone',
          'Listen actively before responding',
          'Find common ground'
        ]
      }
    ];
  }

  getStructuredPractice(type: string, difficulty: string): StructuredPractice | undefined {
    return this.getStructuredPracticeContent().find(
      (practice: StructuredPractice) => practice.type === type && practice.difficulty === difficulty
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

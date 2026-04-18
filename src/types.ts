import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: 'student' | 'admin';
  standard?: '10' | '12';
  stream?: 'Science' | 'Commerce' | 'Arts';
  streak: number;
  points: number;
  studyHours: number;
  goalToday?: string;
  createdAt: Timestamp;
}

export interface Task {
  id?: string;
  uid: string;
  text: string;
  completed: boolean;
  createdAt: Timestamp;
}

export interface StudyPlan {
  id?: string;
  uid: string;
  subjects: string;
  days: number;
  plan: string;
  fullPlan: string;
  createdAt: Timestamp;
}

export interface EducationalVideo {
  id?: string;
  uid: string;
  title: string;
  prompt: string;
  videoUri: string;
  summary?: string;
  createdAt: Timestamp;
}

export interface ChatMessage {
  id?: string;
  uid: string;
  role: 'user' | 'ai';
  content: string;
  createdAt: Timestamp;
}

export type View = 'dashboard' | 'tutor' | 'planner' | 'timer' | 'tasks' | 'video' | 'lessons' | 'revision' | 'settings';

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  subject: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Quiz {
  topic: string;
  questions: QuizQuestion[];
}

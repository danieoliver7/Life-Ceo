
export interface User {
  id: string;
  username: string;
  passwordHash: string;
  ceoName: string;
}

export interface SubAction {
  id: string;
  topicId?: string;
  name: string;
}

export interface Topic {
  id: string;
  userId: string;
  name: string;
  goal: string;
  targetScore: number; // Meta quantitativa diária (0-100)
  actions: SubAction[];
}

export interface LogEntry {
  id: string;
  logId: string;
  topicId: string;
  actionId?: string;
  name: string;
  isCompleted: boolean;
  isAdHoc: boolean;
}

export interface DayLog {
  id: string;
  userId: string;
  date: string;
  score: number;
  topicScores: Record<string, number>;
  completedActions: string[];
}

export interface UserProfile {
  userId: string;
  name: string;
  photoUrl: string;
  onboardingComplete: boolean;
  dailyCheckInTime: string;
  topics: Topic[];
  topicsCount: number;
}

export type AppTab = 'home' | 'dashboard' | 'restructuring' | 'profile';

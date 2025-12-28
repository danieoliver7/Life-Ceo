
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
  actions: SubAction[];
}

export interface LogEntry {
  id: string;
  logId: string;
  topicId: string;
  actionId?: string; // Se vier do banco
  name: string; // Nome (essencial para ad-hoc)
  isCompleted: boolean;
  isAdHoc: boolean;
}

export interface DayLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  score: number;
  // Fix: added topicScores and completedActions used in excelService and Dashboard
  topicScores: Record<string, number>;
  completedActions: string[];
}

export interface UserProfile {
  userId: string;
  name: string;
  photoUrl: string;
  onboardingComplete: boolean;
  dailyCheckInTime: string;
  // Fix: added topics which is expected in Onboarding and App
  topics: Topic[];
}

export type AppTab = 'home' | 'dashboard' | 'restructuring' | 'profile';

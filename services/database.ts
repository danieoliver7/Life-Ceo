
import { User, UserProfile, Topic, DayLog, LogEntry } from '../types';

/**
 * LIFE CEO CLOUD ENGINE
 * Este serviço gerencia tabelas relacionais simuladas.
 * Para produção, as chamadas de 'localStorage' seriam substituídas por fetch('api/v1/...')
 */

// Fix: added type casting to CloudDB object to handle generic methods correctly via 'this'
export const CloudDB = {
  // --- AUTH SECTION ---
  async register(username: string, password: string, ceoName: string): Promise<User | null> {
    const users = (this as any)._getTable('users') as User[];
    if (users.find(u => u.username === username)) return null;

    const newUser: User = {
      id: crypto.randomUUID(),
      username,
      passwordHash: btoa(password),
      ceoName
    };

    (this as any)._saveTable('users', [...users, newUser]);
    return newUser;
  },

  async login(username: string, password: string): Promise<User | null> {
    const users = (this as any)._getTable('users') as User[];
    return users.find(u => u.username === username && u.passwordHash === btoa(password)) || null;
  },

  // --- TOPICS SECTION ---
  async getTopics(userId: string): Promise<Topic[]> {
    const allTopics = (this as any)._getTable('topics') as Topic[];
    return allTopics.filter(t => t.userId === userId);
  },

  async saveTopics(userId: string, topics: Topic[]) {
    const allTopics = ((this as any)._getTable('topics') as Topic[]).filter(t => t.userId !== userId);
    (this as any)._saveTable('topics', [...allTopics, ...topics]);
  },

  // --- LOGS SECTION ---
  async getDayLog(userId: string, date: string): Promise<{ log: DayLog, entries: LogEntry[] }> {
    const logs = (this as any)._getTable('day_logs') as DayLog[];
    let log = logs.find(l => l.userId === userId && l.date === date);
    
    if (!log) {
      // Fix: initialized missing DayLog properties to prevent runtime errors in services/excelService.ts
      log = { 
        id: crypto.randomUUID(), 
        userId, 
        date, 
        score: 0,
        topicScores: {},
        completedActions: []
      };
      (this as any)._saveTable('day_logs', [...logs, log]);
    }

    const allEntries = (this as any)._getTable('log_entries') as LogEntry[];
    const entries = allEntries.filter(e => e.logId === log!.id);

    return { log, entries };
  },

  async updateLogEntry(entry: LogEntry) {
    const entries = ((this as any)._getTable('log_entries') as LogEntry[]).filter(e => e.id !== entry.id);
    (this as any)._saveTable('log_entries', [...entries, entry]);
  },

  async deleteLogEntry(entryId: string) {
    const entries = ((this as any)._getTable('log_entries') as LogEntry[]).filter(e => e.id !== entryId);
    (this as any)._saveTable('log_entries', entries);
  },

  async saveLogHeader(log: DayLog) {
    const logs = ((this as any)._getTable('day_logs') as DayLog[]).filter(l => l.id !== log.id);
    (this as any)._saveTable('day_logs', [...logs, log]);
  },

  async getProfile(userId: string): Promise<UserProfile | null> {
    const profiles = (this as any)._getTable('profiles') as UserProfile[];
    return profiles.find(p => p.userId === userId) || null;
  },

  async saveProfile(profile: UserProfile) {
    const profiles = ((this as any)._getTable('profiles') as UserProfile[]).filter(p => p.userId !== profile.userId);
    (this as any)._saveTable('profiles', [...profiles, profile]);
  },

  async getAllLogs(userId: string): Promise<DayLog[]> {
    return ((this as any)._getTable('day_logs') as DayLog[]).filter(l => l.userId === userId);
  },

  // --- HELPERS ---
  // Fix: internal helper for typed storage retrieval
  _getTable<T>(name: string): T[] {
    const data = localStorage.getItem(`db_${name}`);
    return data ? JSON.parse(data) : [];
  },

  _saveTable(name: string, data: any[]) {
    localStorage.setItem(`db_${name}`, JSON.stringify(data));
  }
};

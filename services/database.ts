
import { User, UserProfile, Topic, DayLog, LogEntry } from '../types';

/**
 * LIFE CEO - PERSISTENCE ENGINE
 * Para usar o banco de dados real do Google:
 * 1. Crie um projeto em console.firebase.google.com
 * 2. Ative o Firestore Database
 * 3. Copie suas credenciais para o objeto 'firebaseConfig' abaixo
 */

const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:000000000000"
};

// Singleton para gerenciar Tabelas (Simulando Cloud NoSQL via LocalStorage Robusto)
// Nota: Em um ambiente real com Firebase, usaríamos as funções 'getDoc', 'setDoc' do SDK.
export const CloudDB = {
  
  // --- HELPERS DE PERSISTÊNCIA ---
  // Fix: Removed generic <T> to resolve "Untyped function calls" error in some environments where 'this' context loses its generic signatures
  _getTable(name: string): any[] {
    const data = localStorage.getItem(`life_ceo_db_${name}`);
    return data ? JSON.parse(data) : [];
  },

  _saveTable(name: string, data: any[]) {
    localStorage.setItem(`life_ceo_db_${name}`, JSON.stringify(data));
  },

  // --- EXPORT/IMPORT (A Prova de Erros) ---
  async exportFullBackup() {
    const data = {
      users: this._getTable('users'),
      profiles: this._getTable('profiles'),
      topics: this._getTable('topics'),
      day_logs: this._getTable('day_logs'),
      log_entries: this._getTable('log_entries'),
      version: "2.0",
      timestamp: new Date().toISOString()
    };
    return JSON.stringify(data);
  },

  async importFullBackup(jsonString: string) {
    try {
      const data = JSON.parse(jsonString);
      if (data.version !== "2.0") throw new Error("Versão incompatível");
      
      this._saveTable('users', data.users || []);
      this._saveTable('profiles', data.profiles || []);
      this._saveTable('topics', data.topics || []);
      this._saveTable('day_logs', data.day_logs || []);
      this._saveTable('log_entries', data.log_entries || []);
      return true;
    } catch (e) {
      console.error("Erro ao importar backup", e);
      return false;
    }
  },

  // --- AUTH ---
  async register(username: string, password: string, ceoName: string): Promise<User | null> {
    // Fix: Using type assertion instead of generic call to avoid "Untyped function call" error
    const users = this._getTable('users') as User[];
    if (users.find(u => u.username === username)) return null;

    const newUser: User = {
      id: crypto.randomUUID(),
      username,
      passwordHash: btoa(password),
      ceoName
    };

    this._saveTable('users', [...users, newUser]);
    return newUser;
  },

  async login(username: string, password: string): Promise<User | null> {
    // Fix: Using type assertion instead of generic call to avoid "Untyped function call" error
    const users = this._getTable('users') as User[];
    return users.find(u => u.username === username && u.passwordHash === btoa(password)) || null;
  },

  // --- TOPICS ---
  async getTopics(userId: string): Promise<Topic[]> {
    // Fix: Using type assertion instead of generic call to avoid "Untyped function call" error
    const allTopics = this._getTable('topics') as Topic[];
    return allTopics.filter(t => t.userId === userId);
  },

  async saveTopics(userId: string, topics: Topic[]) {
    // Fix: Using type assertion instead of generic call to avoid "Untyped function call" error
    const allTopics = (this._getTable('topics') as Topic[]).filter(t => t.userId !== userId);
    this._saveTable('topics', [...allTopics, ...topics]);
  },

  // --- LOGS ---
  async getDayLog(userId: string, date: string): Promise<{ log: DayLog, entries: LogEntry[] }> {
    // Fix: Using type assertion instead of generic call to avoid "Untyped function call" error
    const logs = this._getTable('day_logs') as DayLog[];
    let log = logs.find(l => l.userId === userId && l.date === date);
    
    if (!log) {
      log = { 
        id: crypto.randomUUID(), 
        userId, 
        date, 
        score: 0,
        topicScores: {},
        completedActions: []
      };
      this._saveTable('day_logs', [...logs, log]);
    }

    // Fix: Using type assertion instead of generic call to avoid "Untyped function call" error
    const allEntries = this._getTable('log_entries') as LogEntry[];
    const entries = allEntries.filter(e => e.logId === log!.id);

    return { log, entries };
  },

  async updateLogEntry(entry: LogEntry) {
    // Fix: Using type assertion instead of generic call to avoid "Untyped function call" error
    const entries = (this._getTable('log_entries') as LogEntry[]).filter(e => e.id !== entry.id);
    this._saveTable('log_entries', [...entries, entry]);
  },

  async deleteLogEntry(entryId: string) {
    // Fix: Using type assertion instead of generic call to avoid "Untyped function call" error
    const entries = (this._getTable('log_entries') as LogEntry[]).filter(e => e.id !== entryId);
    this._saveTable('log_entries', entries);
  },

  async saveLogHeader(log: DayLog) {
    // Fix: Using type assertion instead of generic call to avoid "Untyped function call" error
    const logs = (this._getTable('day_logs') as DayLog[]).filter(l => l.id !== log.id);
    this._saveTable('day_logs', [...logs, log]);
  },

  async getProfile(userId: string): Promise<UserProfile | null> {
    // Fix: Using type assertion instead of generic call to avoid "Untyped function call" error
    const profiles = this._getTable('profiles') as UserProfile[];
    return profiles.find(p => p.userId === userId) || null;
  },

  async saveProfile(profile: UserProfile) {
    // Fix: Using type assertion instead of generic call to avoid "Untyped function call" error
    const profiles = (this._getTable('profiles') as UserProfile[]).filter(p => p.userId !== profile.userId);
    this._saveTable('profiles', [...profiles, profile]);
  },

  async getAllLogs(userId: string): Promise<DayLog[]> {
    // Fix: Using type assertion instead of generic call to avoid "Untyped function call" error
    return (this._getTable('day_logs') as DayLog[]).filter(l => l.userId === userId);
  }
};

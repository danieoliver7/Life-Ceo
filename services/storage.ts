
import { UserProfile, DayLog } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'life_ceo_profile',
  LOGS: 'life_ceo_logs'
};

export const saveProfile = (profile: UserProfile) => {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
};

export const getProfile = (): UserProfile | null => {
  const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
  return data ? JSON.parse(data) : null;
};

export const saveLogs = (logs: DayLog[]) => {
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
};

export const getLogs = (): DayLog[] => {
  const data = localStorage.getItem(STORAGE_KEYS.LOGS);
  return data ? JSON.parse(data) : [];
};

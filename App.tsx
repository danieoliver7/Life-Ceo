
import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, AppTab, DayLog, Topic, User as UserType } from './types';
import { CloudDB } from './services/database';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import Floor from './components/Floor';
import Dashboard from './components/Dashboard';
import Restructuring from './components/Restructuring';
import Profile from './components/Profile';
import { LayoutGrid, BarChart3, Settings2, UserCircle2, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [logs, setLogs] = useState<DayLog[]>([]);
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [loading, setLoading] = useState(true);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  useEffect(() => {
    const savedUser = localStorage.getItem('life_ceo_session');
    if (savedUser) {
      handleLogin(JSON.parse(savedUser));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = async (user: UserType) => {
    setLoading(true);
    setCurrentUser(user);
    localStorage.setItem('life_ceo_session', JSON.stringify(user));
    
    const [savedProfile, savedTopics, savedLogs] = await Promise.all([
      CloudDB.getProfile(user.id),
      CloudDB.getTopics(user.id),
      CloudDB.getAllLogs(user.id)
    ]);

    setProfile(savedProfile);
    setTopics(savedTopics);
    setLogs(savedLogs);
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('life_ceo_session');
    setCurrentUser(null);
    setProfile(null);
    setTopics([]);
    setLogs([]);
    setActiveTab('home');
  };

  const handleOnboardingComplete = async (newProfile: UserProfile) => {
    await CloudDB.saveProfile(newProfile);
    await CloudDB.saveTopics(currentUser!.id, newProfile.topics);
    
    setProfile(newProfile);
    setTopics(newProfile.topics);
    const updatedLogs = await CloudDB.getAllLogs(currentUser!.id);
    setLogs(updatedLogs);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <Loader2 className="text-sky-400 animate-spin" size={48} />
        <div className="absolute inset-0 blur-xl bg-sky-500/20 animate-pulse"></div>
      </div>
      <p className="text-[10px] font-bold uppercase text-slate-500 tracking-[0.5em] animate-pulse">Life CEO OS v2.0</p>
    </div>
  );

  if (!currentUser) return <Auth onLogin={handleLogin} />;
  
  if (!profile || !profile.onboardingComplete) {
    return <Onboarding onComplete={handleOnboardingComplete} currentUser={currentUser} />;
  }

  return (
    <div className="min-h-screen flex flex-col text-slate-100 font-sans selection:bg-sky-500/30">
      <main className="flex-1 animate-in fade-in duration-700">
        {activeTab === 'home' && (
          <Floor profile={profile} topics={topics} date={todayStr} />
        )}
        {activeTab === 'dashboard' && <Dashboard logs={logs} topics={topics} />}
        {activeTab === 'restructuring' && (
          <Restructuring 
            profile={profile} 
            onUpdateTopics={async (t) => {
              setTopics(t);
              if (profile) setProfile({ ...profile, topics: t });
              await CloudDB.saveTopics(currentUser.id, t);
            }} 
          />
        )}
        {activeTab === 'profile' && (
          <Profile 
            profile={profile} 
            logs={logs} 
            onLogout={handleLogout} 
            onUpdateProfile={async (p) => {
              setProfile(p);
              await CloudDB.saveProfile(p);
            }}
          />
        )}
      </main>

      {/* Navegação Life CEO Glass */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/60 backdrop-blur-[18px] border-t border-slate-800/40 flex justify-around items-center px-4 h-24 z-50 shadow-[0_-20px_40px_rgba(0,0,0,0.5)]">
        <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<LayoutGrid />} label="Fábrica" />
        <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<BarChart3 />} label="Painel" />
        <NavButton active={activeTab === 'restructuring'} onClick={() => setActiveTab('restructuring')} icon={<Settings2 />} label="Gestão" />
        <NavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<UserCircle2 />} label="CEO" />
      </nav>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick} 
    className={`flex flex-col items-center justify-center transition-all flex-1 h-full relative group ${active ? 'text-sky-400' : 'text-slate-500 hover:text-slate-300'}`}
  >
    {active && (
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-sky-400 rounded-b-full shadow-[0_4px_12px_rgba(56,189,248,0.6)] animate-in slide-in-from-top-1"></div>
    )}
    <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-105'}`}>
      {React.cloneElement(icon, { size: active ? 26 : 22, strokeWidth: active ? 2.5 : 1.5 })}
    </div>
    <span className={`text-[10px] font-bold uppercase tracking-[0.1em] mt-2 transition-all ${active ? 'opacity-100' : 'opacity-40 group-hover:opacity-60'}`}>
      {label}
    </span>
  </button>
);

export default App;

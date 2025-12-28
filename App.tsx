
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
  };

  const handleOnboardingComplete = async (newProfile: UserProfile) => {
    await CloudDB.saveProfile(newProfile);
    // Fix: correctly access topics from newProfile now that it's defined in the interface
    await CloudDB.saveTopics(currentUser!.id, newProfile.topics);
    
    setProfile(newProfile);
    setTopics(newProfile.topics);
    const updatedLogs = await CloudDB.getAllLogs(currentUser!.id);
    setLogs(updatedLogs);
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
      <Loader2 className="text-blue-500 animate-spin" size={40} />
      <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em]">Life CEO OS Loading...</p>
    </div>
  );

  if (!currentUser) return <Auth onLogin={handleLogin} />;
  
  if (!profile || !profile.onboardingComplete) {
    return <Onboarding onComplete={handleOnboardingComplete} currentUser={currentUser} />;
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 pb-20 font-sans selection:bg-blue-500/30">
      <main className="animate-in fade-in duration-700 min-h-screen">
        {activeTab === 'home' && (
          <Floor 
            profile={profile} 
            topics={topics}
            date={todayStr}
          />
        )}
        {activeTab === 'dashboard' && <Dashboard logs={logs} topics={topics} />}
        {activeTab === 'restructuring' && (
          <Restructuring 
            profile={profile} 
            onUpdateTopics={async (t) => {
              // Fix: ensure internal state and persistent storage are synchronized correctly
              setTopics(t);
              if (profile) setProfile({ ...profile, topics: t });
              await CloudDB.saveTopics(currentUser.id, t);
            }} 
          />
        )}
        {activeTab === 'profile' && <Profile profile={profile} logs={logs} onLogout={handleLogout} />}
      </main>

      {/* Navegação Mobile Ultra-Premium */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-2xl border-t border-slate-800/40 flex justify-around items-center px-2 h-24 z-50 shadow-[0_-15_40px_rgba(0,0,0,0.6)]">
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
    className={`flex flex-col items-center justify-center transition-all flex-1 h-full relative group ${active ? 'text-blue-400' : 'text-slate-600 hover:text-slate-400'}`}
  >
    {active && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-500 rounded-b-full shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-in slide-in-from-top-1"></div>}
    <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-active:scale-90'}`}>
      {React.cloneElement(icon, { size: active ? 26 : 22, strokeWidth: active ? 2.5 : 1.5 })}
    </div>
    <span className={`text-[9px] font-black uppercase tracking-[0.2em] mt-2 transition-all ${active ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-1'}`}>
      {label}
    </span>
  </button>
);

export default App;

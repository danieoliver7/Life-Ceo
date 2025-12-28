
import React from 'react';
import { UserProfile, DayLog } from '../types';
import { LogOut, Trophy, Target, Building2, User } from 'lucide-react';

interface ProfileProps {
  profile: UserProfile;
  logs: DayLog[];
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ profile, logs, onLogout }) => {
  const lifetimeAvg = logs.length > 0 
    ? (logs.reduce((acc, l) => acc + l.score, 0) / logs.length).toFixed(1)
    : "0.0";

  return (
    <div className="pb-28 pt-8 px-4 space-y-10 max-w-2xl mx-auto">
      <header className="flex flex-col items-center gap-5 text-center">
        <div className="w-28 h-28 rounded-[2.5rem] bg-slate-800 border-4 border-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative group transition-transform duration-500 hover:scale-105">
          <img src={profile.photoUrl} alt="CEO" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" />
          <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
            <User className="text-white" size={32} />
          </div>
        </div>
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-white tracking-tight">{profile.name}</h1>
          <p className="text-blue-400 font-black uppercase tracking-[0.3em] text-[10px]">C.E.O. & Fundador da Vida Inc.</p>
        </div>
      </header>

      <div className="bg-slate-900 rounded-[3rem] p-10 shadow-2xl border border-slate-800 text-center space-y-4 relative overflow-hidden group">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-[80px] group-hover:bg-blue-500/20 transition-all duration-700"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-[80px]"></div>
        
        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] relative z-10">Métrica de Legado Vitalício</p>
        <div className="flex flex-col items-center relative z-10">
          <span className="text-8xl font-black text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">{lifetimeAvg}</span>
          <div className="flex items-center gap-3 mt-4 bg-slate-800/50 px-6 py-2 rounded-full border border-slate-700/50 shadow-inner">
            <Trophy className="text-amber-400" size={18} />
            <span className="text-slate-400 font-black uppercase tracking-widest text-[9px]">Status: Gestão de Elite</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="bg-slate-900 p-6 rounded-[2rem] shadow-xl border border-slate-800 space-y-2 group transition-all hover:border-blue-500/30">
          <Target className="text-blue-500 mb-2 group-hover:scale-110 transition-transform" size={24} />
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Check-in Estratégico</p>
          <p className="font-black text-slate-200 text-xl">{profile.dailyCheckInTime}</p>
        </div>
        <div className="bg-slate-900 p-6 rounded-[2rem] shadow-xl border border-slate-800 space-y-2 group transition-all hover:border-indigo-500/30">
          <Building2 className="text-indigo-500 mb-2 group-hover:scale-110 transition-transform" size={24} />
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Setores Controlados</p>
          <p className="font-black text-slate-200 text-xl">10 <span className="text-slate-700 text-sm">/ 10</span></p>
        </div>
      </div>

      <button 
        onClick={() => {
          if (confirm("Deseja encerrar a sessão atual? Seus dados estão salvos no banco de dados local.")) {
            onLogout();
          }
        }}
        className="w-full bg-slate-900 border border-red-500/20 text-red-400 font-black py-5 rounded-[2rem] hover:bg-red-500/10 hover:border-red-500/40 transition-all flex items-center justify-center gap-3 shadow-lg uppercase tracking-widest text-[11px] active:scale-95"
      >
        <LogOut size={20} /> Encerrar Sessão do CEO
      </button>

      <footer className="text-center pb-8 pt-4">
        <p className="text-[9px] text-slate-700 font-black uppercase tracking-[0.5em] opacity-50">Life CEO Engine v1.0 • Database Active</p>
      </footer>
    </div>
  );
};

export default Profile;

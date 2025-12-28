
import React, { useRef, useState } from 'react';
import { UserProfile, DayLog } from '../types';
import { CloudDB } from '../services/database';
import { LogOut, Trophy, Target, Building2, User, Camera, Download, Upload, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';

interface ProfileProps {
  profile: UserProfile;
  logs: DayLog[];
  onLogout: () => void;
  onUpdateProfile: (newProfile: UserProfile) => void;
}

const Profile: React.FC<ProfileProps> = ({ profile, logs, onLogout, onUpdateProfile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success'>('idle');
  const [isEditingTime, setIsEditingTime] = useState(false);

  // Métrica consolidada de performance (0-10)
  const legacyScore = logs.length > 0 
    ? Math.floor(logs.reduce((acc, l) => acc + l.score, 0) / logs.length / 10)
    : 0;

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onUpdateProfile({ ...profile, photoUrl: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExportBackup = async () => {
    const backup = await CloudDB.exportFullBackup();
    const blob = new Blob([backup], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LifeCEO_Backup_${profile.name}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    setSyncStatus('success');
    setTimeout(() => setSyncStatus('idle'), 3000);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const success = await CloudDB.importFullBackup(reader.result as string);
        if (success) {
          alert("Backup restaurado com sucesso! O aplicativo irá reiniciar.");
          window.location.reload();
        } else {
          alert("Falha ao restaurar backup. Verifique o arquivo.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateProfile({ ...profile, dailyCheckInTime: e.target.value });
  };

  return (
    <div className="pb-32 pt-12 px-6 space-y-10 max-w-2xl mx-auto">
      <header className="flex flex-col items-center gap-6 text-center">
        <div className="relative group cursor-pointer" onClick={handleImageClick}>
          <div className="absolute inset-0 bg-sky-400/20 blur-[30px] rounded-full group-hover:bg-sky-400/40 transition-all duration-700"></div>
          <div className="w-32 h-32 rounded-[3rem] bg-slate-900 border-4 border-slate-950 shadow-2xl overflow-hidden relative transition-transform duration-500 group-hover:scale-105">
            <img 
              src={profile.photoUrl || `https://picsum.photos/seed/${profile.name}/200/200`} 
              alt="CEO" 
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
            />
            <div className="absolute inset-0 bg-sky-500/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white">
              <Camera size={24} className="mb-1" />
              <span className="text-[8px] font-black uppercase tracking-widest">Alterar</span>
            </div>
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">{profile.name}</h1>
          <p className="ceo-gradient-text font-black uppercase tracking-[0.4em] text-[9px]">Life CEO Operating System</p>
        </div>
      </header>

      {/* Cloud & Backup System */}
      <div className="ceo-glass rounded-[2.5rem] p-8 border-sky-500/10 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-sky-400" size={20} />
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Segurança de Dados</h3>
          </div>
          {syncStatus === 'success' && (
            <div className="flex items-center gap-2 text-emerald-400 animate-in fade-in slide-in-from-right-2">
              <CheckCircle2 size={14} />
              <span className="text-[9px] font-bold uppercase">Backup Gerado</span>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={handleExportBackup}
            className="flex flex-col items-center gap-3 bg-slate-900/50 border border-white/5 p-5 rounded-2xl hover:bg-slate-800 transition-all group"
          >
            <Download size={24} className="text-sky-400 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Exportar Dados</span>
          </button>
          
          <button 
            onClick={() => backupInputRef.current?.click()}
            className="flex flex-col items-center gap-3 bg-slate-900/50 border border-white/5 p-5 rounded-2xl hover:bg-slate-800 transition-all group"
          >
            <Upload size={24} className="text-indigo-400 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Importar Dados</span>
          </button>
          <input type="file" ref={backupInputRef} onChange={handleImportBackup} accept=".json" className="hidden" />
        </div>
        <p className="text-[8px] text-slate-600 text-center uppercase font-bold tracking-tighter leading-relaxed">
          Os dados são salvos localmente. Use a exportação para garantir a persistência eterna entre dispositivos ou atualizações do sistema.
        </p>
      </div>

      {/* Legacy Card */}
      <div className="ceo-glass rounded-[3rem] p-10 shadow-[0_40px_80px_rgba(0,0,0,0.5)] text-center space-y-4 relative overflow-hidden group border-white/5">
        <p className="text-slate-500 font-bold uppercase tracking-[0.25em] text-[10px] relative z-10">Nota dos Setores</p>
        <div className="flex flex-col items-center relative z-10">
          <span className="text-8xl font-black text-white tracking-tighter drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">{legacyScore}</span>
          <div className="flex items-center gap-3 mt-4 bg-white/5 px-6 py-2 rounded-full border border-white/10 backdrop-blur-md">
            <Trophy className="text-amber-400" size={18} />
            <span className="text-sky-300 font-black uppercase tracking-widest text-[9px]">Status: Gestão de Elite</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Botão interativo para editar Check-in */}
        <button 
          onClick={() => setIsEditingTime(true)}
          className="ceo-glass p-6 rounded-[2rem] shadow-xl border-white/5 space-y-2 group hover:border-sky-500/30 transition-all text-center relative overflow-hidden"
        >
          <Target className="text-sky-400 mx-auto mb-1 group-hover:scale-110 transition-transform" size={24} />
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Janela Check-in</p>
          {isEditingTime ? (
            <input 
              type="time" 
              autoFocus
              value={profile.dailyCheckInTime}
              onChange={handleTimeChange}
              onBlur={() => setIsEditingTime(false)}
              className="w-full bg-slate-950/50 border-none rounded-lg p-1 text-center font-bold text-slate-200 text-xl focus:ring-0 outline-none"
            />
          ) : (
            <div className="flex items-center justify-center gap-2">
              <p className="font-bold text-slate-200 text-xl">{profile.dailyCheckInTime}</p>
              <Clock size={12} className="text-slate-600" />
            </div>
          )}
        </button>

        <div className="ceo-glass p-6 rounded-[2rem] shadow-xl border-white/5 space-y-2 group hover:border-indigo-500/30 transition-all text-center">
          <Building2 className="text-indigo-400 mx-auto mb-1 group-hover:scale-110 transition-transform" size={24} />
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Setores Ativos</p>
          <p className="font-bold text-slate-200 text-xl">{profile.topicsCount} Áreas</p>
        </div>
      </div>

      <button 
        onClick={onLogout}
        className="w-full bg-slate-900 border border-rose-500/20 text-rose-500 font-bold py-5 rounded-[2rem] hover:bg-rose-500/10 hover:border-rose-500/40 transition-all flex items-center justify-center gap-4 shadow-xl uppercase tracking-widest text-[11px] active:scale-95"
      >
        <LogOut size={20} /> Sair do App
      </button>

      <footer className="text-center pb-6">
        <p className="text-[9px] text-slate-700 font-bold uppercase tracking-[0.5em] opacity-40">Life CEO v2.0 • Data Sovereignty Active</p>
      </footer>
    </div>
  );
};

export default Profile;

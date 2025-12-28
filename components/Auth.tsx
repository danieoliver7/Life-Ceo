
import React, { useState, useRef } from 'react';
import { CloudDB } from '../services/database';
import { User as UserType } from '../types';
import { Building2, Lock, User, ArrowRight, ShieldCheck, Briefcase, Upload } from 'lucide-react';

interface AuthProps {
  onLogin: (user: UserType) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [ceoName, setCeoName] = useState('');
  const [error, setError] = useState('');
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        const user = await CloudDB.login(username, password);
        if (user) onLogin(user);
        else setError('Acesso negado. Credenciais inválidas.');
      } else {
        if (!ceoName.trim()) {
          setError('Defina o nome do CEO líder.');
          return;
        }
        const user = await CloudDB.register(username, password, ceoName);
        if (user) onLogin(user);
        else setError('Este ID já está em uso no sistema.');
      }
    } catch (err) {
      setError('Falha crítica na conexão.');
    }
  };

  const handleQuickImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const success = await CloudDB.importFullBackup(reader.result as string);
        if (success) {
          alert("Banco de dados restaurado. Use seu ID anterior para entrar.");
          window.location.reload();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="h-screen w-full bg-[#020617] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background FX */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.06),transparent_50%),radial-gradient(circle_at_bottom_right,rgba(79,70,229,0.06),transparent_50%)] pointer-events-none"></div>
      
      <div className="w-full max-w-[320px] space-y-5 animate-in fade-in zoom-in-95 duration-500 relative z-10">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-br from-sky-400 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-[0_12px_24px_-4px_rgba(56,189,248,0.4)] transform hover:scale-105 transition-transform mb-2">
            <Building2 size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tighter">Life <span className="ceo-gradient-text">CEO</span></h1>
            <p className="text-slate-600 font-bold uppercase tracking-[0.2em] text-[8px]">Operating Environment</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="ceo-glass p-5 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.5)] space-y-4">
          <div className="space-y-3">
            {!isLogin && (
              <div className="space-y-1 animate-in slide-in-from-top-1">
                <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest ml-1">Líder CEO</label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                  <input
                    required
                    value={ceoName}
                    onChange={e => setCeoName(e.target.value)}
                    className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-2.5 pl-9 pr-4 text-white text-xs focus:ring-1 focus:ring-sky-500/50 outline-none transition-all font-semibold"
                    placeholder="Nome"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest ml-1">ID de Sistema</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                <input
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-2.5 pl-9 pr-4 text-white text-xs focus:ring-1 focus:ring-sky-500/50 outline-none transition-all font-semibold"
                  placeholder="ID Usuário"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest ml-1">Criptografia</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-2.5 pl-9 pr-4 text-white text-xs focus:ring-1 focus:ring-sky-500/50 outline-none transition-all font-semibold"
                  placeholder="Senha"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg text-rose-400 text-[9px] font-bold text-center animate-pulse">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-sky-400 to-indigo-600 text-white font-black py-3 rounded-xl transition-all shadow-lg active:scale-95 transform text-[10px] tracking-[0.2em]"
          >
            {isLogin ? 'AUTENTICAR' : 'ATIVAR CEO'}
          </button>
        </form>

        <div className="flex flex-col gap-3 items-center">
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-slate-600 hover:text-sky-400 text-[9px] font-black uppercase tracking-[0.1em] transition-colors"
          >
            {isLogin ? 'Criar Novo Registro Corporativo' : 'Voltar para Login de Acesso'}
          </button>
          
          <div className="w-full h-[1px] bg-white/5 my-1"></div>
          
          <button
            onClick={() => importInputRef.current?.click()}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <Upload size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest">Importar Banco Externo</span>
          </button>
          <input type="file" ref={importInputRef} onChange={handleQuickImport} accept=".json" className="hidden" />
        </div>

        <div className="flex items-center justify-center gap-2 opacity-20 pt-2">
          <ShieldCheck size={12} className="text-sky-400" />
          <span className="text-[7px] font-black uppercase tracking-widest text-slate-400">Secure Life Architecture</span>
        </div>
      </div>
    </div>
  );
};

export default Auth;

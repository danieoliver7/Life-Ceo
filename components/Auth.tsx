
import React, { useState } from 'react';
// Fix: corrected import to use CloudDB as defined in services/database.ts
import { CloudDB } from '../services/database';
import { User as UserType } from '../types';
import { Building2, Lock, User, ArrowRight, ShieldCheck, Briefcase } from 'lucide-react';

interface AuthProps {
  onLogin: (user: UserType) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [ceoName, setCeoName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      // Fix: call login on CloudDB
      const user = await CloudDB.login(username, password);
      if (user) onLogin(user);
      else setError('Credenciais inválidas ou conta não encontrada.');
    } else {
      if (!ceoName.trim()) {
        setError('O nome do CEO é obrigatório para o registro.');
        return;
      }
      // Fix: call register on CloudDB
      const user = await CloudDB.register(username, password, ceoName);
      if (user) onLogin(user);
      else setError('Este nome de usuário já está em uso.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center space-y-3">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/20 mb-6">
            <Building2 size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">Life CEO</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
            {isLogin ? 'Terminal de Acesso' : 'Registro de Novo Executivo'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl backdrop-blur-xl space-y-6">
          <div className="space-y-4">
            {!isLogin && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Nome do CEO</label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
                  <input
                    required
                    value={ceoName}
                    onChange={e => setCeoName(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                    placeholder="Ex: Marcus Aurelius"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Usuário / ID</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
                <input
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                  placeholder="ID corporativo"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Chave de Segurança</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-red-400 text-xs font-bold text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 active:scale-95"
          >
            {isLogin ? 'AUTENTICAR' : 'REGISTRAR CEO'} <ArrowRight size={20} />
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-slate-500 hover:text-blue-400 text-xs font-black uppercase tracking-widest transition-colors"
          >
            {isLogin ? 'Não possui uma conta? Registre-se' : 'Já possui conta? Faça Login'}
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 opacity-30">
          <ShieldCheck size={14} className="text-slate-400" />
          <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Security Terminal v1.1 • Encrypted Data</span>
        </div>
      </div>
    </div>
  );
};

export default Auth;

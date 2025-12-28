
import React, { useState, useMemo } from 'react';
import { DayLog, Topic } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { FileDown, LayoutDashboard, Target } from 'lucide-react';
import { exportToExcel } from '../services/excelService';

interface DashboardProps {
  logs: DayLog[];
  topics: Topic[];
}

const Dashboard: React.FC<DashboardProps> = ({ logs, topics }) => {
  const [filter, setFilter] = useState<'day' | 'week' | 'month'>('week');

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLog = logs.find(l => l.date === todayStr) || { score: 0 };
  
  const globalTarget = useMemo(() => {
    if (topics.length === 0) return 0;
    return Math.round(topics.reduce((sum, t) => sum + (t.targetScore || 100), 0) / topics.length);
  }, [topics]);

  const gapToGoal = Math.max(0, globalTarget - todayLog.score);
  const isGoalReached = todayLog.score >= globalTarget;

  const chartData = useMemo(() => {
    const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
    const limit = filter === 'day' ? 1 : filter === 'week' ? 7 : 30;
    return sorted.slice(-limit).map(l => ({
      date: new Date(l.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      score: l.score,
      target: globalTarget
    }));
  }, [logs, filter, globalTarget]);

  return (
    <div className="pb-32 pt-10 px-6 space-y-10 max-w-4xl mx-auto">
      <header className="flex justify-between items-end">
        <div>
          <p className="text-sky-400 text-[10px] font-bold uppercase tracking-widest mb-1.5 ml-0.5">Relatórios Analíticos</p>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Dados da Empresa</h1>
        </div>
        <button 
          onClick={() => exportToExcel(logs, topics)}
          className="bg-white text-slate-950 p-4 rounded-2xl hover:brightness-110 transition-all flex items-center gap-3 text-[11px] font-black shadow-2xl"
        >
          <FileDown size={20} />
          <span className="hidden sm:inline uppercase">EXPORTAR</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className={`ceo-glass rounded-[2.5rem] p-10 col-span-1 relative overflow-hidden group shadow-2xl border-sky-500/10 ${isGoalReached ? 'ring-2 ring-emerald-500/50 animate-pulse' : ''}`}>
          <div className="absolute -top-10 -right-10 opacity-[0.05] group-hover:opacity-[0.1] transition-all duration-700 rotate-12">
            <Target size={200} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Eficiência Operacional</p>
            <div className="flex flex-col">
              {isGoalReached ? (
                <div className="flex flex-col">
                  <span className="text-4xl font-black text-emerald-400 uppercase tracking-tighter">Meta</span>
                  <span className="text-6xl font-black text-emerald-400 uppercase tracking-tighter leading-none">Batida</span>
                </div>
              ) : (
                <div className="flex flex-col">
                  <span className="text-6xl font-black text-amber-500 leading-none">-{gapToGoal}%</span>
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest mt-3">Para a Meta do Dia</span>
                </div>
              )}
            </div>
          </div>
          <div className="mt-8">
            <div className="flex justify-between text-[9px] font-black text-slate-600 uppercase mb-2">
              <span>Realizado: {todayLog.score}%</span>
              <span>Alvo: {globalTarget}%</span>
            </div>
            <div className="w-full bg-slate-800/50 h-3 rounded-full overflow-hidden border border-white/5 relative">
               <div 
                className="absolute h-full border-r-2 border-white/20 z-10" 
                style={{ left: `${globalTarget}%` }}
              ></div>
              <div 
                className={`h-full transition-all duration-1000 ${isGoalReached ? 'bg-emerald-400' : 'bg-sky-400'}`} 
                style={{ width: `${todayLog.score}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="ceo-glass p-10 rounded-[2.5rem] col-span-1 md:col-span-2 shadow-2xl border-white/5">
          <div className="flex justify-between items-center mb-10">
            <h3 className="font-bold text-slate-300 text-[11px] uppercase tracking-widest flex items-center gap-3">
              <LayoutDashboard size={18} className="text-sky-400" />
              Realizado vs Meta Global
            </h3>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value as any)}
              className="text-[10px] font-black bg-slate-800 border border-white/10 text-slate-200 rounded-xl px-5 py-2.5 outline-none appearance-none cursor-pointer"
            >
              <option value="week">7 Dias</option>
              <option value="month">30 Dias</option>
            </select>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.05)" />
                <XAxis dataKey="date" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} tick={{fill: '#475569'}} />
                <YAxis domain={[0, 100]} fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} tick={{fill: '#475569'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '24px', border: 'none', color: '#fff' }}
                />
                <Area type="monotone" dataKey="score" stroke="#38BDF8" fillOpacity={1} fill="url(#colorScore)" strokeWidth={4} />
                <Line type="step" dataKey="target" stroke="#10b981" strokeDasharray="5 5" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

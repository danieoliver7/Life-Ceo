
import React, { useState, useMemo } from 'react';
import { DayLog, Topic } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { FileDown, LayoutDashboard, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
import { exportToExcel } from '../services/excelService';

interface DashboardProps {
  logs: DayLog[];
  topics: Topic[];
}

const Dashboard: React.FC<DashboardProps> = ({ logs, topics }) => {
  const [filter, setFilter] = useState<'day' | 'week' | 'month'>('week');
  const [showDetailed, setShowDetailed] = useState(false);

  const chartData = useMemo(() => {
    const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
    const limit = filter === 'day' ? 1 : filter === 'week' ? 7 : 30;
    return sorted.slice(-limit).map(l => ({
      date: new Date(l.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      score: l.score
    }));
  }, [logs, filter]);

  const topicPerformance = useMemo(() => {
    return topics.map(t => {
      const relevantLogs = logs.slice(-30);
      const totalTopicScore = relevantLogs.reduce((acc, l) => acc + (l.topicScores[t.id] || 0), 0);
      const avgScore = totalTopicScore / (relevantLogs.length || 1);
      return { name: t.name, score: avgScore };
    });
  }, [logs, topics]);

  const latestScore = logs.find(l => l.date === new Date().toISOString().split('T')[0])?.score || 0;

  return (
    <div className="pb-32 pt-10 px-6 space-y-10 max-w-4xl mx-auto">
      <header className="flex justify-between items-end">
        <div>
          <p className="text-sky-400 text-[10px] font-bold uppercase tracking-widest mb-1.5 ml-0.5">Relatórios Analíticos</p>
          <h1 className="text-4xl font-black text-white tracking-tighter">Business Intelligence</h1>
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
        {/* KPI Principal */}
        <div className="pluma-glass rounded-[2.5rem] p-10 col-span-1 relative overflow-hidden group shadow-2xl border-sky-500/10">
          <div className="absolute -top-10 -right-10 opacity-[0.05] group-hover:opacity-[0.1] transition-all duration-700 rotate-12">
            <TrendingUp size={200} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Efficiency Score</p>
            <div className="flex items-baseline gap-2">
              <span className={`text-7xl font-black ${latestScore >= 70 ? 'text-emerald-400' : latestScore >= 40 ? 'text-sky-400' : 'text-rose-400'}`}>
                {latestScore}
              </span>
              <span className="text-slate-700 text-3xl font-bold">/100</span>
            </div>
          </div>
          <div className="mt-8">
            <div className="w-full bg-slate-800/50 h-3 rounded-full overflow-hidden border border-white/5">
              <div 
                className={`h-full transition-all duration-1000 ${latestScore >= 70 ? 'bg-emerald-400' : 'bg-sky-400'}`} 
                style={{ width: `${latestScore}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-500 mt-4 font-bold uppercase tracking-widest">Performance Corporativa Diária</p>
          </div>
        </div>

        {/* Gráfico de Evolução */}
        <div className="pluma-glass p-10 rounded-[2.5rem] col-span-1 md:col-span-2 shadow-2xl border-white/5">
          <div className="flex justify-between items-center mb-10">
            <h3 className="font-bold text-slate-300 text-[11px] uppercase tracking-widest flex items-center gap-3">
              <LayoutDashboard size={18} className="text-sky-400" />
              Histórico de Performance
            </h3>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value as any)}
              className="text-[10px] font-black bg-slate-800 border border-white/10 text-slate-200 rounded-xl px-5 py-2.5 outline-none focus:ring-2 focus:ring-sky-500/50 appearance-none cursor-pointer"
            >
              <option value="day">Hoje</option>
              <option value="week">7 Dias</option>
              <option value="month">30 Dias</option>
            </select>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.05)" />
                <XAxis dataKey="date" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} tick={{fill: '#475569'}} />
                <YAxis domain={[0, 100]} fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} tick={{fill: '#475569'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '24px', border: '1px solid rgba(148, 163, 184, 0.1)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', fontSize: '12px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#38BDF8' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#38BDF8" 
                  strokeWidth={5} 
                  dot={{ r: 6, fill: '#38BDF8', strokeWidth: 3, stroke: '#020617' }} 
                  activeDot={{ r: 9, fill: '#38BDF8', stroke: 'white', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detalhamento por Setor */}
      <div className="pluma-glass rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500 border-white/5">
        <button 
          onClick={() => setShowDetailed(!showDetailed)}
          className="w-full flex justify-between items-center px-10 py-8 hover:bg-white/5 transition-all text-left"
        >
          <div>
            <span className="font-bold text-white uppercase tracking-[0.2em] text-[12px]">Análise por Departamento</span>
            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1.5">Eficiência Ponderada por Unidade de Negócio</p>
          </div>
          {showDetailed ? <ChevronUp size={28} className="text-slate-600" /> : <ChevronDown size={28} className="text-slate-600" />}
        </button>
        
        {showDetailed && (
          <div className="px-10 pb-12 pt-4 space-y-8 animate-in slide-in-from-top-4 duration-300">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topicPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(148, 163, 184, 0.05)" />
                  <XAxis type="number" domain={[0, 10]} hide />
                  <YAxis dataKey="name" type="category" width={140} fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} tick={{fill: '#94a3b8'}} />
                  <Tooltip 
                    cursor={{fill: 'rgba(56, 189, 248, 0.05)'}} 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '16px', color: '#fff' }}
                  />
                  <Bar dataKey="score" radius={[0, 12, 12, 0]} barSize={32}>
                    {topicPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.score >= 7 ? '#34D399' : entry.score >= 4 ? '#FBBF24' : '#FB7185'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

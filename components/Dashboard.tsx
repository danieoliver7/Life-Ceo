
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
    const stats = topics.map(t => {
      const relevantLogs = logs.slice(-30);
      const totalTopicScore = relevantLogs.reduce((acc, l) => acc + (l.topicScores[t.id] || 0), 0);
      const avgScore = totalTopicScore / (relevantLogs.length || 1);
      return { name: t.name, score: avgScore };
    });
    return stats;
  }, [logs, topics]);

  const latestScore = logs.find(l => l.date === new Date().toISOString().split('T')[0])?.score || 0;

  return (
    <div className="pb-28 pt-6 px-4 space-y-8 max-w-4xl mx-auto">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white">CEO Analytics</h1>
          <p className="text-slate-500 text-sm font-medium">Relatórios estratégicos de eficiência</p>
        </div>
        <button 
          onClick={() => exportToExcel(logs, topics)}
          className="bg-white text-slate-950 p-3 rounded-2xl hover:bg-slate-200 transition-all flex items-center gap-2 text-[10px] font-black shadow-lg shadow-white/5"
        >
          <FileDown size={18} />
          <span className="hidden sm:inline uppercase">EXPORTAR .XLSX</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 rounded-[2rem] p-8 border border-slate-800 col-span-1 flex flex-col justify-between relative overflow-hidden group shadow-2xl">
          <div className="absolute -top-10 -right-10 opacity-[0.03] group-hover:opacity-[0.07] transition-all duration-700 rotate-12">
            <TrendingUp size={200} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Nota Geral Hoje</p>
            <div className="flex items-baseline gap-1">
              <span className={`text-6xl font-black ${latestScore >= 70 ? 'text-emerald-400' : latestScore >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                {latestScore}
              </span>
              <span className="text-slate-700 text-2xl font-bold">/100</span>
            </div>
          </div>
          <div className="mt-6">
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden shadow-inner">
              <div 
                className={`h-full transition-all duration-1000 ${latestScore >= 70 ? 'bg-emerald-400' : latestScore >= 40 ? 'bg-amber-400' : 'bg-red-400'}`} 
                style={{ width: `${latestScore}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-500 mt-3 font-bold uppercase tracking-widest">Meta de alta performance</p>
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 col-span-1 md:col-span-2 shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-widest flex items-center gap-2">
              <LayoutDashboard size={14} className="text-blue-400" />
              Evolução Histórica
            </h3>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value as any)}
              className="text-[10px] font-black bg-slate-800 border border-slate-700 text-slate-300 rounded-xl px-4 py-2 outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer hover:bg-slate-700 transition-colors"
            >
              <option value="day">Hoje</option>
              <option value="week">7 Dias</option>
              <option value="month">30 Dias</option>
            </select>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="date" fontSize={9} fontWeight="bold" tickLine={false} axisLine={false} tick={{fill: '#475569'}} />
                <YAxis domain={[0, 100]} fontSize={9} fontWeight="bold" tickLine={false} axisLine={false} tick={{fill: '#475569'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid #1e293b', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)', fontSize: '12px', fontWeight: 'bold', color: '#f1f5f9' }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#3b82f6" 
                  strokeWidth={4} 
                  dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#0f172a' }} 
                  activeDot={{ r: 7, fill: '#60a5fa' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-[2rem] border border-slate-800 overflow-hidden shadow-2xl transition-all duration-500">
        <button 
          onClick={() => setShowDetailed(!showDetailed)}
          className="w-full flex justify-between items-center px-8 py-6 hover:bg-slate-800/50 transition-all text-left"
        >
          <div>
            <span className="font-black text-white uppercase tracking-widest text-[11px]">Performance por Departamento</span>
            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Média ponderada de eficiência mensal</p>
          </div>
          {showDetailed ? <ChevronUp size={24} className="text-slate-600" /> : <ChevronDown size={24} className="text-slate-600" />}
        </button>
        
        {showDetailed && (
          <div className="px-8 pb-10 pt-2 space-y-6 animate-in slide-in-from-top-4 duration-300">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topicPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1e293b" />
                  <XAxis type="number" domain={[0, 10]} hide />
                  <YAxis dataKey="name" type="category" width={140} fontSize={9} fontWeight="black" tickLine={false} axisLine={false} tick={{fill: '#94a3b8'}} />
                  <Tooltip 
                    cursor={{fill: '#1e293b'}} 
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }}
                  />
                  <Bar dataKey="score" radius={[0, 10, 10, 0]} barSize={24}>
                    {topicPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.score >= 7 ? '#34d399' : entry.score >= 4 ? '#fbbf24' : '#f87171'} />
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

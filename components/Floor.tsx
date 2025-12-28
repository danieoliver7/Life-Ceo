
import React, { useState, useEffect } from 'react';
import { Topic, DayLog, LogEntry, UserProfile, SubAction } from '../types';
import { CloudDB } from '../services/database';
import { 
  CheckCircle2, Circle, ChevronDown, ChevronUp, 
  Plus, ListFilter, Zap, Target, Loader2, X
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FloorProps {
  profile: UserProfile;
  topics: Topic[];
  date: string;
}

const Floor: React.FC<FloorProps> = ({ profile, topics, date }) => {
  const [log, setLog] = useState<DayLog | null>(null);
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [showSelectorFor, setShowSelectorFor] = useState<string | null>(null);
  const [adHocInput, setAdHocInput] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDailyData();
  }, [date]);

  const loadDailyData = async () => {
    setLoading(true);
    const data = await CloudDB.getDayLog(profile.userId, date);
    setLog(data.log);
    setEntries(data.entries);
    setLoading(false);
  };

  const calculateAndSaveScore = async (currentEntries: LogEntry[], currentLog: DayLog) => {
    let totalScore = 0;
    const topicScores: Record<string, number> = {};
    const completedActions: string[] = currentEntries
      .filter(e => e.isCompleted && e.actionId)
      .map(e => `${date}-${e.actionId}`);
    
    topics.forEach(topic => {
      const topicEntries = currentEntries.filter(e => e.topicId === topic.id);
      if (topicEntries.length === 0) {
        topicScores[topic.id] = 0;
        return;
      }

      const completedCount = topicEntries.filter(e => e.isCompleted).length;
      const weightPerAction = 10 / topicEntries.length;
      const tScore = completedCount * weightPerAction;
      totalScore += tScore;
      topicScores[topic.id] = tScore;
    });

    const finalScore = Math.min(100, Math.round(totalScore));
    const updatedLog: DayLog = { ...currentLog, score: finalScore, topicScores, completedActions };
    setLog(updatedLog);
    await CloudDB.saveLogHeader(updatedLog);
  };

  const toggleAction = async (entry: LogEntry) => {
    const updatedEntry = { ...entry, isCompleted: !entry.isCompleted };
    if (updatedEntry.isCompleted) {
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 }, colors: ['#38BDF8', '#4F46E5'] });
    }
    const newEntries = entries.map(e => e.id === entry.id ? updatedEntry : e);
    setEntries(newEntries);
    await CloudDB.updateLogEntry(updatedEntry);
    await calculateAndSaveScore(newEntries, log!);
  };

  const addAdHoc = async (topicId: string) => {
    const name = adHocInput[topicId]?.trim();
    if (!name || !log) return;

    const newEntry: LogEntry = {
      id: crypto.randomUUID(),
      logId: log.id,
      topicId,
      name,
      isCompleted: false,
      isAdHoc: true
    };

    const newEntries = [...entries, newEntry];
    setEntries(newEntries);
    await CloudDB.updateLogEntry(newEntry);
    setAdHocInput({ ...adHocInput, [topicId]: '' });
    await calculateAndSaveScore(newEntries, log);
  };

  const scheduleFromBank = async (topicId: string, action: SubAction) => {
    if (!log) return;
    if (entries.some(e => e.actionId === action.id)) return;

    const newEntry: LogEntry = {
      id: crypto.randomUUID(),
      logId: log.id,
      topicId,
      actionId: action.id,
      name: action.name,
      isCompleted: false,
      isAdHoc: false
    };

    const newEntries = [...entries, newEntry];
    setEntries(newEntries);
    await CloudDB.updateLogEntry(newEntry);
    await calculateAndSaveScore(newEntries, log);
  };

  const removeEntry = async (entryId: string) => {
    const newEntries = entries.filter(e => e.id !== entryId);
    setEntries(newEntries);
    await CloudDB.deleteLogEntry(entryId);
    await calculateAndSaveScore(newEntries, log!);
  };

  const toggleTopic = (id: string) => {
    const newSet = new Set(expandedTopics);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedTopics(newSet);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
      <Loader2 className="animate-spin text-sky-400 mb-4" size={32} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Sincronizando Sistema</p>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] overflow-hidden">
      {/* Life CEO Header */}
      <header className="px-6 pt-10 pb-6 shrink-0 bg-slate-950/40 backdrop-blur-xl z-20 border-b border-white/5 flex justify-between items-end">
        <div>
          <p className="text-sky-400 text-[10px] font-bold uppercase tracking-[0.25em] mb-1.5">Métricas Operacionais</p>
          <h1 className="text-3xl font-bold text-white leading-none tracking-tight">
            {new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' }).replace(',', '')}
          </h1>
        </div>
        <div className="relative group">
          <div className="absolute inset-0 bg-sky-400/20 blur-2xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative bg-slate-900/80 border border-sky-500/30 px-5 py-3 rounded-2xl flex flex-col items-center min-w-[90px] backdrop-blur-md">
            <p className="text-[9px] text-sky-300/70 font-bold uppercase tracking-widest mb-0.5">Nota</p>
            <span className={`text-2xl font-bold ${log!.score >= 70 ? 'text-emerald-400' : 'text-sky-400'}`}>
              {log!.score}
            </span>
          </div>
        </div>
      </header>

      {/* Tópicos List */}
      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-24 custom-scrollbar space-y-4">
        {topics.map(topic => {
          const isExpanded = expandedTopics.has(topic.id);
          const topicEntries = entries.filter(e => e.topicId === topic.id);
          const completed = topicEntries.filter(e => e.isCompleted).length;
          
          return (
            <div 
              key={topic.id} 
              className={`ceo-glass rounded-[2rem] overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-2 ring-sky-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)]' : 'hover:scale-[1.01]'}`}
            >
              <div 
                onClick={() => toggleTopic(topic.id)}
                className="p-5 flex justify-between items-center cursor-pointer active:bg-white/5"
              >
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center transition-all ${topicEntries.length > 0 ? 'bg-gradient-to-br from-sky-400 to-indigo-600 shadow-[0_10px_20px_rgba(56,189,248,0.3)]' : 'bg-slate-800'}`}>
                    <span className="text-white text-[11px] font-black leading-none">{completed}</span>
                    <div className="w-4 h-[1px] bg-white/40 my-1"></div>
                    <span className="text-white/60 text-[9px] font-bold leading-none">{topicEntries.length}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-[15px] uppercase tracking-wide">{topic.name}</h3>
                    <p className={`text-[10px] font-bold uppercase tracking-tight mt-1 ${topicEntries.length === 0 ? 'text-slate-600' : 'text-sky-400/60'}`}>
                      {topicEntries.length === 0 ? "Em espera" : `${Math.round((completed/topicEntries.length)*100 || 0)}% Eficiência`}
                    </p>
                  </div>
                </div>
                {isExpanded ? <ChevronUp size={22} className="text-slate-600" /> : <ChevronDown size={22} className="text-slate-600" />}
              </div>

              {isExpanded && (
                <div className="px-6 pb-8 pt-2 space-y-6 animate-in slide-in-from-top-1 duration-200">
                  <div className="h-[1px] bg-white/5 w-full"></div>
                  
                  {topicEntries.length === 0 ? (
                    <div className="bg-slate-950/40 border border-dashed border-slate-800 rounded-3xl p-10 text-center">
                      <p className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.15em] leading-relaxed">
                        Nenhum fluxo de trabalho<br/>definido para hoje.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {topicEntries.map(entry => (
                        <div key={entry.id} className="flex items-center gap-4 bg-slate-900/40 p-5 rounded-[1.5rem] border border-white/5 group hover:border-white/10 transition-all">
                          <button onClick={() => toggleAction(entry)} className="shrink-0 transition-transform active:scale-90">
                            {entry.isCompleted ? 
                              <CheckCircle2 className="text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.4)]" size={28} /> : 
                              <Circle className="text-slate-700 hover:text-slate-600" size={28} />
                            }
                          </button>
                          <div className="flex-1 min-w-0">
                            <span className={`text-[14px] font-medium block truncate transition-all ${entry.isCompleted ? 'text-slate-600 line-through' : 'text-slate-200'}`}>
                              {entry.name}
                            </span>
                          </div>
                          <button onClick={() => removeEntry(entry.id)} className="p-2 text-slate-700 hover:text-rose-400 transition-colors">
                            <X size={20} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <input 
                      value={adHocInput[topic.id] || ''}
                      onChange={e => setAdHocInput({...adHocInput, [topic.id]: e.target.value})}
                      onKeyPress={e => e.key === 'Enter' && addAdHoc(topic.id)}
                      placeholder="Tarefa ad-hoc..."
                      className="flex-1 bg-slate-950/60 border border-white/5 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-sky-500/40 outline-none font-medium text-white placeholder:text-slate-700 transition-all"
                    />
                    <button 
                      onClick={() => addAdHoc(topic.id)}
                      className="bg-sky-500 text-slate-950 p-4 rounded-2xl hover:brightness-110 active:scale-95 transition-all shadow-[0_10px_20px_rgba(56,189,248,0.2)]"
                    >
                      <Plus size={24} strokeWidth={3} />
                    </button>
                  </div>

                  <button 
                    onClick={() => setShowSelectorFor(topic.id)}
                    className="w-full bg-gradient-to-r from-[#38BDF8] to-[#4F46E5] text-white py-5 rounded-[1.5rem] text-[12px] font-black uppercase tracking-[0.15em] flex items-center justify-center gap-3 shadow-[0_15px_40px_rgba(56,189,248,0.3)] active:scale-98 transition-all"
                  >
                    <ListFilter size={20} /> Agendar do Banco
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showSelectorFor && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-2xl p-6 flex items-center justify-center animate-in fade-in duration-300">
          <div className="bg-slate-900/98 w-full max-w-sm rounded-[3rem] border border-white/10 p-10 shadow-2xl relative overflow-visible">
            <button 
              onClick={() => setShowSelectorFor(null)}
              className="absolute -top-4 -right-4 w-12 h-12 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-rose-500/40 hover:scale-110 active:scale-90 transition-all z-10"
            >
              <X size={24} strokeWidth={3} />
            </button>

            <div className="flex items-center gap-5 mb-10">
              <div className="bg-sky-500/20 p-4 rounded-[1.5rem]">
                <Target className="text-sky-400" size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white uppercase tracking-tight leading-none mb-1">Banco</h3>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Defina o escopo</p>
              </div>
            </div>
            
            <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar border-y border-white/5 py-6">
              {topics.find(t => t.id === showSelectorFor)?.actions.map(action => {
                const isAlreadyInLog = entries.some(e => e.actionId === action.id);
                return (
                  <button 
                    key={action.id}
                    disabled={isAlreadyInLog}
                    onClick={() => scheduleFromBank(showSelectorFor, action)}
                    className={`w-full text-left p-5 rounded-2xl border transition-all flex justify-between items-center group ${isAlreadyInLog ? 'bg-slate-800/20 border-white/5 opacity-40' : 'bg-slate-800/60 border-white/10 hover:border-sky-500/50 hover:bg-slate-800/80'}`}
                  >
                    <span className="font-bold text-[14px] uppercase text-slate-200 tracking-tight">{action.name}</span>
                    {!isAlreadyInLog && <Zap size={16} className="text-sky-400 group-hover:scale-125 transition-transform" />}
                  </button>
                );
              })}
            </div>

            <button 
              onClick={() => setShowSelectorFor(null)}
              className="w-full bg-sky-500 text-slate-950 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[12px] shadow-[0_20px_40px_rgba(56,189,248,0.25)] active:scale-95 transition-all mt-8"
            >
              Confirmar Operação
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Floor;

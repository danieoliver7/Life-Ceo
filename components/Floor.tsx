
import React, { useState, useEffect } from 'react';
import { Topic, DayLog, LogEntry, UserProfile, SubAction } from '../types';
import { CloudDB } from '../services/database';
import { 
  CheckCircle2, Circle, ChevronDown, ChevronUp, 
  Plus, ListFilter, Zap, Target, Loader2, Info, X
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
      confetti({ particleCount: 25, spread: 50, origin: { y: 0.8 }, colors: ['#3b82f6', '#10b981'] });
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
    <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500">
      <Loader2 className="animate-spin mb-4" size={32} />
      <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">Sincronizando Banco de Dados...</p>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] overflow-hidden">
      {/* CABEÇALHO FIXO (Fábrica) */}
      <header className="px-5 pt-8 pb-4 shrink-0 bg-slate-950/80 backdrop-blur-xl z-20 border-b border-slate-900 flex justify-between items-center">
        <div>
          <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Terminal CEO</p>
          <h1 className="text-2xl font-black text-white leading-none">
            {new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' }).replace('.', '')}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-2xl shadow-2xl relative group">
            <div className="absolute inset-0 bg-blue-500/5 blur-xl group-hover:bg-blue-500/10 transition-all"></div>
            <p className="text-[7px] text-slate-500 font-black uppercase mb-0.5 tracking-tighter">Performance</p>
            <span className={`text-xl font-black block leading-none ${log!.score >= 70 ? 'text-emerald-400' : 'text-blue-400'}`}>
              {log!.score}
            </span>
          </div>
        </div>
      </header>

      {/* ÁREA DE SCROLL (Departamentos) */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-20 custom-scrollbar">
        <div className="space-y-3 max-w-2xl mx-auto">
          {topics.map(topic => {
            const isExpanded = expandedTopics.has(topic.id);
            const topicEntries = entries.filter(e => e.topicId === topic.id);
            const completed = topicEntries.filter(e => e.isCompleted).length;
            
            return (
              <div key={topic.id} className={`bg-slate-900/40 border transition-all duration-300 rounded-[2rem] overflow-hidden backdrop-blur-sm ${isExpanded ? 'border-blue-500/30 bg-slate-900/80' : 'border-slate-800/50'}`}>
                <div 
                  onClick={() => toggleTopic(topic.id)}
                  className="p-4 flex justify-between items-center cursor-pointer active:scale-[0.98] transition-transform"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center shadow-inner ${topicEntries.length > 0 ? 'bg-blue-600' : 'bg-slate-800'}`}>
                      <span className="text-white text-[10px] font-black leading-none">{completed}</span>
                      <div className="w-4 h-[1px] bg-white/30 my-1"></div>
                      <span className="text-white/60 text-[8px] font-bold leading-none">{topicEntries.length}</span>
                    </div>
                    <div>
                      <h3 className="font-black text-white text-sm uppercase tracking-wide">{topic.name}</h3>
                      <p className={`text-[9px] font-black uppercase tracking-tighter mt-0.5 ${topicEntries.length === 0 ? 'text-slate-600' : 'text-slate-500'}`}>
                        {topicEntries.length === 0 ? "Setor sem agendamento" : `${Math.round((completed/topicEntries.length)*100 || 0)}% Eficiência`}
                      </p>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp size={20} className="text-slate-600" /> : <ChevronDown size={20} className="text-slate-600" />}
                </div>

                {isExpanded && (
                  <div className="px-5 pb-8 pt-2 space-y-5 animate-in slide-in-from-top-1 duration-200">
                    <div className="h-[1px] bg-slate-800/50 w-full mb-1"></div>
                    
                    {topicEntries.length === 0 ? (
                      <div className="bg-slate-950/30 border border-dashed border-slate-800 rounded-2xl p-8 text-center">
                        <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] italic leading-relaxed">
                          Aguardando definição<br/>de escopo diário.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {topicEntries.map(entry => (
                          <div key={entry.id} className="flex items-center gap-4 bg-slate-800/30 p-4 rounded-2xl border border-slate-800/20 group">
                            <button onClick={() => toggleAction(entry)} className="shrink-0 transition-transform active:scale-90">
                              {entry.isCompleted ? 
                                <CheckCircle2 className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]" size={28} /> : 
                                <Circle className="text-slate-700" size={28} />
                              }
                            </button>
                            <div className="flex-1 min-w-0">
                              <span className={`text-[13px] font-bold block truncate transition-all ${entry.isCompleted ? 'text-slate-600 line-through' : 'text-slate-200'}`}>
                                {entry.name}
                              </span>
                            </div>
                            <button 
                              onClick={() => removeEntry(entry.id)}
                              className="p-2 text-slate-800 hover:text-red-500 transition-colors"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <input 
                        value={adHocInput[topic.id] || ''}
                        onChange={e => setAdHocInput({...adHocInput, [topic.id]: e.target.value})}
                        onKeyPress={e => e.key === 'Enter' && addAdHoc(topic.id)}
                        placeholder="Novo Processo Ad-hoc..."
                        className="flex-1 bg-slate-950/40 border border-slate-800 rounded-2xl px-5 py-3.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none font-bold text-white placeholder:text-slate-800"
                      />
                      <button 
                        onClick={() => addAdHoc(topic.id)}
                        className="bg-blue-600/10 p-3 rounded-2xl text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-xl shadow-blue-500/5"
                      >
                        <Plus size={24} />
                      </button>
                    </div>

                    <button 
                      onClick={() => setShowSelectorFor(topic.id)}
                      className="w-full bg-white text-slate-950 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-2xl shadow-white/5 active:scale-95 transition-all"
                    >
                      <ListFilter size={18} /> Agendar do Banco
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL DE AGENDAMENTO */}
      {showSelectorFor && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-2xl p-5 flex items-center justify-center animate-in fade-in duration-300">
          <div className="bg-slate-900 w-full max-w-sm rounded-[3rem] border border-slate-800 p-8 shadow-2xl space-y-8 relative overflow-hidden">
            {/* Botão X Vermelho - Fixando pedido */}
            <button 
              onClick={() => setShowSelectorFor(null)}
              className="absolute top-6 right-6 w-10 h-10 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full flex items-center justify-center shadow-lg active:bg-red-500 active:text-white transition-all z-10"
              title="Cancelar"
            >
              <X size={24} strokeWidth={3} />
            </button>

            <div className="flex items-center gap-5">
              <div className="bg-blue-600/20 p-4 rounded-3xl shadow-lg">
                <Target className="text-blue-500" size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight leading-none mb-1">Escopo</h3>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.1em]">Selecione KPIs do Banco</p>
              </div>
            </div>
            
            <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-2 custom-scrollbar border-y border-slate-800/50 py-4">
              {topics.find(t => t.id === showSelectorFor)?.actions.map(action => {
                const isAlreadyInLog = entries.some(e => e.actionId === action.id);
                return (
                  <button 
                    key={action.id}
                    disabled={isAlreadyInLog}
                    onClick={() => scheduleFromBank(showSelectorFor, action)}
                    className={`w-full text-left p-5 rounded-2xl border transition-all flex justify-between items-center group ${isAlreadyInLog ? 'bg-slate-800/20 border-slate-800 opacity-40' : 'bg-slate-800/40 border-slate-700 hover:border-blue-500'}`}
                  >
                    <span className="font-black text-[13px] uppercase text-slate-300 tracking-tight">{action.name}</span>
                    <Zap size={14} className={isAlreadyInLog ? 'text-slate-600' : 'text-blue-500 group-hover:scale-125 transition-transform'} />
                  </button>
                );
              })}
            </div>

            <button 
              onClick={() => setShowSelectorFor(null)}
              className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-[0_20px_40px_rgba(37,99,235,0.2)] active:scale-95 transition-all"
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

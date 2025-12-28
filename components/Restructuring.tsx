
import React, { useState } from 'react';
import { UserProfile, Topic, SubAction } from '../types';
import { Settings2, Plus, Trash2, Edit3, Save, AlertCircle, RefreshCw, X } from 'lucide-react';

interface RestructuringProps {
  profile: UserProfile;
  onUpdateTopics: (newTopics: Topic[]) => void;
}

const Restructuring: React.FC<RestructuringProps> = ({ profile, onUpdateTopics }) => {
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [tempTopicName, setTempTopicName] = useState('');
  const [tempGoal, setTempGoal] = useState('');
  const [tempActions, setTempActions] = useState<SubAction[]>([]);
  const [newActionName, setNewActionName] = useState('');
  const [isSwapping, setIsSwapping] = useState<string | null>(null);
  const [newDeptName, setNewDeptName] = useState('');

  const startEdit = (topic: Topic) => {
    setEditingTopicId(topic.id);
    setTempTopicName(topic.name);
    setTempGoal(topic.goal);
    setTempActions([...topic.actions]);
    setNewActionName('');
  };

  const cancelEdit = () => {
    setEditingTopicId(null);
  };

  const saveTopic = () => {
    if (!editingTopicId) return;
    const newTopics = profile.topics.map(t => 
      t.id === editingTopicId 
      ? { ...t, name: tempTopicName, goal: tempGoal, actions: tempActions }
      : t
    );
    onUpdateTopics(newTopics);
    setEditingTopicId(null);
  };

  const addAction = () => {
    const trimmed = newActionName.trim();
    if (!trimmed) return;
    const newAction: SubAction = {
      id: Math.random().toString(36).substr(2, 9),
      name: trimmed
    };
    setTempActions([...tempActions, newAction]);
    setNewActionName('');
  };

  const removeAction = (id: string) => {
    setTempActions(tempActions.filter(a => a.id !== id));
  };

  const swapTopic = (id: string) => {
    if (!newDeptName.trim()) return;
    const newTopics = profile.topics.map(t => 
      t.id === id 
      ? { 
          id: Math.random().toString(36).substr(2, 9), 
          userId: profile.userId,
          name: newDeptName.trim(), 
          goal: "Nova meta estratégica corporativa", 
          targetScore: 100,
          actions: [] 
        }
      : t
    );
    onUpdateTopics(newTopics);
    setIsSwapping(null);
    setNewDeptName('');
  };

  return (
    <div className="pb-28 pt-6 px-4 space-y-8 max-w-2xl mx-auto">
      <header>
        <h1 className="text-3xl font-black text-white">Reestruturação</h1>
        <p className="text-slate-500 text-sm font-medium">Arquitetura de departamentos e processos.</p>
      </header>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-3xl p-5 flex gap-5 items-start shadow-xl">
        <AlertCircle className="text-blue-400 shrink-0 mt-0.5" size={24} />
        <p className="text-xs text-blue-200/70 leading-relaxed font-medium">
          <span className="font-black text-blue-400 uppercase tracking-widest block mb-1">Diretriz Organizacional:</span> 
          O ecossistema Life CEO exige exatamente {profile.topicsCount} departamentos ativos. A substituição garante a evolução sem perda de foco.
        </p>
      </div>

      <div className="space-y-4">
        {profile.topics.map((topic) => (
          <div key={topic.id} className="bg-slate-900 rounded-3xl shadow-xl border border-slate-800 overflow-hidden transition-all duration-300">
            {editingTopicId === topic.id ? (
              <div className="p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nome do Departamento</label>
                  <input 
                    value={tempTopicName}
                    onChange={(e) => setTempTopicName(e.target.value)}
                    className="w-full bg-slate-800 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500 outline-none font-black text-white text-xl"
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Objetivo Estratégico (Meta Macro)</label>
                  <textarea 
                    value={tempGoal}
                    onChange={(e) => setTempGoal(e.target.value)}
                    className="w-full bg-slate-800 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-300 h-24 resize-none font-medium"
                  />
                </div>
                
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Processos Binários</label>
                  <div className="flex gap-3">
                    <input 
                      placeholder="Nova tarefa crítica..."
                      value={newActionName}
                      onChange={(e) => setNewActionName(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && addAction()}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-blue-400 outline-none text-white font-medium"
                    />
                    <button 
                      onClick={addAction}
                      className="bg-blue-600 text-white px-6 rounded-2xl font-black hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                    >
                      INCLUIR
                    </button>
                  </div>
                  
                  <div className="space-y-3 mt-4 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                    {tempActions.length === 0 ? (
                      <p className="text-center py-6 text-slate-600 text-[10px] font-black uppercase tracking-widest italic">Nenhum processo mapeado.</p>
                    ) : (
                      tempActions.map(action => (
                        <div key={action.id} className="flex items-center gap-3 bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 group hover:border-slate-600 transition-colors">
                          <span className="flex-1 text-sm font-bold text-slate-300">{action.name}</span>
                          <button onClick={() => removeAction(action.id)} className="text-slate-600 hover:text-red-400 transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-8 border-t border-slate-800">
                  <button onClick={saveTopic} className="flex-1 bg-white text-slate-950 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-200 transition-all shadow-xl active:scale-95">
                    <Save size={20} /> ATUALIZAR SETOR
                  </button>
                  <button onClick={cancelEdit} className="bg-slate-800 text-slate-400 px-6 py-4 rounded-2xl font-black hover:bg-slate-700 transition-all">
                    CANCELAR
                  </button>
                </div>
              </div>
            ) : isSwapping === topic.id ? (
              <div className="p-8 space-y-5 bg-slate-900 border-2 border-amber-500/20 animate-in slide-in-from-top-2 duration-300">
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-amber-500 uppercase text-[10px] tracking-widest">Protocolo de Substituição: {topic.name}</h3>
                  <button onClick={() => setIsSwapping(null)} className="text-slate-600 hover:text-slate-400 transition-colors"><X size={24} /></button>
                </div>
                <div className="flex gap-3">
                  <input 
                    autoFocus
                    value={newDeptName}
                    onChange={e => setNewDeptName(e.target.value)}
                    placeholder="Nome da nova área estratégica..."
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-amber-500 text-white font-black text-lg"
                  />
                  <button 
                    onClick={() => swapTopic(topic.id)}
                    className="bg-amber-500 text-slate-950 px-8 rounded-2xl font-black hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
                  >
                    TROCAR
                  </button>
                </div>
                <div className="bg-amber-500/5 p-4 rounded-2xl">
                  <p className="text-[10px] text-amber-500/80 font-bold leading-relaxed uppercase tracking-tighter">Nota: A troca é irreversível para o histórico operacional deste ciclo.</p>
                </div>
              </div>
            ) : (
              <div className="p-6 flex justify-between items-center group hover:bg-slate-800/50 transition-all">
                <div className="space-y-1.5">
                  <h3 className="font-black text-white flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span>
                    {topic.name}
                  </h3>
                  <p className="text-[10px] text-slate-500 truncate max-w-[220px] font-black uppercase tracking-widest">{topic.goal || "Objetivo não definido."}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => startEdit(topic)}
                    className="p-3 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-2xl transition-all border border-slate-800 hover:border-blue-500/30"
                  >
                    <Edit3 size={20} />
                  </button>
                  <button 
                    onClick={() => setIsSwapping(topic.id)}
                    className="p-3 text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-2xl transition-all border border-slate-800 hover:border-amber-500/30"
                    title="Substituir Tópico"
                  >
                    <RefreshCw size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Restructuring;


import React, { useState } from 'react';
import { UserProfile, Topic, SubAction, User as UserType } from '../types';
import { SUGGESTED_DEPARTMENTS, INITIAL_TOPICS_COUNT } from '../constants';
import { Check, ArrowRight, Plus, ChevronRight, Trash2, Building2, ClipboardList, Target, User } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
  currentUser: UserType;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, currentUser }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(currentUser.ceoName || '');
  const [checkInTime, setCheckInTime] = useState('08:00');
  
  // Step 2: Departments
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [customDepts, setCustomDepts] = useState<string[]>([]);
  const [customDeptInput, setCustomDeptInput] = useState('');

  // Step 3: Actions Loop
  const [topics, setTopics] = useState<Topic[]>([]);
  const [currentTopicIdx, setCurrentTopicIdx] = useState(0);
  const [newActionName, setNewActionName] = useState('');

  const toggleDept = (dept: string) => {
    if (selectedDepts.includes(dept)) {
      setSelectedDepts(selectedDepts.filter(d => d !== dept));
    } else if (selectedDepts.length < INITIAL_TOPICS_COUNT) {
      setSelectedDepts([...selectedDepts, dept]);
    }
  };

  const addCustomDept = () => {
    const trimmed = customDeptInput.trim();
    if (trimmed && !selectedDepts.includes(trimmed) && !customDepts.includes(trimmed) && selectedDepts.length < INITIAL_TOPICS_COUNT) {
      setCustomDepts([...customDepts, trimmed]);
      setSelectedDepts([...selectedDepts, trimmed]);
      setCustomDeptInput('');
    }
  };

  const proceedToActions = () => {
    const initialTopics: Topic[] = selectedDepts.map(name => ({
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      name,
      goal: '',
      actions: []
    }));
    setTopics(initialTopics);
    setStep(3);
  };

  const addActionToCurrentTopic = () => {
    const trimmed = newActionName.trim();
    if (!trimmed) return;
    
    // Fix: removed 'completed' property from SubAction as it is now handled by LogEntry
    const newAction: SubAction = {
      id: Math.random().toString(36).substr(2, 9),
      name: trimmed
    };

    const newTopics = [...topics];
    newTopics[currentTopicIdx].actions.push(newAction);
    setTopics(newTopics);
    setNewActionName('');
  };

  const removeActionFromCurrentTopic = (actionId: string) => {
    const newTopics = [...topics];
    newTopics[currentTopicIdx].actions = newTopics[currentTopicIdx].actions.filter(a => a.id !== actionId);
    setTopics(newTopics);
  };

  const nextTopic = () => {
    if (currentTopicIdx < topics.length - 1) {
      setCurrentTopicIdx(currentTopicIdx + 1);
    } else {
      setStep(4);
    }
  };

  const updateTopicGoal = (index: number, goal: string) => {
    const newTopics = [...topics];
    newTopics[index].goal = goal;
    setTopics(newTopics);
  };

  const finish = () => {
    // Fix: ensure UserProfile follows the updated type definition including topics and userId
    onComplete({
      userId: currentUser.id,
      name,
      photoUrl: `https://picsum.photos/seed/${name}/200/200`,
      onboardingComplete: true,
      topics,
      dailyCheckInTime: checkInTime
    });
  };

  // Combine suggested and custom depts for the list
  const allAvailableDepts = Array.from(new Set([...SUGGESTED_DEPARTMENTS, ...customDepts]));

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 flex flex-col justify-center max-w-lg mx-auto">
      {step === 1 && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="space-y-2 text-center">
            <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
              <User size={32} className="text-white" />
            </div>
            <p className="text-blue-400 font-bold uppercase tracking-widest text-xs">Fase 01: Identificação</p>
            <h1 className="text-4xl font-black">Olá, CEO {currentUser.ceoName}</h1>
            <p className="text-slate-400 leading-relaxed text-sm">Confirme seus dados e defina seu horário de reporte diário.</p>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nome do Executivo (Confirmação)</label>
              <input 
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-800 border-none rounded-xl px-4 py-4 focus:ring-2 focus:ring-blue-500 outline-none text-lg font-bold"
                placeholder="Ex: Marcus Aurelius"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Horário de Check-in Diário</label>
              <input 
                type="time"
                value={checkInTime}
                onChange={e => setCheckInTime(e.target.value)}
                className="w-full bg-slate-800 border-none rounded-xl px-4 py-4 focus:ring-2 focus:ring-blue-500 outline-none text-xl font-bold text-center"
              />
              <p className="text-[10px] text-slate-500 mt-2 text-center uppercase font-bold italic">Seus KPIs serão consolidados neste horário.</p>
            </div>
          </div>

          <button 
            disabled={!name}
            onClick={() => setStep(2)}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 py-5 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 group"
          >
            Configurar Departamentos <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-8 animate-in slide-in-from-right duration-500">
          <div className="space-y-2 text-center">
            <p className="text-blue-400 font-bold uppercase tracking-widest text-xs">Fase 02: Estrutura</p>
            <h1 className="text-3xl font-black">Departamentos</h1>
            <p className="text-slate-400 text-sm">Selecione ou crie exatamente os 10 setores que você irá gerir.</p>
            <div className="flex justify-center gap-2 mt-2">
              <span className={`text-xs font-black py-1 px-3 rounded-full ${selectedDepts.length === 10 ? 'bg-emerald-500 text-white' : 'bg-blue-900/40 text-blue-300'}`}>
                {selectedDepts.length} / 10 SELECIONADOS
              </span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <input 
                value={customDeptInput}
                onChange={e => setCustomDeptInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && addCustomDept()}
                placeholder="Criar departamento personalizado..."
                className="flex-1 bg-slate-800 border-none rounded-xl px-4 py-3 focus:ring-1 focus:ring-blue-400 outline-none text-sm"
              />
              <button 
                onClick={addCustomDept}
                disabled={selectedDepts.length >= 10 || !customDeptInput.trim()}
                className="bg-blue-600 px-4 rounded-xl hover:bg-blue-500 transition-colors disabled:bg-slate-700 disabled:opacity-50"
              >
                Incluir
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-2 max-h-[45vh] overflow-y-auto pr-2 custom-scrollbar border-t border-slate-800 pt-4">
              {allAvailableDepts.map(dept => (
                <button
                  key={dept}
                  onClick={() => toggleDept(dept)}
                  className={`flex justify-between items-center p-4 rounded-xl transition-all border-2 ${
                    selectedDepts.includes(dept) 
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-[0_0_15px_-5px_rgba(59,130,246,0.5)]' 
                    : 'bg-slate-800 border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <span className="font-bold text-xs uppercase tracking-wider">{dept}</span>
                  {selectedDepts.includes(dept) && <Check size={16} className="text-blue-400" />}
                </button>
              ))}
            </div>
          </div>

          <button 
            disabled={selectedDepts.length !== 10}
            onClick={proceedToActions}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            Próximo: Banco de Ações <ArrowRight size={20} />
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6 animate-in slide-in-from-right duration-500">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-400">
              <ClipboardList size={20} />
              <p className="font-bold uppercase tracking-widest text-xs">Fase 03: Processos Operacionais ( {currentTopicIdx + 1} / 10 )</p>
            </div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">{topics[currentTopicIdx].name}</h1>
            <p className="text-slate-400 text-sm">Quais ações binárias (Feito/Não Feito) definem o sucesso deste setor?</p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <input 
                autoFocus
                value={newActionName}
                onChange={e => setNewActionName(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && addActionToCurrentTopic()}
                placeholder="Ex: Tomar 5g de Creatina"
                className="flex-1 bg-slate-800 border-none rounded-xl px-4 py-3 focus:ring-1 focus:ring-blue-400 outline-none text-sm"
              />
              <button 
                onClick={addActionToCurrentTopic}
                className="bg-blue-600 px-5 rounded-xl font-bold hover:bg-blue-500 transition-colors"
              >
                Incluir
              </button>
            </div>

            <div className="bg-slate-800/50 rounded-2xl p-4 min-h-[150px] max-h-[40vh] overflow-y-auto space-y-2 border border-slate-700 shadow-inner">
              {topics[currentTopicIdx].actions.length === 0 ? (
                <div className="h-32 flex flex-col items-center justify-center text-slate-500 gap-2">
                  <Plus className="opacity-20" size={40} />
                  <p className="text-xs font-bold uppercase tracking-widest">Nenhuma ação cadastrada</p>
                </div>
              ) : (
                topics[currentTopicIdx].actions.map(action => (
                  <div key={action.id} className="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-700 group animate-in zoom-in-95 duration-200">
                    <span className="text-sm font-medium">{action.name}</span>
                    <button onClick={() => removeActionFromCurrentTopic(action.id)} className="text-slate-500 hover:text-red-400 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <button 
            onClick={nextTopic}
            disabled={topics[currentTopicIdx].actions.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            {currentTopicIdx < topics.length - 1 ? 'Próximo Departamento' : 'Finalizar Estrutura'} <ArrowRight size={20} />
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-8 animate-in slide-in-from-right duration-500">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-400">
              <Target size={20} />
              <p className="font-bold uppercase tracking-widest text-xs">Fase 04: Visão de Longo Prazo</p>
            </div>
            <h1 className="text-3xl font-black">Meta Macro</h1>
            <p className="text-slate-400 text-sm">Defina o objetivo estratégico de cada setor para este ciclo.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
              {topics.map((topic, i) => (
                <div key={topic.id} className="space-y-2 bg-slate-800 p-4 rounded-xl border border-slate-700">
                  <label className="text-xs font-black text-blue-400 flex items-center gap-2 uppercase tracking-widest">
                    <Building2 size={14} /> {topic.name}
                  </label>
                  <textarea
                    placeholder="Qual a meta macro deste departamento?"
                    className="w-full bg-slate-900 border-none rounded-lg p-3 text-sm focus:ring-1 focus:ring-blue-500 outline-none h-20 resize-none"
                    onChange={e => updateTopicGoal(i, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={finish}
            className="w-full bg-emerald-600 hover:bg-emerald-700 py-4 rounded-xl font-black transition-all flex items-center justify-center gap-2 shadow-2xl"
          >
            Ativar Sistema de Gestão <ChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default Onboarding;

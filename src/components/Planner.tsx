import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Calendar, Book, Info, CheckCircle2, Brain, History, Download, Trash2 } from 'lucide-react';
import { generateStudyPlan } from '../ai';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../AuthContext';
import { StudyPlan } from '../types';
import TestModal from './TestModal';
import { AlertCircle } from 'lucide-react';

interface PlanDay {
  day: number;
  focus: string;
  tasks: string[];
  tip: string;
}

export default function Planner() {
  const { user, profile } = useAuth();
  const [subjects, setSubjects] = useState('');
  const [days, setDays] = useState('10');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<PlanDay[] | null>(null);
  const [history, setHistory] = useState<StudyPlan[]>([]);
  const [view, setView] = useState<'generate' | 'history'>('generate');
  const [activeTestTopic, setActiveTestTopic] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'studyPlans'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudyPlan)));
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'studyPlans');
    });

    return unsub;
  }, [user]);

  const handleGenerate = async () => {
    if (!navigator.onLine) {
      setError("Strategic Algorithm unreachable. You are currently in Offline Mode. Please re-establish connection to generate new blueprints.");
      return;
    }
    if (!user || !subjects || !days) return;
    setLoading(true);
    setError(null);
    try {
      const result = await generateStudyPlan(subjects, parseInt(days), profile?.standard || '12', profile?.stream);
      const parsedPlan = JSON.parse(result) as PlanDay[];
      setPlan(parsedPlan);
      
      // Save to Firebase
      try {
        await addDoc(collection(db, 'studyPlans'), {
          uid: user.uid,
          subjects,
          days: parseInt(days),
          plan: `Plan for ${subjects} over ${days} days`,
          fullPlan: JSON.stringify(parsedPlan),
          createdAt: serverTimestamp()
        });
      } catch (err) {
        console.error("Failed to save plan:", err);
        handleFirestoreError(err, OperationType.CREATE, 'studyPlans');
      }
    } catch (err: any) {
      console.error("AI Generation Error:", err);
      setError("Synchronous intelligence failure. The AI model could not process your request at this time. Please refine your input or retry.");
    } finally {
      setLoading(false);
    }
  };

  const deletePlan = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'studyPlans', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `studyPlans/${id}`);
    }
  };

  const selectPlanFromHistory = (planData: StudyPlan) => {
    try {
      setPlan(JSON.parse(planData.fullPlan));
      setView('generate');
    } catch (e) {
      console.error("Failed to parse history plan:", e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24">
      {/* View Switcher */}
      <div className="flex justify-center">
        <div className="bg-bg-card p-1.5 rounded-2xl border border-border-dim inline-flex gap-2">
          <button 
            onClick={() => setView('generate')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'generate' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-text-muted hover:text-white'}`}
          >
            Tactical Generator
          </button>
          <button 
            onClick={() => setView('history')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'history' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-text-muted hover:text-white'}`}
          >
            Archive Logs {history.length > 0 && `(${history.length})`}
          </button>
        </div>
      </div>

      {view === 'generate' ? (
        <>
          {/* Header */}
          <section className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 border border-accent/40 text-accent rounded-full text-[10px] font-black uppercase tracking-[0.3em]">
              <Sparkles size={14} />
              Strategic Algorithm
            </div>
            <h2 className="text-5xl lg:text-7xl font-black tracking-tight text-text-primary leading-none uppercase italic">AI Planner</h2>
            <p className="text-text-secondary max-w-lg mx-auto leading-relaxed font-medium">Auto-generate a high-density board exam roadmap in seconds.</p>
          </section>

          {/* Input Section */}
          <section className="bg-bg-card p-10 rounded-[40px] border border-border-dim shadow-2xl flex flex-col md:flex-row gap-8 items-end relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[100px] pointer-events-none" />
            <div className="flex-1 space-y-4 w-full relative z-10">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Syllabus (Math, Physics, Bio)</label>
              <input 
                value={subjects}
                onChange={(e) => setSubjects(e.target.value)}
                placeholder="Comma separated subjects..."
                className="w-full bg-bg-surface border border-border-dim focus:border-accent focus:ring-4 focus:ring-accent/10 rounded-2xl px-6 py-5 outline-none text-text-primary font-bold transition-all placeholder:text-text-muted"
              />
            </div>
            <div className="w-full md:w-32 space-y-4 relative z-10">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Exam Window</label>
              <input 
                type="number"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="w-full bg-bg-surface border border-border-dim focus:border-accent focus:ring-4 focus:ring-accent/10 rounded-2xl px-6 py-5 outline-none text-text-primary font-bold transition-all text-center"
              />
            </div>
            <button 
              onClick={handleGenerate}
              disabled={loading || !subjects}
              className="w-full md:w-auto px-10 py-5 bg-accent text-white rounded-2xl font-black tracking-tight shadow-xl shadow-accent/30 transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3 whitespace-nowrap relative z-10"
            >
              {loading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>Deploy Plan <Sparkles size={20} /></>
              )}
            </button>
          </section>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center gap-4 text-red-500"
              >
                <AlertCircle size={24} />
                <p className="text-sm font-bold tracking-tight">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Section */}
          <AnimatePresence>
            {plan && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-4 px-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
                    <CheckCircle2 size={24} />
                  </div>
                  <h4 className="font-extrabold text-xl text-text-primary tracking-tight">Timeline Generated</h4>
                </div>
                
                <div className="grid gap-8">
                  {plan.map((day, i) => (
                    <motion.div
                      key={day.day}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-bg-card p-10 rounded-[40px] border border-border-dim elegant-card-shadow flex flex-col md:flex-row gap-10 group relative transition-colors hover:bg-bg-card/80"
                    >
                      <div className="md:w-40 flex flex-col items-center justify-center md:border-r border-border-dim md:pr-10">
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] mb-3">Day</p>
                        <p className="text-7xl font-black text-accent group-hover:scale-110 transition-transform font-mono italic">{day.day.toString().padStart(2, '0')}</p>
                      </div>
                      
                      <div className="flex-1 space-y-8">
                        <div>
                          <h5 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                            <Book size={16} className="text-accent" /> Priority Module
                          </h5>
                          <div className="flex items-center justify-between gap-4">
                            <p className="text-3xl font-black text-text-primary leading-tight tracking-tight italic uppercase">{day.focus}</p>
                            <button 
                              onClick={() => setActiveTestTopic(day.focus)}
                              className="px-6 py-2.5 bg-accent/10 border border-accent/30 text-accent rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-accent hover:text-white transition-all whitespace-nowrap"
                            >
                              Run Test
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid sm:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <h6 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] decoration-accent underline underline-offset-4 decoration-2">Breakdown</h6>
                            {day.tasks.map((task, idx) => (
                              <div key={idx} className="flex items-center gap-4 text-sm font-bold text-text-secondary">
                                <div className="w-2 h-2 rounded bg-accent shadow-sm shadow-accent/50" />
                                {task}
                              </div>
                            ))}
                          </div>
                          <div className="p-6 bg-bg-surface rounded-2xl space-y-3 border border-border-dim relative overflow-hidden group/tip">
                            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover/tip:opacity-10 transition-opacity">
                              <Info size={48} />
                            </div>
                            <h6 className="text-[10px] font-black text-accent uppercase tracking-[0.3em] flex items-center gap-3">
                              <Info size={14} /> Intelligence
                            </h6>
                            <p className="text-xs text-text-secondary leading-relaxed font-medium italic">"{day.tip}"</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!plan && !loading && (
            <div className="py-24 flex flex-col items-center gap-6 opacity-30 grayscale pointer-events-none">
              <Calendar size={120} />
              <p className="font-bold text-gray-400 uppercase tracking-[0.3em]">Select your subjects above</p>
            </div>
          )}
        </>
      ) : (
        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between px-4">
             <h3 className="text-xl font-black text-text-primary uppercase tracking-tight italic">Archived Blueprints</h3>
             <p className="text-[10px] font-black text-text-muted uppercase tracking-widest italic flex items-center gap-2">
               <Download size={14} /> Offline Access Enabled
             </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {history.map((h) => (
              <div 
                key={h.id}
                className="bg-bg-card p-6 rounded-[32px] border border-border-dim elegant-card-shadow group relative hover:border-accent transition-all cursor-pointer"
                onClick={() => selectPlanFromHistory(h)}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center">
                    <History size={24} />
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePlan(h.id!);
                    }}
                    className="p-2 text-text-muted hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <h4 className="text-xl font-black text-text-primary tracking-tight mb-2 uppercase break-words">{h.subjects}</h4>
                <div className="flex items-center gap-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                   <span>{h.days} Day Roadmap</span>
                   <span className="w-1.5 h-1.5 rounded-full bg-border-dim" />
                   <span>{h.createdAt?.toDate().toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            
            {history.length === 0 && (
              <div className="md:col-span-2 py-24 text-center border-2 border-dashed border-border-dim rounded-[40px] space-y-4">
                 <div className="w-20 h-20 bg-bg-card rounded-[32px] flex items-center justify-center mx-auto text-text-muted opacity-20">
                    <History size={40} />
                 </div>
                 <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em]">Archive Empty</p>
              </div>
            )}
          </div>
        </section>
      )}

      {activeTestTopic && (
        <TestModal 
          topic={activeTestTopic} 
          onClose={() => setActiveTestTopic(null)} 
        />
      )}
    </div>
  );
}

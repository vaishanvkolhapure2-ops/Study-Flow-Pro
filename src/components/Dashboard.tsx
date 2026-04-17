import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../AuthContext';
import { Task, StudyPlan, View } from '../types';
import { motion } from 'motion/react';
import AIInsights from './AIInsights';
import { 
  Trophy, 
  Flame, 
  Target, 
  Clock, 
  ChevronRight,
  TrendingUp,
  BookOpen,
  Calendar,
  Brain,
  Sparkles,
  Video as VideoIcon
} from 'lucide-react';

export default function Dashboard({ setCurrentView }: { setCurrentView: (view: View) => void }) {
  const { user, profile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [latestPlan, setLatestPlan] = useState<StudyPlan | null>(null);

  useEffect(() => {
    if (!user) return;

    // Fetch incomplete tasks
    const tasksQuery = query(
      collection(db, 'tasks'),
      where('uid', '==', user.uid),
      where('completed', '==', false),
      orderBy('createdAt', 'desc'),
      limit(3)
    );

    const unsubTasks = onSnapshot(tasksQuery, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task)));
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'tasks');
    });

    // Fetch latest study plan
    const planQuery = query(
      collection(db, 'studyPlans'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubPlan = onSnapshot(planQuery, (snapshot) => {
      if (!snapshot.empty) {
        setLatestPlan({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as StudyPlan);
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'studyPlans');
    });

    return () => {
      unsubTasks();
      unsubPlan();
    };
  }, [user]);

  const cards = [
    { title: 'Current Streak', value: `${profile?.streak || 0} Days`, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    { title: 'Goal Today', value: profile?.goalToday || 'Set Target', icon: Target, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { title: 'Time Studied', value: `${profile?.studyHours || 0} hrs`, icon: Clock, color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/20' },
    { title: 'XP Gained', value: (profile?.points || 0).toLocaleString(), icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  ];

  return (
    <div className="space-y-12">
      {/* Welcome Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl lg:text-5xl font-black tracking-tight mb-2 text-text-primary">
            Hey, {profile?.displayName?.split(' ')[0] || 'Student'} 👋
          </h2>
          <p className="text-text-secondary font-medium tracking-wide italic">Make today count. Your growth starts now.</p>
          <div className="inline-block px-3 py-1 bg-accent/10 border border-accent rounded-full text-[10px] font-bold text-accent uppercase tracking-widest mt-4">
             Class {profile?.standard || '12'} {profile?.stream ? `• ${profile.stream}` : ''}
          </div>
        </div>
        <div className="flex gap-3">
          <div className="px-5 py-2.5 bg-bg-card rounded-2xl border border-border-dim shadow-xl flex items-center gap-3">
            <Trophy size={18} className="text-yellow-500" />
            <div className="leading-tight">
               <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Rank</p>
               <p className="font-black text-sm">#12</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-6 bg-bg-card rounded-[24px] border ${card.border} elegant-card-shadow flex flex-col justify-between group hover:scale-[1.02] transition-transform`}
          >
            <div className={`w-12 h-12 ${card.bg} ${card.color} rounded-2xl flex items-center justify-center mb-4 border ${card.border}`}>
              <card.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">{card.title}</p>
              <p className="text-2xl font-black tracking-tight text-text-primary">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </section>

      <div className="grid md:grid-cols-5 gap-8">
        {/* Main Content Area */}
        <div className="md:col-span-3 space-y-8">
          {/* Active Study Plan */}
          <section className="bg-bg-card text-white p-10 rounded-[40px] relative overflow-hidden group border border-border-dim elegant-card-shadow">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Calendar size={180} />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 border border-accent/40 text-accent text-[10px] font-bold uppercase tracking-[0.2em]">
                Current Blueprint
              </div>
              {latestPlan ? (
                <>
                  <h3 className="text-3xl font-black leading-tight tracking-tight uppercase italic underline decoration-accent underline-offset-8">
                    Course: {latestPlan.subjects.split(',')[0]}
                  </h3>
                  <div className="flex items-center gap-8">
                    <div>
                      <p className="text-[10px] text-text-muted font-bold uppercase tracking-[0.2em] mb-2">Time Left</p>
                      <p className="text-2xl font-black text-text-primary">{latestPlan.days} Days</p>
                    </div>
                    <div className="h-10 w-px bg-border-dim" />
                    <div>
                      <p className="text-[10px] text-text-muted font-bold uppercase tracking-[0.2em] mb-2">Milestones</p>
                      <p className="text-2xl font-black text-emerald-400">Phase 1 Clear</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setCurrentView('planner')}
                    className="w-full py-4 bg-accent text-white rounded-2xl font-black tracking-tight transition-all hover:bg-accent/90 hover:shadow-xl hover:shadow-accent/20 flex items-center justify-center gap-3 group uppercase text-xs"
                  >
                    Review Schedule <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-3xl font-black leading-tight tracking-tight uppercase italic">Zero Roadmap Active</h3>
                  <p className="text-text-secondary font-medium leading-relaxed italic">"A goal without a plan is just a wish." — Unlock your potential with AI.</p>
                  <button 
                    onClick={() => setCurrentView('planner')}
                    className="w-full py-4 bg-accent text-white rounded-2xl font-black tracking-tight transition-all hover:bg-accent/90 flex items-center justify-center gap-3 uppercase text-xs"
                  >
                    Build Study Strategy <Sparkles size={20} />
                  </button>
                </>
              )}
            </div>
          </section>

          {/* AI Tutor Call to Action */}
          <section className="bg-bg-surface p-8 rounded-[32px] border border-border-dim elegant-card-shadow flex flex-col sm:flex-row gap-6 items-center">
            <div className="p-5 bg-accent/20 border border-accent/40 rounded-2xl text-accent">
              <BookOpen size={36} />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h4 className="font-black text-xl text-text-primary tracking-tight">Got a Doubt?</h4>
              <p className="text-text-secondary text-sm font-medium">Explain concepts deep-dive with your AI Tutor.</p>
            </div>
            <button 
              onClick={() => setCurrentView('tutor')}
              className="w-full sm:w-auto px-8 py-4 bg-white text-bg-deep rounded-2xl font-black text-sm transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/10"
            >
              Ask Tutor
            </button>
          </section>

          {/* Curriculum/Lessons Call to Action */}
          <section className="bg-bg-card p-8 rounded-[32px] border border-border-dim elegant-card-shadow flex flex-col sm:flex-row gap-6 items-center group cursor-pointer hover:border-accent transition-all" onClick={() => setCurrentView('lessons')}>
            <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
              <BookOpen size={36} />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h4 className="font-black text-xl text-text-primary tracking-tight uppercase italic underline decoration-emerald-500 underline-offset-4">Your Curriculum</h4>
              <p className="text-text-secondary text-sm font-medium">Class {profile?.standard} {profile?.standard === '12' ? `(${profile?.stream})` : ''} - Access all subjects.</p>
            </div>
            <button 
              className="w-full sm:w-auto px-6 py-3 bg-white text-bg-deep rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg"
            >
              Open Lessons
            </button>
          </section>

          {/* Video Generation Call to Action */}
          <section className="bg-gradient-to-br from-bg-card to-bg-surface p-8 rounded-[32px] border border-border-dim group cursor-pointer hover:border-accent transition-all overflow-hidden relative" onClick={() => setCurrentView('video')}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl pointer-events-none" />
            <div className="flex flex-col sm:flex-row gap-6 items-center relative z-10">
              <div className="p-5 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all">
                <VideoIcon size={36} />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h4 className="font-black text-xl text-text-primary tracking-tight uppercase italic">Visual Learning</h4>
                <p className="text-text-secondary text-sm font-medium">Synthesize high-definition study videos from your notes.</p>
              </div>
              <button 
                className="w-full sm:w-auto px-6 py-3 bg-accent/10 text-accent rounded-xl font-black text-[10px] uppercase tracking-widest border border-accent/20"
              >
                Synthesize Now
              </button>
            </div>
          </section>
        </div>

        {/* Sidebar Area */}
        <div className="md:col-span-2 space-y-6">
          <AIInsights tasks={tasks} plan={latestPlan?.subjects || ''} />
          
          <div className="bg-bg-card rounded-[32px] p-8 border border-border-dim elegant-card-shadow space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm uppercase tracking-[0.2em] text-text-secondary decoration-accent underline-offset-8 underline decoration-2">Syllabus Targets</h4>
              <button onClick={() => setCurrentView('tasks')} className="text-accent text-xs font-black uppercase hover:opacity-80">Manage</button>
            </div>
            <div className="space-y-1">
              {tasks.length > 0 ? tasks.map((task) => (
                <div key={task.id} className="group flex items-center gap-4 py-4 border-b border-border-dim last:border-0 hover:translate-x-1 transition-transform cursor-pointer">
                  <div className="w-5 h-5 rounded-md border-2 border-accent shrink-0" />
                  <span className="text-sm font-bold text-text-primary tracking-tight truncate">{task.text}</span>
                  <span className="ml-auto text-[9px] font-black bg-bg-surface px-2 py-1 rounded border border-border-dim text-text-muted">CORE</span>
                </div>
              )) : (
                <div className="py-12 text-center bg-bg-surface/50 rounded-2xl border border-dashed border-border-dim">
                  <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em]">Zero Targets Set</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-bg-card rounded-[32px] p-8 border border-border-dim elegant-card-shadow space-y-4 group">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all">
                  <Brain size={24} />
                </div>
                <div>
                   <p className="font-black text-sm tracking-tight uppercase">Knowledge Test</p>
                   <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Validate Learning</p>
                </div>
             </div>
             <button 
               onClick={() => setCurrentView('planner')}
               className="w-full py-3 bg-bg-surface border border-border-dim rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-accent hover:text-accent transition-all"
             >
               Start Assessment
             </button>
          </div>

          <div className="bg-bg-card rounded-[32px] p-8 border border-border-dim elegant-card-shadow space-y-5">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center">
                   <Flame size={24} />
                </div>
                <div>
                   <p className="font-black text-sm tracking-tight">Study Streak</p>
                   <p className="text-xs text-text-secondary font-medium tracking-wide">{profile?.streak || 0} Days Active🔥</p>
                </div>
             </div>
             <div className="flex gap-1.5 h-2">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className={`flex-1 rounded-full ${i < (profile?.streak || 0) % 10 ? 'bg-orange-500 shadow-sm shadow-orange-500/50' : 'bg-bg-surface border border-border-dim'}`} />
                ))}
             </div>
             <p className="text-[9px] text-text-muted font-bold uppercase text-center tracking-[0.3em]">Week Roadmap</p>
          </div>
        </div>
      </div>
    </div>
  );
}

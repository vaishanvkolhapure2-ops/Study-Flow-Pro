import { motion } from 'motion/react';
import { 
  BookOpen, 
  Calculator, 
  Atom, 
  Globe, 
  Languages, 
  Briefcase, 
  LineChart, 
  History, 
  Scale, 
  Map, 
  Users,
  FlaskConical,
  ChevronRight,
  Sparkles,
  Search,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { View } from '../types';

interface Subject {
  id: string;
  name: string;
  icon: any;
  color: string;
  description: string;
}

const subjectsByStandard: Record<string, Record<string, Subject[]>> = {
  '10': {
    'All': [
      { id: 'maths', name: 'Mathematics', icon: Calculator, color: 'text-blue-400', description: 'Algebra, Geometry, Trigonometry, and Arithmetic.' },
      { id: 'science', name: 'Science', icon: Atom, color: 'text-emerald-400', description: 'Physics, Chemistry, and Biology fundamentals.' },
      { id: 'social', name: 'Social Science', icon: Globe, color: 'text-orange-400', description: 'History, Geography, Political Science, and Economics.' },
      { id: 'english', name: 'English', icon: Languages, color: 'text-purple-400', description: 'Literature, Grammar, and Composition.' },
      { id: 'hindi', name: 'Hindi', icon: BookOpen, color: 'text-red-400', description: 'Vyakaran and Sahitya.' },
    ]
  },
  '12': {
    'Science': [
      { id: 'physics', name: 'Physics', icon: Atom, color: 'text-blue-400', description: 'Mechanics, Optics, and Modern Physics.' },
      { id: 'chemistry', name: 'Chemistry', icon: FlaskConical, color: 'text-emerald-400', description: 'Organic, Inorganic, and Physical Chemistry.' },
      { id: 'maths', name: 'Mathematics', icon: Calculator, color: 'text-indigo-400', description: 'Calculus, Vectors, and 3D Geometry.' },
      { id: 'biology', name: 'Biology', icon: Users, color: 'text-pink-400', description: 'Botany and Zoology advanced studies.' },
      { id: 'english', name: 'English', icon: Languages, color: 'text-purple-400', description: 'Advanced Core Literature and Writing.' },
    ],
    'Commerce': [
      { id: 'accountancy', name: 'Accountancy', icon: Briefcase, color: 'text-emerald-400', description: 'Financial Accounting and Partnership accounts.' },
      { id: 'economics', name: 'Economics', icon: LineChart, color: 'text-blue-400', description: 'Micro and Macro Economics analysis.' },
      { id: 'business', name: 'Business Studies', icon:Globe, color: 'text-orange-400', description: 'Management principles and Marketing.' },
      { id: 'maths', name: 'Applied Math', icon: Calculator, color: 'text-indigo-400', description: 'Statistical tools and Financial math.' },
      { id: 'english', name: 'English', icon: Languages, color: 'text-purple-400', description: 'Business Communication and Core English.' },
    ],
    'Arts': [
      { id: 'history', name: 'History', icon: History, color: 'text-orange-400', description: 'World History and Indian Chronicles.' },
      { id: 'polscience', name: 'Political Science', icon: Scale, color: 'text-blue-400', description: 'Global Politics and Constitutional studies.' },
      { id: 'geography', name: 'Geography', icon: Map, color: 'text-emerald-400', description: 'Physical and Human geographic patterns.' },
      { id: 'sociology', name: 'Sociology', icon: Users, color: 'text-pink-400', description: 'Social structures and cultural dynamics.' },
      { id: 'english', name: 'English', icon: Languages, color: 'text-purple-400', description: 'Creative Writing and World Literature.' },
    ]
  }
};

export default function Lessons({ 
  setCurrentView,
  setSelectedSubject 
}: { 
  setCurrentView: (view: View) => void,
  setSelectedSubject: (subject: string) => void
}) {
  const { profile } = useAuth();
  
  const standard = profile?.standard || '10';
  const stream = standard === '12' ? (profile?.stream || 'Science') : 'All';
  const subjects = subjectsByStandard[standard]?.[stream] || [];

  return (
    <div className="space-y-12 pb-24">
      {/* Header */}
      <section className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 border border-accent/40 text-accent rounded-full text-[10px] font-black uppercase tracking-[0.3em]">
          <BookOpen size={14} />
          Academic Curriculum
        </div>
        <h2 className="text-5xl lg:text-7xl font-black tracking-tight text-text-primary leading-none uppercase italic">
          Class <span className="text-accent">{standard}</span> Lessons
        </h2>
        <div className="flex items-center justify-center gap-4">
          <p className="text-text-secondary font-medium tracking-wide uppercase italic italic">
            Stream: <span className="text-text-primary underline decoration-accent">{stream}</span>
          </p>
        </div>
      </section>

      {/* Main Subjects Grid */}
      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject, i) => (
          <motion.div
            key={subject.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group relative bg-bg-card border border-border-dim rounded-[32px] p-8 elegant-card-shadow transition-all hover:border-accent hover:shadow-2xl hover:shadow-accent/10 flex flex-col gap-6"
          >
            <div className={`w-14 h-14 rounded-2xl bg-bg-surface border border-border-dim flex items-center justify-center ${subject.color} group-hover:scale-110 group-hover:bg-accent group-hover:text-white group-hover:border-accent transition-all shadow-xl`}>
              <subject.icon size={28} />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-text-primary uppercase italic tracking-tight">{subject.name}</h3>
              <p className="text-text-secondary text-sm font-medium leading-relaxed">{subject.description}</p>
            </div>

            <div className="mt-auto pt-6 border-t border-border-dim/50 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setCurrentView('tutor')}
                  className="flex items-center gap-2 text-accent text-[10px] font-black uppercase tracking-widest hover:underline"
                >
                  Deep Learn <ChevronRight size={14} />
                </button>
                <button 
                  onClick={() => {
                    setSelectedSubject(subject.name);
                    setCurrentView('revision');
                  }}
                  className="flex items-center gap-2 text-text-muted text-[10px] font-black uppercase tracking-widest hover:text-accent transition-colors"
                >
                  Recall Mode <History size={14} />
                </button>
              </div>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`https://www.google.com/search?q=class+${standard}+${subject.name}+syllabus+chapters+notes+2025+2026`, '_blank');
                }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-bg-surface border border-border-dim rounded-xl text-[10px] font-black text-text-muted hover:text-accent hover:border-accent transition-all uppercase tracking-widest"
              >
                <Globe size={14} /> Research <ExternalLink size={12} />
              </button>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Discover More Call to Action */}
      <section className="bg-bg-card p-10 rounded-[40px] border border-border-dim elegant-card-shadow relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[100px] pointer-events-none" />
        <div className="p-6 bg-accent/10 border border-accent/20 rounded-3xl text-accent">
          <Search size={40} />
        </div>
        <div className="flex-1 text-center md:text-left space-y-2">
          <h4 className="text-2xl font-black text-text-primary uppercase italic tracking-tight">Need specific topics?</h4>
          <p className="text-text-secondary font-medium tracking-tight">Ask our AI Tutor for custom chapters beyond the standard syllabus.</p>
        </div>
        <button 
          onClick={() => setCurrentView('tutor')}
          className="px-8 py-4 bg-accent text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-accent/20 hover:scale-105 active:scale-95 transition-all"
        >
          Open AI Tutor
        </button>
      </section>
    </div>
  );
}

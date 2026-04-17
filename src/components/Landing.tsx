import { useAuth } from '../AuthContext';
import { motion } from 'motion/react';
import { GraduationCap, ArrowRight, ShieldCheck, Zap, Sparkles, MessageSquare, CheckSquare } from 'lucide-react';

export default function Landing() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-bg-deep text-text-primary font-sans overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-accent/10 to-transparent pointer-events-none" />
      
      {/* Header */}
      <nav className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-accent rounded-2xl text-white shadow-xl shadow-accent/20">
            <GraduationCap size={28} />
          </div>
          <span className="font-black text-2xl tracking-tighter uppercase italic">StudyFlow <span className="text-accent underline decoration-2 underline-offset-4">AI</span></span>
        </div>
        <button 
          onClick={login}
          className="px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-white/5 border border-border-dim bg-bg-card/50 backdrop-blur-md text-text-primary"
        >
          Access Portal
        </button>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-32 flex flex-col lg:flex-row items-center gap-16 relative z-10">
        <div className="flex-1 space-y-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/30 text-accent text-[10px] font-black uppercase tracking-[0.4em]"
          >
            <Sparkles size={16} />
            Quantized Learning Protocol
          </motion.div>
          <h1 className="text-7xl lg:text-9xl font-black leading-[0.85] tracking-tighter text-text-primary uppercase italic">
            Elite Study<br />
            <span className="text-accent underline underline-offset-[20px] decoration-8">Symmetry.</span>
          </h1>
          <p className="text-lg text-text-secondary max-w-xl leading-relaxed font-medium">
            Next-gen AI tutor. Automated board-exam blueprints. High-intensity timers. Designed for the Class 10-12 academic elite.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
            <button 
              onClick={login}
              className="w-full sm:w-auto px-10 py-5 bg-white text-bg-deep rounded-[24px] font-black uppercase tracking-widest text-xs shadow-2xl shadow-white/10 hover:scale-105 transition-all flex items-center justify-center gap-3 group"
            >
              Initialize Study Session
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <img 
                    key={i}
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}extra`}
                    className="w-12 h-12 rounded-2xl border-2 border-bg-deep bg-bg-card shadow-xl"
                    alt="User"
                  />
                ))}
              </div>
              <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em]">10k+ Units Active</p>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full max-w-2xl relative group">
          <div className="absolute -inset-10 bg-accent/20 rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity" />
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-bg-card rounded-[48px] p-10 shadow-full border border-border-dim relative z-10 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent" />
            <div className="flex items-center gap-5 mb-10 pb-8 border-b border-border-dim">
              <div className="w-16 h-16 rounded-[24px] bg-accent shadow-2xl shadow-accent/40 flex items-center justify-center text-white">
                <MessageSquare size={32} />
              </div>
              <div>
                <h3 className="font-black text-xl tracking-tight uppercase italic">Tutor Instance 01</h3>
                <p className="text-[10px] text-accent font-black uppercase tracking-[0.4em]">Optimized for CBSE/ICSE</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-2xl bg-bg-surface border border-border-dim shrink-0 shadow-lg" />
                <div className="bg-bg-surface border border-border-dim p-4 rounded-3xl rounded-tl-none max-w-[85%] text-sm font-medium text-text-secondary leading-relaxed">
                  "How do I balance redox reactions using the ion-electron method for my chemistry board exam?"
                </div>
              </div>
              <div className="flex gap-4 justify-end">
                <div className="bg-accent text-white p-4 rounded-3xl rounded-tr-none max-w-[85%] text-sm font-bold shadow-2xl shadow-accent/20 leading-relaxed italic">
                  "First, split the reaction into half-reactions. Then balance atoms, then oxygen (using H2O), then hydrogen..."
                </div>
                <div className="w-10 h-10 rounded-2xl bg-accent shrink-0 shadow-lg" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-bg-surface border-t border-border-dim py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-16">
          <div className="space-y-6 group">
            <div className="w-16 h-16 bg-bg-card border border-border-dim rounded-[24px] flex items-center justify-center shadow-xl group-hover:border-accent transition-colors text-accent">
              <Zap size={32} />
            </div>
            <h3 className="font-black text-2xl uppercase italic">Neural Speed</h3>
            <p className="text-text-secondary text-sm leading-relaxed font-medium">Ultra-low latency inference for instant syllabus resolution. Get deep answers in milliseconds.</p>
          </div>
          <div className="space-y-6 group">
            <div className="w-16 h-16 bg-bg-card border border-border-dim rounded-[24px] flex items-center justify-center shadow-xl group-hover:border-accent transition-colors text-accent">
              <ShieldCheck size={32} />
            </div>
            <h3 className="font-black text-2xl uppercase italic">Protocol Secure</h3>
            <p className="text-text-secondary text-sm leading-relaxed font-medium">Grade-A encryption for your personal study data and progress metrics. Your focus is isolated.</p>
          </div>
          <div className="space-y-6 group">
            <div className="w-16 h-16 bg-bg-card border border-border-dim rounded-[24px] flex items-center justify-center shadow-xl group-hover:border-accent transition-colors text-accent">
              <CheckSquare size={32} />
            </div>
            <h3 className="font-black text-2xl uppercase italic">Flow State</h3>
            <p className="text-text-secondary text-sm leading-relaxed font-medium">Integrated Pomodoro protocols and task matrices to keep your momentum at a constant velocity.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

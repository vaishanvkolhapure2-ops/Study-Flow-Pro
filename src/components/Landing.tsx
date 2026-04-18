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

      {/* Hero / Login Section */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-32 flex flex-col lg:flex-row items-center gap-16 relative z-10">
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
            Focus.<br />
            Level Up.<br />
            <span className="text-accent underline underline-offset-[20px] decoration-8">Conquer.</span>
          </h1>
          <p className="text-lg text-text-secondary max-w-xl leading-relaxed font-medium">
            Next-gen AI tutor. Automated board-exam blueprints. High-intensity timers. Join the academic elite today.
          </p>
        </div>

        <div className="flex-1 w-full max-w-md relative group">
          <div className="absolute -inset-10 bg-accent/20 rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity" />
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-bg-card rounded-[48px] p-12 shadow-2xl border border-border-dim relative z-10 overflow-hidden flex flex-col items-center text-center space-y-10"
          >
            <div className="p-5 bg-accent/10 border border-accent/20 rounded-3xl text-accent">
               <ShieldCheck size={48} />
            </div>
            
            <div className="space-y-3">
              <h2 className="text-3xl font-black tracking-tight text-text-primary uppercase italic">System Authentication</h2>
              <p className="text-xs text-text-muted font-bold uppercase tracking-widest leading-relaxed">Identity verification required to establish neural study link</p>
            </div>

            <div className="w-full space-y-4">
              <button 
                onClick={login}
                className="w-full py-5 bg-white text-bg-deep rounded-[24px] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-white/10 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 group"
              >
                <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="G" />
                Initialize with Google
              </button>
              
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-border-dim opacity-40"></div>
                <span className="flex-shrink mx-4 text-[9px] font-black text-text-muted uppercase tracking-[0.4em]">Secure Protocol</span>
                <div className="flex-grow border-t border-border-dim opacity-40"></div>
              </div>

              <div className="flex items-center justify-center gap-4 pt-2">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <img 
                      key={i}
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}extra`}
                      className="w-8 h-8 rounded-xl border-2 border-bg-card bg-bg-surface shadow-xl"
                      alt="User"
                    />
                  ))}
                </div>
                <p className="text-[9px] text-text-muted font-black uppercase tracking-[0.2em]">10k+ Units Active</p>
              </div>
            </div>

            <div className="pt-6 border-t border-border-dim w-full flex items-center justify-center gap-2">
               <Zap size={14} className="text-accent" />
               <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">End-to-End Encryption Active</p>
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

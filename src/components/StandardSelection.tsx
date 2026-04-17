import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GraduationCap, ArrowRight, ShieldCheck, Zap, BookOpen, Calculator, Paintbrush, ChevronLeft, Brain } from 'lucide-react';
import { useAuth } from '../AuthContext';

export default function StandardSelection() {
  const { updateProfile, profile } = useAuth();
  const [step, setStep] = useState<'standard' | 'stream'>('standard');
  const [selectedStandard, setSelectedStandard] = useState<'10' | '12' | null>(null);

  const handleStandardSelect = async (std: '10' | '12') => {
    if (std === '10') {
      try {
        await updateProfile({ standard: '10' });
      } catch (error) {
        console.error('Failed to update standard:', error);
        // ErrorBoundaries or global toast would catch this via updateProfile's use of handleFirestoreError
      }
    } else {
      setSelectedStandard('12');
      setStep('stream');
    }
  };

  const handleStreamSelect = async (stream: 'Science' | 'Commerce' | 'Arts') => {
    try {
      await updateProfile({ standard: '12', stream });
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  return (
    <div className="min-h-screen bg-bg-deep flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-accent/10 to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <AnimatePresence mode="wait">
        {step === 'standard' ? (
          <motion.div 
            key="standard-step"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="max-w-4xl w-full space-y-12 relative z-10"
          >
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/30 text-accent rounded-full text-[10px] font-black uppercase tracking-[0.4em]">
                <Zap size={16} />
                Network Initialization
              </div>
              <h2 className="text-5xl lg:text-7xl font-black text-text-primary tracking-tight uppercase italic italic">
                Select <span className="text-accent underline underline-offset-8 decoration-4">Standard</span>
              </h2>
              <p className="text-text-secondary max-w-xl mx-auto font-medium tracking-wide">
                Welcome, {profile?.displayName?.split(' ')[0]}. Define your academic baseline.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleStandardSelect('10')}
                className="group relative h-80 bg-bg-card border border-border-dim rounded-[48px] p-10 flex flex-col justify-between text-left overflow-hidden transition-all hover:border-accent hover:shadow-2xl hover:shadow-accent/20"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <GraduationCap size={150} />
                </div>
                <div className="space-y-4 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-bg-surface border border-border-dim flex items-center justify-center text-text-muted transition-colors group-hover:border-accent group-hover:text-accent font-black text-3xl">10</div>
                  <h3 className="text-4xl font-black text-text-primary uppercase italic">Class 10</h3>
                  <p className="text-text-secondary font-medium leading-relaxed">Foundation board preparation. Simplified core concept focus.</p>
                </div>
                <div className="flex items-center gap-2 text-accent font-black text-[10px] uppercase tracking-[0.2em] relative z-10">
                   Activate Session <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleStandardSelect('12')}
                className="group relative h-80 bg-bg-card border border-border-dim rounded-[48px] p-10 flex flex-col justify-between text-left overflow-hidden transition-all hover:border-accent hover:shadow-2xl hover:shadow-accent/20"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <GraduationCap size={150} />
                </div>
                <div className="space-y-4 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-bg-surface border border-border-dim flex items-center justify-center text-text-muted transition-colors group-hover:border-accent group-hover:text-accent font-black text-3xl">12</div>
                  <h3 className="text-4xl font-black text-text-primary uppercase italic">Class 12</h3>
                  <p className="text-text-secondary font-medium leading-relaxed">High-stake academic tracks. Strategic advanced syllabus modules.</p>
                </div>
                <div className="flex items-center gap-2 text-accent font-black text-[10px] uppercase tracking-[0.2em] relative z-10">
                   Configure Streams <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="stream-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-6xl w-full space-y-12 relative z-10"
          >
            <button 
              onClick={() => setStep('standard')}
              className="absolute -top-16 left-0 flex items-center gap-2 text-text-muted hover:text-white transition-colors uppercase text-[10px] font-black tracking-widest"
            >
              <ChevronLeft size={16} /> Back to Standard
            </button>

            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/30 text-accent rounded-full text-[10px] font-black uppercase tracking-[0.4em]">
                <Zap size={16} />
                Specialization Protocol
              </div>
              <h2 className="text-5xl lg:text-7xl font-black text-text-primary tracking-tight uppercase italic italic">
                Choose Your <span className="text-accent underline underline-offset-8 decoration-4">Stream</span>
              </h2>
              <p className="text-text-secondary max-w-xl mx-auto font-medium tracking-wide">
                Class 12 detected. Select your specialized academic domain.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[ 
                { id: 'Science', icon: Brain, label: 'Science', desc: 'Medical and Engineering tracks. Physics, Chemistry, Biology/Math.' },
                { id: 'Commerce', icon: Calculator, label: 'Commerce', desc: 'Business and Finance tracks. Accountancy, Economics, Business Studies.' },
                { id: 'Arts', icon: Paintbrush, label: 'Arts', desc: 'Humanities and Social Sciences. History, Psychology, Sociology.' }
              ].map((stream) => (
                <motion.button
                  key={stream.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleStreamSelect(stream.id as any)}
                  className="group relative bg-bg-card border border-border-dim rounded-[40px] p-8 flex flex-col items-center text-center gap-6 transition-all hover:border-accent hover:shadow-2xl hover:shadow-accent/20"
                >
                  <div className="w-20 h-20 rounded-3xl bg-bg-surface border border-border-dim flex items-center justify-center text-text-muted transition-all group-hover:bg-accent group-hover:text-white group-hover:border-accent group-hover:scale-110 shadow-xl">
                    <stream.icon size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-text-primary uppercase italic mb-2">{stream.label}</h3>
                    <p className="text-text-secondary text-xs font-medium leading-relaxed">{stream.desc}</p>
                  </div>
                  <div className="mt-auto pt-4 flex items-center gap-2 text-accent font-black text-[9px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    Initialize Domain <ArrowRight size={12} />
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-12 pt-8">
         <div className="flex items-center gap-3 text-text-muted">
            <ShieldCheck size={18} className="text-accent" />
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Identity Verified</span>
         </div>
         <div className="flex items-center gap-3 text-text-muted">
            <Zap size={18} className="text-accent" />
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Instant Provisioning</span>
         </div>
      </div>
    </div>
  );
}

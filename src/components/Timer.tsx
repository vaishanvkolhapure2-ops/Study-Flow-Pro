import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Coffee, Zap, Bell, CheckCircle2 } from 'lucide-react';

export default function Timer() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          // Timer finished
          handleCycleComplete();
        }
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, minutes]);

  const handleCycleComplete = () => {
    playNotification();
    setIsActive(false);
    if (!isBreak) {
      setIsBreak(true);
      setMinutes(5);
    } else {
      setIsBreak(false);
      setMinutes(25);
    }
    setSeconds(0);
  };

  const playNotification = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  };

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setMinutes(25);
    setSeconds(0);
  };

  const progress = isBreak 
    ? ((5 * 60 - (minutes * 60 + seconds)) / (5 * 60)) * 100 
    : ((25 * 60 - (minutes * 60 + seconds)) / (25 * 60)) * 100;

  return (
    <div className="max-w-xl mx-auto space-y-12 py-12">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 border border-accent/40 text-accent rounded-full text-[10px] font-black uppercase tracking-[0.3em]">
          <Zap size={14} />
          Focus Protocol
        </div>
        <h2 className="text-5xl lg:text-7xl font-black tracking-tight text-text-primary leading-none uppercase italic">Pomodoro</h2>
        <p className="text-text-secondary max-w-lg mx-auto leading-relaxed font-medium">Maximize cognitive throughput with deep focus cycles.</p>
      </section>

      <div className="bg-bg-card p-12 rounded-[56px] border border-border-dim shadow-2xl space-y-10 flex flex-col items-center relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[100px] pointer-events-none" />
        
        {/* Visual Progress */}
        <div className="relative w-80 h-80 flex items-center justify-center">
          <svg className="absolute w-full h-full -rotate-90">
            <circle
              cx="160"
              cy="160"
              r="150"
              fill="transparent"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="12"
            />
            <motion.circle
              cx="160"
              cy="160"
              r="150"
              fill="transparent"
              stroke={isBreak ? '#10B981' : '#5B67F1'}
              strokeWidth="12"
              strokeDasharray={942}
              initial={{ strokeDashoffset: 942 }}
              animate={{ strokeDashoffset: 942 - (942 * progress) / 100 }}
              strokeLinecap="round"
              className="drop-shadow-[0_0_8px_rgba(91,103,241,0.5)]"
            />
          </svg>
          
          <div className="flex flex-col items-center gap-3 relative z-10 text-center">
             <div className="flex items-center gap-2 px-4 py-1.5 bg-bg-surface border border-border-dim rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
                {isBreak ? <Coffee size={14} className="text-emerald-500" /> : <Zap size={14} className="text-accent" />}
                {isBreak ? 'Cooling Down' : 'Engine Active'}
             </div>
             <motion.p 
               key={minutes + seconds}
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="text-8xl font-mono font-black tracking-tighter tabular-nums italic text-text-primary"
             >
               {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
             </motion.p>
             <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em]">Intensity: 100%</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-8 relative z-10 w-full justify-center">
          <button 
            onClick={resetTimer}
            className="w-16 h-16 bg-bg-surface border border-border-dim text-text-muted rounded-3xl flex items-center justify-center transition-all hover:bg-bg-deep hover:text-white active:scale-90"
          >
            <RotateCcw size={28} />
          </button>
          
          <button 
            onClick={toggleTimer}
            className={`
              w-24 h-24 rounded-[40px] flex items-center justify-center text-white shadow-2xl transition-all hover:scale-105 active:scale-95
              ${isActive ? 'bg-bg-deep border border-border-dim shadow-black/50' : 'bg-accent shadow-accent/40'}
            `}
          >
            {isActive ? <Pause size={40} /> : <Play size={40} className="ml-1" />}
          </button>

          <button 
             onClick={() => {
                playNotification();
                // Simple manual toggle
                if(!isBreak) {
                  setIsBreak(true);
                  setMinutes(5);
                } else {
                  setIsBreak(false);
                  setMinutes(25);
                }
                setSeconds(0);
                setIsActive(false);
             }}
             className="w-16 h-16 bg-bg-surface border border-border-dim text-text-muted rounded-3xl flex items-center justify-center transition-all hover:bg-bg-deep hover:text-accent active:scale-90"
             title="Switch Mode"
          >
            <Coffee size={28} />
          </button>
        </div>

        {/* Status Messages */}
        <div className="pt-8 border-t border-border-dim w-full flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em] text-text-muted px-4">
           <div className="flex items-center gap-3">
             <Bell size={16} className="text-accent" />
             <span>Audio Feedback Active</span>
           </div>
           <div className="flex items-center gap-3">
             <CheckCircle2 size={16} className="text-emerald-500" />
             <span className="text-text-primary">4 Session Streak</span>
           </div>
        </div>
      </div>
    </div>
  );
}

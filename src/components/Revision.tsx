import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History, 
  RotateCcw, 
  Brain, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  CheckCircle2, 
  XCircle,
  Zap
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { generateFlashcards } from '../ai';
import { Flashcard, View } from '../types';

export default function Revision({ 
  setCurrentView, 
  initialSubject 
}: { 
  setCurrentView: (view: View) => void, 
  initialSubject?: string 
}) {
  const { profile } = useAuth();
  const [subject, setSubject] = useState(initialSubject || '');
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });

  const fetchCards = async () => {
    if (!subject.trim()) return;
    setIsLoading(true);
    setCards([]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setScore({ correct: 0, incorrect: 0 });
    
    try {
      const result = await generateFlashcards(subject, profile?.standard || '12');
      const parsed = JSON.parse(result || '[]');
      const formatted = parsed.map((c: any, i: number) => ({
        id: `card-${i}`,
        ...c,
        subject
      }));
      setCards(formatted);
    } catch (error) {
      console.error('Failed to generate cards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialSubject) {
      fetchCards();
    }
  }, [initialSubject]);

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const markScore = (type: 'correct' | 'incorrect') => {
    setScore(prev => ({ ...prev, [type]: prev[type] + 1 }));
    handleNext();
  };

  return (
    <div className="space-y-12 pb-24 max-w-4xl mx-auto">
      {/* Header */}
      <section className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4 text-center md:text-left">
          <button 
            onClick={() => setCurrentView('lessons')}
            className="flex items-center gap-2 text-accent text-[10px] font-black uppercase tracking-widest hover:underline mb-4"
          >
            <ChevronLeft size={14} /> Back to Lessons
          </button>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 border border-accent/40 text-accent rounded-full text-[10px] font-black uppercase tracking-[0.3em]">
            <Zap size={14} />
            Revision Protocol
          </div>
          <h2 className="text-5xl lg:text-7xl font-black tracking-tight text-text-primary uppercase italic">
            Neural <span className="text-accent underline decoration-4 underline-offset-8">Recall</span>
          </h2>
        </div>

        <div className="bg-bg-card border border-border-dim rounded-[32px] p-6 flex flex-col items-center gap-4 w-full md:w-64 elegant-card-shadow">
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-[10px] font-black uppercase text-emerald-500 mb-1">Success</p>
              <p className="text-2xl font-black text-text-primary">{score.correct}</p>
            </div>
            <div className="w-px h-10 bg-border-dim" />
            <div className="text-center">
              <p className="text-[10px] font-black uppercase text-red-500 mb-1">Failed</p>
              <p className="text-2xl font-black text-text-primary">{score.incorrect}</p>
            </div>
          </div>
          <div className="w-full bg-bg-surface h-1 rounded-full overflow-hidden">
             <motion.div 
               className="h-full bg-accent"
               animate={{ width: `${(currentIndex / (cards.length || 1)) * 100}%` }}
             />
          </div>
        </div>
      </section>

      {/* Control / Input */}
      {cards.length === 0 && !isLoading && (
        <section className="bg-bg-card border border-border-dim rounded-[40px] p-12 text-center space-y-8 elegant-card-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[100px]" />
          <div className="w-20 h-20 bg-accent/10 border border-accent/20 rounded-3xl flex items-center justify-center text-accent mx-auto mb-6">
            <Brain size={40} />
          </div>
          <div className="space-y-4">
             <h3 className="text-3xl font-black text-text-primary uppercase italic">Initialize Revision</h3>
             <p className="text-text-secondary font-medium max-w-md mx-auto">Enter a subject or topic for the AI to generate active recall cards.</p>
          </div>
          <div className="max-w-md mx-auto space-y-4">
            <input 
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Organic Chemistry, Calculus, History..."
              className="w-full bg-bg-surface border border-border-dim rounded-2xl px-6 py-4 focus:ring-4 focus:ring-accent/20 outline-none font-bold text-center italic tracking-tighter text-xl"
            />
            <button 
              onClick={fetchCards}
              disabled={!subject.trim()}
              className="w-full py-4 bg-accent text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-accent/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              Generate Revision Deck
            </button>
          </div>
        </section>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-24 space-y-6">
           <motion.div 
             animate={{ rotate: 360 }}
             transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
             className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full shadow-2xl"
           />
           <div className="text-center">
             <p className="text-[10px] font-black uppercase text-accent tracking-[0.5em] animate-pulse">Neural synthesis in progress</p>
             <p className="text-text-secondary font-medium">Crafting active recall sequences...</p>
           </div>
        </div>
      )}

      {/* Flashcards View */}
      {cards.length > 0 && !isLoading && (
        <div className="space-y-12">
          {/* Card Wrapper */}
          <div className="perspective-1000 h-[400px] w-full relative">
            <motion.div
              className={`w-full h-full relative preserve-3d transition-transform duration-700 cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              {/* Front */}
              <div className="absolute inset-0 bg-bg-card border-2 border-border-dim rounded-[48px] p-12 flex flex-col items-center justify-center backface-hidden elegant-card-shadow group">
                <div className="absolute top-8 left-12 text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                   <Brain size={14} /> Subject Context: {subject}
                </div>
                <div className="absolute bottom-8 right-12 text-[10px] font-black uppercase tracking-widest text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                   Click to Reveal Solution
                </div>
                <h3 className="text-3xl md:text-5xl font-black text-text-primary text-center italic tracking-tight leading-tight uppercase">
                  {cards[currentIndex].front}
                </h3>
              </div>

              {/* Back */}
              <div className="absolute inset-0 bg-bg-surface border-2 border-accent/30 rounded-[48px] p-12 flex flex-col items-center justify-center backface-hidden rotate-y-180 transition-all shadow-2xl shadow-accent/10">
                <div className="absolute top-8 left-12 text-[10px] font-black uppercase tracking-widest text-accent flex items-center gap-2">
                   <Sparkles size={14} /> AI Optimized Explanation
                </div>
                <div className="w-full text-center space-y-6">
                  <p className="text-xl md:text-2xl font-medium text-text-primary leading-relaxed">
                    {cards[currentIndex].back}
                  </p>
                  <div className="flex items-center justify-center gap-4 pt-10">
                    <button 
                      onClick={(e) => { e.stopPropagation(); markScore('incorrect'); }}
                      className="flex items-center gap-2 px-6 py-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-500 hover:text-white transition-all"
                    >
                      <XCircle size={14} /> Failed Recall
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); markScore('correct'); }}
                      className="flex items-center gap-2 px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-500 hover:text-white transition-all"
                    >
                      <CheckCircle2 size={14} /> Mastered
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-4 bg-bg-surface p-6 rounded-[32px] border border-border-dim">
            <button 
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-4 bg-bg-card border border-border-dim rounded-2xl text-text-muted hover:text-accent hover:border-accent disabled:opacity-20 transition-all shadow-xl"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="flex flex-col items-center">
               <p className="text-[11px] font-black uppercase text-text-muted tracking-widest leading-none mb-1">Session Progress</p>
               <p className="text-xl font-black text-text-primary italic">{currentIndex + 1} <span className="text-text-muted font-medium mx-1 italic text-base">/</span> {cards.length}</p>
            </div>
            <button 
              onClick={handleNext}
              disabled={currentIndex === cards.length - 1}
              className="p-4 bg-bg-card border border-border-dim rounded-2xl text-text-muted hover:text-accent hover:border-accent disabled:opacity-20 transition-all shadow-xl"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Finish Session */}
          <div className="text-center">
            <button 
              onClick={() => { setCards([]); setSubject(''); }}
              className="flex items-center gap-2 mx-auto text-text-muted hover:text-white transition-colors uppercase text-[10px] font-black tracking-widest"
            >
              <RotateCcw size={14} /> Reset Revision Session
            </button>
          </div>
        </div>
      )}

      {/* Custom styles for Flip effect */}
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}

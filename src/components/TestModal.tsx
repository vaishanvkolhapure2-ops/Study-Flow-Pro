import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, ChevronRight, RotateCcw, Award, Brain } from 'lucide-react';
import { Quiz } from '../types';
import { generateQuiz } from '../ai';
import { useAuth } from '../AuthContext';

interface TestModalProps {
  topic: string;
  onClose: () => void;
}

export default function TestModal({ topic, onClose }: TestModalProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    async function loadQuiz() {
      setLoading(true);
      try {
        const result = await generateQuiz(topic, profile?.standard || '12', profile?.stream);
        setQuiz(JSON.parse(result));
      } catch (error) {
        console.error('Quiz generation failed:', error);
        // Error is handled in UI below
      } finally {
        setLoading(false);
      }
    }
    loadQuiz();
  }, [topic, profile]);

  const handleSelect = (index: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentStep] = index;
    setSelectedAnswers(newAnswers);
  };

  const nextStep = () => {
    if (!quiz) return;
    if (currentStep < quiz.questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResult(true);
    }
  };

  const getScore = () => {
    if (!quiz) return 0;
    return selectedAnswers.reduce((score, answer, index) => {
      return answer === quiz.questions[index].correctAnswer ? score + 1 : score;
    }, 0);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-bg-deep/80 backdrop-blur-xl" onClick={onClose} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl bg-bg-card border border-border-dim rounded-[48px] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] overflow-hidden relative z-10"
      >
        {/* Header */}
        <div className="p-8 border-b border-border-dim flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
               <Brain size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em]">Knowledge Assessment</p>
              <h3 className="text-xl font-black text-text-primary tracking-tight uppercase italic">{topic}</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-text-muted hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 md:p-12">
          {loading ? (
            <div className="py-24 flex flex-col items-center gap-6">
               <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                 className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full shadow-[0_0_24px_rgba(91,103,241,0.3)]"
               />
               <p className="text-[10px] font-black text-accent uppercase tracking-[0.3em] animate-pulse">Generating Evaluation Matrix...</p>
            </div>
          ) : quiz && !showResult ? (
            <div className="space-y-12">
              <div className="flex items-center justify-between">
                 <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em]">Question {currentStep + 1} of {quiz.questions.length}</p>
                 <div className="flex gap-1">
                    {quiz.questions.map((_, i) => (
                      <div 
                        key={i} 
                        className={`h-1 rounded-full transition-all ${i === currentStep ? 'w-8 bg-accent' : i < currentStep ? 'w-4 bg-emerald-500' : 'w-4 bg-border-dim'}`} 
                      />
                    ))}
                 </div>
              </div>

              <div className="space-y-8">
                <h4 className="text-2xl font-black text-text-primary tracking-tight leading-tight italic uppercase italic">
                  {quiz.questions[currentStep].question}
                </h4>

                <div className="grid gap-3">
                  {quiz.questions[currentStep].options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      className={`
                        w-full p-6 text-left rounded-3xl border transition-all flex items-center justify-between group
                        ${selectedAnswers[currentStep] === idx 
                          ? 'bg-accent border-accent text-white shadow-xl shadow-accent/20' 
                          : 'bg-bg-surface border-border-dim text-text-secondary hover:border-accent hover:bg-bg-surface/80'}
                      `}
                    >
                      <span className="font-bold flex items-center gap-4">
                        <span className="w-8 h-8 rounded-xl bg-black/10 flex items-center justify-center text-xs font-black">
                           {String.fromCharCode(65 + idx)}
                        </span>
                        {option}
                      </span>
                      {selectedAnswers[currentStep] === idx && <CheckCircle2 size={24} />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={nextStep}
                  disabled={selectedAnswers[currentStep] === undefined}
                  className="px-10 py-5 bg-accent text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-accent/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-3"
                >
                  {currentStep === quiz.questions.length - 1 ? 'Finalize Protocol' : 'Next Sector'}
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          ) : quiz && showResult ? (
            <div className="py-12 space-y-12 text-center">
               <div className="relative inline-block">
                  <div className="absolute inset-0 bg-accent/20 blur-[60px] rounded-full" />
                  <div className="w-40 h-40 rounded-[48px] bg-bg-card border-4 border-accent flex flex-col items-center justify-center relative z-10 mx-auto">
                     <p className="text-6xl font-black text-accent font-mono italic">{getScore()}/{quiz.questions.length}</p>
                     <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mt-2">Efficiency Rating</p>
                  </div>
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-4 -right-4 p-4 bg-emerald-500 rounded-2xl text-white shadow-2xl z-20"
                  >
                     <Award size={32} />
                  </motion.div>
               </div>

               <div className="space-y-4">
                  <h4 className="text-4xl font-black text-text-primary tracking-tight uppercase italic">Session Terminated</h4>
                  <p className="text-text-secondary max-w-md mx-auto leading-relaxed font-medium">
                     {getScore() === quiz.questions.length 
                       ? "Exceptional matrix alignment. Your comprehension level is at 100%." 
                       : getScore() >= quiz.questions.length / 2 
                       ? "Passable baseline. Recommend recursive review of low-efficiency sectors." 
                       : "Critical failure. Primary focus required on core syllabus modules."}
                  </p>
               </div>

               <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                  <button
                    onClick={() => {
                      setCurrentStep(0);
                      setSelectedAnswers([]);
                      setShowResult(false);
                    }}
                    className="w-full sm:w-auto px-8 py-4 bg-bg-surface border border-border-dim text-text-muted rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:text-white transition-all"
                  >
                    <RotateCcw size={18} />
                    Retest Protocol
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full sm:w-auto px-10 py-5 bg-accent text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-accent/30 hover:scale-105 transition-all"
                  >
                    Return to Timeline
                  </button>
               </div>
            </div>
          ) : (
             <div className="py-24 text-center space-y-4">
                <p className="text-red-500 font-bold uppercase tracking-widest">Protocol Sync Error</p>
                <button onClick={onClose} className="text-accent underline">Return to Timeline</button>
             </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

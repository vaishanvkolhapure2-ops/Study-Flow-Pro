import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Brain, Zap, Target } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { useAuth } from '../AuthContext';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export default function AIInsights({ tasks, plan }: { tasks: any[], plan: string }) {
  const { profile } = useAuth();
  const [insight, setInsight] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchInsight = async () => {
    if (!profile) return;
    setIsLoading(true);
    try {
      const prompt = `Student Profile: Class ${profile.standard} ${profile.stream || ''}.
Pending Tasks: ${tasks.filter(t => !t.completed).map(t => t.text).join(', ') || 'No pending tasks'}.
Current Study Plan: ${plan || 'No plan active'}.

Based on this, give a 2-sentence "Mastery Strategy" for today. High energy, strategic, and concise.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      setInsight(response.text || '');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsight();
  }, [tasks.length, plan]);

  return (
    <div className="bg-bg-card border border-border-dim rounded-[32px] p-8 elegant-card-shadow relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl" />
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
            <Brain size={20} />
          </div>
          <h4 className="font-black text-lg text-text-primary uppercase italic tracking-tight">Neural Strategy</h4>
        </div>
        <button 
          onClick={fetchInsight}
          className="p-2 text-text-muted hover:text-accent transition-colors"
        >
          <Zap size={16} />
        </button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-4 bg-bg-surface rounded-full w-full animate-pulse" />
            <div className="h-4 bg-bg-surface rounded-full w-3/4 animate-pulse" />
          </div>
        ) : (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-text-secondary font-medium italic tracking-tight leading-relaxed"
          >
            "{insight || 'Synthesizing your optimal academic path...'}"
          </motion.p>
        )}
        
        <div className="flex items-center gap-4 pt-4">
           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500">
              <Target size={12} /> Optimization Active
           </div>
           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent">
              <Sparkles size={12} /> Personalized
           </div>
        </div>
      </div>
    </div>
  );
}

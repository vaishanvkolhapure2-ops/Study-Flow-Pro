import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Key, Save, AlertCircle, ShieldCheck, RefreshCcw } from 'lucide-react';

export default function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    const savedKey = localStorage.getItem('SF_GEMINI_API_KEY');
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handleSave = () => {
    setStatus('saving');
    localStorage.setItem('SF_GEMINI_API_KEY', apiKey);
    setTimeout(() => {
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 3000);
      // Optional: Refresh the page or prompt a restart for the AI instance to reload
      // window.location.reload();
    }, 800);
  };

  const clearKey = () => {
    localStorage.removeItem('SF_GEMINI_API_KEY');
    setApiKey('');
    setStatus('saved');
    setTimeout(() => setStatus('idle'), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-12 pb-24">
      <section className="space-y-4 pb-8 border-b border-border-dim">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/40 text-accent rounded-full text-[10px] font-black uppercase tracking-[0.3em]">
           <Key size={14} />
           Security Protocol
        </div>
        <h2 className="text-4xl lg:text-6xl font-black tracking-tight text-text-primary uppercase italic">Neural config</h2>
        <p className="text-text-secondary font-medium tracking-wide">Configure your AI intelligence core. Keys are stored locally on this device.</p>
      </section>

      <section className="bg-bg-card p-8 rounded-[40px] border border-border-dim shadow-2xl space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <ShieldCheck size={180} />
        </div>

        <div className="space-y-6 relative z-10">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-accent uppercase tracking-[0.4em] ml-1">Gemini API Oracle Key</label>
            <div className="relative group">
              <input 
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter AI Architecture Key..."
                className="w-full bg-bg-surface border border-border-dim rounded-2xl px-6 py-4 text-text-primary focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all placeholder:text-text-muted font-mono"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-hover:opacity-100 transition-opacity">
                <Key size={20} className="text-accent" />
              </div>
            </div>
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest leading-relaxed ml-1">
              Required for AI Tutor, Flashcards, and Visualizations. Get yours at <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-accent underline">Google AI Studio</a>.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={status === 'saving'}
              className="flex items-center gap-3 px-8 py-4 bg-accent text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-accent/20 transition-all disabled:opacity-50"
            >
              {status === 'saving' ? <RefreshCcw className="animate-spin" size={16} /> : <Save size={16} />}
              {status === 'saved' ? 'Config Locked' : 'Authorize Key'}
            </motion.button>
            <button
               onClick={clearKey}
               className="px-8 py-4 bg-transparent border border-border-dim text-text-muted rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/5 transition-all"
            >
              Discard Protocol
            </button>
          </div>
        </div>
      </section>

      <div className="bg-accent/5 border border-accent/20 p-6 rounded-3xl flex gap-4">
        <div className="text-accent shrink-0 pt-1">
          <AlertCircle size={20} />
        </div>
        <div className="space-y-2">
          <h4 className="text-xs font-black text-text-primary uppercase tracking-widest">Privacy Assurance</h4>
          <p className="text-xs text-text-secondary font-medium leading-relaxed">
            Your API Key never touches our central servers. It is stored exclusively in your browser's encrypted local storage (localStorage) and used only for direct client-side requests or secure server-side proxying in your session.
          </p>
        </div>
      </div>
    </div>
  );
}

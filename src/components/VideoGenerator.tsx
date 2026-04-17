import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Video, 
  Sparkles, 
  Play, 
  Download, 
  History, 
  Trash2, 
  AlertCircle, 
  Loader2, 
  Clock, 
  Film,
  Key,
  Brain
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../AuthContext';
import { EducationalVideo, StudyPlan } from '../types';

export default function VideoGenerator() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [subjects, setSubjects] = useState('');
  const [loading, setLoading] = useState(false);
  const [summarizingId, setSummarizingId] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<EducationalVideo[]>([]);
  const [view, setView] = useState<'generate' | 'archive'>('generate');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [plans, setPlans] = useState<StudyPlan[]>([]);

  useEffect(() => {
    if (!user) return;

    // Check for API Key
    const checkApiKey = async () => {
      const selected = await (window as any).aistudio.hasSelectedApiKey();
      setHasApiKey(selected);
    };
    checkApiKey();

    // Load History
    const qv = query(
      collection(db, 'educationalVideos'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubV = onSnapshot(qv, (snapshot) => {
      setHistory(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as EducationalVideo)));
    });

    // Load Plans for context
    const qp = query(
      collection(db, 'studyPlans'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubP = onSnapshot(qp, (snapshot) => {
      setPlans(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as StudyPlan)));
    });

    return () => {
      unsubV();
      unsubP();
    };
  }, [user]);

  const handleSelectKey = async () => {
    await (window as any).aistudio.openSelectKey();
    setHasApiKey(true);
  };

  const generateVideo = async () => {
    if (!user || (!prompt && !subjects)) return;
    if (!navigator.onLine) {
      setError("Video Synthesizer unreachable. Offline mode active.");
      return;
    }

    setLoading(true);
    setError(null);
    setVideoUrl(null);
    setStatus('Initializing Neural Video Engine...');

    try {
      const apiKey = process.env.API_KEY;
      const ai = new GoogleGenAI({ apiKey });

      const finalPrompt = prompt || `Create an educational 16:9 1080p video about these study topics: ${subjects}. Make it visually engaging and clear for a student.`;
      
      setStatus('Generating Video Assets (may take ~2-3 mins)...');
      
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-lite-generate-preview',
        prompt: finalPrompt,
        config: {
          numberOfVideos: 1,
          resolution: '1080p',
          aspectRatio: '16:9'
        }
      });

      // Polling
      const pollingStatusMessages = [
        "Rendering temporal frames...",
        "Applying cinematic lighting...",
        "Encoding high-density stream...",
        "Optimizing educational clarity...",
        "Finalizing visual synthesis..."
      ];
      let msgIdx = 0;

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
        setStatus(pollingStatusMessages[msgIdx % pollingStatusMessages.length]);
        msgIdx++;
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!downloadLink) throw new Error("Video generation failed - no URI returned.");

      setStatus('Streaming Final Buffer...');

      // Fetch the video with custom header as required by Veo
      const vidResponse = await fetch(downloadLink, {
        method: 'GET',
        headers: {
          'x-goog-api-key': apiKey!,
        },
      });

      if (!vidResponse.ok) throw new Error("Failed to secure video stream.");

      const blob = await vidResponse.blob();
      const localUrl = URL.createObjectURL(blob);
      setVideoUrl(localUrl);

      // Save to Firebase
      await addDoc(collection(db, 'educationalVideos'), {
        uid: user.uid,
        title: subjects || 'New Educational Video',
        prompt: finalPrompt,
        videoUri: downloadLink, // Note: We save the source URI, but need API key to fetch later
        createdAt: serverTimestamp()
      });

      setStatus('');
    } catch (err: any) {
      console.error("Video Generation Error:", err);
      if (err.message?.includes("Requested entity was not found")) {
        setError("API Key verification failed. Please re-select your key.");
        setHasApiKey(false);
      } else {
        setError("Synthesis interrupted. The video engine encountered an error. Please retry.");
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteVideo = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'educationalVideos', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `educationalVideos/${id}`);
    }
  };

  const generateSummary = async (video: EducationalVideo) => {
    if (!video.id) return;
    setSummarizingId(video.id);
    try {
      const apiKey = process.env.API_KEY;
      const ai = new GoogleGenAI({ apiKey });
      
      const res = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Based on the following request used to generate an educational video, provide a brief summary and 3 key takeaways for a student. 
        Title/Subject: ${video.title}
        Generation Prompt: ${video.prompt}
        
        Format as:
        Summary: [Brief summary]
        Key Takeaways:
        - [Takeaway 1]
        - [Takeaway 2]
        - [Takeaway 3]`,
      });

      const summaryText = res.text;
      await updateDoc(doc(db, 'educationalVideos', video.id), {
        summary: summaryText
      });
    } catch (err) {
      console.error("Summary Generation Error:", err);
      setError("Failed to generate AI insights for this video.");
    } finally {
      setSummarizingId(null);
    }
  };

  const reviewVideo = async (video: EducationalVideo) => {
    setLoading(true);
    setStatus('Retrieving Archived Stream...');
    setError(null);
    try {
      const apiKey = process.env.API_KEY;
      const vidResponse = await fetch(video.videoUri, {
        method: 'GET',
        headers: {
          'x-goog-api-key': apiKey!,
        },
      });
      if (!vidResponse.ok) throw new Error("Archived stream inaccessible.");
      const blob = await vidResponse.blob();
      setVideoUrl(URL.createObjectURL(blob));
      setView('generate');
    } catch (err) {
      setError("Failed to stream archived video. Ensure you have an active network and valid key.");
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24">
      {/* View Switcher */}
      <div className="flex justify-center">
        <div className="bg-bg-card p-1.5 rounded-2xl border border-border-dim inline-flex gap-2">
          <button 
            onClick={() => setView('generate')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'generate' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-text-muted hover:text-white'}`}
          >
            Video Synthesizer
          </button>
          <button 
            onClick={() => setView('archive')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'archive' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-text-muted hover:text-white'}`}
          >
            Video Vault {history.length > 0 && `(${history.length})`}
          </button>
        </div>
      </div>

      {!hasApiKey && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-accent/10 border border-accent/20 p-8 rounded-[32px] text-center space-y-6"
        >
          <div className="w-16 h-16 bg-accent rounded-[24px] flex items-center justify-center text-white mx-auto shadow-xl shadow-accent/20">
            <Key size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-text-primary uppercase tracking-tight">API Key Required</h3>
            <p className="text-sm text-text-secondary max-w-sm mx-auto leading-relaxed">
              Veo High-Quality Video Generation requires a personal API key from a paid Google Cloud project. 
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-accent underline ml-1">Learn about billing</a>
            </p>
          </div>
          <button 
            onClick={handleSelectKey}
            className="px-8 py-4 bg-accent text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
          >
            Select Credentials
          </button>
        </motion.div>
      )}

      {view === 'generate' ? (
        <>
          {/* Header */}
          <section className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 border border-accent/40 text-accent rounded-full text-[10px] font-black uppercase tracking-[0.3em]">
              <Film size={14} />
              Model: Veo 3.1 Lite
            </div>
            <h2 className="text-5xl lg:text-7xl font-black tracking-tight text-text-primary leading-none uppercase italic">Study Videos</h2>
            <p className="text-text-secondary max-w-lg mx-auto leading-relaxed font-medium">Transform your syllabus into cinematic educational visual sequences.</p>
          </section>

          {/* Generator Section */}
          <section className="bg-bg-card p-10 rounded-[40px] border border-border-dim shadow-2xl space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[100px] pointer-events-none" />
            
            <div className="grid md:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Quick Sync (Topics)</label>
                <input 
                  value={subjects}
                  onChange={(e) => setSubjects(e.target.value)}
                  placeholder="e.g., Photosynthesis, Laws of Physics..."
                  className="w-full bg-bg-surface border border-border-dim focus:border-accent focus:ring-4 focus:ring-accent/10 rounded-2xl px-6 py-5 outline-none text-text-primary font-bold transition-all placeholder:text-text-muted"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Custom Narrative Shift</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask for specific styles or detail levels..."
                  className="w-full bg-bg-surface border border-border-dim focus:border-accent focus:ring-4 focus:ring-accent/10 rounded-2xl px-6 py-4 outline-none text-text-primary font-bold transition-all placeholder:text-text-muted resize-none"
                  rows={1}
                />
              </div>
            </div>

            <button 
              onClick={generateVideo}
              disabled={loading || !hasApiKey || (!subjects && !prompt)}
              className="w-full py-6 bg-accent text-white rounded-2xl font-black tracking-tighter uppercase italic text-xl shadow-xl shadow-accent/30 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-4 relative z-10"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  {status || 'Processing...'}
                </>
              ) : (
                <>Initiate Video Synthesis <Sparkles size={24} /></>
              )}
            </button>
          </section>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center gap-4 text-red-500"
              >
                <AlertCircle size={24} />
                <p className="text-sm font-bold tracking-tight">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Video Player Area */}
          <AnimatePresence>
            {videoUrl && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between px-4">
                  <h4 className="font-extrabold text-xl text-text-primary tracking-tight italic uppercase">Synthesis Output</h4>
                  <a 
                    href={videoUrl} 
                    download="StudyFlow-Educational.mp4"
                    className="flex items-center gap-2 text-[10px] font-black uppercase text-accent hover:underline"
                  >
                    <Download size={14} /> Download File
                  </a>
                </div>
                
                {/* Immersive View Styling (Recipe 7 Inspired) */}
                <div className="relative group rounded-[40px] overflow-hidden border border-border-dim shadow-2xl aspect-video bg-black">
                  <video 
                    src={videoUrl} 
                    controls 
                    className="w-full h-full object-contain"
                    autoPlay
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!videoUrl && !loading && (
            <div className="py-24 flex flex-col items-center gap-6 opacity-30 grayscale pointer-events-none">
              <Film size={120} />
              <p className="font-bold text-gray-400 uppercase tracking-[0.3em]">Ready for visual deployment</p>
            </div>
          )}
        </>
      ) : (
        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
           <div className="flex items-center justify-between px-4">
             <h3 className="text-xl font-black text-text-primary uppercase tracking-tight italic">Resource Vault</h3>
             <p className="text-[10px] font-black text-text-muted uppercase tracking-widest italic flex items-center gap-2">
               <History size={14} /> Generated Assets
             </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {history.map((v) => (
              <div 
                key={v.id}
                className="bg-bg-card p-6 rounded-[32px] border border-border-dim elegant-card-shadow group relative hover:border-accent transition-all cursor-pointer overflow-hidden"
                onClick={() => reviewVideo(v)}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl pointer-events-none" />
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center">
                    <Play size={24} />
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteVideo(v.id!);
                    }}
                    className="p-2 text-text-muted hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <h4 className="text-xl font-black text-text-primary tracking-tight mb-2 uppercase break-words relative z-10">{v.title}</h4>
                <div className="flex items-center gap-4 text-[10px] font-bold text-text-muted uppercase tracking-widest relative z-10">
                   <span className="flex items-center gap-1.5"><Clock size={12} /> {v.createdAt?.toDate().toLocaleDateString()}</span>
                   <span className="w-1.5 h-1.5 rounded-full bg-border-dim" />
                   <span className="truncate max-w-[150px]">{v.prompt}</span>
                </div>

                <div className="mt-4 pt-4 border-t border-border-dim/50 space-y-3 relative z-10">
                  {v.summary ? (
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-2">
                        <Sparkles size={12} /> AI Insights
                      </p>
                      <div className="text-xs text-text-secondary leading-relaxed bg-bg-surface/50 p-4 rounded-xl border border-border-dim/30 whitespace-pre-wrap">
                        {v.summary}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        generateSummary(v);
                      }}
                      disabled={summarizingId === v.id}
                      className="w-full py-3 bg-accent/5 hover:bg-accent/10 border border-accent/20 rounded-xl text-[10px] font-black text-accent uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      {summarizingId === v.id ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Synthesizing Analysis...
                        </>
                      ) : (
                        <>
                          <Brain size={14} />
                          Extract AI Insights
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {history.length === 0 && (
              <div className="md:col-span-2 py-24 text-center border-2 border-dashed border-border-dim rounded-[40px] space-y-4">
                 <div className="w-20 h-20 bg-bg-card rounded-[32px] flex items-center justify-center mx-auto text-text-muted opacity-20">
                    <Film size={40} />
                 </div>
                 <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em]">Vault Isolated</p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

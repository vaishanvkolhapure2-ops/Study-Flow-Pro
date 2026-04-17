import { useState, useEffect, useRef } from 'react';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../AuthContext';
import { ChatMessage } from '../types';
import { Send, Mic, Sparkles, User, Brain, Globe, Volume2, Image as ImageIcon } from 'lucide-react';
import { getTutorResponse, generateSpeech, generateVisual } from '../ai';
import { motion } from 'motion/react';
import Markdown from 'react-markdown';

export default function Tutor() {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState<string | null>(null); // 'voice' | 'image'
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleSpeech = async (text: string) => {
    setIsSynthesizing('voice');
    try {
      const base64 = await generateSpeech(text);
      if (base64) {
        if (audioRef.current) {
          audioRef.current.src = `data:audio/mp3;base64,${base64}`;
          audioRef.current.play();
        } else {
          const audio = new Audio(`data:audio/mp3;base64,${base64}`);
          audioRef.current = audio;
          audio.play();
        }
      }
    } catch (err) {
      console.error('Speech synthesis failed:', err);
    } finally {
      setIsSynthesizing(null);
    }
  };

  const handleVisual = async (text: string) => {
    setIsSynthesizing('image');
    try {
      // Find a core concept to visualize from the text
      const concept = text.split('\n')[0].replace(/[#*]/g, '').slice(0, 100);
      const url = await generateVisual(concept);
      if (url) {
        // Add a local message with the image
        setMessages(prev => [...prev, {
          id: 'visual-' + Date.now(),
          uid: user?.uid || '',
          role: 'ai',
          content: `![Concept Visualization](${url})`,
          createdAt: serverTimestamp() as any
        }]);
      }
    } catch (err) {
      console.error('Visual synthesis failed:', err);
    } finally {
      setIsSynthesizing(null);
    }
  };

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'chatMessages'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'asc')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'chatMessages');
    });

    return unsub;
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!navigator.onLine) {
      setMessages(prev => [...prev, {
        id: 'offline-' + Date.now(),
        uid: user?.uid || '',
        role: 'ai',
        content: "🚨 **System Offline**: Intelligence Stream blocked. You can still review past conversations, but real-time tutoring requires a data connection.",
        createdAt: serverTimestamp() as any
      }]);
      return;
    }
    if (!user || !input.trim() || isTyping) return;

    const userText = input.trim();
    setInput('');
    setIsTyping(true);

    try {
      // 1. Add user message
      await addDoc(collection(db, 'chatMessages'), {
        uid: user.uid,
        role: 'user',
        content: userText,
        createdAt: serverTimestamp()
      });

      // 2. Format history for AI
      const history = messages.map(m => ({
        role: (m.role === 'user' ? 'user' : 'model') as 'user' | 'model',
        parts: [{ text: m.content }]
      }));

      // 3. Get AI Stream
      const stream = await getTutorResponse(history, userText, profile?.standard || '12', profile?.stream);
      let fullResponse = '';

      for await (const chunk of stream) {
        fullResponse += chunk.text || '';
      }

      // 4. Add AI message
      try {
        await addDoc(collection(db, 'chatMessages'), {
          uid: user.uid,
          role: 'ai',
          content: fullResponse,
          createdAt: serverTimestamp()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'chatMessages');
      }

    } catch (error: any) {
      console.error(error);
      // Optional: Add a local error message to the chat
      setMessages(prev => [...prev, {
        id: 'error-' + Date.now(),
        uid: user.uid,
        role: 'ai',
        content: "🚨 **System Alert**: Intelligence Stream Interrupted. Failed to retrieve tutor response. Check your network or valid API configuration.",
        createdAt: serverTimestamp() as any
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-bg-surface rounded-[32px] shadow-2xl border border-border-dim overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-accent/5 to-transparent pointer-events-none" />
      
      {/* Chat Header */}
      <header className="p-8 border-b border-border-dim bg-bg-card/50 backdrop-blur-md flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-accent shadow-lg shadow-accent/30 text-white flex items-center justify-center">
            <Brain size={24} />
          </div>
          <div>
            <h3 className="font-black text-lg tracking-tight text-text-primary uppercase">StudyFlow AI Tutor</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
              <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                Internet Grounding Active <Globe size={10} className="text-accent" />
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 relative z-10">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 max-w-sm mx-auto">
            <div className="w-24 h-24 rounded-[40px] bg-bg-card border border-border-dim flex items-center justify-center text-accent shadow-2xl">
              <Sparkles size={48} />
            </div>
            <div>
               <h4 className="font-black text-2xl text-text-primary tracking-tight mb-2">Class {profile?.standard || '10-12'} {profile?.stream || ''} Expert</h4>
               <p className="text-sm text-text-secondary leading-relaxed font-medium">
                 {profile?.stream === 'Science' 
                   ? "Ask about Physics derivations, Organic Chemistry, or Advanced Calculus. I'm here to simplify complexity."
                   : profile?.stream === 'Commerce'
                   ? "Ask about Accountancy ledgers, Business Economics, or Market Analysis. I'm here to simplify complexity."
                   : profile?.stream === 'Arts'
                   ? "Ask about Historical timelines, Social Psychology, or Political Theories. I'm here to simplify complexity."
                   : "Ask about academic concepts, study strategies, or board prep. I'm here to simplify complexity."}
               </p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xl border
              ${msg.role === 'user' ? 'bg-accent border-accent/20 text-white' : 'bg-bg-card border-border-dim text-accent'}
            `}>
              {msg.role === 'user' ? <User size={18} /> : <Brain size={18} />}
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className={`p-5 rounded-[24px] max-w-[85%] lg:max-w-[70%] text-sm leading-relaxed shadow-xl border
                ${msg.role === 'user' 
                  ? 'bg-accent text-white border-accent/20 rounded-tr-none' 
                  : 'bg-ai-bubble text-text-primary border-border-dim rounded-tl-none'}
              `}
            >
              <Markdown>{msg.content}</Markdown>
              
              {msg.role === 'ai' && !msg.content.startsWith('![Concept Visualization]') && (
                <div className="mt-4 pt-4 border-t border-border-dim/30 flex items-center gap-3">
                  <button 
                    onClick={() => handleSpeech(msg.content)}
                    disabled={isSynthesizing !== null}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-accent transition-colors disabled:opacity-50"
                  >
                    <Volume2 size={12} /> {isSynthesizing === 'voice' ? 'Voice Link...' : 'Read Aloud'}
                  </button>
                  <button 
                    onClick={() => handleVisual(msg.content)}
                    disabled={isSynthesizing !== null}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-accent transition-colors disabled:opacity-50"
                  >
                    <ImageIcon size={12} /> {isSynthesizing === 'image' ? 'Visualizing...' : 'Show Diagram'}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-5">
            <div className="w-10 h-10 rounded-2xl bg-bg-card border border-border-dim text-accent flex items-center justify-center shrink-0">
              <Brain size={18} />
            </div>
            <div className="bg-ai-bubble p-5 rounded-[24px] rounded-tl-none border border-border-dim flex gap-1.5 items-center">
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 rounded-full bg-accent" />
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-accent" />
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-2 italic">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <footer className="p-8 bg-bg-card border-t border-border-dim relative z-10">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="flex-1 relative group">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask about Physics, Bio, BST..."
              className="w-full bg-bg-surface border border-border-dim rounded-2xl px-6 py-4 focus:ring-4 focus:ring-accent/20 focus:border-accent outline-none font-medium transition-all resize-none shadow-2xl text-text-primary pr-14 placeholder:text-text-muted"
            />
            <button
              type="button"
              className="absolute right-5 top-1/2 -translate-y-1/2 text-text-muted hover:text-accent transition-colors p-2"
            >
              <Mic size={20} />
            </button>
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="w-14 h-14 bg-accent text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-accent/30 transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100 disabled:grayscale active:scale-95"
          >
            <Send size={24} />
          </button>
        </form>
      </footer>
    </div>
  );
}

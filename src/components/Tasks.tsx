import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../AuthContext';
import { Task } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Check, Trash2, CheckCircle2, ListTodo, AlertCircle } from 'lucide-react';

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'tasks'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task)));
      setLocalError(null);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'tasks');
    });

    return unsub;
  }, [user]);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !input.trim()) return;

    setLocalError(null);
    try {
      await addDoc(collection(db, 'tasks'), {
        uid: user.uid,
        text: input.trim(),
        completed: false,
        createdAt: serverTimestamp()
      });
      setInput('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'tasks');
    }
  };

  const toggleTask = async (task: Task) => {
    if (!task.id) return;
    try {
      await updateDoc(doc(db, 'tasks', task.id), {
        completed: !task.completed
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${task.id}`);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `tasks/${taskId}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-12 pb-24">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border-dim">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/40 text-accent rounded-full text-[10px] font-black uppercase tracking-[0.3em]">
             <ListTodo size={14} />
             Operational Matrix
          </div>
          <h2 className="text-4xl lg:text-6xl font-black tracking-tight text-text-primary uppercase italic">Task Flow</h2>
          <p className="text-text-secondary font-medium tracking-wide">Deconstruct your syllabus into executable units.</p>
        </div>
        <div className="flex bg-bg-card p-1.5 rounded-2xl border border-border-dim">
           <div className="px-4 py-2 bg-accent/20 border border-accent/40 rounded-xl text-accent text-xs font-black uppercase tracking-widest">
              {tasks.filter(t => !t.completed).length} Pending
           </div>
        </div>
      </section>

      {/* Add Task Input */}
      <section className="bg-bg-card p-3 rounded-[32px] border border-border-dim shadow-2xl relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-accent/20 to-transparent rounded-[33px] blur opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <form onSubmit={addTask} className="relative flex items-center gap-2 bg-bg-surface rounded-[26px] p-2">
          <div className="pl-4 text-accent">
            <Plus size={24} />
          </div>
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="System input: New syllabus target..."
            className="flex-1 bg-transparent border-none px-4 py-4 focus:ring-0 outline-none font-bold text-text-primary placeholder:text-text-muted italic"
          />
          <button 
            type="submit"
            disabled={!input.trim()}
            className="px-8 py-4 bg-accent text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-accent/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            Encrypt Task
          </button>
        </form>
      </section>

      {/* Stats Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-bg-card/50 rounded-2xl border border-border-dim backdrop-blur-sm">
         <div className="flex items-center gap-8">
            <div>
               <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Queue Size</p>
               <p className="text-xl font-black text-text-primary font-mono">{tasks.length}</p>
            </div>
            <div className="w-px h-8 bg-border-dim" />
            <div>
               <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Completed</p>
               <p className="text-xl font-black text-emerald-500 font-mono">{tasks.filter(t => t.completed).length}</p>
            </div>
         </div>
         <div className="text-right">
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Efficiency</p>
            <p className="text-xl font-black text-accent font-mono">{tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0}%</p>
         </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, x: -20, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              className={`
                group flex items-center justify-between p-6 rounded-[28px] border transition-all elegant-card-shadow
                ${task.completed 
                  ? 'bg-bg-deep border-border-dim grayscale opacity-40' 
                  : 'bg-bg-card border-border-dim hover:border-accent hover:translate-x-1'}
              `}
            >
              <div className="flex items-center gap-5 flex-1 cursor-pointer" onClick={() => toggleTask(task)}>
                <button
                  className={`
                    w-7 h-7 rounded-xl flex items-center justify-center transition-all border-2
                    ${task.completed 
                      ? 'bg-accent border-accent text-white' 
                      : 'bg-transparent border-accent/30 group-hover:border-accent'}
                  `}
                >
                  {task.completed && <Check size={18} />}
                </button>
                <div className="flex flex-col">
                  <span className={`text-base font-bold tracking-tight transition-all uppercase italic ${task.completed ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                    {task.text}
                  </span>
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mt-1">Status: {task.completed ? 'Terminated' : 'Actionable'}</span>
                </div>
              </div>
              
              <button
                onClick={() => deleteTask(task.id!)}
                className="p-3 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={20} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {tasks.length === 0 && (
          <div className="py-24 text-center space-y-4 bg-bg-card/30 rounded-[40px] border border-dashed border-border-dim">
            <div className="w-20 h-20 bg-bg-card rounded-[32px] flex items-center justify-center mx-auto text-text-muted opacity-20 border border-border-dim">
               <ListTodo size={40} />
            </div>
            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em]">Operational Matrix Empty</p>
          </div>
        )}
      </div>
    </div>
  );
}

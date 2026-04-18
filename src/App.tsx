import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Calendar, 
  Timer as TimerIcon, 
  CheckSquare, 
  LogOut, 
  Menu,
  X,
  GraduationCap,
  Wifi,
  WifiOff,
  CloudLightning,
  Video as VideoIcon,
  BookOpen,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './AuthContext';
import { View } from './types';
import Dashboard from './components/Dashboard';
import Tutor from './components/Tutor';
import Planner from './components/Planner';
import Timer from './components/Timer';
import Tasks from './components/Tasks';
import VideoGenerator from './components/VideoGenerator';
import Lessons from './components/Lessons';
import Revision from './components/Revision';
import Landing from './components/Landing';
import StandardSelection from './components/StandardSelection';
import Settings from './components/Settings';

export default function App() {
  const { user, loading, profile, logout } = useAuth();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedSubject, setSelectedSubject] = useState<string | undefined>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-bg-deep">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return <Landing />;
  }

  if (profile && !profile.standard) {
    return <StandardSelection />;
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'lessons', label: 'Lessons', icon: BookOpen },
    { id: 'revision', label: 'Revision', icon: History },
    { id: 'tutor', label: 'AI Tutor', icon: MessageSquare },
    { id: 'planner', label: 'Study Planner', icon: Calendar },
    { id: 'video', label: 'Study Videos', icon: VideoIcon },
    { id: 'timer', label: 'Focus Timer', icon: TimerIcon },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'settings', label: 'Neural Config', icon: CloudLightning },
  ];

  return (
    <div className="flex h-screen bg-bg-deep text-text-primary font-sans overflow-hidden">
      {/* Mobile Sidebar Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-bg-card rounded-lg shadow-lg border border-border-dim"
      >
        <Menu size={20} />
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-bg-surface border-r border-border-dim transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="p-2 bg-accent rounded-xl text-white shadow-lg shadow-accent/20">
              <GraduationCap size={24} />
            </div>
            <h1 className="font-extrabold text-xl tracking-tight uppercase italic underline decoration-accent underline-offset-4">StudyFlow <span className="text-accent">AI</span></h1>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden ml-auto">
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id as View);
                  setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                  ${currentView === item.id 
                    ? 'bg-accent/10 text-accent font-bold border border-accent/30' 
                    : 'text-text-secondary hover:bg-white/5'}
                `}
              >
                <item.icon size={20} />
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-border-dim space-y-4">
            {/* Connection Status */}
            <div className={`
              mx-2 flex items-center gap-3 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border
              ${isOnline ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}
            `}>
              {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
              {isOnline ? 'System Online' : 'Offline Mode'}
            </div>

            <div className="flex items-center gap-3 px-2 mb-2">
              <img 
                src={profile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
                className="w-10 h-10 rounded-full border border-border-dim bg-bg-card"
                alt="Profile"
              />
              <div className="overflow-hidden">
                <p className="font-bold text-sm truncate text-text-primary">{profile?.displayName || 'Student'}</p>
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider truncate">{user.email}</p>
              </div>
            </div>
            
            <button 
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 text-text-muted hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all"
            >
              <LogOut size={20} />
              <span className="text-sm font-bold">Terminate Session</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full bg-bg-deep relative">
        <AnimatePresence>
          {!isOnline && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-accent text-white py-2 px-4 text-center text-[10px] font-black uppercase tracking-[0.4em] sticky top-0 z-[60] flex items-center justify-center gap-2"
            >
              <CloudLightning size={16} />
              Offline Persistence Active: Changes will sync on reconnect
            </motion.div>
          )}
        </AnimatePresence>
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto p-6 lg:p-12 pb-24 lg:pb-12 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {currentView === 'dashboard' && <Dashboard setCurrentView={setCurrentView} />}
              {currentView === 'lessons' && (
                <Lessons 
                  setCurrentView={setCurrentView} 
                  setSelectedSubject={setSelectedSubject} 
                />
              )}
              {currentView === 'revision' && (
                <Revision 
                  setCurrentView={setCurrentView} 
                  initialSubject={selectedSubject} 
                />
              )}
              {currentView === 'tutor' && <Tutor />}
              {currentView === 'planner' && <Planner />}
              {currentView === 'video' && <VideoGenerator />}
              {currentView === 'timer' && <Timer />}
              {currentView === 'tasks' && <Tasks />}
              {currentView === 'settings' && <Settings />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-bg-surface border-t border-border-dim flex items-center justify-around px-6 pb-safe z-50">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
            { id: 'lessons', icon: BookOpen, label: 'Learn' },
            { id: 'tutor', icon: MessageSquare, label: 'AI' },
            { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
            { id: 'settings', icon: CloudLightning, label: 'Config' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as View)}
              className={`flex flex-col items-center gap-1 ${currentView === item.id ? 'text-accent' : 'text-text-muted'}`}
            >
              <item.icon size={20} />
              <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
}

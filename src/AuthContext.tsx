import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { UserProfile } from './types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setError(null);
      setUser(user);
      
      try {
        if (user) {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            const newProfile: Partial<UserProfile> = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName,
              photoURL: user.photoURL,
              role: 'student',
              streak: 0,
              points: 0,
              studyHours: 0,
              goalToday: 'Set your target',
              createdAt: serverTimestamp() as any
            };
            await setDoc(docRef, newProfile);
            setProfile(newProfile as UserProfile);
          }
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error("Critical Profile Sync Failure:", err);
        // We catch here but don't re-throw immediately to allow setLoading(false)
        try {
          handleFirestoreError(err, OperationType.GET, user ? `users/${user.uid}` : 'auth');
        } catch (error: any) {
          setError(error.message);
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const login = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Login Error:", err);
      setError(err.message || "Failed to establish secure link with Google.");
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error("Logout Error:", err);
      setError("Failed to terminate session properly.");
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    setError(null);
    setLoading(true);
    try {
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, data, { merge: true });
      setProfile(prev => prev ? { ...prev, ...data } : null);
    } catch (err) {
      console.error("Profile Update Failed:", err);
      try {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
      } catch (error: any) {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, error, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

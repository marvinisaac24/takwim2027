import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, signInWithGoogle, logoutUser } from '../lib/firebase';
import { firebaseSync } from '../services/firebaseSync';
import { LogIn, LogOut, CheckCircle2 } from 'lucide-react';

interface FirebaseAuthButtonProps {
  onAuthChange?: (user: User | null) => void;
}

export const FirebaseAuthButton: React.FC<FirebaseAuthButtonProps> = ({ onAuthChange }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (onAuthChange) onAuthChange(currentUser);

      if (currentUser) {
        await firebaseSync.recordUserLogin({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
        });
      }
    });

    return () => unsubscribe();
  }, [onAuthChange]);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (err) {
      console.warn('Google sign-in cancelled or error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutUser();
      setMenuOpen(false);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-500 bg-slate-100 rounded-lg animate-pulse">
        <span className="w-2 h-2 rounded-full bg-slate-400"></span>
        <span className="hidden sm:inline">Firebase...</span>
      </div>
    );
  }

  if (user) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
          title={`Log masuk sebagai ${user.displayName || user.email}`}
        >
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'Pengguna'}
              className="w-4 h-4 rounded-full object-cover"
            />
          ) : (
            <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
              {(user.displayName || user.email || 'G')[0].toUpperCase()}
            </div>
          )}
          <span className="hidden sm:inline max-w-[90px] truncate font-medium">
            {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
          </span>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-3 py-2 border-b border-slate-100">
              <p className="text-xs font-semibold text-slate-900 truncate">{user.displayName || 'Guru Sekolah'}</p>
              <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
              <span className="inline-block mt-1 text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-md font-medium">
                Pangkalan Data Firestore Aktif
              </span>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Keluar</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleSignIn}
      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-blue-700 bg-white hover:bg-blue-50 border border-slate-300 rounded-lg transition-colors shadow-2xs"
      title="Log masuk menggunakan akaun Google / Delima KPM"
    >
      <LogIn className="w-3.5 h-3.5 text-blue-600" />
      <span className="hidden sm:inline">Log Masuk Google</span>
      <span className="sm:hidden">Log Masuk</span>
    </button>
  );
};

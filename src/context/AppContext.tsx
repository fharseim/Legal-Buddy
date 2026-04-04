import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Case } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AppContextType {
  user: User | null;
  isAdmin: boolean;
  cases: Case[];
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  addCase: (newCase: Case) => void;
  updateCase: (updatedCase: Case) => void;
  isAuthReady: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

/** Mappt einen Supabase-User auf unseren User-Typ */
function mapSupabaseUser(sb: {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}): User {
  const meta = sb.user_metadata ?? {};
  return {
    id: sb.id,
    email: sb.email ?? '',
    name: (meta['name'] as string) ?? sb.email?.split('@')[0] ?? 'Nutzer',
    plan: (meta['plan'] as User['plan']) ?? 'buddy',
    planStart: (meta['planStart'] as string) ?? new Date().toISOString(),
    planEnd:
      (meta['planEnd'] as string) ??
      new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    usageThisMonth: (meta['usageThisMonth'] as number) ?? 0,
    createdAt: (meta['createdAt'] as string) ?? new Date().toISOString(),
  };
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cases, setCases] = useState<Case[]>([]);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // ── Auth-Initialisierung ──────────────────────────────
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      // Echte Supabase-Auth
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUserState(mapSupabaseUser(session.user));
          setIsAdmin(session.user.user_metadata?.['role'] === 'admin');
        }
        setIsAuthReady(true);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          if (session?.user) {
            setUserState(mapSupabaseUser(session.user));
            setIsAdmin(session.user.user_metadata?.['role'] === 'admin');
          } else {
            setUserState(null);
            setIsAdmin(false);
          }
        }
      );

      return () => subscription.unsubscribe();
    } else {
      // Demo-Modus: localStorage
      try {
        const stored = localStorage.getItem('legal_buddy_user');
        if (stored) {
          const parsed = JSON.parse(stored) as User;
          setUserState(parsed);
          // Admin-Check: separates Flag, nicht E-Mail-Vergleich im produktiven Code
          setIsAdmin(localStorage.getItem('legal_buddy_is_admin') === 'true');
        }
      } catch {
        localStorage.removeItem('legal_buddy_user');
      }
      setIsAuthReady(true);
    }
  }, []);

  // ── Cases: localStorage ───────────────────────────────
  useEffect(() => {
    try {
      const stored = localStorage.getItem('legal_buddy_cases');
      if (stored) setCases(JSON.parse(stored) as Case[]);
    } catch { /* ignorieren */ }
  }, []);

  useEffect(() => {
    localStorage.setItem('legal_buddy_cases', JSON.stringify(cases));
  }, [cases]);

  // ── Mock-User im Demo-Modus persistieren ─────────────
  useEffect(() => {
    if (!isSupabaseConfigured) {
      if (user) {
        localStorage.setItem('legal_buddy_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('legal_buddy_user');
        localStorage.removeItem('legal_buddy_is_admin');
      }
    }
  }, [user]);

  const setUser = (u: User | null) => {
    setUserState(u);
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem('legal_buddy_user');
      localStorage.removeItem('legal_buddy_is_admin');
      setUserState(null);
      setIsAdmin(false);
    }
  };

  const addCase = (newCase: Case) =>
    setCases((prev) => [newCase, ...prev]);

  const updateCase = (updated: Case) =>
    setCases((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));

  return (
    <AppContext.Provider
      value={{ user, isAdmin, cases, setUser, logout, addCase, updateCase, isAuthReady }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within an AppProvider');
  return ctx;
};

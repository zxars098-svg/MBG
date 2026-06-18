import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import bcrypt from 'bcryptjs';
import type { Database, User } from './types';
import { initDatabase, saveDatabase } from './db';
import { supabase, SUPABASE_ENABLED } from './supabase';

interface AuthState {
  user: User | null;
  db: Database | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  setDb: (updater: (db: Database) => Database) => void;
  addAudit: (aksi: string, modul: string, detail: string) => void;
}

const AuthContext = createContext<AuthState | null>(null);
const SESSION_KEY = 'mbg_session_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [db, setDbState] = useState<Database | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    initDatabase().then((loaded) => {
      if (!mounted) return;
      setDbState(loaded);
      const session = sessionStorage.getItem(SESSION_KEY);
      if (session) {
        const u = loaded.users.find((x) => x.id === Number(session));
        if (u) setUser(u);
      }
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    console.log('Login attempt:', { username, SUPABASE_ENABLED });
    
    if (SUPABASE_ENABLED) {
      console.log('Trying Supabase auth...');
      
      // First, check all users in table
      const { data: allUsers, error: allError } = await supabase
        .from('users')
        .select('*');
      console.log('All users in database:', { allUsers, allError });
      
      // Now try to find specific user
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('username', username)
        .single();

      console.log('Supabase query result:', { data, error });
      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          status: (error as any).status,
          statusText: (error as any).statusText,
          hint: (error as any).hint,
          details: (error as any).details
        });
      }

      if (error || !data) {
        console.log('Supabase query failed, returning false');
        return false;
      }
      
      const userData = data as User;
      const ok = await bcrypt.compare(password, userData.password);
      console.log('Password match:', ok);
      
      if (!ok) return false;

      setUser(data);
      sessionStorage.setItem(SESSION_KEY, String(data.id));
      addAuditInternal(data.username, 'Login', 'Auth', 'Login berhasil');
      return true;
    }

    if (!db) return false;
    const found = db.users.find((u) => u.username.toLowerCase() === username.toLowerCase());
    if (!found) return false;
    const ok = await bcrypt.compare(password, found.password);
    if (!ok) return false;
    setUser(found);
    sessionStorage.setItem(SESSION_KEY, String(found.id));
    addAuditInternal(found.username, 'Login', 'Auth', 'Login berhasil');
    return true;
  };

  const logout = () => {
    if (user) addAuditInternal(user.username, 'Logout', 'Auth', 'Logout dari sistem');
    setUser(null);
    sessionStorage.removeItem(SESSION_KEY);
  };

  const addAuditInternal = (username: string, aksi: string, modul: string, detail: string) => {
    setDbState((prev) => {
      if (!prev) return prev;
      const next = { ...prev };
      next.audit_log = [
        ...prev.audit_log,
        {
          id: prev.audit_log.length ? Math.max(...prev.audit_log.map((a) => a.id)) + 1 : 1,
          timestamp: new Date().toISOString(),
          username,
          aksi,
          modul,
          detail,
        },
      ];
      saveDatabase(next);
      return next;
    });
  };

  const addAudit = (aksi: string, modul: string, detail: string) => {
    if (user) addAuditInternal(user.username, aksi, modul, detail);
  };

  const setDb = (updater: (db: Database) => Database) => {
    setDbState((prev) => {
      if (!prev) return prev;
      const next = updater(prev);
      saveDatabase(next);
      return next;
    });
  };

  return (
    <AuthContext.Provider value={{ user, db, loading, login, logout, setDb, addAudit }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

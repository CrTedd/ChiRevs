import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "../api/client";

export interface User {
  id: number;
  email: string;
  display_name: string | null;
  crit_weights?: Record<string, number>;
}

interface AuthState {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AuthState>(null as any);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  async function refresh() {
    if (!localStorage.getItem("cr_token")) {
      setUser(null);
      return;
    }
    try {
      const me = await api.me();
      setUser(me);
    } catch {
      localStorage.removeItem("cr_token");
      setUser(null);
    }
  }

  useEffect(() => {
    refresh().finally(() => setReady(true));
  }, []);

  async function login(email: string, password: string) {
    const data = await api.login(email, password);
    localStorage.setItem("cr_token", data.access_token);
    await refresh();
  }

  async function register(email: string, password: string, name: string) {
    await api.register(email, password, name);
  }

  function logout() {
    localStorage.removeItem("cr_token");
    setUser(null);
  }

  return (
    <Ctx.Provider value={{ user, ready, login, register, logout, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);

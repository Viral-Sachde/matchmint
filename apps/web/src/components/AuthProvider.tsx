"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, getToken, setToken } from "@/lib/api";
import type { OrgType, User } from "@/lib/types";

type Session = { token: string; user: User; joined?: "created" | "joined" | "pending" };
type Ctx = {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (input: { email: string; password: string; name: string; orgName: string; orgType?: OrgType }) => Promise<Session["joined"]>;
  logout: () => void;
  /** Re-reads the account, after the profile, team or verification changes. */
  refresh: () => Promise<void>;
};

const AuthContext = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getToken()) { setReady(true); return; }
    api<User>("/auth/me")
      .then(setUser)
      .catch((e) => { if (e?.status === 401) setToken(null); })
      .finally(() => setReady(true));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const s = await api<Session>("/auth/login", { method: "POST", body: { email, password }, auth: false });
    setToken(s.token); setUser(s.user);
    api<User>("/auth/me").then(setUser).catch(() => {});
  }, []);
  const signup = useCallback<Ctx["signup"]>(async (input) => {
    const s = await api<Session>("/auth/signup", { method: "POST", body: input, auth: false });
    setToken(s.token); setUser(s.user);
    return s.joined;
  }, []);
  const refresh = useCallback(async () => { setUser(await api<User>("/auth/me")); }, []);
  const logout = useCallback(() => { setToken(null); setUser(null); }, []);

  const value = useMemo(() => ({ user, ready, login, signup, logout, refresh }), [user, ready, login, signup, logout, refresh]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

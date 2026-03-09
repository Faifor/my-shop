"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "@/lib/api/requests";
import { tokenStorage } from "@/lib/api/client";
import type { AuthResponse, User } from "@/types/api";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (payload: { email: string; password: string }) => Promise<void>;
  register: (payload: { email: string; full_name: string; phone?: string; password: string }) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function handleAuth(response: AuthResponse, setUser: (user: User | null) => void) {
  tokenStorage.setTokens(response.tokens);
  setUser(response.user);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = async () => {
    try {
      const me = await authApi.me();
      setUser(me);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      await refreshMe();
      setLoading(false);
    };
    bootstrap();
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login: async (payload: { email: string; password: string }) => {
        const data = await authApi.login(payload);
        handleAuth(data, setUser);
      },
      register: async (payload: { email: string; full_name: string; phone?: string; password: string }) => {
        const data = await authApi.register(payload);
        handleAuth(data, setUser);
      },
      logout: () => {
        tokenStorage.clear();
        setUser(null);
      },
      refreshMe,
    }),
    [loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}

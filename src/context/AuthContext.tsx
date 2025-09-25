import { createContext, useState, useEffect, useContext } from "react";
import type { ReactNode } from "react";

type User = {
  sub: string;
  email: string;
  username: string;
} | null;

interface AuthContextType {
  user: User;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    try {
      const res = await fetch("http://localhost:3001/me", {
        credentials: "include",
      });
      if (res.ok) {
        const { user } = await res.json();
        setUser(user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
        setLoading(false);
    }
  }

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

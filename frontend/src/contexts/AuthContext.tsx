import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { authService } from '@/services/auth.service';
import { tokenManager } from '@/services/tokenManager';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setTokenAndUser: (token: string, user: User) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount using the httpOnly refresh cookie
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { accessToken } = await authService.refresh();
        tokenManager.setToken(accessToken);
        const userData = await authService.getMe();
        setUser(userData);
      } catch {
        // No valid session — user needs to log in
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    const { accessToken, user: userData } = await authService.login(email, password);
    tokenManager.setToken(accessToken);
    setUser(userData);
  };

  const register = async (email: string, username: string, password: string) => {
    const { accessToken, user: userData } = await authService.register(
      email,
      username,
      password
    );
    tokenManager.setToken(accessToken);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      tokenManager.setToken(null);
      setUser(null);
    }
  };

  const setTokenAndUser = (token: string, userData: User) => {
    tokenManager.setToken(token);
    setUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        setTokenAndUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within <AuthProvider>');
  }
  return context;
}

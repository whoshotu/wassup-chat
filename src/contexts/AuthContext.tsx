import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  primaryLanguage: string;
  viewerCountries: string[];
  stripeCustomerId?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('chatDecoder_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Simple localStorage-based auth
    const storedUsers = localStorage.getItem('chatDecoder_users');
    const users = storedUsers ? JSON.parse(storedUsers) : {};
    
    if (users[email] && users[email].password === password) {
      setUser(users[email].profile);
      localStorage.setItem('chatDecoder_user', JSON.stringify(users[email].profile));
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const signup = async (email: string, password: string) => {
    const storedUsers = localStorage.getItem('chatDecoder_users');
    const users = storedUsers ? JSON.parse(storedUsers) : {};
    
    if (users[email]) {
      throw new Error('User already exists');
    }
    
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      primaryLanguage: 'English',
      viewerCountries: [],
    };
    
    users[email] = { password, profile: newUser };
    localStorage.setItem('chatDecoder_users', JSON.stringify(users));
    setUser(newUser);
    localStorage.setItem('chatDecoder_user', JSON.stringify(newUser));
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('chatDecoder_user');
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('chatDecoder_user', JSON.stringify(updatedUser));
      
      // Update in users storage
      const storedUsers = localStorage.getItem('chatDecoder_users');
      const users = storedUsers ? JSON.parse(storedUsers) : {};
      if (users[user.email]) {
        users[user.email].profile = updatedUser;
        localStorage.setItem('chatDecoder_users', JSON.stringify(users));
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import client from './api/client';

export interface RolePermission {
  resource_name: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: string;
  is_admin?: boolean;
  permissions?: RolePermission[];
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
  hasPermission: (resource: string, action: keyof Omit<RolePermission, 'resource_name'>) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const response = await client.get('/auth/me');
      if (response.data?.status === 'success') {
        setUser(response.data.data);
        setIsAuthenticated(true);
      } else {
        throw new Error("Failed to fetch user");
      }
    } catch (err) {
      console.error(err);
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem('token', token);
    setIsLoading(true);
    fetchUser();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  const hasPermission = (resource: string, action: keyof Omit<RolePermission, 'resource_name'>) => {
    if (!user) return false;
    if (user.is_admin) return true;
    
    const perm = user.permissions?.find(p => p.resource_name === resource);
    if (!perm) return false;
    return perm[action];
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

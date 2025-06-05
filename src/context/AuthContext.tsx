import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, AuthContextType } from '../types';
import database from '../db/database';

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  login: async () => null,
  register: async () => null,
  logout: () => {},
  isAuthenticated: false,
  refreshUser: async () => {},
  isAdmin: false
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('hackademy_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user && typeof user.id === 'string' && user.id.trim() !== '') {
          setCurrentUser(user);
          setIsAuthenticated(true);
          setIsAdmin(user.role === 'admin');
        } else {
          localStorage.removeItem('hackademy_user');
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('hackademy_user');
      }
    }
  }, []);

  const refreshUser = async () => {
    if (currentUser?.id) {
      const updatedUser = await database.getUser(currentUser.id);
      if (updatedUser) {
        setCurrentUser(updatedUser);
        setIsAdmin(updatedUser.role === 'admin');
        localStorage.setItem('hackademy_user', JSON.stringify(updatedUser));
      }
    }
  };

  const login = async (username: string, password: string): Promise<User | null> => {
    try {
      const user = await database.loginUser(username, password);
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
        setIsAdmin(user.role === 'admin');
        localStorage.setItem('hackademy_user', JSON.stringify(user));
        return user;
      }
      return null;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (username: string, password: string): Promise<User | null> => {
    try {
      const user = await database.registerUser(username, password);
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
        setIsAdmin(user.role === 'admin');
        localStorage.setItem('hackademy_user', JSON.stringify(user));
        return user;
      }
      return null;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    localStorage.removeItem('hackademy_user');
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    isAuthenticated,
    refreshUser,
    isAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
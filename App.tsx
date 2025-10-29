
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { User, Theme } from './types';
import { UserRole } from './types';
import { api } from './services/api';
import LoginScreen from './components/LoginScreen';
import POS from './components/pos/POS';
import AdminDashboard from './components/admin/AdminDashboard';
import { ThemeContext } from './contexts/ThemeContext';
import { AuthContext } from './contexts/AuthContext';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  const handleLogin = useCallback(async (username: string, pin: string) => {
    const loggedInUser = await api.login(username, pin);
    if (loggedInUser) {
      setUser(loggedInUser);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
    }
    return loggedInUser;
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const authContextValue = useMemo(() => ({ user, login: handleLogin, logout: handleLogout }), [user, handleLogin, handleLogout]);
  const themeContextValue = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-t-primary-500 border-gray-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      <ThemeContext.Provider value={themeContextValue}>
        <div className="min-h-screen text-gray-900 dark:text-gray-100">
          {!user ? (
            <LoginScreen />
          ) : (
            <>
              {user.role === UserRole.ADMIN ? (
                <AdminDashboard />
              ) : (
                <POS />
              )}
            </>
          )}
        </div>
      </ThemeContext.Provider>
    </AuthContext.Provider>
  );
};

export default App;
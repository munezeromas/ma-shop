import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import db from '../utils/db';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    if (!username || !password) {
      return { success: false, error: 'Missing credentials' };
    }

    console.log('Login attempt for:', username);

    // FIRST: Try local authentication (for admin/emilys)
    try {
      const localUser = db.authenticate(username, password);
      if (localUser) {
        console.log('Local auth successful:', localUser);
        setUser(localUser);
        localStorage.setItem('user', JSON.stringify(localUser));
        localStorage.setItem('token', `local-token-${localUser.id}`);
        return { success: true, user: localUser };
      }
    } catch (localErr) {
      console.log('Local auth error:', localErr);
    }

    // SECOND: Try API authentication
    try {
      const res = await api.post(
        '/auth/login',
        { username, password },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const data = res.data;
      console.log('API auth response:', data);

      const userData = {
        id: data.id ? `u-${data.id}` : `u-${Date.now()}`,
        username: data.username || username,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        role: data.role || 'user',
        avatar: data.avatar || db.getAvatarUrl(username),
        token: data.token || `api-token-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      // Sync with local db
      try {
        const existing = db.getUserByUsername(userData.username);
        if (!existing) {
          db.addUser({
            username: userData.username,
            password: '', // Don't store API passwords
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role,
          });
        }
      } catch (e) {
        console.warn('Local DB sync failed', e);
      }

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', userData.token);

      db.logActivity({
        actor: userData.username,
        type: 'login',
        message: `User ${userData.username} logged in`,
      });

      return { success: true, user: userData };
    } catch (err) {
      console.log('API auth error:', err);
      return {
        success: false,
        error: err?.response?.data?.message || err.message || 'Invalid credentials',
      };
    }
  };

  const register = async ({ username, password, firstName = '', lastName = '' }) => {
    try {
      const u = db.addUser({
        username,
        password,
        firstName,
        lastName,
        role: 'user',
      });

      const { password: _p, ...safe } = u;
      setUser(safe);
      localStorage.setItem('user', JSON.stringify(safe));
      localStorage.setItem('token', 'demo-token-' + safe.id);

      return { success: true, user: safe };
    } catch (err) {
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        loading,
        isAuthenticated: !!user,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
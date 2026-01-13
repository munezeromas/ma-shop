import { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

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
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    if (!username || !password) {
      return { success: false, error: 'Missing credentials' };
    }

    try {
      // Call API login
      const result = await authService.login(username, password);
      
      if (result.success) {
        const apiData = result.data;
        
        // Transform API response to our user format
        const userData = {
          id: apiData.id,
          username: apiData.username,
          email: apiData.email,
          firstName: apiData.firstName,
          lastName: apiData.lastName,
          gender: apiData.gender,
          image: apiData.image,
          role: username === 'emilys' ? 'admin' : 'user', // Make emilys admin
          token: apiData.accessToken,
          refreshToken: apiData.refreshToken,
        };

        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', apiData.accessToken);
        localStorage.setItem('refreshToken', apiData.refreshToken);

        return { success: true, user: userData };
      }

      return result;
    } catch (err) {
      console.error('Login error:', err);
      return {
        success: false,
        error: err?.message || 'Login failed',
      };
    }
  };

  const register = async ({ username, password, firstName = '', lastName = '', email = '' }) => {
    // Note: DummyJSON doesn't have a real register endpoint
    // We'll simulate it by creating a user object
    // In production, you'd call a real registration API
    
    try {
      // For demo purposes, we'll create a mock user
      // In real app, call your backend registration API
      const userData = {
        id: Date.now(),
        username,
        email: email || `${username}@example.com`,
        firstName,
        lastName,
        role: 'user',
        image: `https://dummyjson.com/icon/${username}/128`,
        token: `demo-token-${Date.now()}`,
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', userData.token);

      return { success: true, user: userData };
    } catch (err) {
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  };

  const refreshUserToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      logout();
      return { success: false };
    }

    const result = await authService.refreshToken(refreshToken);
    
    if (result.success) {
      const apiData = result.data;
      const updatedUser = {
        ...user,
        token: apiData.accessToken,
        refreshToken: apiData.refreshToken,
      };

      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('token', apiData.accessToken);
      localStorage.setItem('refreshToken', apiData.refreshToken);

      return { success: true };
    }

    logout();
    return { success: false };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        refreshUserToken,
        loading,
        isAuthenticated: !!user,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
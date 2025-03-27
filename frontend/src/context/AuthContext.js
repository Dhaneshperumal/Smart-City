import React, { createContext, useState, useContext, useEffect } from 'react';
import * as authService from '../services/auth';

// Create authentication context
const AuthContext = createContext(null);

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user on mount or when token changes
  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      setError(null);
      
      if (!token) {
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
      
      try {
        const userData = await authService.getCurrentUser();
        
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setToken(null);
          setIsAuthenticated(false);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (err) {
        console.error('Error loading user:', err);
        setError(err.message || 'Failed to load user');
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, [token]);

  // Login user
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await authService.login(email, password);
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      return data;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register user
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await authService.register(userData);
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      return data;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login with Google
  const loginWithGoogle = async (googleToken) => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock the Google auth flow since we can't implement the actual flow here
      // In a real app, you would use Google's OAuth API to get a token
      console.log('Simulating Google login flow');
      
      // This would normally come from Google's OAuth response
      const mockGoogleToken = googleToken || 'mock_google_token';
      
      const data = await authService.loginWithGoogle(mockGoogleToken);
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      return data;
    } catch (err) {
      setError(err.message || 'Google login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login with Facebook
  const loginWithFacebook = async (accessToken) => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock the Facebook auth flow since we can't implement the actual flow here
      // In a real app, you would use Facebook's OAuth API to get a token
      console.log('Simulating Facebook login flow');
      
      // This would normally come from Facebook's OAuth response
      const mockFacebookToken = accessToken || 'mock_facebook_token';
      
      const data = await authService.loginWithFacebook(mockFacebookToken);
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      return data;
    } catch (err) {
      setError(err.message || 'Facebook login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    setLoading(true);
    
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedUser = await authService.updateProfile(profileData);
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update password
  const updatePassword = async (currentPassword, newPassword) => {
    setLoading(true);
    setError(null);
    
    try {
      await authService.updatePassword(currentPassword, newPassword);
    } catch (err) {
      setError(err.message || 'Failed to update password');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        isAuthenticated,
        login,
        register,
        loginWithGoogle,
        loginWithFacebook,
        logout,
        updateProfile,
        updatePassword,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CitizenUser, AuthMode } from '../types';

interface AuthContextType {
  user: CitizenUser | null;
  authMode: AuthMode;
  isLoading: boolean;
  continueAsGuest: () => Promise<void>;
  loginWithPhone: (phoneNumber: string, fullName?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (fullName: string, neighborhood: string) => Promise<void>;
}

const STORAGE_USER_KEY = '@aleis_citizen_user';
const STORAGE_MODE_KEY = '@aleis_auth_mode';

const AuthContext = createContext<AuthContextType>({
  user: null,
  authMode: 'unauthenticated',
  isLoading: true,
  continueAsGuest: async () => {},
  loginWithPhone: async () => false,
  logout: async () => {},
  updateProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CitizenUser | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('unauthenticated');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      // Ensure Firebase Auth is anonymously signed in to satisfy Storage Rules
      try {
        const { signInAnonymously } = await import('firebase/auth');
        const { auth } = await import('../config/firebase');
        await signInAnonymously(auth);
      } catch (authError) {
        console.warn('Firebase anonymous auth failed:', authError);
      }

      const storedMode = await AsyncStorage.getItem(STORAGE_MODE_KEY);
      const storedUserJson = await AsyncStorage.getItem(STORAGE_USER_KEY);

      if (storedMode === 'guest') {
        setAuthMode('guest');
        setUser({
          uid: 'guest_' + Math.random().toString(36).substring(2, 9),
          phoneNumber: '',
          fullName: 'زائر',
          isGuest: true,
        });
      } else if (storedMode === 'authenticated' && storedUserJson) {
        setAuthMode('authenticated');
        setUser(JSON.parse(storedUserJson));
      }
    } catch (e) {
      console.warn('Failed to load local auth session', e);
    } finally {
      setIsLoading(false);
    }
  };

  const continueAsGuest = async () => {
    setIsLoading(true);
    const guestUser: CitizenUser = {
      uid: 'guest_' + Date.now(),
      phoneNumber: '',
      fullName: 'مواطن كزائر',
      isGuest: true,
    };
    try {
      await AsyncStorage.setItem(STORAGE_MODE_KEY, 'guest');
      await AsyncStorage.setItem(STORAGE_USER_KEY, JSON.stringify(guestUser));
      setUser(guestUser);
      setAuthMode('guest');
    } catch (err) {
      console.error('Error enabling guest mode:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithPhone = async (phoneNumber: string, fullName?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Create user session object
      const authUser: CitizenUser = {
        uid: 'user_' + Date.now(),
        phoneNumber: phoneNumber,
        fullName: fullName || 'مواطن مسجل',
        isGuest: false,
      };

      await AsyncStorage.setItem(STORAGE_MODE_KEY, 'authenticated');
      await AsyncStorage.setItem(STORAGE_USER_KEY, JSON.stringify(authUser));

      setUser(authUser);
      setAuthMode('authenticated');
      return true;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (fullName: string, neighborhood: string) => {
    if (!user) return;
    const updated = { ...user, fullName, neighborhood };
    setUser(updated);
    if (!user.isGuest) {
      await AsyncStorage.setItem(STORAGE_USER_KEY, JSON.stringify(updated));
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.removeItem(STORAGE_MODE_KEY);
      await AsyncStorage.removeItem(STORAGE_USER_KEY);
      setUser(null);
      setAuthMode('unauthenticated');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authMode,
        isLoading,
        continueAsGuest,
        loginWithPhone,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AppScreen = 'splash' | 'welcome' | 'login' | 'admin' | 'main';

interface AppState {
  currentScreen: AppScreen;
  isLoggedIn: boolean;
  userType: 'user' | 'admin' | null;
  userData: {
    username: string;
    role: string;
  } | null;
}

interface AppContextType extends AppState {
  setCurrentScreen: (screen: AppScreen) => void;
  login: (userType: 'user' | 'admin', credentials: { username: string; password: string }) => void;
  logout: () => void;
  goBack: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    currentScreen: 'splash',
    isLoggedIn: false,
    userType: null,
    userData: null,
  });

  // Load saved state on app start
  useEffect(() => {
    // Always start with splash screen
    setState(prev => ({ ...prev, currentScreen: 'splash' }));
    // loadSavedState(); // Commented out to always show splash screen
  }, []);

  const loadSavedState = async () => {
    try {
      const savedState = await AsyncStorage.getItem('appState');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        setState(prev => ({ ...prev, ...parsedState }));
      }
    } catch (error) {
      console.error('Error loading saved state:', error);
    }
  };

  const saveState = async (newState: Partial<AppState>) => {
    try {
      await AsyncStorage.setItem('appState', JSON.stringify(newState));
    } catch (error) {
      console.error('Error saving state:', error);
    }
  };

  const setCurrentScreen = (screen: AppScreen) => {
    setState(prev => {
      const newState = { ...prev, currentScreen: screen };
      saveState(newState);
      return newState;
    });
  };

  const login = (userType: 'user' | 'admin', credentials: { username: string; password: string }) => {
    const userData = {
      username: credentials.username,
      role: userType === 'admin' ? 'admin' : 'pilot',
    };

    setState(prev => {
      const newState = {
        ...prev,
        isLoggedIn: true,
        userType,
        userData,
        currentScreen: userType === 'admin' ? 'admin' : 'main',
      };
      saveState(newState);
      return newState;
    });
  };

  const logout = () => {
    setState(prev => {
      const newState = {
        ...prev,
        isLoggedIn: false,
        userType: null,
        userData: null,
        currentScreen: 'welcome',
      };
      saveState(newState);
      return newState;
    });
  };

  const goBack = () => {
    setState(prev => {
      let newScreen: AppScreen = 'welcome';
      
      if (prev.currentScreen === 'login') {
        newScreen = 'welcome';
      } else if (prev.currentScreen === 'admin') {
        newScreen = prev.isLoggedIn ? 'main' : 'welcome';
      } else if (prev.currentScreen === 'main') {
        newScreen = 'welcome';
      }

      const newState = { ...prev, currentScreen: newScreen };
      saveState(newState);
      return newState;
    });
  };

  const value: AppContextType = {
    ...state,
    setCurrentScreen,
    login,
    logout,
    goBack,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
}

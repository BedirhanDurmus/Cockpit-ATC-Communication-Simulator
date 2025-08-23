import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAppState } from '../hooks/useAppState';
import SplashScreen from './SplashScreen';
import WelcomeScreen from './WelcomeScreen';
import LoginScreen from './LoginScreen';
import AdminPanel from './AdminPanel';
import TrainingScreen from '../app/(tabs)/index';

export default function AppNavigator() {
  const { currentScreen, setCurrentScreen, login, logout, goBack } = useAppState();

  const handleSplashComplete = () => {
    setCurrentScreen('welcome');
  };

  const handleUserLogin = () => {
    setCurrentScreen('login');
  };

  const handleAdminLogin = () => {
    setCurrentScreen('login');
  };

  const handleLogin = (userData: { username: string; role: string }) => {
    login(userData.role === 'admin' ? 'admin' : 'user', { username: userData.username, password: '' });
  };

  const handleLogout = () => {
    logout();
  };

  const handleBack = () => {
    goBack();
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen onComplete={handleSplashComplete} />;
      
      case 'welcome':
        return (
          <WelcomeScreen
            onUserLogin={handleUserLogin}
            onAdminLogin={handleAdminLogin}
          />
        );
      
      case 'login':
        return (
          <LoginScreen
            onLogin={handleLogin}
            onAdminLogin={handleLogin}
            onBack={handleBack}
          />
        );
      
      case 'admin':
        return (
          <AdminPanel
            onLogout={handleLogout}
            onBack={handleBack}
          />
        );
      
      case 'main':
        return <TrainingScreen />;
      
      default:
        return <SplashScreen onComplete={handleSplashComplete} />;
    }
  };

  return (
    <View style={styles.container}>
      {renderScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

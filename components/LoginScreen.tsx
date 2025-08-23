import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen({ onLogin, onAdminLogin, onBack }: {
  onLogin: (userData: { username: string; role: string }) => void;
  onAdminLogin: (userData: { username: string; role: string }) => void;
  onBack: () => void;
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminLogin, setIsAdminLogin] = useState(false);

  const handleLogin = () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    if (isAdminLogin) {
      // Admin login logic
      if (username === 'admin' && password === 'admin123') {
        onAdminLogin({ username, role: 'admin' });
      } else {
        Alert.alert('Error', 'Invalid admin credentials');
      }
    } else {
      // Regular user login logic
      if (username === 'pilot' && password === 'pilot123') {
        onLogin({ username, role: 'pilot' });
      } else {
        Alert.alert('Error', 'Invalid credentials');
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Arka plan fotoğrafı */}
      <Image 
        source={require('../assets/images/cockpit_gri.jpeg')} 
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      
      {/* Gradient overlay */}
      <LinearGradient
        colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)', 'rgba(0,0,0,0.9)']}
        style={styles.gradientOverlay}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#FFD700" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>ATC TRAINING</Text>
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            <View style={styles.logoContainer}>
              <View style={styles.airplaneLogo}>
                <Text style={styles.airplaneSymbol}>✈️</Text>
              </View>
              <Text style={styles.appTitle}>ATC COMMUNICATION</Text>
              <Text style={styles.appSubtitle}>TRAINING SIMULATOR</Text>
            </View>

            <View style={styles.form}>
              <Text style={styles.formTitle}>
                {isAdminLogin ? 'ADMIN LOGIN' : 'PILOT LOGIN'}
              </Text>
              
              <View style={styles.inputContainer}>
                <Ionicons name="person" size={20} color="#FFD700" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor="#666"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={20} color="#FFD700" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#666"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginButtonText}>
                  {isAdminLogin ? 'ADMIN LOGIN' : 'PILOT LOGIN'}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#000" />
              </TouchableOpacity>

              {/* Demo Credentials */}
              <View style={styles.demoCredentials}>
                <Text style={styles.demoTitle}>Demo Credentials:</Text>
                {isAdminLogin ? (
                  <Text style={styles.demoText}>Admin: admin / admin123</Text>
                ) : (
                  <Text style={styles.demoText}>Pilot: pilot / pilot123</Text>
                )}
              </View>
            </View>

            {/* Toggle Login Type */}
            <TouchableOpacity 
              style={styles.toggleButton} 
              onPress={() => setIsAdminLogin(!isAdminLogin)}
            >
              <Text style={styles.toggleText}>
                {isAdminLogin ? 'Switch to Pilot Login' : 'Switch to Admin Login'}
              </Text>
              <Ionicons 
                name={isAdminLogin ? "person" : "shield-checkmark"} 
                size={20} 
                color="#FFD700" 
              />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: '100%',
    height: '100%',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    zIndex: 1,
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  formContainer: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 20,
    padding: 30,
    marginTop: 50,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  airplaneLogo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  airplaneSymbol: {
    fontSize: 50,
    color: '#FFD700',
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  appSubtitle: {
    fontSize: 16,
    color: '#B8860B',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  form: {
    width: '100%',
    alignItems: 'center',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 25,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    width: '100%',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 25,
    marginTop: 20,
    width: '100%',
    borderWidth: 2,
    borderColor: '#B8860B',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  demoCredentials: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 8,
    padding: 15,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    width: '100%',
  },
  demoTitle: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  demoText: {
    color: '#E0E0E0',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginTop: 20,
    width: '100%',
    borderWidth: 2,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  toggleText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen({ onUserLogin, onAdminLogin }: {
  onUserLogin: () => void;
  onAdminLogin: () => void;
}) {
  return (
    <View style={styles.container}>
             {/* Arka plan fotoğrafı */}
       <Image 
         source={require('../assets/images/aviation_team.jpeg')} 
         style={styles.backgroundImage}
         resizeMode="cover"
       />
      
             {/* Gradient overlay */}
       <LinearGradient
         colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.95)']}
         style={styles.gradientOverlay}
       />

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        style={styles.scrollView}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.appTitle}>ATC COMMUNICATION</Text>
            <Text style={styles.appSubtitle}>TRAINING SIMULATOR</Text>
            <Text style={styles.appDescription}>
            Welcome to the Professional ATC Communication Training Platform. Enhance your aviation skills with realistic scenarios and our advanced simulator.
            </Text>
          </View>
        </View>



        {/* Key Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Key Features</Text>
          
          <View style={styles.featureCard}>
            <Ionicons name="mic" size={24} color="#FFD700" />
            <Text style={styles.featureTitle}>Voice Recognition</Text>
            <Text style={styles.featureText}>Advanced speech-to-text technology for realistic communication</Text>
          </View>
          
          <View style={styles.featureCard}>
            <Ionicons name="airplane" size={24} color="#FFD700" />
            <Text style={styles.featureTitle}>Flight Simulation</Text>
            <Text style={styles.featureText}>Realistic flight scenarios and ATC procedures</Text>
          </View>
          
          <View style={styles.featureCard}>
            <Ionicons name="analytics" size={24} color="#FFD700" />
            <Text style={styles.featureTitle}>Performance Tracking</Text>
            <Text style={styles.featureText}>Monitor your progress and improve your skills</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Quick Statistics</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>500+</Text>
              <Text style={styles.statLabel}>Training Scenarios</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>98%</Text>
              <Text style={styles.statLabel}>Success Rate</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>24/7</Text>
              <Text style={styles.statLabel}>Available</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>50+</Text>
              <Text style={styles.statLabel}>Flight Schools</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={onUserLogin}
            activeOpacity={0.7}
          >
            <Ionicons name="person" size={24} color="#000" />
            <Text style={styles.primaryButtonText}>Start Training</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={onAdminLogin}
            activeOpacity={0.7}
          >
            <Ionicons name="shield-checkmark" size={24} color="#FFD700" />
            <Text style={styles.secondaryButtonText}>Admin Panel</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2024 Aviation Training Systems</Text>
          <Text style={styles.footerSubtext}>Professional ATC Communication Training</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Fallback background
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
    zIndex: -1, // Ensure it's behind other content
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
    zIndex: 0, // Background image ile aynı seviyede
  },
  scrollView: {
    flex: 1,
    zIndex: 10, // En üstte olmalı
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 100, // Daha fazla alt boşluk
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
    paddingTop: 60,
    flex: 1,
    minHeight: 300,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    maxWidth: 400,
  },
  airplaneLogo: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 4,
    borderColor: '#FFD700',
  },
  airplaneSymbol: {
    fontSize: 80,
    color: '#FFD700',
  },
  appTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
    letterSpacing: 2,
  },
  appSubtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#B8860B',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginBottom: 20,
    letterSpacing: 1,
  },
  appDescription: {
    fontSize: 15,
    color: '#E0E0E0',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    lineHeight: 22,
    maxWidth: 350,
    opacity: 0.9,
    marginBottom: 15,
    fontWeight: '400',
  },
  appDescriptionSubtext: {
    fontSize: 14,
    color: '#B8860B',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    lineHeight: 20,
    maxWidth: 320,
    opacity: 0.8,
    fontStyle: 'italic',
    fontWeight: '400',
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  welcomeText: {
    fontSize: 16,
    color: '#E0E0E0',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  welcomeSubtext: {
    fontSize: 14,
    color: '#B8860B',
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.8,
  },
  featuresSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 1,
  },
     featureCard: {
     backgroundColor: 'rgba(0, 0, 0, 0.6)',
     borderRadius: 12,
     padding: 20,
     marginBottom: 15,
     alignItems: 'center',
     borderWidth: 2,
     borderColor: 'rgba(255, 215, 0, 0.5)',
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 4 },
     shadowOpacity: 0.3,
     shadowRadius: 8,
     elevation: 8,
   },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  featureText: {
    fontSize: 12,
    color: '#E0E0E0',
    textAlign: 'center',
    lineHeight: 16,
  },
  statsSection: {
    marginBottom: 40,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
     statCard: {
     width: (width - 60) / 2,
     backgroundColor: 'rgba(0, 0, 0, 0.6)',
     borderRadius: 12,
     padding: 20,
     marginBottom: 15,
     alignItems: 'center',
     borderWidth: 2,
     borderColor: 'rgba(255, 215, 0, 0.5)',
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 4 },
     shadowOpacity: 0.3,
     shadowRadius: 8,
     elevation: 8,
   },
  statNumber: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFD700',
    marginBottom: 8,
    letterSpacing: 1,
  },
  statLabel: {
    fontSize: 13,
    color: '#E0E0E0',
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  actionsSection: {
    marginBottom: 40,
    paddingHorizontal: 10,
    paddingTop: 20,
  },
          primaryButton: {
       borderRadius: 16,
       overflow: 'hidden',
       backgroundColor: '#FFD700',
       padding: 30,
       alignItems: 'center',
       flexDirection: 'row',
       justifyContent: 'center',
       marginBottom: 20,
       borderWidth: 3,
       borderColor: '#B8860B',
       shadowColor: '#000',
       shadowOffset: { width: 0, height: 6 },
       shadowOpacity: 0.5,
       shadowRadius: 12,
       elevation: 12,
       minHeight: 60,
     },
     primaryButtonText: {
     color: '#000',
     fontSize: 20,
     fontWeight: 'bold',
     marginLeft: 10,
     textShadowColor: 'rgba(255, 255, 255, 0.8)',
     textShadowOffset: { width: 1, height: 1 },
     textShadowRadius: 3,
   },
          secondaryButton: {
       borderRadius: 16,
       overflow: 'hidden',
       backgroundColor: 'rgba(255, 215, 0, 0.3)',
       padding: 30,
       alignItems: 'center',
       flexDirection: 'row',
       justifyContent: 'center',
       borderWidth: 3,
       borderColor: '#FFD700',
       shadowColor: '#000',
       shadowOffset: { width: 0, height: 6 },
       shadowOpacity: 0.5,
       shadowRadius: 12,
       elevation: 12,
       minHeight: 60,
     },
     secondaryButtonText: {
     color: '#FFD700',
     fontSize: 20,
     fontWeight: 'bold',
     marginLeft: 10,
     textShadowColor: 'rgba(0, 0, 0, 0.9)',
     textShadowOffset: { width: 2, height: 2 },
     textShadowRadius: 4,
   },
  footer: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 215, 0, 0.3)',
  },
  footerText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 5,
    fontWeight: '500',
  },
  footerSubtext: {
    color: '#999',
    fontSize: 12,
    fontWeight: '400',
    fontStyle: 'italic',
  },
});

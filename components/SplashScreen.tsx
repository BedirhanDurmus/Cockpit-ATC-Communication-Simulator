import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Image, TouchableOpacity } from 'react-native';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const imageFadeAnim = useRef(new Animated.Value(1)).current;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [imageLoadProgress, setImageLoadProgress] = useState(0);
  const [cachedImages, setCachedImages] = useState<any[]>([]);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [showAudioButton, setShowAudioButton] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  
  // Havacılık fotoğrafları
  const aviationImages = [
    require('../assets/images/splash_cockpit.jpg'),
    require('../assets/images/aviation_team.jpeg'),
    require('../assets/images/PFD.jpeg'),
    require('../assets/images/airbusA380.jpg'),
    require('../assets/images/pervaneli.jpeg'),
    require('../assets/images/gece_ucak.jpeg'),
    require('../assets/images/cockpit_gri.jpeg'),
  ];

  // Fotoğrafları önceden yükle ve cache'le
  useEffect(() => {
    const preloadImages = async () => {
      try {
        // Web'de basit yükleme - resolveAssetSource kullanma
        const cached = [...aviationImages];
        setCachedImages(cached);
        setImagesLoaded(true);
        setImageLoadProgress(100);
      } catch (error) {
        console.log('Fotoğraf yükleme hatası:', error);
        // Hata olsa bile devam et
        setCachedImages(aviationImages);
        setImagesLoaded(true);
        setImageLoadProgress(100);
      }
    };
    
    preloadImages();
  }, []);

  // Ses dosyasını yükle ve çal
  useEffect(() => {
    const loadAndPlaySound = async () => {
      try {
        console.log('🎵 Ses dosyası yükleniyor...');
        
        // Audio session'ı ayarla
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
        
        console.log('🔊 Audio session ayarlandı');

        // Ses dosyasını yükle
        const { sound: audioSound } = await Audio.Sound.createAsync(
          require('../assets/sound/Ucak_sesi.mp3'),
          { 
            shouldPlay: false, // Önce yükle, sonra çal
            volume: 1.0,
            isLooping: false,
            isMuted: false
          }
        );
        
        console.log('📁 Ses dosyası yüklendi');
        setSound(audioSound);
        setAudioLoaded(true);
        
        // Ses durumunu takip et
        audioSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            console.log('📊 Ses durumu:', {
              isPlaying: status.isPlaying,
              durationMillis: status.durationMillis,
              positionMillis: status.positionMillis
            });
            
            if (status.didJustFinish) {
              console.log('✅ Ses bitti, temizleniyor...');
              audioSound.unloadAsync();
            }
          }
        });
        
        // Web'de otomatik ses çalma izni yok, buton göster
        setShowAudioButton(true);
        
      } catch (error) {
        console.error('❌ Ses yükleme hatası:', error);
      }
    };

    // Fotoğraflar yüklendikten sonra sesi çal
    if (imagesLoaded) {
      console.log('🖼️ Fotoğraflar yüklendi, ses başlatılıyor...');
      loadAndPlaySound();
    }

    // Cleanup
    return () => {
      if (sound) {
        console.log('🧹 Ses temizleniyor...');
        sound.unloadAsync();
      }
    };
  }, [imagesLoaded]);

  // Manuel ses çalma fonksiyonu
  const playAudioManually = async () => {
    if (sound && audioLoaded) {
      try {
        console.log('▶️ Manuel ses çalma başlatılıyor...');
        await sound.playAsync();
        console.log('🎵 Ses çalınıyor!');
        setShowAudioButton(false); // Butonu gizle
      } catch (error) {
        console.error('❌ Manuel ses çalma hatası:', error);
      }
    }
  };

  useEffect(() => {
    // Fotoğraflar yüklenmeden animasyonları başlatma
    if (!imagesLoaded) return;
    
    // Fotoğraf değişimi animasyonu - instant geçiş
    const imageInterval = setInterval(() => {
      // Fotoğrafı hemen değiştir (fade olmadan)
      setCurrentImageIndex((prev) => (prev + 1) % aviationImages.length);
    }, 1500); // Her 1.5 saniyede bir değişsin

    // Yükleme progress animasyonu - fotoğraf değişimi ile senkronize
    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2; // Daha hızlı artsın
      });
    }, 150); // Progress interval'ı da 150ms yap

    // Ana animasyonlar
    const animations = [
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ];

    Animated.sequence(animations).start();

    // Splash ekranı süresi - tüm fotoğraflar dönsün (7 fotoğraf x 1.5 saniye = 10.5 saniye)
    const timer = setTimeout(() => {
      onComplete();
    }, 10500);

    return () => {
      clearInterval(imageInterval);
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, [fadeAnim, scaleAnim, slideAnim, onComplete]);

  return (
    <View style={styles.container}>
            {/* Arka plan fotoğrafları - Tümü önceden yüklenmiş */}
      {cachedImages.length > 0 ? (
        cachedImages.map((imageSource, index) => (
          <Animated.Image 
            key={index}
            source={imageSource} 
            style={[
              styles.backgroundImage,
              {
                opacity: index === currentImageIndex ? 1 : 0,
                zIndex: index === currentImageIndex ? 1 : 0,
              }
            ]}
            resizeMode="cover"
            fadeDuration={0}
          />
        ))
      ) : (
        // Fallback - ilk fotoğraf
        <Animated.Image 
          source={aviationImages[0]} 
          style={styles.backgroundImage}
          resizeMode="cover"
          fadeDuration={0}
        />
      )}
      
      {/* Gradient overlay */}
      <ExpoLinearGradient
        colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
        style={styles.gradientOverlay}
      />

      {/* Ana içerik */}
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: slideAnim }
            ]
          }
        ]}
      >
        {/* Logo ve başlık */}
        <View style={styles.logoContainer}>
          <Text style={styles.appTitle}>ATC COMMUNICATION</Text>
          <Text style={styles.appSubtitle}>TRAINING SIMULATOR</Text>
          <Text style={styles.appDescription}>
            Professional Air Traffic Control Communication Training Platform
          </Text>
        </View>

        {/* Yükleniyor işareti - Uçak animasyonu */}
        <View style={styles.loadingContainer}>
          <View style={styles.airplaneLoading}>
            {/* Uçak ikonu kaldırıldı */}
            
            {/* Fotoğraf yükleme progress */}
            {!imagesLoaded && (
              <View style={styles.imageLoadingContainer}>
                <Text style={styles.imageLoadingText}>Initializing Visual Assets</Text>
                <View style={styles.imageLoadingBar}>
                  <Animated.View 
                    style={[
                      styles.imageLoadingProgress, 
                      { width: `${imageLoadProgress}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.imageLoadingPercentage}>{Math.round(imageLoadProgress)}%</Text>
              </View>
            )}
            
            {/* Sistem yükleme progress */}
            {imagesLoaded && (
              <>
                <View style={styles.loadingBar}>
                  <Animated.View 
                    style={[
                      styles.loadingProgress, 
                      { width: `${loadingProgress}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.loadingText}>INITIALIZING TRAINING SYSTEMS</Text>
                <Text style={styles.loadingPercentage}>{loadingProgress}%</Text>
                
                {/* Web için ses çalma butonu */}
                {showAudioButton && (
                  <View style={styles.audioButtonContainer}>
                    <Text style={styles.audioButtonText}>🎵 Uçak Sesi Çal</Text>
                    <TouchableOpacity 
                      style={styles.audioButton} 
                      onPress={playAudioManually}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.audioButtonLabel}>PLAY AUDIO</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>
        </View>

        {/* Alt bilgiler */}
        <View style={styles.bottomInfo}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
          <Text style={styles.copyrightText}>© 2025 Bu proje HOCTECH "High-Optimized Creative Technology" şirketi tarafından geliştirilmiştir.</Text>
          <Text style={styles.copyrightSubtext}>Professional ATC Communication Training</Text>
        </View>
      </Animated.View>

      {/* Fotoğraf değişim göstergesi */}
                   <View style={styles.imageIndicator}>
               {aviationImages.map((_, index) => (
                 <Animated.View 
                   key={index} 
                   style={[
                     styles.indicatorDot, 
                     index === currentImageIndex && styles.indicatorDotActive,
                     {
                       transform: [
                         {
                           scale: index === currentImageIndex ? 
                             imageFadeAnim.interpolate({
                               inputRange: [0, 1],
                               outputRange: [0.8, 1.2]
                             }) : 1
                         }
                       ]
                     }
                   ]} 
                 />
               ))}
             </View>
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
    width: width,
    height: height,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
    zIndex: 1,
  },
  content: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  airplaneLogo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  airplaneSymbol: {
    fontSize: 50,
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
    marginBottom: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 1,
  },
  appDescription: {
    fontSize: 14,
    color: '#E0E0E0',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    lineHeight: 20,
    maxWidth: 300,
    opacity: 0.9,
    marginBottom: 40,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  airplaneLoading: {
    alignItems: 'center',
    width: '100%',
  },
  loadingBar: {
    width: '80%',
    height: 10,
    backgroundColor: '#444',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  loadingProgress: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 5,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#E0E0E0',
    marginBottom: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.5,
  },
  loadingPercentage: {
    fontSize: 14,
    color: '#FFD700',
  },
  imageLoadingContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imageLoadingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#E0E0E0',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.3,
  },
  imageLoadingBar: {
    width: '80%',
    height: 8,
    backgroundColor: '#444',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  imageLoadingProgress: {
    height: '100%',
    backgroundColor: '#00D4AA',
    borderRadius: 4,
  },
  imageLoadingPercentage: {
    fontSize: 12,
    color: '#00D4AA',
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    color: '#666',
  },
  copyrightText: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
    marginBottom: 3,
  },
  copyrightSubtext: {
    fontSize: 10,
    color: '#777',
    fontStyle: 'italic',
  },
  imageIndicator: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  indicatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 6,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  indicatorDotActive: {
    backgroundColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 8,
  },
  audioButtonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  audioButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD700',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.5,
  },
  audioButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  audioButtonLabel: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
});

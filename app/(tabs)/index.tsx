import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
  useWindowDimensions,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PrimaryFlightDisplay from "../../components/PrimaryFlightDisplay";
import NavigationDisplay from "../../components/NavigationDisplay";
import { useTrainingSession } from "@/hooks/useTrainingSession";
import { useAppState } from "@/hooks/useAppState";

export default function TrainingScreen() {
  const {
    session,
    flightData,
    isListening,
    currentCommand,
    isWaitingForResponse,
    questionMode,
    currentQuestion,
    lastFeedback,
    startSession,
    endSession,
    addResponse,
    updateScore,
    toggleListening,
  } = useTrainingSession();

  const { userData, logout } = useAppState();
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [transcribedText, setTranscribedText] = useState<string>("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackType, setFeedbackType] = useState<"correct" | "incorrect" | null>(null);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  
  // Settings state
  const [audioSensitivity, setAudioSensitivity] = useState(90); // Ses seviyesi artırıldı
  const [audioQuality, setAudioQuality] = useState("High");
  const [difficultyLevel, setDifficultyLevel] = useState("Intermediate");
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [theme, setTheme] = useState("Dark");
  const [fontSizeSetting, setFontSizeSetting] = useState("Medium");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [speakerVolume, setSpeakerVolume] = useState(100); // Hoparlör ses seviyesi
  const [microphoneGain, setMicrophoneGain] = useState(85); // Mikrofon kazancı
  
  // Statistics state
  const [totalSessions, setTotalSessions] = useState(24);
  const [averageScore, setAverageScore] = useState(87.5);
  const [totalCommands, setTotalCommands] = useState(156);
  const [averageResponseTime, setAverageResponseTime] = useState(2.3);
  const [accuracy, setAccuracy] = useState(94.2);
  const [bestScore, setBestScore] = useState(98.5);
  const [totalTrainingTime, setTotalTrainingTime] = useState(18.5);
  const [currentStreak, setCurrentStreak] = useState(7);

  // Statistics management functions
  const loadStatistics = useCallback(async () => {
    try {
      const savedStats = await AsyncStorage.getItem('atcTrainingStatistics');
      if (savedStats) {
        const stats = JSON.parse(savedStats);
        setTotalSessions(stats.totalSessions || 0);
        setAverageScore(stats.averageScore || 0);
        setTotalCommands(stats.totalCommands || 0);
        setAverageResponseTime(stats.averageResponseTime || 0);
        setAccuracy(stats.accuracy || 0);
        setBestScore(stats.bestScore || 0);
        setTotalTrainingTime(stats.totalTrainingTime || 0);
        setCurrentStreak(stats.currentStreak || 0);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  }, []);

  const saveStatistics = useCallback(async () => {
    try {
      const stats = {
        totalSessions,
        averageScore,
        totalCommands,
        averageResponseTime,
        accuracy,
        bestScore,
        totalTrainingTime,
        currentStreak,
        lastUpdated: new Date().toISOString()
      };
      await AsyncStorage.setItem('atcTrainingStatistics', JSON.stringify(stats));
    } catch (error) {
      console.error('Error saving statistics:', error);
    }
  }, [totalSessions, averageScore, totalCommands, averageResponseTime, accuracy, bestScore, totalTrainingTime, currentStreak]);

  const exportStatistics = useCallback(async () => {
    if (isExporting) return; // Prevent multiple exports
    
    setIsExporting(true);
    try {
      const stats = {
        totalSessions,
        averageScore,
        totalCommands,
        averageResponseTime,
        accuracy,
        bestScore,
        totalTrainingTime,
        currentStreak,
        exportDate: new Date().toISOString()
      };

      const csvData = `ATC Training Statistics\n\n` +
        `Total Sessions,${stats.totalSessions}\n` +
        `Average Score,${stats.averageScore}%\n` +
        `Total Commands,${stats.totalCommands}\n` +
        `Average Response Time,${stats.averageResponseTime}s\n` +
        `Accuracy,${stats.accuracy}%\n` +
        `Best Score,${stats.bestScore}%\n` +
        `Total Training Time,${stats.totalTrainingTime}h\n` +
        `Current Streak,${stats.currentStreak} days\n` +
        `Export Date,${stats.exportDate}`;

      if (Platform.OS === 'web') {
        // Web export - create and download file
        try {
          const blob = new Blob([csvData], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `atc-training-stats-${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          Alert.alert("Export Successful", "Statistics exported successfully! Check your downloads folder.");
        } catch (webError) {
          console.error('Web export error:', webError);
          // Fallback: show data in alert for copy-paste
          Alert.alert(
            "Export Data", 
            "Copy this data manually:\n\n" + csvData,
            [{ text: "OK" }]
          );
        }
      } else {
        // Mobile export - share using native share
        try {
          await Share.share({
            message: `ATC Training Statistics:\n\n` +
              `Total Sessions: ${stats.totalSessions}\n` +
              `Average Score: ${stats.averageScore}%\n` +
              `Total Commands: ${stats.totalCommands}\n` +
              `Average Response Time: ${stats.averageResponseTime}s\n` +
              `Accuracy: ${stats.accuracy}%\n` +
              `Best Score: ${stats.bestScore}%\n` +
              `Total Training Time: ${stats.totalTrainingTime}h\n` +
              `Current Streak: ${stats.currentStreak} days\n` +
              `Export Date: ${stats.exportDate}`,
            title: 'ATC Training Statistics'
          });
        } catch (shareError) {
          console.error('Share error:', shareError);
          // Fallback: show data in alert for copy-paste
          Alert.alert(
            "Export Data", 
            "Copy this data manually:\n\n" + 
            `Total Sessions: ${stats.totalSessions}\n` +
            `Average Score: ${stats.averageScore}%\n` +
            `Total Commands: ${stats.totalCommands}\n` +
            `Average Response Time: ${stats.averageResponseTime}s\n` +
            `Accuracy: ${stats.accuracy}%\n` +
            `Best Score: ${stats.bestScore}%\n` +
            `Total Training Time: ${stats.totalTrainingTime}h\n` +
            `Current Streak: ${stats.currentStreak} days`,
            [{ text: "OK" }]
          );
        }
      }
    } catch (error) {
      console.error('Error exporting statistics:', error);
      Alert.alert("Export Error", "Failed to export statistics. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }, [totalSessions, averageScore, totalCommands, averageResponseTime, accuracy, bestScore, totalTrainingTime, currentStreak, isExporting]);

  const resetStatistics = useCallback(async () => {
    if (isResetting) return; // Prevent multiple resets
    
    Alert.alert(
      "Reset Statistics",
      "Are you sure you want to reset all training statistics? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            setIsResetting(true);
            try {
              // Reset all statistics to default values
              const defaultStats = {
                totalSessions: 0,
                averageScore: 0,
                totalCommands: 0,
                averageResponseTime: 0,
                accuracy: 0,
                bestScore: 0,
                totalTrainingTime: 0,
                currentStreak: 0
              };

              setTotalSessions(defaultStats.totalSessions);
              setAverageScore(defaultStats.averageScore);
              setTotalCommands(defaultStats.totalCommands);
              setAverageResponseTime(defaultStats.averageResponseTime);
              setAccuracy(defaultStats.accuracy);
              setBestScore(defaultStats.bestScore);
              setTotalTrainingTime(defaultStats.totalTrainingTime);
              setCurrentStreak(defaultStats.currentStreak);

              // Save to AsyncStorage
              await AsyncStorage.setItem('atcTrainingStatistics', JSON.stringify(defaultStats));
              
              Alert.alert("Statistics Reset", "All training statistics have been reset successfully.");
            } catch (error) {
              console.error('Error resetting statistics:', error);
              Alert.alert("Reset Error", "Failed to reset statistics. Please try again.");
            } finally {
              setIsResetting(false);
            }
          }
        }
      ]
    );
  }, [isResetting]);

  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, [recording]);

  // Load statistics on component mount
  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  // Save statistics whenever they change
  useEffect(() => {
    saveStatistics();
  }, [saveStatistics]);

  // Simulate some training progress for demonstration
  useEffect(() => {
    const simulateProgress = () => {
      // Only simulate if no saved statistics exist
      if (totalSessions === 0 && accuracy === 0) {
        const demoStats = {
          totalSessions: 24,
          averageScore: 87.5,
          totalCommands: 156,
          averageResponseTime: 2.3,
          accuracy: 94.2,
          bestScore: 98.5,
          totalTrainingTime: 18.5,
          currentStreak: 7
        };
        
        setTotalSessions(demoStats.totalSessions);
        setAverageScore(demoStats.averageScore);
        setTotalCommands(demoStats.totalCommands);
        setAverageResponseTime(demoStats.averageResponseTime);
        setAccuracy(demoStats.accuracy);
        setBestScore(demoStats.bestScore);
        setTotalTrainingTime(demoStats.totalTrainingTime);
        setCurrentStreak(demoStats.currentStreak);
      }
    };

    // Small delay to ensure AsyncStorage has loaded
    const timer = setTimeout(simulateProgress, 100);
    return () => clearTimeout(timer);
  }, [totalSessions, accuracy]);

  // Ses ayarlarını uygula
  useEffect(() => {
    const applyAudioSettings = async () => {
      try {
        // Hoparlör ses seviyesini ayarla
        if (Platform.OS === 'android') {
          // Android için ses seviyesi ayarı
          const { Audio } = await import('expo-av');
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            staysActiveInBackground: true,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: false,
            playThroughEarpieceAndroid: false, // Hoparlörden çal
          });
        }
        
        // Mikrofon kazancını ayarla
        if (recording) {
          try {
            const status = await recording.getStatusAsync();
            console.log('Mikrofon durumu:', status);
          } catch (error) {
            console.log('Mikrofon durumu alınamadı:', error);
          }
        }
      } catch (error) {
        console.log('Ses ayarları uygulanamadı:', error);
      }
    };

    applyAudioSettings();
  }, [speakerVolume, microphoneGain, recording]);

  const startTraining = () => {
    startSession();
  };

  const stopTraining = () => {
    endSession();
    setTranscribedText("");
    if (recording) {
      recording.stopAndUnloadAsync();
      setRecording(null);
    }
    setIsRecording(false);
    setIsProcessing(false);
    
    // Update training statistics
    updateTrainingStats();
  };

  // Function to update training statistics
  const updateTrainingStats = useCallback(() => {
    // Only update if session has meaningful data
    if (session.commandsIssued === 0) return;
    
    // Increment total sessions
    setTotalSessions(prev => prev + 1);
    
    // Update total training time (add 0.5 hours for each session)
    setTotalTrainingTime(prev => Math.round((prev + 0.5) * 10) / 10);
    
    // Update current streak (increment by 1 day)
    setCurrentStreak(prev => prev + 1);
    
    // Update best score if current session score is higher
    if (session.score > bestScore) {
      setBestScore(session.score);
    }
    
    // Update average score
    setAverageScore(prev => {
      const newTotal = (prev * (totalSessions) + session.score) / (totalSessions + 1);
      return Math.round(newTotal * 10) / 10; // Round to 1 decimal place
    });
    
    // Update total commands
    setTotalCommands(prev => prev + session.commandsIssued);
    
    // Update accuracy
    if (session.commandsIssued > 0) {
      const sessionAccuracy = (session.correctResponses / session.commandsIssued) * 100;
      setAccuracy(prev => {
        const newTotal = (prev * totalSessions + sessionAccuracy) / (totalSessions + 1);
        return Math.round(newTotal * 10) / 10; // Round to 1 decimal place
      });
    }
    
    // Update average response time (simulate based on session duration)
    if (session.startTime && session.endTime) {
      const sessionDuration = (session.endTime - session.startTime) / 1000; // Convert to seconds
      const avgResponseTime = sessionDuration / Math.max(session.commandsIssued, 1);
      setAverageResponseTime(prev => {
        const newTotal = (prev * totalSessions + avgResponseTime) / (totalSessions + 1);
        return Math.round(newTotal * 10) / 10; // Round to 1 decimal place
      });
    }
  }, [session, bestScore, totalSessions]);

  const startRecording = async () => {
    try {
      if (Platform.OS === 'web') {
        // Web recording using MediaRecorder
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        const chunks: Blob[] = [];
        
        mediaRecorder.ondataavailable = (event) => {
          chunks.push(event.data);
        };
        
        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(chunks, { type: 'audio/webm' });
          await processAudioBlob(audioBlob);
          stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorder.start();
        setIsRecording(true);
        
        // Store mediaRecorder reference
        (window as any).currentMediaRecorder = mediaRecorder;
      } else {
        // Mobile recording using expo-audio
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission required", "Please grant microphone permission to use this feature.");
          return;
        }

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: false,
          playThroughEarpieceAndroid: false, // Hoparlörden çal
        });

        const newRecording = new Audio.Recording();
        await newRecording.prepareToRecordAsync({
          android: {
            extension: 'm4a',
            outputFormat: 'MPEG4AAC',
            audioEncoder: 'AAC',
            sampleRate: 44100,
            numberOfChannels: 1,
            bitRate: 128000,
          },
          ios: {
            extension: 'm4a',
            outputFormat: 'MPEG4AAC',
            audioQuality: 'High',
            sampleRate: 44100,
            numberOfChannels: 1,
            bitRate: 128000,
          },
        } as any);

        await newRecording.startAsync();
        setRecording(newRecording);
        setIsRecording(true);
      }
    } catch (error) {
      console.error("Failed to start recording:", error);
      Alert.alert("Error", "Failed to start recording. Please try again.");
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      setIsProcessing(true);
      
      if (Platform.OS === 'web') {
        // Stop web recording
        const mediaRecorder = (window as any).currentMediaRecorder;
        if (mediaRecorder && mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      } else {
        // Stop mobile recording
        if (!recording) return;
        
        await recording.stopAndUnloadAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
        });

        const uri = recording.getURI();
        if (!uri) {
          throw new Error("No recording URI");
        }

        await processAudioFile(uri);
        setRecording(null);
      }
    } catch (error) {
      console.error("Failed to stop recording:", error);
      Alert.alert("Error", "Failed to process recording. Please try again.");
      setIsProcessing(false);
    }
  };

  const processAudioBlob = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      await transcribeAudio(formData);
    } catch (error) {
      console.error("Failed to process audio blob:", error);
      setIsProcessing(false);
    }
  };

  const processAudioFile = async (uri: string) => {
    try {
      const formData = new FormData();
      const uriParts = uri.split(".");
      const fileType = uriParts[uriParts.length - 1];
      
      const audioFile: any = {
        uri,
        name: `recording.${fileType}`,
        type: `audio/${fileType}`,
      };
      
      formData.append("audio", audioFile);
      await transcribeAudio(formData);
    } catch (error) {
      console.error("Failed to process audio file:", error);
      setIsProcessing(false);
    }
  };

  const transcribeAudio = async (formData: FormData) => {
    try {
      const transcribeResponse = await fetch("https://toolkit.rork.com/stt/transcribe/", {
        method: "POST",
        body: formData,
      });

      if (!transcribeResponse.ok) {
        throw new Error("Transcription failed");
      }

      const { text } = await transcribeResponse.json();
      setTranscribedText(text);
      
      // Process the response
      if (questionMode && currentQuestion) {
        const isCorrect = checkQuestionResponse(text, currentQuestion);
        addResponse({
          commandId: 'question',
          text,
          isCorrect,
          timestamp: Date.now(),
        });
        
        if (isCorrect) {
          updateScore(15);
        }
      } else if (currentCommand) {
        const isCorrect = checkReadback(text, currentCommand);
        addResponse({
          commandId: currentCommand,
          text,
          isCorrect,
          timestamp: Date.now(),
        });
        
        if (isCorrect) {
          updateScore(10);
        }
      }
    } catch (error) {
      console.error("Failed to transcribe audio:", error);
      Alert.alert("Error", "Failed to transcribe audio. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const checkReadback = (response: string, command: string): boolean => {
    const responseWords = response.toLowerCase().split(" ");
    const commandWords = command.toLowerCase().split(" ");
    
    // Check for key aviation terms
    const keyTerms = ['climb', 'descend', 'turn', 'left', 'right', 'heading', 'altitude', 'speed', 'flight', 'level'];
    let matchCount = 0;
    
    keyTerms.forEach(term => {
      if (commandWords.includes(term) && responseWords.includes(term)) {
        matchCount++;
      }
    });
    
    // Check for numbers
    const numberMatches = commandWords.filter(word => /\d/.test(word))
      .filter(word => responseWords.some(respWord => respWord.includes(word.replace(/\D/g, ''))));
    
    return matchCount >= 2 || numberMatches.length >= 1;
  };

  const checkQuestionResponse = (response: string, question: string): boolean => {
    const responseWords = response.toLowerCase();
    
    if (question.includes('speed')) {
      const speedMatch = responseWords.match(/(\d+)/);
      if (speedMatch) {
        const reportedSpeed = parseInt(speedMatch[1]);
        return Math.abs(reportedSpeed - flightData.speed) <= 20;
      }
    } else if (question.includes('altitude')) {
      const altMatch = responseWords.match(/(\d+)/);
      if (altMatch) {
        const reportedAlt = parseInt(altMatch[1]);
        return Math.abs(reportedAlt - flightData.altitude) <= 500;
      }
    } else if (question.includes('heading')) {
      const hdgMatch = responseWords.match(/(\d+)/);
      if (hdgMatch) {
        const reportedHdg = parseInt(hdgMatch[1]);
        return Math.abs(reportedHdg - flightData.heading) <= 10;
      }
    }
    
    return false;
  };

  const handleLogout = () => {
    logout();
  };

  // Responsive dimensions
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isMobile = screenWidth < 768;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;
  const isDesktop = screenWidth >= 1024;

  // Responsive layout adjustments
  const displayLayout = useMemo(() => {
    if (isMobile) {
      return {
        flexDirection: 'column' as const,
        gap: 8,
        paddingHorizontal: 8,
      };
    } else if (isTablet) {
      return {
        flexDirection: 'row' as const,
        gap: 15,
        paddingHorizontal: 15,
      };
    } else {
      return {
        flexDirection: 'row' as const,
        gap: 20,
        paddingHorizontal: 20,
      };
    }
  }, [isMobile, isTablet, isDesktop]);

  // Responsive font sizes
  const fontSize = useMemo(() => {
    if (isMobile) return { small: 10, normal: 12, large: 16, xlarge: 20 };
    if (isTablet) return { small: 11, normal: 14, large: 18, xlarge: 24 };
    return { small: 12, normal: 16, large: 20, xlarge: 28 };
  }, [isMobile, isTablet, isDesktop]);

  // Responsive button sizes
  const buttonSize = useMemo(() => {
    if (isMobile) return { height: 50, padding: 12, fontSize: 14 };
    if (isTablet) return { height: 60, padding: 16, fontSize: 16 };
    return { height: 70, padding: 20, fontSize: 18 };
  }, [isMobile, isTablet, isDesktop]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { paddingHorizontal: isMobile ? 10 : 20 }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.title, { fontSize: fontSize.xlarge }]}>
            ATC Communication Training
          </Text>
          {session.isActive ? (
            <View style={styles.sessionInfo}>
              <Text style={[styles.sessionText, { fontSize: fontSize.normal }]}>
                Score: {session.score}
              </Text>
              <Text style={[styles.sessionText, { fontSize: fontSize.normal }]}>
                Commands: {session.commandsIssued}
              </Text>
            </View>
          ) : null}
        </View>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <View style={styles.logoutButtonContent}>
            <Ionicons name="log-out" size={20} color="#FF6B6B" />
            <Text style={styles.logoutButtonText}>Çıkış</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.cockpitContainer}>
        {/* Dual Display Layout - PFD + Navigation Display */}
        <View style={styles.displayRow}>
          {/* PFD Display - Left Side */}
          <View style={styles.pfdDisplayArea}>
            <PrimaryFlightDisplay
              altitude={flightData.altitude}
              heading={flightData.heading}
              speed={flightData.speed}
              verticalSpeed={flightData.verticalSpeed}
            />
            
            {/* Overlay Status Messages - Non-intrusive */}
            {isWaitingForResponse && (
              <View style={styles.overlayStatus}>
                <View style={styles.statusIndicator}>
                  <Ionicons name="volume-high" color="#FFA500" size={16} />
                  <Text style={styles.overlayStatusText}>
                    {questionMode ? "ATC QUESTION" : "ATC COMMAND"}
                  </Text>
                </View>
              </View>
            )}

            {/* Enhanced Feedback Display */}
            {lastFeedback && (
              <View style={styles.feedbackOverlay}>
                <View style={[
                  styles.feedbackContainer,
                  lastFeedback.isCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect
                ]}>
                  <Ionicons 
                    name={lastFeedback.isCorrect ? "checkmark-circle" : "close-circle"} 
                    color={lastFeedback.isCorrect ? "#00FF00" : "#FF0000"} 
                    size={32} 
                  />
                  <Text style={[
                    styles.feedbackMainText,
                    { color: lastFeedback.isCorrect ? "#00FF00" : "#FF0000" }
                  ]}>
                    {lastFeedback.isCorrect ? "CORRECT" : "INCORRECT"}
                  </Text>
                  <Text style={styles.feedbackSubText}>
                    {lastFeedback.isCorrect ? "Good readback!" : "Try again"}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Navigation Display - Right Side */}
          <View style={styles.navDisplayArea}>
            <NavigationDisplay
              heading={flightData.heading}
              speed={flightData.speed}
              altitude={flightData.altitude}
            />
          </View>
        </View>

        {/* Bottom Communication Panel */}
        <View style={styles.communicationPanel}>
          {/* ATC Command/Question Display */}
          {(currentCommand || currentQuestion) && (
            <View style={styles.atcDisplay}>
              <View style={styles.atcHeader}>
                <Ionicons 
                  name="radio" 
                  color="#FFA500" 
                  size={16} 
                  style={styles.atcIcon} 
                />
                <Text style={styles.atcLabel}>
                  {questionMode ? "ATC QUESTION:" : "ATC COMMAND:"}
                </Text>
              </View>
              <Text style={styles.atcText}>
                {questionMode ? currentQuestion : currentCommand}
              </Text>
            </View>
          )}

          {/* Readback Display - Only show after feedback is cleared and no ATC command/question active */}
          {transcribedText && !isWaitingForResponse && !lastFeedback && !(currentCommand || currentQuestion) && (
            <View style={styles.readbackDisplay}>
              <Text style={styles.readbackLabel}>YOUR LAST RESPONSE:</Text>
              <Text style={styles.readbackText} numberOfLines={2} ellipsizeMode="tail">
                {transcribedText}
              </Text>
            </View>
          )}
        </View>

        {/* Physical Control Panel */}
        <View style={styles.controlPanel}>
          <View style={styles.controlPanelTop}>
            <View style={styles.analogMeter}>
              <Text style={styles.meterLabel}>COM1</Text>
              <Text style={styles.meterValue}>121.500</Text>
            </View>
            <View style={styles.analogMeter}>
              <Text style={styles.meterLabel}>COM2</Text>
              <Text style={styles.meterValue}>124.850</Text>
            </View>
            <View style={styles.analogMeter}>
              <Text style={styles.meterLabel}>XPDR</Text>
              <Text style={styles.meterValue}>7000</Text>
            </View>
          </View>

          <View style={styles.physicalControls}>
            {!session.isActive ? (
              <TouchableOpacity
                style={styles.startTrainingButton}
                onPress={startTraining}
              >
                <View style={styles.buttonLED} />
                <Text style={styles.physicalButtonText}>START TRAINING</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={[
                    styles.pttButton,
                    isRecording && styles.pttActive,
                  ]}
                  onPress={isRecording ? stopRecording : startRecording}
                  disabled={isProcessing || (!currentCommand && !currentQuestion)}
                >
                  <View style={[styles.pttLED, isRecording && styles.pttLEDActive]} />
                  <Text style={styles.pttText}>
                    {isProcessing ? "PROC" : isRecording ? "XMIT" : "PTT"}
                  </Text>
                  <Text style={styles.pttSubtext}>
                    {isProcessing
                      ? "Processing..."
                      : isRecording
                      ? "TRANSMITTING"
                      : "PUSH TO TALK"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.endSessionButton}
                  onPress={stopTraining}
                >
                  <View style={styles.buttonLED} />
                  <Text style={styles.physicalButtonText}>END SESSION</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          <View style={styles.statusLights}>
            <View style={[styles.statusLight, session.isActive && styles.statusLightActive]}>
              <Text style={styles.statusLightText}>ACTIVE</Text>
            </View>
            <View style={[styles.statusLight, isWaitingForResponse && styles.statusLightWaiting]}>
              <Text style={styles.statusLightText}>STANDBY</Text>
            </View>
            <View style={[styles.statusLight, isRecording && styles.statusLightRecording]}>
              <Text style={styles.statusLightText}>XMIT</Text>
            </View>
          </View>
        </View>

        {/* Bottom Navigation Bar */}
        <View style={styles.bottomNavigation}>
          <TouchableOpacity style={[styles.navItem, { backgroundColor: session.isActive ? '#1a4a1a' : 'rgba(255, 255, 255, 0.05)' }]}>
            <Ionicons name="airplane" size={20} color={session.isActive ? '#00FF00' : '#666'} />
            <Text style={[styles.navText, { color: session.isActive ? '#00FF00' : '#666' }]}>Training</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItem} onPress={() => setShowStatistics(true)}>
            <Ionicons name="analytics" size={20} color="#666" />
            <Text style={styles.navText}>Statistics</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItem} onPress={() => setShowSettings(true)}>
            <Ionicons name="settings" size={20} color="#666" />
            <Text style={styles.navText}>Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Statistics Modal */}
        {showStatistics && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Training Statistics</Text>
                <TouchableOpacity onPress={() => setShowStatistics(false)} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalBody}>
                <View style={styles.statSection}>
                  <Text style={styles.statSectionTitle}>Performance Overview</Text>
                  
                  <View style={styles.statCard}>
                    <View style={styles.statHeader}>
                      <Ionicons name="calendar" size={20} color="#FFD700" />
                      <Text style={styles.statLabel}>Total Sessions</Text>
                    </View>
                    <Text style={styles.statValue}>{totalSessions}</Text>
                    <Text style={styles.statSubtext}>This month</Text>
                  </View>
                  
                  <View style={styles.statCard}>
                    <View style={styles.statHeader}>
                      <Ionicons name="trophy" size={20} color="#FFD700" />
                      <Text style={styles.statLabel}>Average Score</Text>
                    </View>
                    <Text style={styles.statValue}>{averageScore}%</Text>
                    <Text style={styles.statSubtext}>Last 10 sessions</Text>
                  </View>
                  
                  <View style={styles.statCard}>
                    <View style={styles.statHeader}>
                      <Ionicons name="mic" size={20} color="#FFD700" />
                      <Text style={styles.statLabel}>Commands Issued</Text>
                    </View>
                    <Text style={styles.statValue}>{totalCommands}</Text>
                    <Text style={styles.statSubtext}>Total commands</Text>
                  </View>
                  
                  <View style={styles.statCard}>
                    <View style={styles.statHeader}>
                      <Ionicons name="time" size={20} color="#FFD700" />
                      <Text style={styles.statLabel}>Response Time</Text>
                    </View>
                    <Text style={styles.statValue}>{averageResponseTime}s</Text>
                    <Text style={styles.statSubtext}>Average response</Text>
                  </View>
                </View>
                
                <View style={styles.statSection}>
                  <Text style={styles.statSectionTitle}>Detailed Metrics</Text>
                  
                  <View style={styles.statCard}>
                    <View style={styles.statHeader}>
                      <Ionicons name="checkmark-circle" size={20} color="#00D4AA" />
                      <Text style={styles.statLabel}>Accuracy</Text>
                    </View>
                    <Text style={styles.statValue}>{accuracy}%</Text>
                    <Text style={styles.statSubtext}>Correct responses</Text>
                  </View>
                  
                  <View style={styles.statCard}>
                    <View style={styles.statHeader}>
                      <Ionicons name="star" size={20} color="#FFD700" />
                      <Text style={styles.statLabel}>Best Score</Text>
                    </View>
                    <Text style={styles.statValue}>{bestScore}%</Text>
                    <Text style={styles.statSubtext}>Personal record</Text>
                  </View>
                  
                  <View style={styles.statCard}>
                    <View style={styles.statHeader}>
                      <Ionicons name="hourglass" size={20} color="#FFD700" />
                      <Text style={styles.statLabel}>Total Training</Text>
                    </View>
                    <Text style={styles.statValue}>{totalTrainingTime}h</Text>
                    <Text style={styles.statSubtext}>Cumulative time</Text>
                  </View>
                  
                  <View style={styles.statCard}>
                    <View style={styles.statHeader}>
                      <Ionicons name="flame" size={20} color="#FF6B6B" />
                      <Text style={styles.statLabel}>Current Streak</Text>
                    </View>
                    <Text style={styles.statValue}>{currentStreak} days</Text>
                    <Text style={styles.statSubtext}>Consecutive training</Text>
                  </View>
                </View>
                
                <View style={styles.statSection}>
                  <Text style={styles.statSectionTitle}>Actions</Text>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, isExporting && styles.actionButtonDisabled]} 
                    onPress={exportStatistics}
                    disabled={isExporting}
                  >
                    {isExporting ? (
                      <ActivityIndicator size="small" color="#00D4AA" />
                    ) : (
                      <Ionicons name="download" size={20} color="#00D4AA" />
                    )}
                    <Text style={styles.actionButtonText}>
                      {isExporting ? "Exporting..." : "Export Statistics"}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, isResetting && styles.actionButtonDisabled]} 
                    onPress={resetStatistics}
                    disabled={isResetting}
                  >
                    {isResetting ? (
                      <ActivityIndicator size="small" color="#FFD700" />
                    ) : (
                      <Ionicons name="trash" size={20} color="#FFD700" />
                    )}
                    <Text style={styles.actionButtonText}>
                      {isResetting ? "Resetting..." : "Reset Statistics"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        )}

        {/* Settings Modal */}
        {showSettings && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Settings</Text>
                <TouchableOpacity onPress={() => setShowSettings(false)} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalBody}>
                <View style={styles.settingSection}>
                  <Text style={styles.settingSectionTitle}>Audio Settings</Text>
                  
                  <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Microphone Sensitivity</Text>
                    <View style={styles.sliderContainer}>
                      <TouchableOpacity 
                        style={styles.sliderButton} 
                        onPress={() => setAudioSensitivity(Math.max(0, audioSensitivity - 5))}
                      >
                        <Ionicons name="remove" size={16} color="#FFD700" />
                      </TouchableOpacity>
                      <Text style={styles.sliderValue}>{audioSensitivity}%</Text>
                      <TouchableOpacity 
                        style={styles.sliderButton} 
                        onPress={() => setAudioSensitivity(Math.min(100, audioSensitivity + 5))}
                      >
                        <Ionicons name="add" size={16} color="#FFD700" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Audio Quality</Text>
                    <TouchableOpacity 
                      style={styles.settingValue} 
                      onPress={() => setAudioQuality(audioQuality === "High" ? "Medium" : audioQuality === "Medium" ? "Low" : "High")}
                    >
                      <Text style={styles.settingValueText}>{audioQuality}</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Sound Effects</Text>
                    <TouchableOpacity 
                      style={[styles.toggleButton, soundEnabled && styles.toggleButtonActive]} 
                      onPress={() => setSoundEnabled(!soundEnabled)}
                    >
                      <Text style={[styles.toggleText, soundEnabled && styles.toggleTextActive]}>
                        {soundEnabled ? "ON" : "OFF"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Speaker Volume</Text>
                    <View style={styles.sliderContainer}>
                      <TouchableOpacity 
                        style={styles.sliderButton} 
                        onPress={() => setSpeakerVolume(Math.max(0, speakerVolume - 10))}
                      >
                        <Ionicons name="remove" size={16} color="#FFD700" />
                      </TouchableOpacity>
                      <Text style={styles.sliderValue}>{speakerVolume}%</Text>
                      <TouchableOpacity 
                        style={styles.sliderButton} 
                        onPress={() => setSpeakerVolume(Math.min(100, speakerVolume + 10))}
                      >
                        <Ionicons name="add" size={16} color="#FFD700" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Microphone Gain</Text>
                    <View style={styles.sliderContainer}>
                      <TouchableOpacity 
                        style={styles.sliderButton} 
                        onPress={() => setMicrophoneGain(Math.max(0, microphoneGain - 5))}
                      >
                        <Ionicons name="remove" size={16} color="#FFD700" />
                      </TouchableOpacity>
                      <Text style={styles.sliderValue}>{microphoneGain}%</Text>
                      <TouchableOpacity 
                        style={styles.sliderButton} 
                        onPress={() => setMicrophoneGain(Math.min(100, microphoneGain + 5))}
                      >
                        <Ionicons name="add" size={16} color="#FFD700" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                
                <View style={styles.settingSection}>
                  <Text style={styles.settingSectionTitle}>Training Settings</Text>
                  
                  <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Difficulty Level</Text>
                    <TouchableOpacity 
                      style={styles.settingValue} 
                      onPress={() => setDifficultyLevel(difficultyLevel === "Beginner" ? "Intermediate" : difficultyLevel === "Intermediate" ? "Advanced" : "Beginner")}
                    >
                      <Text style={styles.settingValueText}>{difficultyLevel}</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Auto-Advance</Text>
                    <TouchableOpacity 
                      style={[styles.toggleButton, autoAdvance && styles.toggleButtonActive]} 
                      onPress={() => setAutoAdvance(!autoAdvance)}
                    >
                      <Text style={[styles.toggleText, autoAdvance && styles.toggleTextActive]}>
                        {autoAdvance ? "ON" : "OFF"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Vibration</Text>
                    <TouchableOpacity 
                      style={[styles.toggleButton, vibrationEnabled && styles.toggleButtonActive]} 
                      onPress={() => setVibrationEnabled(!vibrationEnabled)}
                    >
                      <Text style={[styles.toggleText, vibrationEnabled && styles.toggleTextActive]}>
                        {vibrationEnabled ? "ON" : "OFF"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.settingSection}>
                  <Text style={styles.settingSectionTitle}>Display Settings</Text>
                  
                  <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Theme</Text>
                    <TouchableOpacity 
                      style={styles.settingValue} 
                      onPress={() => setTheme(theme === "Dark" ? "Light" : "Dark")}
                    >
                      <Text style={styles.settingValueText}>{theme}</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Font Size</Text>
                    <TouchableOpacity 
                      style={styles.settingValue} 
                      onPress={() => setFontSizeSetting(fontSizeSetting === "Small" ? "Medium" : fontSizeSetting === "Medium" ? "Large" : "Small")}
                    >
                      <Text style={styles.settingValueText}>{fontSizeSetting}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.settingSection}>
                  <Text style={styles.settingSectionTitle}>Actions</Text>
                  
                  <TouchableOpacity style={styles.actionButton} onPress={() => {
                    Alert.alert("Reset Settings", "Are you sure you want to reset all settings to default?", [
                      { text: "Cancel", style: "cancel" },
                      { text: "Reset", style: "destructive", onPress: () => {
                        setAudioSensitivity(75);
                        setAudioQuality("High");
                        setDifficultyLevel("Intermediate");
                        setAutoAdvance(true);
                        setTheme("Dark");
                        setFontSizeSetting("Medium");
                        setSoundEnabled(true);
                        setVibrationEnabled(true);
                      }}
                    ]);
                  }}>
                    <Ionicons name="refresh" size={20} color="#FF6B6B" />
                    <Text style={styles.actionButtonText}>Reset to Default</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.actionButton} onPress={() => {
                    Alert.alert("Settings Saved", "All settings have been saved successfully!");
                  }}>
                    <Ionicons name="save" size={20} color="#00D4AA" />
                    <Text style={styles.actionButtonText}>Save Settings</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  header: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 6,
  },
  sessionInfo: {
    flexDirection: "row",
    gap: 20,
  },
  sessionText: {
    color: "#00A86B",
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  logoutButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  cockpitContainer: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    paddingHorizontal: 10,
  },
  displayRow: {
    flexDirection: 'row',
    flex: 1,
    gap: 10,
    minHeight: 400,
  },
  pfdDisplayArea: {
    flex: 1,
    position: 'relative',
    minHeight: 400,
  },
  navDisplayArea: {
    flex: 1,
    position: 'relative',
    minHeight: 400,
  },
  overlayStatus: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 165, 0, 0.15)',
    borderWidth: 2,
    borderColor: '#FFA500',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#FFA500',
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  overlayStatusText: {
    color: '#FFA500',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
    fontFamily: 'monospace',
  },
  feedbackOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 15,
  },
  feedbackContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    paddingHorizontal: 30,
    paddingVertical: 25,
    alignItems: 'center',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    minWidth: 200,
  },
  feedbackCorrect: {
    borderColor: '#00FF00',
    shadowColor: '#00FF00',
  },
  feedbackIncorrect: {
    borderColor: '#FF0000',
    shadowColor: '#FF0000',
  },
  feedbackMainText: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginTop: 10,
    textAlign: 'center',
  },
  feedbackSubText: {
    fontSize: 14,
    color: '#CCCCCC',
    fontFamily: 'monospace',
    marginTop: 8,
    textAlign: 'center',
  },
  communicationPanel: {
    backgroundColor: '#1a1a1a',
    borderTopWidth: 2,
    borderTopColor: '#333',
    paddingHorizontal: 10,
    paddingVertical: 12,
    minHeight: 80,
    marginHorizontal: 0,
  },
  atcDisplay: {
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA500',
    marginBottom: 10,
    shadowColor: '#FFA500',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  atcHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  atcIcon: {
    marginRight: 8,
  },
  atcLabel: {
    color: '#FFA500',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
  },
  atcText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
    lineHeight: 22,
  },
  readbackDisplay: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#00A86B',
    shadowColor: '#00A86B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  readbackLabel: {
    color: '#00A86B',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
  },
  readbackText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'monospace',
  },
  controlPanel: {
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 12,
    paddingVertical: 15,
    borderTopWidth: 4,
    borderTopColor: "#555",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    marginHorizontal: 0,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderLeftColor: "#333",
    borderRightColor: "#333",
  },
  controlPanelTop: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  analogMeter: {
    backgroundColor: "#0d1117",
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 3,
    borderTopColor: "#666",
    borderLeftColor: "#666",
    borderRightColor: "#333",
    borderBottomColor: "#333",
    alignItems: "center",
    minWidth: 65,
    flex: 1,
    marginHorizontal: 3,
    minHeight: 55,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  meterLabel: {
    color: "#888",
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 3,
    fontFamily: "monospace",
  },
  meterValue: {
    color: "#00FF00",
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "monospace",
  },
  physicalControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 2,
    gap: 8,
  },
  startTrainingButton: {
    backgroundColor: "#1a4a1a",
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderRadius: 15,
    borderWidth: 4,
    borderTopColor: "#4a7c2a",
    borderLeftColor: "#4a7c2a",
    borderRightColor: "#1a3a1a",
    borderBottomColor: "#1a3a1a",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    flex: 1,
    minHeight: 70,
  },
  pttButton: {
    backgroundColor: "#2a2a2a",
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderRadius: 15,
    borderWidth: 4,
    borderTopColor: "#666",
    borderLeftColor: "#666",
    borderRightColor: "#111",
    borderBottomColor: "#111",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    flex: 1,
    minHeight: 70,
  },
  pttActive: {
    backgroundColor: "#4a0e0e",
    borderTopColor: "#dc2626",
    borderLeftColor: "#dc2626",
    borderRightColor: "#2a0606",
    borderBottomColor: "#2a0606",
    shadowColor: "#dc2626",
    shadowOpacity: 0.8,
  },
  endSessionButton: {
    backgroundColor: "#4a1a1a",
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderRadius: 15,
    borderWidth: 4,
    borderTopColor: "#7a2e2e",
    borderLeftColor: "#7a2e2e",
    borderRightColor: "#2a1111",
    borderBottomColor: "#2a1111",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    flex: 1,
    minHeight: 70,
  },
  buttonLED: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#333",
    marginBottom: 8,
  },
  pttLED: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#333",
    marginBottom: 8,
  },
  pttLEDActive: {
    backgroundColor: "#ff0000",
    shadowColor: "#ff0000",
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  physicalButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "monospace",
  },
  pttText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "monospace",
  },
  pttSubtext: {
    color: "#888",
    fontSize: 10,
    textAlign: "center",
    marginTop: 4,
    fontFamily: "monospace",
  },
  statusLights: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 2,
    gap: 4,
  },
  statusLight: {
    backgroundColor: "#0d1117",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderTopColor: "#444",
    borderLeftColor: "#444",
    borderRightColor: "#222",
    borderBottomColor: "#222",
    alignItems: "center",
    flex: 1,
    minHeight: 40,
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  statusLightActive: {
    backgroundColor: "#1a4a1a",
    borderColor: "#00FF00",
    shadowColor: "#00FF00",
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  statusLightWaiting: {
    backgroundColor: "#4a4a1a",
    borderColor: "#FFA500",
    shadowColor: "#FFA500",
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  statusLightRecording: {
    backgroundColor: "#4a1a1a",
    borderColor: "#FF0000",
    shadowColor: "#FF0000",
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  statusLightText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    fontFamily: "monospace",
  },
  bottomNavigation: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#1a1a1a",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#333",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  navItem: {
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
  },
  navText: {
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "monospace",
    marginTop: 4,
  },
  
  // Modal Styles
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "#2D2D2D",
    borderRadius: 16,
    width: "90%",
    maxHeight: "80%",
    borderWidth: 1,
    borderColor: "#444",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#444",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    fontFamily: "monospace",
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    padding: 20,
  },
  
  // Statistics Styles
  statCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  statLabel: {
    fontSize: 14,
    color: "#CCC",
    fontFamily: "monospace",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFD700",
    fontFamily: "monospace",
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 12,
    color: "#888",
    fontFamily: "monospace",
  },
  
  // Settings Styles
  settingSection: {
    marginBottom: 24,
  },
  settingSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFD700",
    fontFamily: "monospace",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#444",
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  settingLabel: {
    fontSize: 14,
    color: "#CCC",
    fontFamily: "monospace",
    flex: 1,
  },
  settingValue: {
    backgroundColor: "#1A1A1A",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#444",
  },
  settingValueText: {
    fontSize: 12,
    color: "#FFD700",
    fontFamily: "monospace",
  },
  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#444",
    minWidth: 120,
    justifyContent: "space-between",
  },
  sliderValue: {
    fontSize: 12,
    color: "#FFD700",
    fontFamily: "monospace",
  },
  
  // Interactive Controls
  sliderButton: {
    backgroundColor: "#1A1A1A",
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#444",
    minWidth: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleButton: {
    backgroundColor: "#1A1A1A",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#444",
    minWidth: 60,
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: "#00D4AA",
    borderColor: "#00D4AA",
  },
  toggleText: {
    fontSize: 12,
    color: "#666",
    fontFamily: "monospace",
    fontWeight: "bold",
  },
  toggleTextActive: {
    color: "#000",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1A1A1A",
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#444",
  },
  actionButtonDisabled: {
    opacity: 0.6,
    backgroundColor: "#2A2A2A",
  },
  actionButtonText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontFamily: "monospace",
    fontWeight: "bold",
    marginLeft: 8,
  },
  
  // Statistics Section Styles
  statSection: {
    marginBottom: 24,
  },
  statSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFD700",
    fontFamily: "monospace",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#444",
    paddingBottom: 8,
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
});
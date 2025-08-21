import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import PrimaryFlightDisplay from "../../components/PrimaryFlightDisplay";
import { useTrainingSession } from "@/hooks/useTrainingSession";

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

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [transcribedText, setTranscribedText] = useState<string>("");

  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, [recording]);

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
  };

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
        // Mobile recording using expo-av
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission required", "Please grant microphone permission to use this feature.");
          return;
        }

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const newRecording = new Audio.Recording();
        await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ATC Communication Training</Text>
        {session.isActive ? (
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionText}>Score: {session.score}</Text>
            <Text style={styles.sessionText}>
              Commands: {session.commandsIssued}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.cockpitContainer}>
        {/* PFD Display - Full Screen */}
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

          {lastFeedback && (
            <View style={[
              styles.overlayFeedback,
              lastFeedback.isCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect
            ]}>
              <Text style={styles.overlayFeedbackText}>
                {lastFeedback.isCorrect ? "✓ CORRECT" : "✗ INCORRECT"}
              </Text>
            </View>
          )}
        </View>

        {/* Bottom Communication Panel */}
        <View style={styles.communicationPanel}>
          {transcribedText && (
            <View style={styles.readbackDisplay}>
              <Text style={styles.readbackLabel}>READBACK:</Text>
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  sessionInfo: {
    flexDirection: "row",
    gap: 20,
  },
  sessionText: {
    color: "#00A86B",
    fontSize: 16,
  },
  cockpitContainer: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    paddingHorizontal: 10,
  },
  pfdDisplayArea: {
    flex: 1,
    position: 'relative',
    minHeight: 400,
    marginHorizontal: 0,
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
  overlayFeedback: {
    position: 'absolute',
    top: 70,
    right: 20,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 2,
    zIndex: 10,
  },
  overlayFeedbackText: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  communicationPanel: {
    backgroundColor: '#1a1a1a',
    borderTopWidth: 2,
    borderTopColor: '#333',
    paddingHorizontal: 10,
    paddingVertical: 8,
    minHeight: 50,
    marginHorizontal: 0,
  },
  readbackDisplay: {
    backgroundColor: '#2a2a2a',
    borderRadius: 6,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#00A86B',
  },
  readbackLabel: {
    color: '#888',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  readbackText: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 18,
  },
  statusContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFA500",
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  statusLabel: {
    color: "#FFA500",
    fontSize: 14,
    fontWeight: "600",
  },
  waitingText: {
    color: "#FFA500",
    fontSize: 14,
    fontStyle: "italic",
    marginTop: 8,
  },
  transcriptionContainer: {
    margin: 20,
    marginTop: 0,
    padding: 16,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
  },
  transcriptionLabel: {
    color: "#888",
    fontSize: 12,
    marginBottom: 8,
  },
  transcriptionText: {
    color: "white",
    fontSize: 16,
  },
  feedbackContainer: {
    margin: 20,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
  },
  feedbackCorrect: {
    backgroundColor: "rgba(0, 168, 107, 0.1)",
    borderColor: "#00A86B",
  },
  feedbackIncorrect: {
    backgroundColor: "rgba(220, 38, 38, 0.1)",
    borderColor: "#dc2626",
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: "600",
  },
  feedbackTextCorrect: {
    color: "#00A86B",
  },
  feedbackTextIncorrect: {
    color: "#dc2626",
  },
  controls: {
    padding: 20,
    gap: 12,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#00A86B",
    padding: 16,
    borderRadius: 12,
  },
  recordButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 12,
  },
  recordingActive: {
    backgroundColor: "#dc2626",
  },
  stopButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#666",
    padding: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  controlPanel: {
    backgroundColor: "#2a2a2a",
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderTopWidth: 3,
    borderTopColor: "#444",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginHorizontal: 0,
  },
  controlPanelTop: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  analogMeter: {
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#555",
    alignItems: "center",
    minWidth: 60,
    flex: 1,
    marginHorizontal: 2,
    minHeight: 50,
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
    backgroundColor: "#2d5016",
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#4a7c2a",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    flex: 1,
    minHeight: 65,
  },
  pttButton: {
    backgroundColor: "#1a1a1a",
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#555",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    flex: 1,
    minHeight: 65,
  },
  pttActive: {
    backgroundColor: "#4a0e0e",
    borderColor: "#dc2626",
    shadowColor: "#dc2626",
    shadowOpacity: 0.6,
  },
  endSessionButton: {
    backgroundColor: "#3d1a1a",
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#7a2e2e",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    flex: 1,
    minHeight: 65,
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
    backgroundColor: "#1a1a1a",
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#333",
    alignItems: "center",
    flex: 1,
    minHeight: 35,
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
});
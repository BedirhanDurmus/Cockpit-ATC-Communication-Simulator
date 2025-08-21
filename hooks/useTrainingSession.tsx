import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TrainingSession, ATCCommand, PilotResponse, Statistics } from "@/types/training";
import { Platform } from "react-native";
import * as Speech from 'expo-speech';

interface FlightData {
  altitude: number;
  heading: number;
  speed: number;
  verticalSpeed: number;
  targetHeading?: number;
}

interface TrainingContextType {
  session: TrainingSession;
  stats: Statistics;
  flightData: FlightData;
  isListening: boolean;
  currentCommand: string | null;
  isWaitingForResponse: boolean;
  questionMode: boolean;
  currentQuestion: string | null;
  lastFeedback: { isCorrect: boolean; message: string; timestamp: number } | null;
  startSession: () => void;
  endSession: () => void;
  addCommand: (command: ATCCommand) => void;
  addResponse: (response: PilotResponse) => void;
  updateScore: (points: number) => void;
  toggleListening: () => void;
}

const TrainingContext = createContext<TrainingContextType | undefined>(undefined);

export const useTrainingSession = () => {
  const context = useContext(TrainingContext);
  if (!context) {
    throw new Error("useTrainingSession must be used within TrainingProvider");
  }
  return context;
};

export const TrainingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<TrainingSession>({
    isActive: false,
    startTime: null,
    endTime: null,
    commandsIssued: 0,
    correctResponses: 0,
    score: 0,
    commands: [],
    responses: [],
  });

  const [stats, setStats] = useState<Statistics>({
    totalScore: 0,
    sessionsCompleted: 0,
    accuracy: 0,
    avgResponseTime: 0,
    recentSessions: [],
  });

  const [flightData, setFlightData] = useState<FlightData>({
    altitude: 37000,
    heading: 270,
    speed: 450,
    verticalSpeed: 0,
  });

  const [isListening, setIsListening] = useState<boolean>(false);
  const [currentCommand, setCurrentCommand] = useState<string | null>(null);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState<boolean>(false);
  const [questionMode, setQuestionMode] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [lastFeedback, setLastFeedback] = useState<{ isCorrect: boolean; message: string; timestamp: number } | null>(null);
  
  const flightDataInterval = useRef<NodeJS.Timeout | null>(null);
  const commandInterval = useRef<NodeJS.Timeout | null>(null);
  const questionInterval = useRef<NodeJS.Timeout | null>(null);
  const responseTimeout = useRef<NodeJS.Timeout | null>(null);

  const loadStats = useCallback(async () => {
    try {
      const savedStats = await AsyncStorage.getItem("pilotTrainingStats");
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  }, []);

  const saveStats = useCallback(async (newStats: Statistics) => {
    try {
      await AsyncStorage.setItem("pilotTrainingStats", JSON.stringify(newStats));
    } catch (error) {
      console.error("Error saving stats:", error);
    }
  }, []);

  const speakText = useCallback((text: string) => {
    if (Platform.OS === 'web') {
      // Wait for voices to load on web
      const speakWithVoice = () => {
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = speechSynthesis.getVoices();
        
        // Force American English voice - be more specific
        const americanVoice = voices.find(voice => 
          (voice.lang === 'en-US' || voice.lang.startsWith('en-US')) &&
          (voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.name.includes('Alex') || voice.name.includes('Samantha'))
        ) || voices.find(voice => voice.lang === 'en-US');
        
        if (americanVoice) {
          utterance.voice = americanVoice;
          utterance.lang = 'en-US';
        } else {
          // Fallback to first English voice
          const englishVoice = voices.find(voice => voice.lang.startsWith('en'));
          if (englishVoice) {
            utterance.voice = englishVoice;
            utterance.lang = 'en-US';
          }
        }
        
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        speechSynthesis.speak(utterance);
      };

      // Check if voices are already loaded
      if (speechSynthesis.getVoices().length > 0) {
        speakWithVoice();
      } else {
        // Wait for voices to load
        speechSynthesis.onvoiceschanged = () => {
          speakWithVoice();
          speechSynthesis.onvoiceschanged = null;
        };
      }
    } else {
      // Use Expo Speech for mobile platforms - force American English
      Speech.speak(text, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.9,
      });
    }
  }, []);

  const stopAllIntervals = useCallback(() => {
    if (flightDataInterval.current) {
      clearInterval(flightDataInterval.current);
      flightDataInterval.current = null;
    }
    if (commandInterval.current) {
      clearInterval(commandInterval.current);
      commandInterval.current = null;
    }
    if (questionInterval.current) {
      clearInterval(questionInterval.current);
      questionInterval.current = null;
    }
    if (responseTimeout.current) {
      clearTimeout(responseTimeout.current);
      responseTimeout.current = null;
    }
  }, []);

  const issueRandomCommand = useCallback(() => {
    const commands = [
      "Climb flight level one eight zero",
      "Descend and maintain flight level two four zero",
      "Turn left heading two seven zero",
      "Turn right heading zero nine zero",
      "Reduce speed to two five zero knots",
      "Increase speed to three zero zero knots",
    ];
    
    const command = commands[Math.floor(Math.random() * commands.length)];
    setCurrentCommand(command);
    setIsWaitingForResponse(true);
    
    // Speak command with American English accent
    speakText(command);
    
    // Set timeout for response
    responseTimeout.current = setTimeout(() => {
      setIsWaitingForResponse(prev => {
        if (prev) {
          // Repeat command if no response
          speakText(command);
        }
        return prev;
      });
    }, 15000);
  }, [speakText]);

  const askRandomQuestion = useCallback(() => {
    const questions = [
      `What is your current speed?`,
      `What is your current altitude?`,
      `What is your current heading?`,
    ];
    
    const question = questions[Math.floor(Math.random() * questions.length)];
    setCurrentQuestion(question);
    setQuestionMode(true);
    setIsWaitingForResponse(true);
    
    speakText(question);
    
    responseTimeout.current = setTimeout(() => {
      setQuestionMode(false);
      setCurrentQuestion(null);
      setIsWaitingForResponse(false);
    }, 15000);
  }, [speakText]);

  const startFlightDataSimulation = useCallback(() => {
    flightDataInterval.current = setInterval(() => {
      setFlightData(prev => ({
        altitude: prev.altitude + (Math.random() - 0.5) * 100,
        heading: Math.max(0, Math.min(360, prev.heading + (Math.random() - 0.5) * 10)),
        speed: Math.max(200, Math.min(500, prev.speed + (Math.random() - 0.5) * 20)),
        verticalSpeed: (Math.random() - 0.5) * 1000,
      }));
    }, 2000); // Update every 2 seconds
  }, []);

  const startCommandSequence = useCallback(() => {
    // Issue first command immediately after voices are ready
    const issueFirstCommand = () => {
      // Check if we're not already waiting for a response
      setIsWaitingForResponse(waiting => {
        setQuestionMode(qMode => {
          if (!waiting && !qMode) {
            issueRandomCommand();
          }
          return qMode;
        });
        return waiting;
      });
    };

    if (Platform.OS === 'web') {
      // Wait for voices to load on web, then issue first command
      if (speechSynthesis.getVoices().length > 0) {
        setTimeout(issueFirstCommand, 500);
      } else {
        speechSynthesis.onvoiceschanged = () => {
          setTimeout(issueFirstCommand, 500);
          speechSynthesis.onvoiceschanged = null;
        };
      }
    } else {
      // On mobile, issue immediately
      setTimeout(issueFirstCommand, 500);
    }
    
    // Then continue with interval for subsequent commands
    commandInterval.current = setInterval(() => {
      setIsWaitingForResponse(waiting => {
        setQuestionMode(qMode => {
          if (!waiting && !qMode) {
            issueRandomCommand();
          }
          return qMode;
        });
        return waiting;
      });
    }, 20000); // Every 20 seconds
  }, [issueRandomCommand]);

  const startQuestionSequence = useCallback(() => {
    questionInterval.current = setInterval(() => {
      setIsWaitingForResponse(waiting => {
        setQuestionMode(qMode => {
          if (!waiting && !qMode) {
            askRandomQuestion();
          }
          return qMode;
        });
        return waiting;
      });
    }, 30000); // Every 30 seconds
  }, [askRandomQuestion]);

  // Load stats from AsyncStorage
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Start flight data simulation when session is active
  useEffect(() => {
    if (session.isActive) {
      startFlightDataSimulation();
      startCommandSequence();
      startQuestionSequence();
    } else {
      stopAllIntervals();
    }
    
    return () => stopAllIntervals();
  }, [session.isActive, startFlightDataSimulation, startCommandSequence, startQuestionSequence, stopAllIntervals]);

  const startSession = useCallback(() => {
    // Initialize voices on web before starting session
    if (Platform.OS === 'web' && speechSynthesis.getVoices().length === 0) {
      speechSynthesis.onvoiceschanged = () => {
        speechSynthesis.onvoiceschanged = null;
      };
    }
    
    setSession({
      isActive: true,
      startTime: Date.now(),
      endTime: null,
      commandsIssued: 0,
      correctResponses: 0,
      score: 0,
      commands: [],
      responses: [],
    });
    setIsListening(false);
    setCurrentCommand(null);
    setIsWaitingForResponse(false);
    setQuestionMode(false);
    setCurrentQuestion(null);
    setLastFeedback(null);
  }, []);

  const endSession = useCallback(() => {
    const endTime = Date.now();
    const updatedSession = {
      ...session,
      isActive: false,
      endTime,
    };
    
    setSession(updatedSession);
    stopAllIntervals();
    
    // Update statistics
    const accuracy = session.commandsIssued > 0
      ? Math.round((session.correctResponses / session.commandsIssued) * 100)
      : 0;
    
    const newStats: Statistics = {
      ...stats,
      totalScore: stats.totalScore + session.score,
      sessionsCompleted: stats.sessionsCompleted + 1,
      accuracy: Math.round(
        ((stats.accuracy * stats.sessionsCompleted) + accuracy) /
        (stats.sessionsCompleted + 1)
      ),
      recentSessions: [
        {
          date: endTime,
          score: session.score,
          commandsCompleted: session.correctResponses,
          accuracy,
        },
        ...stats.recentSessions.slice(0, 9), // Keep last 10 sessions
      ],
    };
    
    setStats(newStats);
    saveStats(newStats);
  }, [session, stats, stopAllIntervals, saveStats]);

  const addCommand = useCallback((command: ATCCommand) => {
    setSession(prev => ({
      ...prev,
      commandsIssued: prev.commandsIssued + 1,
      commands: [...prev.commands, command],
    }));
  }, []);

  const addResponse = useCallback((response: PilotResponse) => {
    setSession(prev => ({
      ...prev,
      responses: [...prev.responses, response],
      correctResponses: response.isCorrect
        ? prev.correctResponses + 1
        : prev.correctResponses,
    }));
    
    // Set feedback message
    const feedbackMessage = response.isCorrect 
      ? (questionMode ? "Correct answer!" : "Good readback!")
      : (questionMode ? "Incorrect answer. Try again." : "Incorrect readback. Please repeat.");
    
    setLastFeedback({
      isCorrect: response.isCorrect,
      message: feedbackMessage,
      timestamp: Date.now()
    });
    
    // Clear feedback after 3 seconds
    setTimeout(() => {
      setLastFeedback(null);
    }, 3000);
    
    if (response.isCorrect) {
      // Play confirmation blip
      if (Platform.OS === 'web') {
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
      }
    } else {
      // Repeat command/question if incorrect
      setTimeout(() => {
        if (questionMode && currentQuestion) {
          speakText(currentQuestion);
        } else if (currentCommand) {
          speakText(currentCommand);
        }
      }, 1000);
    }
    
    setIsWaitingForResponse(false);
    setCurrentCommand(null);
    setQuestionMode(false);
    setCurrentQuestion(null);
    
    if (responseTimeout.current) {
      clearTimeout(responseTimeout.current);
      responseTimeout.current = null;
    }
  }, [questionMode, currentQuestion, currentCommand, speakText]);

  const updateScore = useCallback((points: number) => {
    setSession(prev => ({
      ...prev,
      score: prev.score + points,
    }));
  }, []);

  const toggleListening = useCallback(() => {
    setIsListening(prev => !prev);
  }, []);

  const value = useMemo(() => ({
    session,
    stats,
    flightData,
    isListening,
    currentCommand,
    isWaitingForResponse,
    questionMode,
    currentQuestion,
    lastFeedback,
    startSession,
    endSession,
    addCommand,
    addResponse,
    updateScore,
    toggleListening,
  }), [
    session,
    stats,
    flightData,
    isListening,
    currentCommand,
    isWaitingForResponse,
    questionMode,
    currentQuestion,
    lastFeedback,
    startSession,
    endSession,
    addCommand,
    addResponse,
    updateScore,
    toggleListening,
  ]);

  return (
    <TrainingContext.Provider value={value}>
      {children}
    </TrainingContext.Provider>
  );
};
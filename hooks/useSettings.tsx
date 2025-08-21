import React, { useState, useEffect, useCallback, useMemo, createContext, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Settings {
  commandInterval: number;
  responseTimeout: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  voiceFeedback: boolean;
  soundEffects: boolean;
  crossCheckEnabled: boolean;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>({
    commandInterval: 20,
    responseTimeout: 15,
    difficulty: "Beginner",
    voiceFeedback: true,
    soundEffects: true,
    crossCheckEnabled: true,
  });

  const loadSettings = useCallback(async () => {
    try {
      const savedSettings = await AsyncStorage.getItem("pilotTrainingSettings");
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    
    try {
      await AsyncStorage.setItem("pilotTrainingSettings", JSON.stringify(updated));
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  }, [settings]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const value = useMemo(() => ({
    settings,
    updateSettings,
  }), [settings, updateSettings]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
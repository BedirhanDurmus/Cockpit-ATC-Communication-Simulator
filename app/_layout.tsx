import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { TrainingProvider } from "@/hooks/useTrainingSession";
import { SettingsProvider } from "@/hooks/useSettings";
import { AppProvider } from "@/hooks/useAppState";
import AppNavigator from "@/components/AppNavigator";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <AppProvider>
      <TrainingProvider>
        <SettingsProvider>
          <QueryClientProvider client={queryClient}>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <AppNavigator />
            </GestureHandlerRootView>
          </QueryClientProvider>
        </SettingsProvider>
      </TrainingProvider>
    </AppProvider>
  );
}
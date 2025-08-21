import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "@/hooks/useSettings";

export default function SettingsScreen() {
  const { settings, updateSettings } = useSettings();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Training Configuration</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="time" color="#888" size={20} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Command Interval</Text>
                <Text style={styles.settingDescription}>
                  Time between ATC commands
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.settingValue}>
              <Text style={styles.valueText}>{settings.commandInterval}s</Text>
              <Ionicons name="chevron-forward" color="#888" size={20} />
            </TouchableOpacity>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="time" color="#888" size={20} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Response Timeout</Text>
                <Text style={styles.settingDescription}>
                  Maximum time to respond
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.settingValue}>
              <Text style={styles.valueText}>{settings.responseTimeout}s</Text>
              <Ionicons name="chevron-forward" color="#888" size={20} />
            </TouchableOpacity>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="alert-circle" color="#888" size={20} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Difficulty Level</Text>
                <Text style={styles.settingDescription}>
                  Complexity of commands
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.settingValue}>
              <Text style={styles.valueText}>{settings.difficulty}</Text>
              <Ionicons name="chevron-forward" color="#888" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audio Settings</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="volume-high" color="#888" size={20} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Voice Feedback</Text>
                <Text style={styles.settingDescription}>
                  Enable text-to-speech
                </Text>
              </View>
            </View>
            <Switch
              value={settings.voiceFeedback}
              onValueChange={(value) => updateSettings({ voiceFeedback: value })}
              trackColor={{ false: "#333", true: "#00A86B" }}
              thumbColor="white"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="volume-high" color="#888" size={20} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Sound Effects</Text>
                <Text style={styles.settingDescription}>
                  Confirmation sounds
                </Text>
              </View>
            </View>
            <Switch
              value={settings.soundEffects}
              onValueChange={(value) => updateSettings({ soundEffects: value })}
              trackColor={{ false: "#333", true: "#00A86B" }}
              thumbColor="white"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Display Settings</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="alert-circle" color="#888" size={20} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Cross-check Questions</Text>
                <Text style={styles.settingDescription}>
                  Random instrument checks
                </Text>
              </View>
            </View>
            <Switch
              value={settings.crossCheckEnabled}
              onValueChange={(value) => updateSettings({ crossCheckEnabled: value })}
              trackColor={{ false: "#333", true: "#00A86B" }}
              thumbColor="white"
            />
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.resetButton}>
            <Text style={styles.resetButtonText}>Reset Statistics</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#888",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1a1a1a",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    color: "white",
    fontSize: 16,
    marginBottom: 4,
  },
  settingDescription: {
    color: "#666",
    fontSize: 12,
  },
  settingValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  valueText: {
    color: "#00A86B",
    fontSize: 16,
    fontWeight: "600",
  },
  resetButton: {
    backgroundColor: "#dc2626",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  resetButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
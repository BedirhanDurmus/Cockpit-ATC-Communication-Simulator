import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTrainingSession } from "@/hooks/useTrainingSession";

export default function StatsScreen() {
  const { stats } = useTrainingSession();

  const statCards = [
    {
      icon: <Ionicons name="trophy" color="#FFD700" size={24} />,
      label: "Total Score",
      value: stats.totalScore.toString(),
      color: "#FFD700",
    },
    {
      icon: <Ionicons name="checkmark-circle" color="#00A86B" size={24} />,
      label: "Accuracy",
      value: `${stats.accuracy}%`,
      color: "#00A86B",
    },
    {
      icon: <Ionicons name="time" color="#2563eb" size={24} />,
      label: "Avg Response Time",
      value: `${stats.avgResponseTime}s`,
      color: "#2563eb",
    },
    {
      icon: <Ionicons name="trending-up" color="#8b5cf6" size={24} />,
      label: "Sessions Completed",
      value: stats.sessionsCompleted.toString(),
      color: "#8b5cf6",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Performance Statistics</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          {statCards.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={[styles.iconContainer, { backgroundColor: `${stat.color}20` }]}>
                {stat.icon}
              </View>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={[styles.statValue, { color: stat.color }]}>
                {stat.value}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Sessions</Text>
          {stats.recentSessions.length > 0 ? (
            stats.recentSessions.map((session: any, index: number) => (
              <View key={index} style={styles.sessionCard}>
                <View style={styles.sessionHeader}>
                  <Text style={styles.sessionDate}>
                    {new Date(session.date).toLocaleDateString()}
                  </Text>
                  <Text style={styles.sessionScore}>Score: {session.score}</Text>
                </View>
                <View style={styles.sessionStats}>
                  <Text style={styles.sessionStat}>
                    Commands: {session.commandsCompleted}
                  </Text>
                  <Text style={styles.sessionStat}>
                    Accuracy: {session.accuracy}%
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No sessions completed yet</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Improvement Tips</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>
              • Practice standard phraseology daily
            </Text>
            <Text style={styles.tipText}>
              • Focus on clear and concise readbacks
            </Text>
            <Text style={styles.tipText}>
              • Maintain situational awareness during commands
            </Text>
            <Text style={styles.tipText}>
              • Review ICAO radiotelephony procedures
            </Text>
          </View>
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
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 10,
  },
  statCard: {
    width: "50%",
    padding: 10,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statLabel: {
    color: "#888",
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    marginBottom: 16,
  },
  sessionCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sessionDate: {
    color: "white",
    fontSize: 14,
  },
  sessionScore: {
    color: "#00A86B",
    fontSize: 14,
    fontWeight: "600",
  },
  sessionStats: {
    flexDirection: "row",
    gap: 20,
  },
  sessionStat: {
    color: "#888",
    fontSize: 12,
  },
  emptyText: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
    padding: 20,
  },
  tipCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
  },
  tipText: {
    color: "#ccc",
    fontSize: 14,
    lineHeight: 24,
    marginBottom: 8,
  },
});
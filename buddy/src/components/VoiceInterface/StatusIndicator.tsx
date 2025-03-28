import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useVoiceStore } from "../../store/voiceStore";

export const StatusIndicator: React.FC = () => {
  const { isListening, isProcessing, isTtsPlaying } = useVoiceStore();

  const getStatusEmoji = () => {
    if (isTtsPlaying) return "💬"; // Speaking state
    if (isListening) return "👂"; // Listening state
    if (isProcessing) return "🧠"; // Processing state
    return "🤖"; // Ready state
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{getStatusEmoji()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  emoji: {
    fontSize: 72,
  },
});

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Markdown from "react-native-markdown-display";

type MessageBubbleProps = {
  role: "user" | "assistant" | "system";
  content: string;
  thought?: string;
  showThought?: boolean;
  tokensPerSecond?: number;
  onToggleThought?: () => void;
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  role,
  content,
  thought,
  showThought,
  tokensPerSecond,
  onToggleThought,
}) => {
  return (
    <View style={styles.messageWrapper}>
      <View
        style={[
          styles.messageBubble,
          role === "user" ? styles.userBubble : styles.llamaBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            role === "user" && styles.userMessageText,
          ]}
        >
          {thought && (
            <TouchableOpacity
              onPress={onToggleThought}
              style={styles.toggleButton}
            >
              <Text style={styles.toggleText}>
                {showThought ? "▼ Hide Thought" : "▶ Show Thought"}
              </Text>
            </TouchableOpacity>
          )}
          {showThought && thought && (
            <View style={styles.thoughtContainer}>
              <Text style={styles.thoughtTitle}>Model's Reasoning:</Text>
              <Text style={styles.thoughtText}>{thought}</Text>
            </View>
          )}
          <Markdown>{content}</Markdown>
        </Text>
      </View>
      {role === "assistant" && tokensPerSecond !== undefined && (
        <Text style={styles.tokenInfo}>
          {Math.round(tokensPerSecond)} tokens/s
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  messageWrapper: {
    marginBottom: 16,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 12,
    maxWidth: "80%",
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#3B82F6",
  },
  llamaBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  messageText: {
    fontSize: 16,
    color: "#334155",
  },
  userMessageText: {
    color: "#FFFFFF",
  },
  tokenInfo: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 4,
    textAlign: "right",
  },
  thoughtContainer: {
    marginTop: 8,
    padding: 10,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#94A3B8",
  },
  thoughtTitle: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  thoughtText: {
    color: "#475569",
    fontSize: 12,
    fontStyle: "italic",
    lineHeight: 16,
  },
  toggleButton: {
    marginTop: 8,
    paddingVertical: 4,
  },
  toggleText: {
    color: "#3B82F6",
    fontSize: 12,
    fontWeight: "500",
  },
});

import React from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

type ChatInputProps = {
  userInput: string;
  setUserInput: (text: string) => void;
  isLoading: boolean;
  isRecording: boolean;
  onSend: () => void;
  onToggleRecording: () => void;
  onBack: () => void;
};

export const ChatInput: React.FC<ChatInputProps> = ({
  userInput,
  setUserInput,
  isLoading,
  isRecording,
  onSend,
  onToggleRecording,
  onBack,
}) => {
  return (
    <>
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={[styles.iconButton, isRecording && styles.iconButtonActive]}
          onPress={onToggleRecording}
        >
          <Icon
            name={isRecording ? "microphone-slash" : "microphone"}
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <View style={styles.inputWrapper}>
          <Icon
            name="comment"
            size={20}
            color="#94A3B8"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            value={userInput}
            onChangeText={setUserInput}
            placeholder="Type your message..."
            multiline
          />
        </View>

        <TouchableOpacity
          style={[
            styles.iconButton,
            (!userInput.trim() || isLoading) && styles.iconButtonDisabled,
          ]}
          onPress={onSend}
          disabled={isLoading || !userInput.trim()}
        >
          <Icon name="send" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Icon name="chevron-left" size={24} color="#FFFFFF" />
        <Text style={styles.backButtonText}>Back to Model Selection</Text>
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    marginHorizontal: 8,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#334155",
    minHeight: 24,
    padding: 8,
  },
  iconButton: {
    backgroundColor: "#3B82F6",
    padding: 12,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    width: 46,
    height: 46,
  },
  iconButtonActive: {
    backgroundColor: "#EF4444",
  },
  iconButtonDisabled: {
    backgroundColor: "#93C5FD",
  },
  backButton: {
    backgroundColor: "#3B82F6",
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: Platform.OS === "ios" ? 20 : 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

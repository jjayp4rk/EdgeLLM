import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { initLlama, releaseAllLlama } from "llama.rn";
import { downloadModel } from "./src/api/model";
import ProgressBar from "./src/components/ProgressBar";
import { initializeTtsListeners, playTTS } from "./src/ttsListeners";
import { WaveformAvatar } from "./src/components/VoiceInterface/MemojiAvatar";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Voice, {
  SpeechResultsEvent,
  SpeechErrorEvent,
} from "@react-native-voice/voice";
import RNFS from "react-native-fs";
import { styles } from "./src/styles/AppStyles";
import { Message, AppState } from "./src/types";
import { INITIAL_CONVERSATION, MODEL_CONFIG, LLM_CONFIG } from "./src/config";
import { AnimatedVoiceIndicator } from "./src/components/VoiceInterface/AnimatedVoiceIndicator";
import { useVoiceStore } from "./src/store/voiceStore";
import { COLORS } from "./src/config/colors";

function App(): React.JSX.Element {
  const [progress, setProgress] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_CONVERSATION);
  const messagesRef = useRef<Message[]>(INITIAL_CONVERSATION);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [context, setContext] = useState<any>(null);
  const contextRef = useRef<any>(null);
  const [appState, setAppState] = useState<AppState>("welcome");
  const [downloadedModels, setDownloadedModels] = useState<string[]>([]);

  // Use Zustand store for voice states
  const {
    isListening,
    isProcessing,
    isTtsPlaying,
    currentSpeech,
    setIsListening,
    setIsProcessing,
    setIsTtsPlaying,
    setCurrentSpeech,
    reset: resetVoiceState,
  } = useVoiceStore();

  // Update refs when state changes
  useEffect(() => {
    contextRef.current = context;
    messagesRef.current = messages;
  }, [context, messages]);

  // Initialize voice and TTS services
  useEffect(() => {
    const initializeServices = async () => {
      try {
        console.log("[App] Initializing services");
        await initializeTtsListeners();
        const isAvailable = await Voice.isAvailable();
        if (!isAvailable) {
          throw new Error("Voice recognition is not available");
        }
        setupVoiceListeners();
        console.log("[App] Services initialized successfully");
      } catch (error) {
        console.error("[App] Service initialization failed:", error);
      }
    };

    initializeServices();

    return () => {
      console.log("[App] Cleaning up services");
      Voice.destroy().then(Voice.removeAllListeners);
      resetVoiceState();
    };
  }, []); // Only run once on mount

  // Check for downloaded models on mount
  useEffect(() => {
    const checkDownloadedModels = async () => {
      try {
        const files = await RNFS.readDir(RNFS.DocumentDirectoryPath);
        const ggufFiles = files
          .filter((file) => file.name.endsWith(".gguf"))
          .map((file) => file.name);
        setDownloadedModels(ggufFiles);
      } catch (error) {
        console.error("[App] Error checking downloaded models:", error);
      }
    };

    checkDownloadedModels();
  }, []);

  const handleGetStarted = async () => {
    try {
      setAppState("downloading");
      setIsDownloading(true);
      setProgress(0);
      const destPath = `${RNFS.DocumentDirectoryPath}/${MODEL_CONFIG.FILE}`;

      // Check if file already exists
      const exists = await RNFS.exists(destPath);

      if (!exists) {
        console.log("[App] Starting model download from:", MODEL_CONFIG.URL);
        await downloadModel(MODEL_CONFIG.FILE, MODEL_CONFIG.URL, (progress) => {
          // Convert progress to decimal (0-1) if it's coming as percentage (0-100)
          setProgress(progress / 100);
        });
      }

      if (context) {
        await releaseAllLlama();
        setContext(null);
        setMessages(INITIAL_CONVERSATION);
      }
      // Initialize the model
      console.log("[App] Initializing model from:", destPath);
      const newContext = await initLlama({
        model: destPath,
        use_mlock: true,
        n_ctx: 2048,
        n_gpu_layers: 1,
      });

      setContext(newContext);
      console.log("[App] Model initialized successfully");
      setAppState("ready");
    } catch (error) {
      console.error("[App] Error initializing model:", error);
      Alert.alert("Error", "Failed to initialize the model. Please try again.");
      setAppState("welcome");
    } finally {
      setIsDownloading(false);
      setProgress(0);
    }
  };

  const handleSpeechResult = async (text: string) => {
    if (isProcessing) {
      console.log("[App] Already processing, ignoring speech result");
      return;
    }

    setIsProcessing(true);
    setAiGenerating(true);
    console.log("[App] Processing speech:", text);

    try {
      // Get current messages from ref to ensure we have latest state
      const currentMessages = messagesRef.current;
      const newMessages: Message[] = [
        ...currentMessages,
        { role: "user" as const, content: text },
      ];

      // Update messages state once
      setMessages(newMessages);

      let currentResponse = "";
      let currentThought = "";
      let inThinkBlock = false;

      if (!contextRef.current) {
        throw new Error("No LLM context available");
      }

      console.log("[App] Using context:", contextRef.current);

      await contextRef.current.completion(
        {
          messages: newMessages,
          ...LLM_CONFIG,
        },
        (data: { token: string }) => {
          if (data?.token) {
            if (data.token.includes("<think>")) {
              inThinkBlock = true;
              currentThought = data.token.replace("<think>", "");
            } else if (data.token.includes("</think>")) {
              inThinkBlock = false;
              const finalThought = currentThought
                .replace("</think>", "")
                .trim();
              setMessages((prev) => {
                const lastIndex = prev.length - 1;
                const updated = [...prev];
                updated[lastIndex] = {
                  ...updated[lastIndex],
                  content: updated[lastIndex].content.replace(
                    `<think>${finalThought}</think>`,
                    ""
                  ),
                  thought: finalThought,
                };
                return updated;
              });
              currentThought = "";
            } else if (inThinkBlock) {
              currentThought += data.token;
            } else {
              currentResponse += data.token;
            }
          }
        }
      );

      if (!currentResponse) {
        console.error("[App] No response generated from LLM");
        return;
      }

      // Add AI response to history using the latest messages
      const updatedMessages: Message[] = [
        ...messagesRef.current,
        { role: "assistant" as const, content: currentResponse.trim() },
      ];

      setMessages(updatedMessages);

      // Keep processing state active until TTS starts
      // TTS listeners will handle setting isTtsPlaying to true
      await playTTS(currentResponse.trim());
    } catch (error) {
      console.error("[App] Error in handleSpeechResult:", error);
      if (
        error instanceof Error &&
        error.message === "No LLM context available"
      ) {
        Alert.alert("Error", "AI model context was lost. Please try again.");
        setAppState("welcome");
      }
    } finally {
      // Only reset processing states after everything is complete
      setCurrentSpeech("");
    }
  };

  const setupVoiceListeners = () => {
    console.log("[App] Setting up voice listeners");
    let finalSpeech = "";

    Voice.onSpeechStart = () => {
      console.log("[App] Speech started");
      setIsListening(true);
      finalSpeech = "";
      setCurrentSpeech("");
    };

    Voice.onSpeechEnd = async () => {
      console.log("[App] Speech ended");
      setIsListening(false);

      if (finalSpeech) {
        console.log("[App] Processing final speech:", finalSpeech);
        await handleSpeechResult(finalSpeech);
      } else {
        console.log("[App] No speech detected, ignoring");
      }
    };

    Voice.onSpeechResults = (e: SpeechResultsEvent) => {
      if (e.value && e.value[0]) {
        const text = e.value[0];
        console.log("[App] Speech result:", text);
        finalSpeech = text; // Store the latest result
        setCurrentSpeech(text);
      }
    };

    Voice.onSpeechError = (e: SpeechErrorEvent) => {
      console.error("[App] Speech error:", e);
      setIsListening(false);
      setIsProcessing(false);
      finalSpeech = "";
      setCurrentSpeech("");
      Alert.alert("Error", "Voice recognition failed. Please try again.");
    };
  };

  const startListening = useCallback(async () => {
    try {
      console.log("[App] Starting voice recognition");
      await Voice.start("en-US");
      setIsListening(true);
    } catch (error) {
      console.error("[App] Error starting voice recognition:", error);
      setIsListening(false);
      setIsProcessing(false);
      Alert.alert(
        "Error",
        "Failed to start voice recognition. Please try again."
      );
    }
  }, [setIsListening, setIsProcessing]);

  const stopListening = useCallback(async () => {
    try {
      console.log("[App] Stopping voice recognition");
      await Voice.stop();
      setIsListening(false);
    } catch (error) {
      console.error("[App] Error stopping voice recognition:", error);
      setIsListening(false);
      setIsProcessing(false);
    }
  }, [setIsListening, setIsProcessing]);

  const handleMicPress = async () => {
    console.log("[App] Mic button pressed, current state:", {
      isListening,
      isProcessing,
      appState,
      hasContext: !!context,
      isTtsPlaying,
    });

    if (!context) {
      console.log(
        "[App] No LLM context available - need to initialize model first"
      );
      Alert.alert(
        "Not Ready",
        "Please wait for the AI model to initialize. Go back to the welcome screen and click 'Start Chatting'."
      );
      return;
    }

    if (isListening) {
      console.log("[App] Stopping voice recognition");
      await stopListening();
    } else if (!isProcessing && !isTtsPlaying) {
      console.log("[App] Starting voice recognition");
      await startListening();
    }
  };

  const handleSettingsPress = useCallback(() => {
    if (isListening) {
      stopListening();
    }
    // Don't change app state if we have context, just reset messages
    if (context) {
      setMessages(INITIAL_CONVERSATION);
      setAppState("ready");
    } else {
      setAppState("welcome");
    }
  }, [isListening, stopListening, context]);

  const renderWelcomeScreen = () => (
    <View style={styles.container}>
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeTitle}>Buddy</Text>
        <Text style={styles.welcomeSubtitle}>
          Your friendly AI pal that's always here to help and chat
        </Text>

        <View style={styles.welcomeFeatures}>
          <View style={styles.featureItem}>
            <MaterialCommunityIcons
              name="shield-check"
              size={28}
              color={COLORS.primary}
              style={styles.featureIcon}
            />
            <Text style={styles.featureText}>Safe & Private</Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialCommunityIcons
              name="brain"
              size={28}
              color={COLORS.primary}
              style={styles.featureIcon}
            />
            <Text style={styles.featureText}>Super Smart</Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialCommunityIcons
              name="microphone"
              size={28}
              color={COLORS.primary}
              style={styles.featureIcon}
            />
            <Text style={styles.featureText}>Just Talk</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={handleGetStarted}
        >
          <Text style={styles.getStartedButtonText}>Start Chatting</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDownloadScreen = () => (
    <View style={[styles.card, styles.downloadCard]}>
      <MaterialCommunityIcons
        name="download"
        size={80}
        color={COLORS.primary}
      />
      <Text style={styles.downloadTitle}>Preparing Your AI Assistant</Text>
      <Text style={styles.downloadSubtitle}>
        This only happens once. We're downloading the AI model to your device.
      </Text>
      <View style={styles.progressContainer}>
        <ProgressBar progress={progress} />
        <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
      </View>
    </View>
  );

  const renderVoiceAssistant = () => (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.assistantTitle}>How can I help you today?</Text>

        <View style={styles.voiceContainer}>
          <AnimatedVoiceIndicator
            isListening={isListening}
            isProcessing={isProcessing}
            isTtsPlaying={isTtsPlaying}
          />

          <TouchableOpacity
            style={[
              styles.micButton,
              isListening && styles.micButtonActive,
              (isProcessing || isTtsPlaying) && styles.micButtonDisabled,
            ]}
            onPress={handleMicPress}
            disabled={isProcessing || aiGenerating || isTtsPlaying}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={isListening ? "stop" : "microphone"}
              size={28}
              color={
                isProcessing || isTtsPlaying
                  ? COLORS.text.disabled
                  : isListening
                  ? COLORS.text.light
                  : COLORS.text.primary
              }
            />
          </TouchableOpacity>

          {/* <Text style={styles.micInstructions}>
            {isListening
              ? "Listening..."
              : isProcessing
              ? "Processing..."
              : isTtsPlaying
              ? "Speaking..."
              : "Tap to start talking"}
          </Text> */}
        </View>
      </View>
    </View>
  );

  console.log("Messages", messages);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        {appState === "welcome" && renderWelcomeScreen()}
        {appState === "downloading" && renderDownloadScreen()}
        {appState === "ready" && renderVoiceAssistant()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default App;

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
} from "react-native";
import { initLlama, releaseAllLlama } from "llama.rn";
import { downloadModel } from "./src/api/model";
import ProgressBar from "./src/components/ProgressBar";
import axios from "axios";
import { initializeTtsListeners, playTTS } from "./src/ttsListeners";
import { WaveformAvatar } from "./src/components/VoiceInterface/MemojiAvatar";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Voice, {
  SpeechResultsEvent,
  SpeechErrorEvent,
} from "@react-native-voice/voice";
import RNFS from "react-native-fs";
import { styles } from "./src/styles/AppStyles";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
  thought?: string;
  showThought?: boolean;
}

const SYSTEM_PROMPT =
  "You are a friendly AI assistant talking to a child. Be short and concise in your responses. Children tend to ask a lot of questions, so be prepared to answer them, without asking for clarification. You are both their teacher and friend!";

const INITIAL_CONVERSATION: Message[] = [
  {
    role: "system",
    content: SYSTEM_PROMPT,
  },
];

function App(): React.JSX.Element {
  const [progress, setProgress] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [selectedModelFormat, setSelectedModelFormat] = useState<string>("");
  const [selectedGGUF, setSelectedGGUF] = useState<string>("");
  const [availableGGUFs, setAvailableGGUFs] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<
    "model-selection" | "conversation"
  >("model-selection");
  const [downloadedModels, setDownloadedModels] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentSpeech, setCurrentSpeech] = useState("");
  const [messages, setMessages] = useState<Message[]>(INITIAL_CONVERSATION);
  const [context, setContext] = useState<any>(null);
  const [tokensPerSecond, setTokensPerSecond] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  const modelFormats = [
    { label: "Llama-3.2-1B-Instruct" },
    { label: "Qwen2-0.5B-Instruct" },
    { label: "DeepSeek-R1-Distill-Qwen-1.5B" },
    { label: "SmolLM2-1.7B-Instruct" },
  ];

  const HF_TO_GGUF = {
    "Llama-3.2-1B-Instruct": "medmekk/Llama-3.2-1B-Instruct.GGUF",
    "DeepSeek-R1-Distill-Qwen-1.5B":
      "medmekk/DeepSeek-R1-Distill-Qwen-1.5B.GGUF",
    "Qwen2-0.5B-Instruct": "medmekk/Qwen2.5-0.5B-Instruct.GGUF",
    "SmolLM2-1.7B-Instruct": "medmekk/SmolLM2-1.7B-Instruct.GGUF",
  };

  const handleModelSelect = async (file: string) => {
    try {
      setIsDownloading(true);
      setProgress(0);
      const destPath = `${RNFS.DocumentDirectoryPath}/${file}`;

      // Check if file already exists
      const exists = await RNFS.exists(destPath);
      if (!exists) {
        // Download the model
        const repoPath =
          HF_TO_GGUF[selectedModelFormat as keyof typeof HF_TO_GGUF];
        const downloadUrl = `https://huggingface.co/${repoPath}/resolve/main/${file}`;
        console.log("[App] Downloading from:", downloadUrl);
        await downloadModel(file, downloadUrl, (progress) => {
          setProgress(progress);
        });
      }

      // Clean up previous model context
      if (context) {
        console.log("[App] Releasing previous model context");
        await releaseAllLlama();
        setContext(null);
        setMessages(INITIAL_CONVERSATION);
      }

      // Initialize the new model
      console.log("[App] Initializing new model from:", destPath);
      const newContext = await initLlama({
        model: destPath,
        use_mlock: true,
        n_ctx: 2048,
        n_gpu_layers: 1,
      });

      // Set the new context
      setContext(newContext);
      console.log(
        "[App] Model initialized successfully, context set:",
        !!newContext
      );

      // Update downloaded models list
      const files = await RNFS.readDir(RNFS.DocumentDirectoryPath);
      const ggufFiles = files
        .filter((file) => file.name.endsWith(".gguf"))
        .map((file) => file.name);
      setDownloadedModels(ggufFiles);

      setSelectedGGUF(file);
      setCurrentPage("conversation");
    } catch (error) {
      console.error("[App] Error loading model:", error);
      Alert.alert("Error", "Failed to load the model. Please try again.");
    } finally {
      setIsDownloading(false);
      setProgress(0);
    }
  };

  const handleBackToModelSelection = async () => {
    if (context) {
      console.log("[App] Releasing context before navigation");
      await releaseAllLlama();
      setContext(null);
      setMessages(INITIAL_CONVERSATION);
    }
    setCurrentPage("model-selection");
  };

  const handleFormatSelection = (format: string) => {
    setSelectedModelFormat(format);
    setAvailableGGUFs([]);
    fetchAvailableGGUFs(format);
  };

  const fetchAvailableGGUFs = async (modelFormat: string) => {
    if (!modelFormat) {
      Alert.alert("Error", "Please select a model format first.");
      return;
    }

    try {
      const repoPath = HF_TO_GGUF[modelFormat as keyof typeof HF_TO_GGUF];
      if (!repoPath) {
        throw new Error(
          `No repository mapping found for model format: ${modelFormat}`
        );
      }

      console.log("Fetching models from:", repoPath);
      const response = await axios.get(
        `https://huggingface.co/api/models/${repoPath}`
      );

      if (!response.data?.siblings) {
        throw new Error("Invalid API response format");
      }

      const files = response.data.siblings
        .filter((file: any) => file.rfilename.endsWith(".gguf"))
        .map((file: any) => file.rfilename);

      console.log("Found GGUF files:", files);
      setAvailableGGUFs(files);
    } catch (error) {
      console.error("Error fetching GGUFs:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch model files";
      Alert.alert("Error", errorMessage);
      setAvailableGGUFs([]);
    }
  };

  // Initialize voice and TTS services
  useEffect(() => {
    const initializeServices = async () => {
      try {
        console.log("[App] Initializing services");
        await initializeTtsListeners();
        await Voice.destroy();
        await Voice.removeAllListeners();
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
      if (context) {
        console.log("[App] Releasing context on unmount");
        releaseAllLlama();
        setContext(null);
      }
    };
  }, []);

  // Add effect to monitor context state
  useEffect(() => {
    console.log("[App] Context state changed:", !!context);
  }, [context]);

  const setupVoiceListeners = () => {
    console.log("[App] Setting up voice listeners");
    let finalSpeech = "";

    Voice.onSpeechStart = () => {
      console.log("[App] Speech started");
      setIsListening(true);
      finalSpeech = "";
      setCurrentSpeech("");
    };

    Voice.onSpeechEnd = () => {
      console.log("[App] Speech ended");
      setIsListening(false);
      if (finalSpeech) {
        console.log("[App] Processing final speech:", finalSpeech);
        handleSpeechResult(finalSpeech);
      } else {
        console.log("[App] No speech detected, ignoring");
      }
    };

    Voice.onSpeechResults = (e: SpeechResultsEvent) => {
      if (e.value) {
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
    };

    console.log("[App] Voice listeners setup complete");
  };

  const handleSpeechResult = async (text: string) => {
    console.log("[App] Handling speech result:", text);
    console.log("[App] Current context state:", !!context);

    if (isProcessing) {
      console.log("[App] Already processing, ignoring speech result");
      return;
    }

    try {
      setIsProcessing(true);
      console.log("[App] Processing speech:", text);

      // Add user message to history
      const newMessages: Message[] = [
        ...messages,
        { role: "user" as const, content: text },
      ];
      console.log("[App] Updated messages with user input:", newMessages);
      setMessages(newMessages);

      // Generate response using the LLM service
      if (!context) {
        console.error("[App] No LLM context available");
        throw new Error("No LLM context available");
      }

      console.log("[App] Starting LLM generation with context:", !!context);
      let currentResponse = "";
      let currentThought = "";
      let inThinkBlock = false;

      const result = await context.completion(
        {
          messages: newMessages,
          n_predict: 400,
          stop: [
            "</s>",
            "<|end|>",
            "user:",
            "assistant:",
            "<|im_end|>",
            "<|eot_id|>",
            "<|end▁of▁sentence|>",
            "<|end_of_text|>",
            "REDACTED_SPECIAL_TOKEN",
          ],
          temperature: 0.8,
          repeat_penalty: 1.2,
          top_k: 40,
          top_p: 0.9,
          n_ctx: 2048,
          presence_penalty: 0.6,
          frequency_penalty: 0.6,
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

      console.log("[App] AI response:", currentResponse);

      if (!currentResponse) {
        console.error("[App] No response generated from LLM");
        return;
      }

      // Add AI response to history
      const updatedMessages: Message[] = [
        ...newMessages,
        { role: "assistant" as const, content: currentResponse.trim() },
      ];
      console.log("[App] Updated messages with AI response:", updatedMessages);
      setMessages(updatedMessages);

      // Play the response using TTS
      console.log("[App] Playing TTS response");
      try {
        await playTTS(currentResponse.trim());
        console.log("[App] TTS playback complete");
      } catch (error) {
        console.error("[App] TTS playback failed:", error);
      }
    } catch (error) {
      console.error("[App] Error in handleSpeechResult:", error);
    } finally {
      setIsProcessing(false);
      setCurrentSpeech("");
      console.log("[App] Processing complete, mic enabled");
    }
  };

  const startListening = useCallback(async () => {
    if (isProcessing) {
      console.log("[App] Cannot start listening while processing");
      return;
    }

    if (!context) {
      console.error("[App] Cannot start listening - no LLM context available");
      Alert.alert("Error", "Please select a model first");
      return;
    }

    try {
      console.log("[App] Starting listening...");
      await Voice.destroy();
      await Voice.removeAllListeners();
      setupVoiceListeners();
      await Voice.start("en-US");
      console.log("[App] Voice.start() successful");
    } catch (error) {
      console.error("[App] Failed to start listening:", error);
      setIsListening(false);
      setIsProcessing(false);
    }
  }, [isProcessing, context]);

  const stopListening = useCallback(async () => {
    try {
      console.log("[App] Stopping listening...");
      await Voice.stop();
      console.log("[App] Voice.stop() successful");
    } catch (error) {
      console.error("[App] Failed to stop listening:", error);
      setIsListening(false);
      setIsProcessing(false);
    }
  }, []);

  const handleMicPress = () => {
    if (isListening) {
      console.log("[App] Stopping recording...");
      stopListening();
    } else if (!isProcessing) {
      console.log("[App] Starting recording...");
      startListening();
    } else {
      console.log("[App] Mic press ignored - still processing");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          ref={scrollViewRef}
          onScroll={(event) => {
            const currentPosition = event.nativeEvent.contentOffset.y;
            const contentHeight = event.nativeEvent.contentSize.height;
            const scrollViewHeight = event.nativeEvent.layoutMeasurement.height;
            const distanceFromBottom =
              contentHeight - scrollViewHeight - currentPosition;
            setAutoScrollEnabled(distanceFromBottom < 100);
          }}
          scrollEventThrottle={16}
        >
          {currentPage === "model-selection" && !isDownloading && (
            <View style={styles.card}>
              <Text style={styles.subtitle}>Choose a model format</Text>
              {modelFormats.map((format) => (
                <TouchableOpacity
                  key={format.label}
                  style={[
                    styles.button,
                    selectedModelFormat === format.label &&
                      styles.selectedButton,
                  ]}
                  onPress={() => handleFormatSelection(format.label)}
                >
                  <Text style={styles.buttonText}>{format.label}</Text>
                </TouchableOpacity>
              ))}
              {selectedModelFormat && availableGGUFs.length > 0 && (
                <>
                  <Text style={styles.subtitle}>Available Models</Text>
                  {availableGGUFs.map((file) => (
                    <TouchableOpacity
                      key={file}
                      style={styles.button}
                      onPress={() => handleModelSelect(file)}
                    >
                      <Text style={styles.buttonText}>{file}</Text>
                    </TouchableOpacity>
                  ))}
                </>
              )}
            </View>
          )}
          {currentPage === "conversation" && !isDownloading && (
            <View style={styles.container}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBackToModelSelection}
              >
                <MaterialCommunityIcons
                  name="chevron-left"
                  size={32}
                  color="#000"
                />
              </TouchableOpacity>

              <View style={styles.contentContainer}>
                <View style={styles.waveformContainer}>
                  <WaveformAvatar
                    isSpeaking={isProcessing}
                    isListening={isListening}
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.micButton,
                    isListening && styles.micButtonActive,
                    isProcessing && styles.micButtonDisabled,
                  ]}
                  onPress={handleMicPress}
                  disabled={isProcessing}
                >
                  <MaterialCommunityIcons
                    name={isListening ? "stop" : "microphone"}
                    size={32}
                    color={
                      isProcessing
                        ? "#A1A1AA"
                        : isListening
                        ? "#FFFFFF"
                        : "#000000"
                    }
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
          {isDownloading && (
            <View style={styles.card}>
              <Text style={styles.subtitle}>Downloading : </Text>
              <Text style={styles.subtitle2}>{selectedGGUF}</Text>
              <ProgressBar progress={progress} />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default App;

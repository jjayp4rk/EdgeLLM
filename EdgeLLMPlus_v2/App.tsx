import React, { useState, useRef, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  NativeEventEmitter,
  NativeModules,
} from "react-native";
import Voice, {
  SpeechResultsEvent,
  SpeechErrorEvent,
} from "@react-native-voice/voice";
import Icon from "react-native-vector-icons/FontAwesome";
import Markdown from "react-native-markdown-display";
import { initLlama, releaseAllLlama } from "llama.rn";
import { downloadModel } from "./src/api/model";
import ProgressBar from "./src/components/ProgressBar";
import RNFS from "react-native-fs";
import axios from "axios";
import { initializeTtsListeners, playTTS } from "./src/ttsListeners";

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
  thought?: string; // Single thought block
  showThought?: boolean;
};

// Fix regex flags by using a simpler pattern
const cleanThinkBlocks = (text: string) => {
  return text
    .replace(/<think>/g, "")
    .replace(/<\/think>/g, "")
    .trim();
};

function App(): React.JSX.Element {
  const INITIAL_CONVERSATION: Message[] = [
    {
      role: "system",
      content:
        "This is a conversation between user and assistant, a friendly chatbot.",
    },
  ];
  const [context, setContext] = useState<any>(null);
  const [conversation, setConversation] =
    useState<Message[]>(INITIAL_CONVERSATION);
  const [userInput, setUserInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [selectedModelFormat, setSelectedModelFormat] = useState<string>("");
  const [selectedGGUF, setSelectedGGUF] = useState<string | null>(null);
  const [availableGGUFs, setAvailableGGUFs] = useState<string[]>([]); // List of .gguf files
  const [currentPage, setCurrentPage] = useState<
    "modelSelection" | "conversation"
  >("modelSelection"); // Navigation state
  const [tokensPerSecond, setTokensPerSecond] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const [downloadedModels, setDownloadedModels] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const modelFormats = [
    { label: "Llama-3.2-1B-Instruct" },
    { label: "Qwen2-0.5B-Instruct" },
    { label: "DeepSeek-R1-Distill-Qwen-1.5B" },
    { label: "SmolLM2-1.7B-Instruct" },
  ];

  const HF_TO_GGUF = {
    // 'Llama-3.2-1B-Instruct': 'bartowski/Llama-3.2-1B-Instruct-GGUF',
    "Llama-3.2-1B-Instruct": "medmekk/Llama-3.2-1B-Instruct.GGUF",
    "DeepSeek-R1-Distill-Qwen-1.5B":
      "medmekk/DeepSeek-R1-Distill-Qwen-1.5B.GGUF",
    "Qwen2-0.5B-Instruct": "medmekk/Qwen2.5-0.5B-Instruct.GGUF",
    "SmolLM2-1.7B-Instruct": "medmekk/SmolLM2-1.7B-Instruct.GGUF",
  };

  // To handle the scroll view
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollPositionRef = useRef(0);
  const contentHeightRef = useRef(0);

  const handleGGUFSelection = (file: string) => {
    setSelectedGGUF(file);
    Alert.alert(
      "Confirm Download",
      `Do you want to download ${file} ?`,
      [
        {
          text: "No",
          onPress: () => setSelectedGGUF(null),
          style: "cancel",
        },
        { text: "Yes", onPress: () => handleDownloadAndNavigate(file) },
      ],
      { cancelable: false }
    );
  };

  const handleDownloadAndNavigate = async (file: string) => {
    await handleDownloadModel(file);
    setCurrentPage("conversation"); // Navigate to conversation after download
  };

  const handleBackToModelSelection = () => {
    setContext(null);
    releaseAllLlama();
    setConversation(INITIAL_CONVERSATION);
    setSelectedGGUF(null);
    setTokensPerSecond([]);
    setCurrentPage("modelSelection");
  };

  const toggleThought = (messageIndex: number) => {
    setConversation((prev) =>
      prev.map((msg, index) =>
        index === messageIndex ? { ...msg, showThought: !msg.showThought } : msg
      )
    );
  };
  const fetchAvailableGGUFs = async (modelFormat: string) => {
    setIsFetching(true);
    console.log(HF_TO_GGUF[modelFormat as keyof typeof HF_TO_GGUF]);
    try {
      const response = await axios.get(
        `https://huggingface.co/api/models/${
          HF_TO_GGUF[modelFormat as keyof typeof HF_TO_GGUF]
        }`
      );
      console.log(response);
      const files = response.data.siblings.filter((file: any) =>
        file.rfilename.endsWith(".gguf")
      );
      setAvailableGGUFs(files.map((file: any) => file.rfilename));
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to fetch .gguf files from Hugging Face API."
      );
    } finally {
      setIsFetching(false);
    }
  };

  const handleFormatSelection = (format: string) => {
    setSelectedModelFormat(format);
    setAvailableGGUFs([]); // Clear any previous list
    fetchAvailableGGUFs(format); // Fetch .gguf files for selected format
  };

  const checkDownloadedModels = async () => {
    try {
      const files = await RNFS.readDir(RNFS.DocumentDirectoryPath);
      const ggufFiles = files
        .filter((file) => file.name.endsWith(".gguf"))
        .map((file) => file.name);
      setDownloadedModels(ggufFiles);
    } catch (error) {
      console.error("Error checking downloaded models:", error);
    }
  };
  useEffect(() => {
    checkDownloadedModels();
  }, [currentPage]);

  const checkFileExists = async (filePath: string) => {
    try {
      const fileExists = await RNFS.exists(filePath);
      console.log("File exists:", fileExists);
      return fileExists;
    } catch (error) {
      console.error("Error checking file existence:", error);
      return false;
    }
  };
  const handleScroll = (event: any) => {
    const currentPosition = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const scrollViewHeight = event.nativeEvent.layoutMeasurement.height;

    // Store current scroll position and content height
    scrollPositionRef.current = currentPosition;
    contentHeightRef.current = contentHeight;

    // If user has scrolled up more than 100px from bottom, disable auto-scroll
    const distanceFromBottom =
      contentHeight - scrollViewHeight - currentPosition;
    setAutoScrollEnabled(distanceFromBottom < 100);
  };

  const handleDownloadModel = async (file: string) => {
    const downloadUrl = `https://huggingface.co/${
      HF_TO_GGUF[selectedModelFormat as keyof typeof HF_TO_GGUF]
    }/resolve/main/${file}`;
    setIsDownloading(true);
    setProgress(0);

    const destPath = `${RNFS.DocumentDirectoryPath}/${file}`;
    if (await checkFileExists(destPath)) {
      const success = await loadModel(file);
      if (success) {
        Alert.alert(
          "Info",
          `File ${destPath} already exists, we will load it directly.`
        );
        setIsDownloading(false);
        return;
      }
    }
    try {
      console.log("before download");
      console.log(isDownloading);

      const destPath = await downloadModel(file, downloadUrl, (progress) =>
        setProgress(progress)
      );
      Alert.alert("Success", `Model downloaded to: ${destPath}`);

      // After downloading, load the model
      await loadModel(file);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      Alert.alert("Error", `Download failed: ${errorMessage}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const stopGeneration = async () => {
    try {
      await context.stopCompletion();
      setIsGenerating(false);
      setIsLoading(false);

      setConversation((prev) => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage.role === "assistant") {
          return [
            ...prev.slice(0, -1),
            {
              ...lastMessage,
              content: lastMessage.content + "\n\n*Generation stopped by user*",
            },
          ];
        }
        return prev;
      });
    } catch (error) {
      console.error("Error stopping completion:", error);
    }
  };

  const loadModel = async (modelName: string) => {
    try {
      console.log("Starting model load process for:", modelName);
      const destPath = `${RNFS.DocumentDirectoryPath}/${modelName}`;
      console.log("Model path:", destPath);

      // Check if file exists
      const exists = await RNFS.exists(destPath);
      console.log("Model file exists:", exists);

      if (context) {
        console.log("Releasing existing context");
        await releaseAllLlama();
        setContext(null);
        setConversation(INITIAL_CONVERSATION);
      }

      console.log("Initializing new Llama context");
      const llamaContext = await initLlama({
        model: destPath,
        use_mlock: true,
        n_ctx: 2048,
        n_gpu_layers: 1,
      });

      console.log("Llama context initialized successfully");
      setContext(llamaContext);
      Alert.alert("Model Loaded", "The model was successfully loaded.");
      return true;
    } catch (error) {
      console.error("Error in loadModel:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      Alert.alert("Error Loading Model", errorMessage);
      return false;
    }
  };

  const handleSendMessage = async () => {
    console.log("Starting handleSendMessage");
    console.log("Current context:", context ? "Available" : "Not available");

    if (!context) {
      console.log("No context available - model not loaded");
      Alert.alert("Model Not Loaded", "Please load the model first.");
      return;
    }

    if (!userInput.trim()) {
      console.log("Empty user input");
      Alert.alert("Input Error", "Please enter a message.");
      return;
    }

    console.log("Preparing to send message:", userInput);
    const newConversation: Message[] = [
      ...conversation,
      { role: "user", content: userInput },
    ];
    console.log("New conversation length:", newConversation.length);

    setConversation(newConversation);
    setUserInput("");
    setIsLoading(true);
    setIsGenerating(true);
    setAutoScrollEnabled(true);

    try {
      console.log("Starting completion request");
      const stopWords = [
        "</s>",
        "<|end|>",
        "user:",
        "assistant:",
        "<|im_end|>",
        "<|eot_id|>",
        "<|end▁of▁sentence|>",
        "<|end_of_text|>",
        "",
      ];
      const chat = newConversation;

      // Append a placeholder for the assistant's response
      setConversation((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "",
          thought: undefined,
          showThought: false,
        },
      ]);

      let currentAssistantMessage = "";
      let currentThought = "";
      let inThinkBlock = false;

      interface CompletionData {
        token: string;
      }

      interface CompletionResult {
        timings: {
          predicted_per_second: number;
        };
      }

      console.log("Calling context.completion with chat length:", chat.length);

      // Format the conversation into a prompt the model understands
      const formattedPrompt =
        chat
          .map((msg) => {
            if (msg.role === "system") {
              return `<|im_start|>system\n${msg.content}<|im_end|>\n`;
            } else if (msg.role === "user") {
              return `<|im_start|>user\n${msg.content}<|im_end|>\n`;
            } else {
              return `<|im_start|>assistant\n${msg.content}<|im_end|>\n`;
            }
          })
          .join("") + "<|im_start|>assistant\n";

      console.log("Formatted prompt:", formattedPrompt);

      const result: CompletionResult = await context.completion(
        {
          prompt: formattedPrompt,
          messages: chat,
          n_predict: 1000,
          stop: ["<|im_end|>", "<|im_start|>"],
          temperature: 0.7,
          repeat_penalty: 1.1,
          top_k: 40,
          top_p: 0.9,
        },
        (data: CompletionData) => {
          if (!data || !data.token) {
            console.log("Received empty or invalid token data:", data);
            return;
          }

          const token = data.token;
          currentAssistantMessage += token;

          if (token.includes("<think>")) {
            inThinkBlock = true;
            currentThought = token.replace("<think>", "");
          } else if (token.includes("</think>")) {
            inThinkBlock = false;
            const finalThought = currentThought.replace("</think>", "").trim();

            setConversation((prev) => {
              const lastIndex = prev.length - 1;
              const updated = [...prev];
              updated[lastIndex] = {
                ...updated[lastIndex],
                content: cleanThinkBlocks(updated[lastIndex].content),
                thought: finalThought,
              };
              return updated;
            });

            currentThought = "";
          } else if (inThinkBlock) {
            currentThought += token;
          }

          const visibleContent = cleanThinkBlocks(currentAssistantMessage);

          setConversation((prev) => {
            const lastIndex = prev.length - 1;
            const updated = [...prev];
            updated[lastIndex] = {
              ...updated[lastIndex],
              content: visibleContent,
            };
            return updated;
          });

          if (autoScrollEnabled && scrollViewRef.current) {
            requestAnimationFrame(() => {
              scrollViewRef.current?.scrollToEnd({ animated: false });
            });
          }

          // Only update tokens per second if result is available
          if (result && result.timings) {
            setTokensPerSecond((prev) => [
              ...prev,
              result.timings.predicted_per_second,
            ]);
          }
        }
      );

      console.log("Completion finished successfully");

      // After completion finishes, speak the assistant's response
      const finalMessage = cleanThinkBlocks(currentAssistantMessage);
      if (finalMessage.trim()) {
        playTTS(finalMessage);
      }

      // Update final conversation state
      setConversation((prev) => {
        const lastIndex = prev.length - 1;
        const updated = [...prev];
        updated[lastIndex] = {
          ...updated[lastIndex],
          content: finalMessage,
        };
        return updated;
      });

      // Only update final tokens per second if result is available
      if (result && result.timings) {
        setTokensPerSecond((prev) => [
          ...prev,
          result.timings.predicted_per_second,
        ]);
      }

      setIsGenerating(false);
      setIsLoading(false);
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
      setIsGenerating(false);
      setIsLoading(false);
      Alert.alert("Error", "Failed to generate response. Please try again.");
    }
  };

  const startRecording = async () => {
    try {
      console.log("Starting voice recording...");
      await Voice.start("en-US");
      setIsRecording(true);
      console.log("Voice recording started successfully");
    } catch (error) {
      console.error("Error starting voice recording:", error);
      Alert.alert("Voice Error", "Failed to start voice recording");
    }
  };

  const stopRecording = async () => {
    try {
      console.log("Stopping voice recording...");
      await Voice.stop();
      setIsRecording(false);
      console.log("Voice recording stopped successfully");
    } catch (error) {
      console.error("Error stopping voice recording:", error);
      Alert.alert("Voice Error", "Failed to stop voice recording");
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  useEffect(() => {
    // Voice event handlers
    Voice.onSpeechStart = () => {
      console.log("Voice recognition started");
    };

    Voice.onSpeechEnd = () => {
      console.log("Voice recognition ended");
    };

    Voice.onSpeechResults = (e: SpeechResultsEvent) => {
      console.log("Voice results received:", e.value);
      if (e.value) {
        setUserInput(e.value[0]);
      }
    };

    Voice.onSpeechError = (e: SpeechErrorEvent) => {
      console.error("Voice recognition error:", e);
      Alert.alert("Voice Error", "Failed to recognize speech");
    };

    return () => {
      console.log("Cleaning up voice recognition...");
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  useEffect(() => {
    initializeTtsListeners();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          ref={scrollViewRef}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <Text style={styles.title}>Llama Chat</Text>
          {currentPage === "modelSelection" && !isDownloading && (
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
              {selectedModelFormat && (
                <View>
                  <Text style={styles.subtitle}>Select a .gguf file</Text>
                  {isFetching && (
                    <ActivityIndicator size="small" color="#2563EB" />
                  )}
                  {availableGGUFs.map((file, index) => {
                    const isDownloaded = downloadedModels.includes(file);
                    return (
                      <View key={index} style={styles.modelContainer}>
                        <TouchableOpacity
                          style={[
                            styles.modelButton,
                            selectedGGUF === file && styles.selectedButton,
                            isDownloaded && styles.downloadedModelButton,
                          ]}
                          onPress={() =>
                            isDownloaded
                              ? (loadModel(file),
                                setCurrentPage("conversation"),
                                setSelectedGGUF(file))
                              : handleGGUFSelection(file)
                          }
                        >
                          <View style={styles.modelButtonContent}>
                            <View style={styles.modelStatusContainer}>
                              {isDownloaded ? (
                                <View style={styles.downloadedIndicator}>
                                  <Text style={styles.downloadedIcon}>▼</Text>
                                </View>
                              ) : (
                                <View style={styles.notDownloadedIndicator}>
                                  <Text style={styles.notDownloadedIcon}>
                                    ▽
                                  </Text>
                                </View>
                              )}
                              <Text
                                style={[
                                  styles.buttonTextGGUF,
                                  selectedGGUF === file &&
                                    styles.selectedButtonText,
                                  isDownloaded && styles.downloadedText,
                                ]}
                              >
                                {file.split("-")[-1] == "imat"
                                  ? file
                                  : file.split("-").pop()}
                              </Text>
                            </View>
                            {isDownloaded && (
                              <View style={styles.loadModelIndicator}>
                                <Text style={styles.loadModelText}>
                                  TAP TO LOAD →
                                </Text>
                              </View>
                            )}
                            {!isDownloaded && (
                              <View style={styles.downloadIndicator}>
                                <Text style={styles.downloadText}>
                                  DOWNLOAD →
                                </Text>
                              </View>
                            )}
                          </View>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          )}
          {currentPage === "conversation" && !isDownloading && (
            <View style={styles.chatWrapper}>
              <Text style={styles.subtitle2}>Chatting with {selectedGGUF}</Text>
              <View style={styles.chatContainer}>
                <Text style={styles.greetingText}>
                  🦙 Welcome! The Llama is ready to chat. Ask away! 🎉
                </Text>
                {conversation.slice(1).map((msg, index) => (
                  <View key={index} style={styles.messageWrapper}>
                    <View
                      style={[
                        styles.messageBubble,
                        msg.role === "user"
                          ? styles.userBubble
                          : styles.llamaBubble,
                      ]}
                    >
                      <Text
                        style={[
                          styles.messageText,
                          msg.role === "user" && styles.userMessageText,
                        ]}
                      >
                        {msg.thought && (
                          <TouchableOpacity
                            onPress={() => toggleThought(index + 1)}
                            style={styles.toggleButton}
                          >
                            <Text style={styles.toggleText}>
                              {msg.showThought
                                ? "▼ Hide Thought"
                                : "▶ Show Thought"}
                            </Text>
                          </TouchableOpacity>
                        )}
                        {msg.showThought && msg.thought && (
                          <View style={styles.thoughtContainer}>
                            <Text style={styles.thoughtTitle}>
                              Model's Reasoning:
                            </Text>
                            <Text style={styles.thoughtText}>
                              {msg.thought}
                            </Text>
                          </View>
                        )}
                        <Markdown>{msg.content}</Markdown>
                      </Text>
                    </View>
                    {msg.role === "assistant" && (
                      <Text style={styles.tokenInfo}>
                        {tokensPerSecond[Math.floor(index / 2)]} tokens/s
                      </Text>
                    )}
                  </View>
                ))}
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
        <View style={styles.bottomContainer}>
          {currentPage === "conversation" && (
            <>
              <View style={styles.inputContainer}>
                <TouchableOpacity
                  style={[
                    styles.iconButton,
                    isRecording && styles.iconButtonActive,
                  ]}
                  onPress={toggleRecording}
                >
                  <Icon
                    name={isRecording ? "microphone-slash" : "microphone"}
                    size={24}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>

                <View style={styles.inputWrapper}>
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
                    (!userInput.trim() || isLoading) &&
                      styles.iconButtonDisabled,
                  ]}
                  onPress={handleSendMessage}
                  disabled={isLoading || !userInput.trim()}
                >
                  <Icon name="send" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBackToModelSelection}
              >
                <Icon name="chevron-left" size={24} color="#FFFFFF" />
                <Text style={styles.backButtonText}>
                  Back to Model Selection
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1E293B",
    marginVertical: 24,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    margin: 16,
    shadowColor: "#475569",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 16,
    marginTop: 16,
  },
  subtitle2: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 16,
    color: "#93C5FD",
  },
  button: {
    backgroundColor: "#93C5FD", // Lighter blue
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginVertical: 6,
    shadowColor: "#93C5FD", // Matching lighter shadow color
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15, // Slightly reduced opacity for subtle shadows
    shadowRadius: 4,
    elevation: 2,
  },
  selectedButton: {
    backgroundColor: "#2563EB",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  chatWrapper: {
    flex: 1,
    padding: 16,
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
  chatContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
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
    backgroundColor: "#EF4444", // Red color when recording
  },
  iconButtonDisabled: {
    backgroundColor: "#93C5FD", // Lighter blue when disabled
  },
  greetingText: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    marginVertical: 12,
    color: "#64748B", // Soft gray that complements #2563EB
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

  bottomContainer: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingBottom: Platform.OS === "ios" ? 20 : 10,
  },
  modelContainer: {
    marginVertical: 6,
    borderRadius: 12,
    overflow: "hidden",
  },

  modelButton: {
    backgroundColor: "#EFF6FF",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    shadowColor: "#3B82F6",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  downloadedModelButton: {
    backgroundColor: "#EFF6FF",
    borderColor: "#3B82F6",
    borderWidth: 1,
  },

  modelButtonContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  modelStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  downloadedIndicator: {
    backgroundColor: "#DBEAFE",
    padding: 4,
    borderRadius: 6,
    marginRight: 8,
  },

  notDownloadedIndicator: {
    backgroundColor: "#F1F5F9",
    padding: 4,
    borderRadius: 6,
    marginRight: 8,
  },

  downloadedIcon: {
    color: "#3B82F6",
    fontSize: 14,
    fontWeight: "bold",
  },

  notDownloadedIcon: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "bold",
  },

  downloadedText: {
    color: "#1E40AF",
  },

  loadModelIndicator: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },

  buttonTextGGUF: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "500",
  },

  selectedButtonText: {
    color: "#1E40AF",
    fontWeight: "600",
  },

  loadModelText: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "500",
  },

  downloadIndicator: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },

  downloadText: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "500",
  },
});

export default App;

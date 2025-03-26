import Voice, {
  SpeechResultsEvent,
  SpeechErrorEvent,
} from "@react-native-voice/voice";

type VoiceServiceConfig = {
  silenceThreshold: number; // Duration in ms to consider as silence
  minSpeechDuration: number; // Minimum duration to consider as speech
  maxSpeechDuration: number; // Maximum duration before forcing stop
};

type VoiceServiceCallbacks = {
  onSpeechStart: () => void;
  onSpeechEnd: (text: string) => void;
  onSilenceDetected: () => void;
  onError: (error: SpeechErrorEvent) => void;
};

class VoiceService {
  private isListening: boolean = false;
  private silenceStartTime: number = 0;
  private speechStartTime: number = 0;
  private currentSpeech: string = "";
  private config: VoiceServiceConfig;
  private callbacks: VoiceServiceCallbacks;
  private isInitialized: boolean = false;
  private hasSentResult: boolean = false;
  private isStarting: boolean = false;
  private isStopping: boolean = false;

  constructor(config: VoiceServiceConfig, callbacks: VoiceServiceCallbacks) {
    this.config = config;
    this.callbacks = callbacks;
    this.initialize();
  }

  private async initialize() {
    try {
      console.log("[Voice Service] Initializing...");
      await Voice.destroy();
      await Voice.removeAllListeners();
      this.setupVoiceListeners();
      const isAvailable = await Voice.isAvailable();
      console.log("[Voice Service] Availability:", isAvailable);
      if (!isAvailable) {
        throw new Error("Voice recognition is not available");
      }
      this.isInitialized = true;
      console.log("[Voice Service] Initialized successfully");
    } catch (error) {
      console.error("[Voice Service] Initialization failed:", error);
      this.callbacks.onError({
        error: { message: "Voice initialization failed" },
      } as SpeechErrorEvent);
    }
  }

  private setupVoiceListeners() {
    console.log("[Voice Service] Setting up listeners...");

    Voice.onSpeechStart = () => {
      console.log("[Voice Service] Speech started");
      this.isListening = true;
      this.isStarting = false;
      this.speechStartTime = Date.now();
      this.hasSentResult = false;
      this.callbacks.onSpeechStart();
    };

    Voice.onSpeechEnd = () => {
      console.log("[Voice Service] Speech ended");
      this.isListening = false;
      this.isStopping = false;
      this.silenceStartTime = Date.now();

      // Only send the final result if we have speech and haven't sent it yet
      if (this.currentSpeech && !this.hasSentResult) {
        const speechDuration = Date.now() - this.speechStartTime;
        if (speechDuration >= this.config.minSpeechDuration) {
          console.log(
            "[Voice Service] Sending final result:",
            this.currentSpeech
          );
          this.callbacks.onSpeechEnd(this.currentSpeech);
          this.hasSentResult = true;
        } else {
          console.log("[Voice Service] Speech too short, ignoring...");
        }
      }

      this.callbacks.onSilenceDetected();
    };

    Voice.onSpeechResults = (e: SpeechResultsEvent) => {
      if (e.value) {
        this.currentSpeech = e.value[0];
        console.log("[Voice Service] Partial result:", this.currentSpeech);
      }
    };

    Voice.onSpeechError = (e: SpeechErrorEvent) => {
      console.error("[Voice Service] Speech error:", {
        code: e.error?.code,
        message: e.error?.message,
        details: e,
      });
      this.isListening = false;
      this.isStarting = false;
      this.isStopping = false;
      this.hasSentResult = false;
      this.callbacks.onError(e);
    };
  }

  public async startListening() {
    try {
      if (this.isListening || this.isStarting) {
        console.log("[Voice Service] Already listening or starting");
        return;
      }

      if (!this.isInitialized) {
        console.log("[Voice Service] Not initialized, initializing...");
        await this.initialize();
      }

      console.log("[Voice Service] Starting recognition...");
      this.isStarting = true;
      this.currentSpeech = "";
      this.hasSentResult = false;
      await Voice.start("en-US");
      console.log("[Voice Service] Recognition started");
    } catch (error) {
      console.error("[Voice Service] Start listening failed:", error);
      this.isStarting = false;
      this.callbacks.onError({
        error: { message: "Failed to start listening" },
      } as SpeechErrorEvent);
    }
  }

  public async stopListening() {
    try {
      if (!this.isListening || this.isStopping) {
        console.log("[Voice Service] Not listening or already stopping");
        return;
      }

      console.log("[Voice Service] Stopping recognition...");
      this.isStopping = true;
      await Voice.stop();
      console.log("[Voice Service] Recognition stopped");
    } catch (error) {
      console.error("[Voice Service] Stop listening failed:", error);
      this.isStopping = false;
      this.callbacks.onError({
        error: { message: "Failed to stop listening" },
      } as SpeechErrorEvent);
    }
  }

  public async cleanup() {
    try {
      console.log("[Voice Service] Cleaning up...");
      if (this.isListening) {
        await this.stopListening();
      }
      await Voice.destroy();
      await Voice.removeAllListeners();
      this.isInitialized = false;
      this.isListening = false;
      this.isStarting = false;
      this.isStopping = false;
      console.log("[Voice Service] Cleanup complete");
    } catch (error) {
      console.error("[Voice Service] Cleanup failed:", error);
    }
  }
}

export const createVoiceService = (
  config: VoiceServiceConfig,
  callbacks: VoiceServiceCallbacks
) => {
  return new VoiceService(config, callbacks);
};

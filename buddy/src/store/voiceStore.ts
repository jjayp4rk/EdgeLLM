import { create } from "zustand";

interface VoiceState {
  isListening: boolean;
  isProcessing: boolean;
  isTtsPlaying: boolean;
  currentSpeech: string;
  ttsProgress: number;
  aiGenerating: boolean;
  setIsListening: (isListening: boolean) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  setIsTtsPlaying: (isTtsPlaying: boolean) => void;
  setCurrentSpeech: (speech: string) => void;
  setTtsProgress: (progress: number) => void;
  setAiGenerating: (aiGenerating: boolean) => void;
  reset: () => void;
}

export const useVoiceStore = create<VoiceState>((set) => ({
  isListening: false,
  isProcessing: false,
  isTtsPlaying: false,
  currentSpeech: "",
  ttsProgress: 0,
  aiGenerating: false,
  setIsListening: (isListening) => set({ isListening }),
  setIsProcessing: (isProcessing) => set({ isProcessing }),
  setIsTtsPlaying: (isTtsPlaying) => set({ isTtsPlaying }),
  setCurrentSpeech: (speech) => set({ currentSpeech: speech }),
  setTtsProgress: (progress) => set({ ttsProgress: progress }),
  setAiGenerating: (aiGenerating) => set({ aiGenerating }),
  reset: () =>
    set({
      isListening: false,
      isProcessing: false,
      isTtsPlaying: false,
      currentSpeech: "",
      ttsProgress: 0,
      aiGenerating: false,
    }),
}));

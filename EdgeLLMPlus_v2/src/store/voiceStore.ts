import { create } from "zustand";

interface VoiceState {
  isListening: boolean;
  isProcessing: boolean;
  isTtsPlaying: boolean;
  currentSpeech: string;
  setIsListening: (isListening: boolean) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  setIsTtsPlaying: (isTtsPlaying: boolean) => void;
  setCurrentSpeech: (speech: string) => void;
  reset: () => void;
}

export const useVoiceStore = create<VoiceState>((set) => ({
  isListening: false,
  isProcessing: false,
  isTtsPlaying: false,
  currentSpeech: "",
  setIsListening: (isListening) => set({ isListening }),
  setIsProcessing: (isProcessing) => set({ isProcessing }),
  setIsTtsPlaying: (isTtsPlaying) => set({ isTtsPlaying }),
  setCurrentSpeech: (speech) => set({ currentSpeech: speech }),
  reset: () =>
    set({
      isListening: false,
      isProcessing: false,
      isTtsPlaying: false,
      currentSpeech: "",
    }),
}));

import { create } from "zustand";
import Tts from "react-native-tts";

interface Settings {
  // Voice Settings
  speechRate: number;
  speechPitch: number;
  selectedVoice: string;

  // Visual Settings
  circleSize: number;
  animationSpeed: number;
  isDarkMode: boolean;

  // Interaction Settings
  autoListen: boolean;
  hapticFeedback: boolean;
  soundEffects: boolean;

  // Actions
  setSpeechRate: (rate: number) => void;
  setSpeechPitch: (pitch: number) => void;
  setSelectedVoice: (voice: string) => void;
  setCircleSize: (size: number) => void;
  setAnimationSpeed: (speed: number) => void;
  setIsDarkMode: (isDark: boolean) => void;
  setAutoListen: (auto: boolean) => void;
  setHapticFeedback: (enabled: boolean) => void;
  setSoundEffects: (enabled: boolean) => void;
}

export const useSettingsStore = create<Settings>((set) => ({
  // Default values
  speechRate: 0.5,
  speechPitch: 1.0,
  selectedVoice: "com.apple.voice.compact.en-US.Samantha",
  circleSize: 0.5, // 50% of screen width
  animationSpeed: 1.0,
  isDarkMode: false,
  autoListen: false,
  hapticFeedback: true,
  soundEffects: true,

  // Actions
  setSpeechRate: (rate) => {
    set({ speechRate: rate });
    Tts.setDefaultRate(rate);
  },
  setSpeechPitch: (pitch) => {
    set({ speechPitch: pitch });
    Tts.setDefaultPitch(pitch);
  },
  setSelectedVoice: (voice) => {
    set({ selectedVoice: voice });
    Tts.setDefaultVoice(voice);
  },
  setCircleSize: (size) => set({ circleSize: size }),
  setAnimationSpeed: (speed) => set({ animationSpeed: speed }),
  setIsDarkMode: (isDark) => set({ isDarkMode: isDark }),
  setAutoListen: (auto) => set({ autoListen: auto }),
  setHapticFeedback: (enabled) => set({ hapticFeedback: enabled }),
  setSoundEffects: (enabled) => set({ soundEffects: enabled }),
}));

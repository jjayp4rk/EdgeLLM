import Tts from "react-native-tts";

export const playTTS = async (text: string): Promise<void> => {
  try {
    await Tts.setDefaultLanguage("en-US");
    await Tts.setDefaultRate(0.5); // Slower rate for better clarity
    await Tts.setDefaultPitch(1.0); // Normal pitch
    await Tts.speak(text);
  } catch (error) {
    console.error("TTS error:", error);
    throw error;
  }
};

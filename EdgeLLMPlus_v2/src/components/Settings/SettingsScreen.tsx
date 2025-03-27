import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Platform,
} from "react-native";
import Slider from "@react-native-community/slider";
import Tts from "react-native-tts";
import { useSettingsStore } from "../../store/settingsStore";
import { COLORS } from "../../config/colors";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

interface VoiceOption {
  id: string;
  name: string;
}

export const SettingsScreen: React.FC<{ onClose: () => void }> = ({
  onClose,
}) => {
  const settings = useSettingsStore();
  const [voices, setVoices] = useState<VoiceOption[]>([]);

  useEffect(() => {
    // Load available voices
    const loadVoices = async () => {
      try {
        const availableVoices = await Tts.voices();
        const voiceOptions = availableVoices
          .filter((voice) => voice.language.startsWith("en")) // Filter English voices
          .map((voice) => ({
            id: voice.id,
            name: voice.name,
          }));
        setVoices(voiceOptions);
      } catch (error) {
        console.error("Error loading voices:", error);
      }
    };
    loadVoices();
  }, []);

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const renderSliderSetting = (
    title: string,
    value: number,
    onValueChange: (value: number) => void,
    min: number,
    max: number,
    step: number
  ) => (
    <View style={styles.setting}>
      <Text style={styles.settingTitle}>{title}</Text>
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={min}
          maximumValue={max}
          step={step}
          value={value}
          onValueChange={onValueChange}
          minimumTrackTintColor={COLORS.primary}
          maximumTrackTintColor={COLORS.text.disabled}
        />
        <Text style={styles.sliderValue}>{value.toFixed(1)}</Text>
      </View>
    </View>
  );

  const renderSwitchSetting = (
    title: string,
    value: boolean,
    onValueChange: (value: boolean) => void
  ) => (
    <View style={styles.setting}>
      <Text style={styles.settingTitle}>{title}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: COLORS.text.disabled, true: COLORS.primary }}
        thumbColor={
          Platform.OS === "ios" ? "#FFFFFF" : value ? COLORS.accent : "#f4f3f4"
        }
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <MaterialCommunityIcons
            name="close"
            size={24}
            color={COLORS.text.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {renderSection(
          "Voice Settings",
          <>
            {renderSliderSetting(
              "Speech Rate",
              settings.speechRate,
              settings.setSpeechRate,
              0.1,
              2,
              0.1
            )}
            {renderSliderSetting(
              "Pitch",
              settings.speechPitch,
              settings.setSpeechPitch,
              0.5,
              2,
              0.1
            )}
            <View style={styles.setting}>
              <Text style={styles.settingTitle}>Voice Selection</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.voiceList}
              >
                {voices.map((voice) => (
                  <TouchableOpacity
                    key={voice.id}
                    style={[
                      styles.voiceOption,
                      voice.id === settings.selectedVoice &&
                        styles.voiceOptionSelected,
                    ]}
                    onPress={() => settings.setSelectedVoice(voice.id)}
                  >
                    <Text
                      style={[
                        styles.voiceOptionText,
                        voice.id === settings.selectedVoice &&
                          styles.voiceOptionTextSelected,
                      ]}
                    >
                      {voice.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </>
        )}

        {renderSection(
          "Visual Settings",
          <>
            {renderSliderSetting(
              "Circle Size",
              settings.circleSize,
              settings.setCircleSize,
              0.3,
              0.7,
              0.1
            )}
            {renderSliderSetting(
              "Animation Speed",
              settings.animationSpeed,
              settings.setAnimationSpeed,
              0.5,
              2,
              0.1
            )}
            {renderSwitchSetting(
              "Dark Mode",
              settings.isDarkMode,
              settings.setIsDarkMode
            )}
          </>
        )}

        {renderSection(
          "Interaction Settings",
          <>
            {renderSwitchSetting(
              "Auto-Listen After Speaking",
              settings.autoListen,
              settings.setAutoListen
            )}
            {renderSwitchSetting(
              "Haptic Feedback",
              settings.hapticFeedback,
              settings.setHapticFeedback
            )}
            {renderSwitchSetting(
              "Sound Effects",
              settings.soundEffects,
              settings.setSoundEffects
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.text.disabled,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text.primary,
  },
  closeButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.text.disabled,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  setting: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  settingTitle: {
    fontSize: 16,
    color: COLORS.text.primary,
    flex: 1,
  },
  sliderContainer: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderValue: {
    width: 40,
    textAlign: "right",
    color: COLORS.text.secondary,
  },
  voiceList: {
    flexGrow: 0,
    marginLeft: 16,
  },
  voiceOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: COLORS.background.secondary,
    marginRight: 8,
  },
  voiceOptionSelected: {
    backgroundColor: COLORS.primary,
  },
  voiceOptionText: {
    color: COLORS.text.primary,
  },
  voiceOptionTextSelected: {
    color: COLORS.text.light,
  },
});

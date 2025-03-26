import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

interface WaveformAvatarProps {
  isSpeaking: boolean;
  isListening: boolean;
}

export const WaveformAvatar: React.FC<WaveformAvatarProps> = ({
  isSpeaking,
  isListening,
}) => {
  // Create multiple animated values for different waves
  const waveAnimations = useRef(
    Array(8)
      .fill(0)
      .map(() => new Animated.Value(0))
  ).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation
  useEffect(() => {
    if (isSpeaking || isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isSpeaking, isListening]);

  // Wave animations
  useEffect(() => {
    if (isSpeaking) {
      // Animate each wave with different timing
      waveAnimations.forEach((anim, index) => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: 1000 + index * 100,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 1000 + index * 100,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        ).start();
      });
    } else {
      waveAnimations.forEach((anim) => anim.setValue(0));
    }
  }, [isSpeaking]);

  // Rotation animation
  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 3000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      rotateAnim.setValue(0);
    }
  }, [isListening]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.avatarContainer,
          {
            transform: [
              { scale: pulseAnim },
              {
                rotate: rotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "360deg"],
                }),
              },
            ],
          },
        ]}
      >
        {/* Base circle */}
        <View style={styles.baseCircle}>
          {/* Animated waves */}
          {waveAnimations.map((anim, index) => (
            <Animated.View
              key={index}
              style={[
                styles.wave,
                {
                  transform: [
                    {
                      scale: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.5],
                      }),
                    },
                  ],
                  opacity: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 0],
                  }),
                  borderColor: isSpeaking ? "#4F46E5" : "#10B981",
                },
              ]}
            />
          ))}
          {/* Center icon */}
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={isSpeaking ? "message-text" : "microphone"}
              size={24}
              color={isSpeaking ? "#4F46E5" : "#10B981"}
            />
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  baseCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  wave: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#4F46E5",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});

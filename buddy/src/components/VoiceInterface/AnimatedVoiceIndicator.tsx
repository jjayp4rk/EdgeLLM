import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Dimensions, Animated, Easing } from "react-native";
import { useVoiceStore } from "../../store/voiceStore";
import { COLORS } from "../../config/colors";

const { width } = Dimensions.get("window");
const CIRCLE_SIZE = width * 0.5;
const WAVE_COUNT = 8; // Number of wave segments

interface Props {
  isListening: boolean;
  isProcessing: boolean;
  isTtsPlaying: boolean;
  size?: number; // Optional size multiplier (default: 0.5)
  speed?: number; // Optional animation speed multiplier (default: 1.0)
}

export const AnimatedVoiceIndicator: React.FC<Props> = ({
  isListening,
  isProcessing,
  isTtsPlaying,
  size = 0.5,
  speed = 1.0,
}) => {
  const { ttsProgress } = useVoiceStore();
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.5)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const waveScales = useRef(
    Array(WAVE_COUNT)
      .fill(0)
      .map(() => new Animated.Value(1))
  ).current;
  const waveOpacities = useRef(
    Array(WAVE_COUNT)
      .fill(0)
      .map(() => new Animated.Value(0.5))
  ).current;

  // Calculate actual duration based on speed
  const getDuration = (baseDuration: number) => baseDuration / speed;

  useEffect(() => {
    if (isTtsPlaying) {
      // Create a wave animation for TTS
      const animations = waveScales.map((waveScale, index) => {
        const delay = (index * 100) / speed;
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
              Animated.timing(waveScale, {
                toValue: 1.3,
                duration: getDuration(800),
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(waveOpacities[index], {
                toValue: 0.8,
                duration: getDuration(800),
                useNativeDriver: true,
              }),
            ]),
            Animated.parallel([
              Animated.timing(waveScale, {
                toValue: 1,
                duration: getDuration(800),
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(waveOpacities[index], {
                toValue: 0.5,
                duration: getDuration(800),
                useNativeDriver: true,
              }),
            ]),
          ])
        );
      });

      // Start all wave animations
      animations.forEach((animation) => animation.start());

      // Set static scale and opacity for TTS
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1.1,
          useNativeDriver: true,
        }),
        Animated.spring(opacity, {
          toValue: 0.7,
          useNativeDriver: true,
        }),
      ]).start();

      return () => {
        animations.forEach((animation) => animation.stop());
      };
    } else if (isListening) {
      // Pulsing animation when listening
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(scale, {
              toValue: 1.1,
              duration: getDuration(1000),
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0.7,
              duration: getDuration(1000),
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(scale, {
              toValue: 1,
              duration: getDuration(1000),
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0.5,
              duration: getDuration(1000),
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    } else if (isProcessing) {
      // Rotating animation when processing
      Animated.loop(
        Animated.timing(rotation, {
          toValue: 1,
          duration: getDuration(2000),
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      // Set static scale and opacity
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1.1,
          useNativeDriver: true,
        }),
        Animated.spring(opacity, {
          toValue: 0.7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset to default state
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.spring(opacity, {
          toValue: 0.5,
          useNativeDriver: true,
        }),
        Animated.timing(rotation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        ...waveScales.map((waveScale) =>
          Animated.timing(waveScale, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          })
        ),
        ...waveOpacities.map((waveOpacity) =>
          Animated.timing(waveOpacity, {
            toValue: 0.5,
            duration: 300,
            useNativeDriver: true,
          })
        ),
      ]).start();
    }
  }, [
    isListening,
    isProcessing,
    isTtsPlaying,
    scale,
    opacity,
    rotation,
    waveScales,
    waveOpacities,
    speed,
  ]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // Calculate actual circle size based on screen width and size prop
  const actualCircleSize = width * size;

  return (
    <View
      style={[
        styles.container,
        { width: actualCircleSize, height: actualCircleSize },
      ]}
    >
      <Animated.View
        style={[
          styles.circle,
          {
            width: actualCircleSize,
            height: actualCircleSize,
            borderRadius: actualCircleSize / 2,
            transform: [{ scale }, { rotate: spin }],
            opacity,
            backgroundColor: isTtsPlaying
              ? COLORS.accent
              : isListening
              ? COLORS.secondary
              : isProcessing
              ? COLORS.highlight
              : COLORS.primary,
          },
        ]}
      >
        {waveScales.map((waveScale, index) => (
          <Animated.View
            key={index}
            style={[
              styles.waveSegment,
              {
                width: actualCircleSize * 0.8,
                height: actualCircleSize * 0.8,
                borderRadius: actualCircleSize / 2,
                transform: [
                  { scale: waveScale },
                  { rotate: `${(index * 360) / WAVE_COUNT}deg` },
                ],
                opacity: waveOpacities[index],
                borderColor: isTtsPlaying
                  ? COLORS.accent
                  : isListening
                  ? COLORS.secondary
                  : isProcessing
                  ? COLORS.highlight
                  : COLORS.primary,
              },
            ]}
          />
        ))}
        <View
          style={[
            styles.innerCircle,
            {
              width: actualCircleSize * 0.7,
              height: actualCircleSize * 0.7,
              borderRadius: (actualCircleSize * 0.7) / 2,
              backgroundColor: isTtsPlaying
                ? COLORS.accent
                : isListening
                ? COLORS.secondary
                : isProcessing
                ? COLORS.highlight
                : COLORS.primary,
              opacity: 0.8,
            },
          ]}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  circle: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  innerCircle: {
    position: "absolute",
  },
  waveSegment: {
    position: "absolute",
    borderWidth: 2,
    backgroundColor: "transparent",
  },
});

import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Dimensions, Animated, Easing } from "react-native";

const { width } = Dimensions.get("window");
const CIRCLE_SIZE = width * 0.6;

interface Props {
  isListening: boolean;
  isProcessing: boolean;
  isTtsPlaying: boolean;
}

export const AnimatedVoiceIndicator: React.FC<Props> = ({
  isListening,
  isProcessing,
  isTtsPlaying,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.5)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const waveScale = useRef(new Animated.Value(1)).current;
  const waveOpacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (isTtsPlaying) {
      // Wave animation for TTS
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(waveScale, {
              toValue: 1.3,
              duration: 800,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(waveOpacity, {
              toValue: 0.8,
              duration: 800,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(waveScale, {
              toValue: 1,
              duration: 800,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(waveOpacity, {
              toValue: 0.5,
              duration: 800,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();

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
    } else if (isListening) {
      // Pulsing animation when listening
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(scale, {
              toValue: 1.2,
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0.8,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(scale, {
              toValue: 1,
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0.4,
              duration: 1000,
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
          duration: 2000,
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
        Animated.timing(waveScale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(waveOpacity, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [
    isListening,
    isProcessing,
    isTtsPlaying,
    scale,
    opacity,
    rotation,
    waveScale,
    waveOpacity,
  ]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.circle,
          {
            transform: [{ scale }, { rotate: spin }],
            opacity,
            backgroundColor: isTtsPlaying ? "#10B981" : "#6366f1",
          },
        ]}
      >
        <Animated.View
          style={[
            styles.innerCircle,
            {
              transform: [{ scale: waveScale }],
              opacity: waveOpacity,
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
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
  },
  innerCircle: {
    width: CIRCLE_SIZE * 0.7,
    height: CIRCLE_SIZE * 0.7,
    borderRadius: (CIRCLE_SIZE * 0.7) / 2,
    backgroundColor: "#818cf8",
  },
});

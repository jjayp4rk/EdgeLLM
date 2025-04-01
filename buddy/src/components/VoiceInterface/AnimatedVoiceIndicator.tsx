import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Dimensions, Animated, Easing } from "react-native";
import { useVoiceStore } from "../../store/voiceStore";
import { COLORS } from "../../config/colors";
import ReadyImage from "../../assets/images/ready.png";
import ListeningImage from "../../assets/images/listening.png";
import TalkingImage from "../../assets/images/talking.png";
import ThinkingImage from "../../assets/images/thinking.png";

const { width } = Dimensions.get("window");
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
      // Helper function to get random value within a range
      const getRandomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      // Create a sequence of random pulses
      const createRandomPulseSequence = () => {
        const numPulses = Math.floor(getRandomInRange(2, 5)); // 2-4 pulses per sequence
        const sequence = [];

        for (let i = 0; i < numPulses; i++) {
          // Random scale up
          sequence.push(
            Animated.timing(scale, {
              toValue: getRandomInRange(1.02, 1.08),
              duration: getDuration(getRandomInRange(100, 200)),
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            })
          );

          // Random scale down
          sequence.push(
            Animated.timing(scale, {
              toValue: getRandomInRange(0.92, 0.98),
              duration: getDuration(getRandomInRange(100, 200)),
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            })
          );
        }

        // Add a small pause at the end of each sequence
        sequence.push(
          Animated.timing(scale, {
            toValue: 1,
            duration: getDuration(getRandomInRange(200, 400)),
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          })
        );

        return sequence;
      };

      // Create wave animation for TTS
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

      // Create and start the random pulse animation
      const pulseAnimation = Animated.loop(
        Animated.sequence(createRandomPulseSequence())
      );

      // Start all animations
      animations.forEach((animation) => animation.start());
      pulseAnimation.start();

      return () => {
        animations.forEach((animation) => animation.stop());
        pulseAnimation.stop();
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
      // Simple pulsing animation for processing
      Animated.loop(
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.1,
            duration: getDuration(1000),
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: getDuration(1000),
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
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

  // Calculate actual circle size based on screen width and size prop
  const actualCircleSize = width * size;

  const getStateImage = () => {
    if (isTtsPlaying) return TalkingImage;
    if (isProcessing) return ThinkingImage;
    if (isListening) return ListeningImage;
    return ReadyImage;
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.circle,
          {
            width: actualCircleSize,
            height: actualCircleSize,
            transform: [{ scale }],
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "white",
            borderRadius: actualCircleSize / 2,
            overflow: "hidden",
          },
        ]}
      >
        <Animated.Image
          source={getStateImage()}
          style={{
            width: actualCircleSize,
            height: actualCircleSize,
            opacity: 1,
          }}
          resizeMode="contain"
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
});

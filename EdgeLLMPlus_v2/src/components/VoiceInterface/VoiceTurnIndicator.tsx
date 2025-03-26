import React from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";

type VoiceTurnIndicatorProps = {
  isAITurn: boolean;
  isListening: boolean;
};

export const VoiceTurnIndicator: React.FC<VoiceTurnIndicatorProps> = ({
  isAITurn,
  isListening,
}) => {
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.indicator,
          {
            backgroundColor: isAITurn ? "#3B82F6" : "#10B981",
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 1000,
  },
  indicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    opacity: 0.8,
  },
});

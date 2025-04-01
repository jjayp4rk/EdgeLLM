import React from "react";
import { View, StyleSheet } from "react-native";
import { COLORS } from "../config/colors";

interface ProgressBarProps {
  progress: number; // Percentage (0–100)
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  // Ensure progress is between 0 and 100
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <View style={styles.container}>
      <View style={[styles.bar, { width: `${clampedProgress}%` }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
  },
  bar: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
});

export default ProgressBar;

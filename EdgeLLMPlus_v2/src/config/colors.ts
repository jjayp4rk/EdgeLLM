export const COLORS = {
  primary: "#1d4e89", // Navy - main color
  secondary: "#00b2ca", // Light Blue - listening state
  accent: "#7dcfb6", // Mint - TTS state
  highlight: "#f79256", // Coral - processing/active state
  neutral: "#fbd1a2", // Cream - inactive/disabled state

  // Derived colors with opacity
  primaryLight: "rgba(29, 78, 137, 0.1)", // Navy with 10% opacity
  secondaryLight: "rgba(0, 178, 202, 0.1)", // Light Blue with 10% opacity
  accentLight: "rgba(125, 207, 182, 0.1)", // Mint with 10% opacity
  highlightLight: "rgba(247, 146, 86, 0.1)", // Coral with 10% opacity
  neutralLight: "rgba(251, 209, 162, 0.1)", // Cream with 10% opacity

  // Text colors
  text: {
    primary: "#1d4e89", // Navy
    secondary: "#4a5568", // Gray
    light: "#ffffff", // White
    disabled: "#a0aec0", // Light gray
  },

  // Status colors
  status: {
    success: "#7dcfb6", // Mint
    error: "#f79256", // Coral
    warning: "#fbd1a2", // Cream
    info: "#00b2ca", // Light Blue
  },

  // Background colors
  background: {
    primary: "#ffffff",
    secondary: "#f7fafc",
    accent: "rgba(125, 207, 182, 0.05)", // Very light mint
  },
};

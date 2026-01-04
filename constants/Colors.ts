// Brand colors from environment variables (change in .env file)
const PRIMARY = process.env.EXPO_PUBLIC_COLOR_PRIMARY || "#00008B";
const ACCENT = process.env.EXPO_PUBLIC_COLOR_ACCENT || "#CCFF00";

export default {
  // Primary brand color - dark blue
  primary: PRIMARY,

  // Accent brand color - lime green
  accent: ACCENT,

  // Text colors
  dark: "#1A1A1A",
  grey: "#5E5D5E",
  darkGrey: "#878787",

  // Background colors
  lightGrey: "#F5F5F5",

  // Status colors
  success: "#4CAF50",
  warning: "#FF9800",
  error: "#F44336",
  info: "#2196F3",
};

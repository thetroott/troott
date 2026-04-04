import { Dimensions } from "react-native";

function getScreenDimensions() {
  const { width, height } = Dimensions.get("screen");
  return { width, height };
}

let _screen: { width: number; height: number } | null = null;
function getScreen() {
  if (!_screen) _screen = getScreenDimensions();
  return _screen;
}

export const sizes = {
  typography: {
    xs: 12,
    sm: 14,
    base: 16,
    md: 18,
    lg: 20,
    xl: 24,
    "2xl": 28,
    "3xl": 32,
    "4xl": 40,
    "5xl": 52,
    "6xl": 72,
    "7xl": 96,
  },
  spacing: {
    xs: 4,
    sm: 8,
    base: 12,
    md: 16,
    lg: 24,
    xl: 32,
    "2xl": 48,
  },
  radius: {
    none: 0,
    xs: 6,
    sm: 8,
    base: 12,
    md: 16,
    lg: 24,
    xl: 32,
    "2xl": 48,
    full: 9999,
  },
  get screen() {
    return getScreen();
  },
} as const;

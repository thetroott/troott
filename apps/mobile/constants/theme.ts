/**
 * Troott theme: app palette + semantic ColorPalette.
 * `theme` is a plain object (no getters) so bridgeless/Hermes and Metro circular loads
 * never see a missing `theme` export.
 */
import { Platform } from "react-native";
import { colors } from "./colors";
import { sizes } from "./sizes";
import { matterType as m, typography } from "./typography";

export const FLEX = { flex: 1 };
export const BACKGROUND_COLOR = { backgroundColor: colors.black[50] };

export const theme = {
  colors,
  typography,
  sizes,
  layout: {
    FLEX,
    BACKGROUND_COLOR,
  },
} as const;

const c = colors;

export const ColorPalette = {
  primary: {
    50: c.teal["50"],
    100: c.teal["100"],
    200: c.teal["200"],
    300: c.teal["300"],
    400: c.teal["400"],
    500: c.teal["500"],
    600: c.teal["600"],
    700: c.teal["700"],
    800: c.teal["800"],
    900: c.teal["900"],
  },
  neutral: {
    0: c.white["50"],
    50: c.grey["50"],
    100: c.grey["100"],
    200: c.grey["200"],
    300: c.grey["300"],
    400: c.grey["400"],
    500: c.grey["500"],
    600: c.grey["600"],
    700: c.grey["700"],
    800: c.grey["800"],
    900: c.grey["900"],
    950: c.black["50"],
  },
  secondary: {
    50: c.blue["50"],
    100: c.blue["100"],
    200: c.blue["200"],
    300: c.blue["300"],
    400: c.blue["400"],
    500: c.blue["500"],
    600: c.blue["600"],
    700: c.blue["700"],
    800: c.blue["800"],
    900: c.blue["900"],
  },
  accent: {
    50: c.teal["50"],
    100: c.teal["100"],
    200: c.teal["200"],
    300: c.teal["300"],
    400: c.teal["400"],
    500: c.teal["500"],
    600: c.teal["600"],
    700: c.teal["700"],
    800: c.teal["800"],
    900: c.teal["900"],
  },
  success: {
    50: c.teal["50"],
    100: c.teal["100"],
    200: c.teal["200"],
    300: c.teal["300"],
    400: c.teal["400"],
    500: c.teal["500"],
    600: c.teal["600"],
    700: c.teal["700"],
    800: c.teal["800"],
    900: c.teal["900"],
  },
  alert: {
    50: c.red["100"],
    100: c.red["100"],
    200: c.red["200"],
    300: c.red["300"],
    400: c.red["400"],
    500: c.red["500"],
    600: c.red["600"],
    700: c.red["700"],
    800: c.red["800"],
    900: c.red["900"],
  },
  error: {
    50: c.red["100"],
    100: c.red["100"],
    200: c.red["200"],
    300: c.red["300"],
    400: c.red["400"],
    500: c.red["500"],
    600: c.red["600"],
    700: c.red["700"],
    800: c.red["800"],
    900: c.red["900"],
  },
  pillBackground: "#252525",
  pillBorder: c.grey["200"],
} as const;

export const Colors = {
  light: {
    text: ColorPalette.neutral[900],
    background: ColorPalette.neutral[0],
    tint: ColorPalette.primary[600],
    icon: ColorPalette.neutral[600],
    tabIconDefault: ColorPalette.neutral[500],
    tabIconSelected: ColorPalette.primary[900],
    border: ColorPalette.neutral[200],
    card: ColorPalette.neutral[0],
    cardForeground: ColorPalette.neutral[900],
    muted: ColorPalette.neutral[50],
    mutedForeground: ColorPalette.neutral[600],
    primary: ColorPalette.primary[600],
    primaryForeground: ColorPalette.neutral[0],
    secondary: ColorPalette.secondary[600],
    secondaryForeground: ColorPalette.neutral[0],
    accent: ColorPalette.accent[600],
    accentForeground: ColorPalette.neutral[0],
    success: ColorPalette.success[500],
    successForeground: ColorPalette.neutral[0],
    destructive: ColorPalette.alert[700],
    destructiveForeground: ColorPalette.neutral[0],
  },
  dark: {
    text: ColorPalette.neutral[50],
    background: ColorPalette.neutral[900],
    tint: ColorPalette.primary[400],
    icon: ColorPalette.neutral[400],
    tabIconDefault: ColorPalette.neutral[500],
    tabIconSelected: ColorPalette.primary[400],
    border: ColorPalette.neutral[800],
    card: ColorPalette.neutral[800],
    cardForeground: ColorPalette.neutral[50],
    muted: ColorPalette.neutral[800],
    mutedForeground: ColorPalette.neutral[400],
    primary: ColorPalette.primary[400],
    primaryForeground: ColorPalette.neutral[900],
    secondary: ColorPalette.secondary[500],
    secondaryForeground: ColorPalette.neutral[900],
    accent: ColorPalette.accent[500],
    accentForeground: ColorPalette.neutral[900],
    success: ColorPalette.success[400],
    successForeground: ColorPalette.neutral[900],
    destructive: ColorPalette.alert[600],
    destructiveForeground: ColorPalette.neutral[0],
  },
};

export const Typography = {
  h1: {
    fontFamily: m.bold,
    fontSize: 32,
    fontWeight: "700" as const,
    lineHeight: 40,
    letterSpacing: 0.5,
  },
  h2: {
    fontFamily: m.semiBold,
    fontSize: 28,
    fontWeight: "600" as const,
    lineHeight: 36,
    letterSpacing: 0.4,
  },
  h3: {
    fontFamily: m.semiBold,
    fontSize: 26,
    fontWeight: "500" as const,
    lineHeight: 32,
    letterSpacing: 0.3,
  },
  h4: {
    fontFamily: m.medium,
    fontSize: 22,
    fontWeight: "400" as const,
    lineHeight: 28,
    letterSpacing: 0.2,
  },
  h5: {
    fontFamily: m.medium,
    fontSize: 20,
    fontWeight: "400" as const,
    lineHeight: 28,
    letterSpacing: 0.2,
  },
  h6: {
    fontFamily: m.medium,
    fontSize: 18,
    fontWeight: "400" as const,
    lineHeight: 28,
    letterSpacing: 0.2,
  },
  body1: {
    fontFamily: m.regular,
    fontSize: 16,
    fontWeight: "400" as const,
    lineHeight: 24,
    letterSpacing: 0,
  },
  body2: {
    fontFamily: m.regular,
    fontSize: 14,
    fontWeight: "400" as const,
    lineHeight: 20,
    letterSpacing: 0,
  },
  subtitle1: {
    fontFamily: m.regular,
    fontSize: 16,
    fontWeight: "400" as const,
    lineHeight: 20,
    letterSpacing: 0,
  },
  subtitle2: {
    fontFamily: m.regular,
    fontSize: 14,
    fontWeight: "400" as const,
    lineHeight: 20,
    letterSpacing: 0,
  },
  caption: {
    fontFamily: m.regular,
    fontSize: 13,
    fontWeight: "400" as const,
    lineHeight: 16,
    letterSpacing: 0,
  },
  small: {
    fontFamily: m.regular,
    fontSize: 10,
    fontWeight: "400" as const,
    lineHeight: 14,
    letterSpacing: 0,
  },
  button: {
    fontFamily: m.medium,
    fontSize: 16,
    fontWeight: "600" as const,
    lineHeight: 20,
    letterSpacing: 0.5,
  },
  buttonSecondary: {
    fontFamily: m.medium,
    fontSize: 14,
    fontWeight: "500" as const,
    lineHeight: 18,
    letterSpacing: 0.3,
  },
} as const;

export const FontFamilies = {
  matter: {
    thin: m.thin,
    regular: m.regular,
    medium: m.medium,
    semiBold: m.semiBold,
    bold: m.bold,
    black: m.black,
  },
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export function useTheme() {
  const { useResponsiveScale } = require("@/hooks/useResponsive");
  const { width, height, scale } = useResponsiveScale();
  const columns = 3;
  const imageSpacing = sizes.spacing.base;
  const horizontalPadding = sizes.spacing.lg;
  const availableWidth =
    width - horizontalPadding * 2 - imageSpacing * (columns - 1);
  const imageWidth = Math.floor(availableWidth / columns);
  const imageHeight = imageWidth;
  const minSize = 80;
  const maxSize = 150;
  const RESPONSIVE_SIZE = Math.max(
    minSize,
    Math.min(maxSize, Math.round(110 * scale))
  );
  return {
    colors: theme.colors,
    typography: theme.typography,
    sizes: theme.sizes,
    dimensions: { width, height, scale },
    layout: {
      ...theme.layout,
      imageWidth,
      imageHeight,
      RESPONSIVE_SIZE,
    },
  };
}

/**
 * Semantic colors — hex values match [constants/tailwind-bridge.cjs](tailwind-bridge.cjs).
 * Use for Reanimated, icons, or any JS that cannot use NativeWind className.
 */
export const semanticColors = {
  background: "#171717",
  foreground: "#e8e8e8",
  card: "#252525",
  cardForeground: "#f7f7f7",
  muted: "#292929",
  mutedForeground: "#707070",
  border: "#292929",
  primary: "#08FFDB",
  /** Pressed primary (teal-600), matches tailwind-bridge.cjs */
  primaryPressed: "#07D4B6",
  primaryForeground: "#1d1d1d",
  /** Disabled fill (card / neutral) */
  buttonDisabled: "#252525",
  destructive: "#f00707",
  destructiveForeground: "#ffffff",
  /** Subtle pressed overlay on outline */
  outlinePressed: "rgba(255,255,255,0.08)",
  /** Modal/overlay backdrop */
  overlay: "rgba(0,0,0,0.5)",
  /** Toast success (green) */
  success: "#16a34a",
  /** Toast warning (amber) */
  warning: "#ca8a04",
} as const;

export type SemanticColorKey = keyof typeof semanticColors;

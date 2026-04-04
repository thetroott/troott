import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

/**
 * Semantic tokens from {@link Colors} for the active color scheme.
 * Defaults to `dark` (app is dark-first; most surfaces use neutral-950).
 */
export function useSemanticColors() {
  const scheme = (useColorScheme() ?? "dark") as keyof typeof Colors;
  return Colors[scheme];
}

import { colors } from "./colors";
import { sizes } from "./sizes";
import { typography } from "./typography";
import { useResponsiveScale } from "@/hooks/useResponsive";



// Layout helpers (static)
export const FLEX = { flex: 1 };
export const BACKGROUND_COLOR = { backgroundColor: colors.black };

// Theme object
export const theme = {
  colors,
  typography,
  sizes,
  layout: {
    FLEX,
    BACKGROUND_COLOR
  },
} as const;


export function useTheme() {
  const { width, height, scale } = useResponsiveScale();

    // Responsive image grid
  const columns = 3;
  const imageSpacing = sizes.spacing.base;
  const horizontalPadding = sizes.spacing.lg;
  const availableWidth =
    width - horizontalPadding * 2 - imageSpacing * (columns - 1);
  const imageWidth = Math.floor(availableWidth / columns);
  const imageHeight = imageWidth;

  // Responsive sizing
  const minSize = 80;
  const maxSize = 150;
  const RESPONSIVE_SIZE = Math.max(
    minSize,
    Math.min(maxSize, Math.round(110 * scale))
  );

  return {
    ...theme,
    dimensions: { width, height, scale },
    layout: {
      ...theme.layout,
      imageWidth,
      imageHeight,
      RESPONSIVE_SIZE,
    },
  };
}
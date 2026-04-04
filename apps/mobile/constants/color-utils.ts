import type { ColorFamily, ColorShade } from './colors.types';
import { ColorPalette } from './theme';

/**
 * Get a specific color from the palette
 * @param family - The color family (primary, neutral, etc.)
 * @param shade - The shade value (50-900)
 * @returns The hex color value
 */
export function getColor(family: ColorFamily, shade: ColorShade): string {
  return ColorPalette[family][shade];
}

/**
 * Get a lighter shade of a color
 * @param family - The color family
 * @param currentShade - Current shade value
 * @param steps - Number of steps lighter (default: 1)
 * @returns The lighter color or the current color if at minimum
 */
export function getLighterShade(
  family: ColorFamily,
  currentShade: ColorShade,
  steps: number = 1
): string {
  const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
  const currentIndex = shades.indexOf(currentShade);
  const newIndex = Math.max(0, currentIndex - steps);
  return ColorPalette[family][shades[newIndex]];
}

/**
 * Get a darker shade of a color
 * @param family - The color family
 * @param currentShade - Current shade value
 * @param steps - Number of steps darker (default: 1)
 * @returns The darker color or the current color if at maximum
 */
export function getDarkerShade(
  family: ColorFamily,
  currentShade: ColorShade,
  steps: number = 1
): string {
  const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
  const currentIndex = shades.indexOf(currentShade);
  const newIndex = Math.min(shades.length - 1, currentIndex + steps);
  return ColorPalette[family][shades[newIndex]];
}

/**
 * Convert hex color to RGB values
 * @param hex - Hex color string (e.g., "#ff0000")
 * @returns Object with r, g, b values (0-255)
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convert hex color to RGBA string
 * @param hex - Hex color string
 * @param alpha - Alpha value (0-1)
 * @returns RGBA color string
 */
export function hexToRgba(hex: string, alpha: number = 1): string {
  const rgb = hexToRgb(hex);
  return rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})` : hex;
}

/**
 * Get appropriate text color (black or white) for a background color
 * @param bgColor - Background color hex
 * @returns ColorPalette.neutral[950] or ColorPalette.neutral[0]
 */
export function getContrastTextColor(bgColor: string): string {
  const rgb = hexToRgb(bgColor);
  if (!rgb) return ColorPalette.neutral[950];
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness > 128 ? ColorPalette.neutral[950] : ColorPalette.neutral[0];
}

/**
 * Get the full color scale for a family
 * @param family - The color family
 * @returns Array of [shade, color] tuples
 */
export function getColorScale(family: ColorFamily): Array<[ColorShade, string]> {
  const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
  return shades.map(shade => [shade, ColorPalette[family][shade]]);
}

/**
 * Get suggested foreground color for a given background color from palette
 * @param family - The color family
 * @param shade - The shade value
 * @returns Suggested foreground color
 */
export function getSuggestedForeground(family: ColorFamily, shade: ColorShade): string {
  return shade >= 500 ? ColorPalette.neutral[50] : ColorPalette.neutral[900];
}


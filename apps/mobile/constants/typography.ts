type FontWeight =
  | "thin"
  | "extraLight"
  | "light"
  | "regular"
  | "medium"
  | "semiBold"
  | "bold"
  | "extraBold"
  | "black";

type FontKey = FontWeight | `${FontWeight}Italic`;

export type MatterTypography = Record<FontKey, string>;

function createTypography(
  family: string,
  weights: Record<FontWeight, number>
): MatterTypography {
  const styles: MatterTypography = {} as MatterTypography;
  (Object.keys(weights) as FontWeight[]).forEach((weight) => {
    styles[weight] = `${family}-${weights[weight]}`;
    styles[`${weight}Italic` as FontKey] = `${family}-${weights[weight]}Italic`;
  });
  return styles;
}

export const matterType = createTypography("Matter", {
  thin: 100,
  extraLight: 200,
  light: 300,
  regular: 400,
  medium: 500,
  semiBold: 600,
  bold: 700,
  extraBold: 800,
  black: 900,
});

export const matterFonts = {
  [matterType.bold]: require("../assets/fonts/matter/Matter-Bold.ttf"),
  [matterType.boldItalic]: require("../assets/fonts/matter/Matter-BoldItalic.ttf"),
  [matterType.extraBold]: require("../assets/fonts/matter/Matter-Heavy.ttf"),
  [matterType.extraBoldItalic]: require("../assets/fonts/matter/Matter-HeavyItalic.ttf"),
  [matterType.light]: require("../assets/fonts/matter/Matter-Light.ttf"),
  [matterType.lightItalic]: require("../assets/fonts/matter/Matter-LightItalic.ttf"),
  [matterType.medium]: require("../assets/fonts/matter/Matter-Medium.ttf"),
  [matterType.mediumItalic]: require("../assets/fonts/matter/Matter-MediumItalic.ttf"),
  [matterType.regular]: require("../assets/fonts/matter/Matter-Regular.ttf"),
  [matterType.regularItalic]: require("../assets/fonts/matter/Matter-RegularItalic.ttf"),
  [matterType.semiBold]: require("../assets/fonts/matter/Matter-SemiBold.ttf"),
  [matterType.semiBoldItalic]: require("../assets/fonts/matter/Matter-SemiBoldItalic.ttf"),
};

/** Postscript names for theme.typography.* (same as legacy API). */
export const typography = matterType;

type FontWeight =
    | 'thin'
    | 'extraLight'
    | 'light'
    | 'regular'
    | 'medium'
    | 'semiBold'
    | 'bold'
    | 'extraBold'
    | 'black';

type FontKey = FontWeight | `${FontWeight}Italic`;

export type Typography = Record<FontKey, string>;

// Utility to generate camelCase keys
function createTypography(
    family: string,
    weights: Record<FontWeight, number>,
): Typography {
    const styles: Typography = {} as Typography;

    (Object.keys(weights) as FontWeight[]).forEach((weight) => {
        styles[weight] = `${family}-${weights[weight]}`;
        styles[
            `${weight}Italic` as FontKey
        ] = `${family}-${weights[weight]}Italic`;
    });

    return styles;
}

// Example: Matter font family mapping
export const typography = createTypography('Matter', {
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
    [typography.bold]: require('../assets/fonts/matter/Matter-Bold.ttf'),
    [typography.boldItalic]: require('../assets/fonts/matter/Matter-BoldItalic.ttf'),
    [typography.extraBold]: require('../assets/fonts/matter/Matter-Heavy.ttf'),
    [typography.extraBoldItalic]: require('../assets/fonts/matter/Matter-HeavyItalic.ttf'),
    [typography.light]: require('../assets/fonts/matter/Matter-Light.ttf'),
    [typography.lightItalic]: require('../assets/fonts/matter/Matter-LightItalic.ttf'),
    [typography.medium]: require('../assets/fonts/matter/Matter-Medium.ttf'),
    [typography.mediumItalic]: require('../assets/fonts/matter/Matter-MediumItalic.ttf'),
    [typography.regular]: require('../assets/fonts/matter/Matter-Regular.ttf'),
    [typography.regularItalic]: require('../assets/fonts/matter/Matter-RegularItalic.ttf'),
    [typography.semiBold]: require('../assets/fonts/matter/Matter-SemiBold.ttf'),
    [typography.semiBoldItalic]: require('../assets/fonts/matter/Matter-SemiBoldItalic.ttf'),
};

export const colors = {
    grey: {
        50: '#f7f7f7',
        100: '#eaeaea',
        200: '#bdbdbd',
        300: '#9d9d9d',
        400: '#707070',
        500: '#545454',
        600: '#292929',
        700: '#252525',
        800: '#1d1d1d',
        900: '#171717',
        950: '#1C1C1E',
    },
    blue: {
        50: '#eef2ff',
        100: '#e0e7ff',
        200: '#c7d2fe',
        300: '#a5b4fc',
        400: '#818cf8',
        500: '#6366f1',
        600: '#4f46e5',
        700: '#4338ca',
        800: '#3730a3',
        900: '#312e81',
        950: '#1e1b4b',
    },
    red: {
        100: '#fab2b3',
        200: '#f88d8d',
        300: '#f55859',
        400: '#f33939',
        500: '#f00707',
        600: '#da0606',
        700: '#aa0505',
        800: '#840404',
        900: '#650303',
    },
    teal: {
        50: '#CEFFF8',
        100: '#ADFFF3',
        200: '#83FFED',
        300: '#5AFFE7',
        400: '#31FFE1',
        500: '#08FFDB',
        600: '#07D4B6',
        700: '#05AA92',
        800: '#04806E',
        900: '#035549',
    },
    white: {
        50: '#ffffff',
        100: '#fdfdfd',
        200: '#f9f9f9',
        300: '#f5f5f5',
        400: '#f1f1f1',
        500: '#ededed',
        600: '#e9e9e9',
        700: '#e5e5e5',
        800: '#e1e1e1',
        900: '#dddddd',
    },
    black: {
        50: '#000000',
        100: '#0d0d0d',
        200: '#1a1a1a',
        300: '#262626',
        400: '#333333',
        500: '#404040',
        600: '#4d4d4d',
        700: '#595959',
        800: '#666666',
        900: '#737373',
    },
} as const;

export type Colors = typeof colors;

export const spacing = {
    xs: 4,
    sm: 8,
    base: 12,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
} as const;

export type Spacing = typeof spacing;

export const radii = {
    none: 0,
    xs: 6,
    sm: 8,
    base: 12,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    full: 9999,
} as const;

export type Radii = typeof radii;

export const fontSizes = {
    xs: 12,
    sm: 14,
    base: 16,
    md: 18,
    lg: 20,
    xl: 24,
    '2xl': 28,
    '3xl': 32,
    '4xl': 40,
    '5xl': 52,
    '6xl': 72,
    '7xl': 96,
} as const;

export type FontSizes = typeof fontSizes;

export const typography = {
    fontFamily: {
        sans: 'Matter',
    },
    fontWeight: {
        thin: 100,
        extraLight: 200,
        light: 300,
        regular: 400,
        medium: 500,
        semiBold: 600,
        bold: 700,
        extraBold: 800,
        black: 900,
    },
    fontSizes,
} as const;

export type Typography = typeof typography;

import type { Config } from 'tailwindcss';
import { colors, radii, fontSizes } from '@troott/tokens';

const config: Config = {
    content: ['./src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: {
                brand: {
                    DEFAULT: colors.teal[500],
                    foreground: colors.black[900],
                },
                neutral: colors.grey,
                accent: colors.blue,
                danger: colors.red,
            },
            borderRadius: {
                sm: `${radii.xs}px`,
                md: `${radii.sm}px`,
                lg: `${radii.md}px`,
                xl: `${radii.lg}px`,
                full: `${radii.full}px`,
            },
            fontSize: {
                xs: `${fontSizes.xs / 16}rem`,
                sm: `${fontSizes.sm / 16}rem`,
                base: `${fontSizes.base / 16}rem`,
                md: `${fontSizes.md / 16}rem`,
                lg: `${fontSizes.lg / 16}rem`,
                xl: `${fontSizes.xl / 16}rem`,
                '2xl': `${fontSizes['2xl'] / 16}rem`,
                '3xl': `${fontSizes['3xl'] / 16}rem`,
                '4xl': `${fontSizes['4xl'] / 16}rem`,
                '5xl': `${fontSizes['5xl'] / 16}rem`,
                '6xl': `${fontSizes['6xl'] / 16}rem`,
                '7xl': `${fontSizes['7xl'] / 16}rem`,
            },
        },
    },
    plugins: [],
};

export default config;

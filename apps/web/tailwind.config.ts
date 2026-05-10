import type { Config } from 'tailwindcss';
import { colors, fontSizes, radii } from './src/tokens';

const config = {
    content: [
        './pages/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './app/**/*.{ts,tsx}',
        './src/**/*.{ts,tsx}',
    ],
    prefix: '',
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px',
            },
        },
        extend: {
            colors: {
                brand: {
                    DEFAULT: colors.teal[500],
                    foreground: colors.black[900],
                },
                neutral: colors.grey,
                accent: colors.blue,
                danger: colors.red,
                primary: '#134e4a',
                'bg-primary': '#134e4a', // teal
                'primary-foreground': '#ffffff', // white text on teal
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
            fontFamily: {
                sans: [
                    'Matter-Regular',
                    'ui-sans-serif',
                    'system-ui',
                    'sans-serif',
                ],
                matter: ['Matter-Regular', 'sans-serif'],
                'matter-bold': ['Matter-Bold', 'sans-serif'],
                'matter-light': ['Matter-Light', 'sans-serif'],
                'matter-medium': ['Matter-Medium', 'sans-serif'],
                'matter-heavy': ['Matter-Heavy', 'sans-serif'],
            },
        },
    },
    plugins: [],
} satisfies Config;

export default config;

/**
 * Troott theme extension for Tailwind (NativeWind).
 * Single source consumed by tailwind.config.js. TS: see tailwind-bridge.ts (semantic hex mirror).
 */
const teal = {
  50: "#CEFFF8",
  100: "#ADFFF3",
  200: "#83FFED",
  300: "#5AFFE7",
  400: "#31FFE1",
  500: "#08FFDB",
  600: "#07D4B6",
  700: "#05AA92",
  800: "#04806E",
  900: "#035549",
};

const grey = {
  50: "#f7f7f7",
  100: "#eaeaea",
  200: "#bdbdbd",
  300: "#9d9d9d",
  400: "#707070",
  500: "#545454",
  600: "#292929",
  700: "#252525",
  800: "#1d1d1d",
  900: "#171717",
  950: "#1C1C1E",
};

module.exports.troottExtend = {
  colors: {
    background: grey[900],
    foreground: "#e8e8e8",
    card: {
      DEFAULT: "#252525",
      foreground: grey[50],
    },
    muted: {
      DEFAULT: grey[600],
      foreground: grey[400],
    },
    border: grey[600],
    input: grey[600],
    ring: teal[500],
    primary: {
      DEFAULT: teal[500],
      foreground: grey[800],
      ...teal,
    },
    secondary: {
      50: "#eef2ff",
      100: "#e0e7ff",
      200: "#c7d2fe",
      300: "#a5b4fc",
      400: "#818cf8",
      500: "#6366f1",
      600: "#4f46e5",
      700: "#4338ca",
      800: "#3730a3",
      900: "#312e81",
      DEFAULT: "#4f46e5",
      foreground: grey[50],
    },
    destructive: {
      DEFAULT: "#f00707",
      foreground: "#ffffff",
    },
    success: {
      DEFAULT: teal[500],
      foreground: grey[900],
    },
    troott: {
      teal,
      grey,
    },
  },
  borderRadius: {
    sm: "4px",
    DEFAULT: "8px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    "2xl": "24px",
    full: "9999px",
  },
  fontFamily: {
    matter: ["Matter-Regular"],
    "matter-medium": ["Matter-Medium"],
    "matter-semibold": ["Matter-SemiBold"],
    "matter-bold": ["Matter-Bold"],
  },
  fontSize: {
    "2xs": [10, { lineHeight: 14 }],
    caption: [12, { lineHeight: 16 }],
  },
};

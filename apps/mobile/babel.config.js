module.exports = function (api) {
  api.cache.forever();

  // babel-preset-expo (SDK 55) already includes the React Native Babel preset pipeline
  // (see babel-preset-expo / @react-native/babel-preset). Keep react-native-reanimated/plugin last.
  // RNSVG "Codegen didn't run" Metro warnings may persist until react-native-svg + RN align; safe to ignore if SVG renders.

  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      [
        "module:react-native-dotenv",
        {
          moduleName: "@env",
          path: ".env",
          blocklist: null,
          allowlist: null,
          safe: false,
          allowUndefined: true,
          verbose: false,
        },
      ],
      "react-native-iconify/babel",
      "react-native-reanimated/plugin",
    ],
  };
};

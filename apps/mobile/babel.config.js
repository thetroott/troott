module.exports = function (api) {
  api.cache(true);

  // Reanimated 4 depends on `react-native-worklets` and its Babel plugin.
  // The Worklets plugin MUST be listed last (after dotenv, iconify, etc.).
  // https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/
  //
  // `react-native-reanimated/plugin` is a thin re-export of `react-native-worklets/plugin`;
  // naming the Worklets entry matches the official install instructions and avoids confusion.

  const dotenvPlugin = [
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
  ];

  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    // `react-native-dotenv` must not run on `node_modules`: it breaks Reanimated /
    // Worklets workletization (addListener on UI thread, etc.). Babel merges override
    // plugins after root plugins, so a single "exclude node_modules" override would put
    // dotenv *after* `react-native-worklets/plugin`. Split overrides keep order:
    // app: dotenv -> iconify -> worklets (last); deps: iconify -> worklets (last).
    overrides: [
      {
        exclude: /[/\\]node_modules[/\\]/,
        plugins: [
          dotenvPlugin,
          "react-native-iconify/babel",
          "react-native-worklets/plugin",
        ],
      },
      {
        include: /[/\\]node_modules[/\\]/,
        plugins: ["react-native-iconify/babel", "react-native-worklets/plugin"],
      },
    ],
  };
};

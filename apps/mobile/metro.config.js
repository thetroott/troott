const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { wrapWithReanimatedMetroConfig } = require("react-native-reanimated/metro-config");
const { withNativeWind } = require('nativewind/metro');

// Node's built-in "buffer" shadows the npm polyfill; Metro must resolve the package in node_modules.
function resolveNpmBufferRoot() {
  return path.dirname(require.resolve("buffer/package.json", { paths: [__dirname] }));
}

module.exports = (() => {
  let config = getDefaultConfig(__dirname);

  const { transformer, resolver } = config;

  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer/expo")
  };
  
  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...resolver.sourceExts, "svg"],
    extraNodeModules: {
      ...resolver.extraNodeModules,
      buffer: resolveNpmBufferRoot(),
    },
  };

  config = withNativeWind(config, { input: './global.css' })


  return wrapWithReanimatedMetroConfig(config);
})();
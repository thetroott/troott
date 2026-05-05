const path = require('path');
const fs = require('fs');
const { getDefaultConfig } = require('expo/metro-config');
const {
    wrapWithReanimatedMetroConfig,
} = require('react-native-reanimated/metro-config');
const { withNativeWind } = require('nativewind/metro');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

// react-native-svg (15.x) imports `buffer`; RN has no Node core — use the npm polyfill.
const bufferPackageRoot = path.dirname(require.resolve('buffer/package.json'));

/** Paths like .../react-native-is-edge-to-edge/node_modules/react-native/... */
const nestedRnInsideEdgeRe =
    /[/\\]react-native-is-edge-to-edge[/\\]node_modules[/\\]react-native(?=[/\\]|$)/;

function tryResolveFromProject(moduleName) {
    try {
        const filePath = require.resolve(moduleName, { paths: [projectRoot] });
        return { type: 'sourceFile', filePath };
    } catch {
        return null;
    }
}

function rewriteNestedReactNativeResolution(resolution) {
    if (
        !resolution ||
        resolution.type !== 'sourceFile' ||
        !resolution.filePath
    ) {
        return resolution;
    }
    const { filePath } = resolution;
    const match = filePath.match(nestedRnInsideEdgeRe);
    if (!match) {
        return resolution;
    }
    const nestedRoot = filePath.slice(0, match.index + match[0].length);
    let canonicalRoot;
    try {
        canonicalRoot = path.dirname(
            require.resolve('react-native/package.json', {
                paths: [projectRoot],
            }),
        );
    } catch {
        return resolution;
    }
    const rel = path.relative(nestedRoot, filePath);
    const candidate = path.normalize(path.join(canonicalRoot, rel));
    if (fs.existsSync(candidate)) {
        return { type: 'sourceFile', filePath: candidate };
    }
    return resolution;
}

function attachMonorepoResolver(config) {
    const prior = config.resolver.resolveRequest;
    config.resolver.resolveRequest = (context, moduleName, platform) => {
        const delegate = () => {
            if (typeof prior === 'function') {
                return prior(context, moduleName, platform);
            }
            return context.resolveRequest(context, moduleName, platform);
        };

        if (
            moduleName === 'react' ||
            moduleName === 'react/jsx-runtime' ||
            moduleName === 'react/jsx-dev-runtime' ||
            (typeof moduleName === 'string' && moduleName.startsWith('react/'))
        ) {
            const r = tryResolveFromProject(moduleName);
            if (r) {
                return r;
            }
        }

        if (
            moduleName === 'react-native' ||
            (typeof moduleName === 'string' &&
                moduleName.startsWith('react-native/'))
        ) {
            const r = tryResolveFromProject(moduleName);
            if (r) {
                return r;
            }
        }

        if (moduleName === 'scheduler') {
            const r = tryResolveFromProject(moduleName);
            if (r) {
                return r;
            }
        }

        // One physical copy of react-native-svg — avoids duplicate RNSVG* native registrations.
        if (
            moduleName === 'react-native-svg' ||
            (typeof moduleName === 'string' &&
                moduleName.startsWith('react-native-svg/'))
        ) {
            const r = tryResolveFromProject(moduleName);
            if (r) {
                return r;
            }
        }

        if (
            moduleName === 'react-native-reanimated' ||
            (typeof moduleName === 'string' &&
                moduleName.startsWith('react-native-reanimated/'))
        ) {
            const r = tryResolveFromProject(moduleName);
            if (r) {
                return r;
            }
        }

        if (
            moduleName === 'react-native-worklets' ||
            (typeof moduleName === 'string' &&
                moduleName.startsWith('react-native-worklets/'))
        ) {
            const r = tryResolveFromProject(moduleName);
            if (r) {
                return r;
            }
        }

        return rewriteNestedReactNativeResolution(delegate());
    };
    return config;
}

module.exports = (() => {
    let config = getDefaultConfig(projectRoot);

    const defaultWatchFolders = config.watchFolders ?? [];
    config.watchFolders = [...new Set([...defaultWatchFolders, monorepoRoot])];

    const { transformer, resolver } = config;

    config.transformer = {
        ...transformer,
        babelTransformerPath:
            require.resolve('react-native-svg-transformer/expo'),
    };

    config.resolver = {
        ...resolver,
        assetExts: resolver.assetExts.filter((ext) => ext !== 'svg'),
        sourceExts: [...resolver.sourceExts, 'svg'],
        extraNodeModules: {
            ...resolver.extraNodeModules,
            buffer: bufferPackageRoot,
        },
        nodeModulesPaths: [
            path.resolve(projectRoot, 'node_modules'),
            path.resolve(monorepoRoot, 'node_modules'),
        ],
    };

    config = withNativeWind(config, { input: './global.css' });
    config = wrapWithReanimatedMetroConfig(config);
    config = attachMonorepoResolver(config);

    return config;
})();

const path = require('path');

/**
 * pnpm hoists @rntp/player to the monorepo root, and its package.json "exports"
 * block require.resolve("@rntp/player/package.json"). React Native codegen then
 * skips the library and never generates RNTrackPlayerSpec — iOS build fails on
 * #import <RNTrackPlayerSpec/RNTrackPlayerSpec.h>.
 *
 * Pointing the dependency root here forces codegen to read package.json from disk.
 */
module.exports = {
    dependencies: {
        '@rntp/player': {
            root: path.resolve(__dirname, '../../node_modules/@rntp/player'),
        },
    },
};

import 'dotenv/config';

// Load .env first, then use the canonical static config (app.json) so merges match `expo config`
// and expo-build-properties / ios.deploymentTarget apply (required for @rntp/player iOS 16+).
// eslint-disable-next-line @typescript-eslint/no-require-imports
export default require('./app.json');

import { TroottAPIClient } from './clients/troott';

/** Configured Troott HTTP client (singleton). */
const api = new TroottAPIClient();

export default api;
export { api };

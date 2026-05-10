/** Ensures `apps/mobile/api/config.tsx` runs before accessing `troottAPIClient()`. */
import '../config';
export { troottAPIClient } from '@troott/api-client';

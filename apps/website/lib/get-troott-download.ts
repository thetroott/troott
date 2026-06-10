import { publicEnv } from '@/lib/public-env';

export {
    getTroottDownloadUrlByPackage,
    getTroottDownloadUrlForPlatform,
} from './build-get-troott-url';
export type { DownloadPackage } from './build-get-troott-url';

export function isGetTroottEnabled(): boolean {
    return publicEnv.getTroottEnabled;
}

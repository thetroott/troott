import type { IAPIResponse } from '@/utils/interface.utl';

import { URL_DISCOVERY_HOME } from '../config/path';
import { BaseService } from '../config/api-call';

export class DiscoveryService extends BaseService {
    getHome(params?: Record<string, unknown>): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_DISCOVERY_HOME,
            isAuth: true,
            params,
        });
    }
}

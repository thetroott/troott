import type { IAPIResponse } from '@/api/types';

import { URL_SHARE_RESOLVE } from '../config/path';
import { BaseService } from '../config/api-call';

export class ShareService extends BaseService {
    resolveShareLink(params?: Record<string, unknown>): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_SHARE_RESOLVE,
            isAuth: false,
            params,
        });
    }
}

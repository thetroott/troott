import type { IAPIResponse } from '@/utils/interface.utl';

import { URL_OPEN_SERMON } from '../config/path';
import { BaseService } from '../config/api-call';

export class OpenService extends BaseService {
    getOpenSermon(id: string): Promise<IAPIResponse> {
        return this.call({
            method: 'GET',
            type: 'default',
            path: URL_OPEN_SERMON(id),
            isAuth: false,
        });
    }
}

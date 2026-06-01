import type { IAPIResponse } from '@/api/types';

import { URL_STORAGE_UPLOAD } from '../config/path';
import { BaseService } from '../config/api-call';

export class StorageService extends BaseService {
    upload(payload: FormData): Promise<IAPIResponse> {
        return this.call({
            method: 'POST',
            type: 'default',
            path: URL_STORAGE_UPLOAD,
            isAuth: true,
            payload,
        });
    }
}

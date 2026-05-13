/**
 * Listener profile API (`/listener`).
 */
import type { IAPIResponse } from '@/utils/interface.utl';

import { listenerEndpoints } from '../config/endpoints';
import { BaseService } from '../config/api-call';

export class ListenerService extends BaseService {
    updateProfile(body: unknown): Promise<IAPIResponse> {
        return this.call({
            method: 'PUT',
            type: 'default',
            path: listenerEndpoints.profile,
            isAuth: true,
            payload: body,
        });
    }
}

export const listenerService = new ListenerService();

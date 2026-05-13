/**
 * Listener profile API (`/listener`).
 */
import { listenerEndpoints } from '../config/endpoints';
import { BaseService } from './base.service';

export class ListenerService extends BaseService {
    async updateProfile(body: unknown): Promise<unknown> {
        return this.put(listenerEndpoints.profile, body);
    }
}

export const listenerService = new ListenerService();

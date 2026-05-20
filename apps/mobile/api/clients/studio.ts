import type { IAPIResponse } from '@/utils/interface.utl';

import { BaseService } from '../config/api-call';

/** Placeholder until studio routes are added to path.ts. */
export class StudioService extends BaseService {
    getStudio(_studioId: string): Promise<IAPIResponse> {
        return Promise.resolve({
            error: true,
            errors: ['Studio API paths not configured on mobile'],
            data: null,
            message: 'Studio API not configured',
            status: 501,
        });
    }
}

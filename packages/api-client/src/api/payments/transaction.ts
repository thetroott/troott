import type AxiosService from '../_base/axios';
import { TroottAPIError } from '../../utils/helpers';

/** Reserved for when billing exposes `/transactions` on v1. */
class TransactionAPI {
    constructor(_axiosService: AxiosService) {
        void _axiosService;
    }

    list(): Promise<never> {
        return Promise.reject(
            new TroottAPIError(
                'not_implemented',
                'Transaction API routes are not mounted on v1 yet.',
            ),
        );
    }
}

export default TransactionAPI;

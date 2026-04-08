import { v4 as randomUUID } from 'uuid';
import cookieService from '@/services/cookies';
import { CookieKeyType } from '@/types/types';

class IdempotentService {
    public getRequestKey(): string {
        const key = cookieService.getData({
            key: CookieKeyType.XHIT,
            parse: false,
        });
        if (key) {
            return key as string;
        }
        return this.setRequestKey();
    }

    public setRequestKey(): string {
        const idempKey = randomUUID();
        cookieService.setData({
            key: CookieKeyType.XHIT,
            payload: idempKey,
            path: '/',
            maxAge: 90,
        });
        return idempKey;
    }
}

export default new IdempotentService();

import { v4 as randomUUID } from 'uuid';
import cookieService from './cookies';
import { CookieKeyType } from '../types/types';

class IdempotentService {
    constructor() {}

    /**
     * @name getRequestKey
     * @returns
     */
    public getRequestKey(): string {
        let result: string = '';

        const key = cookieService.getData({
            key: CookieKeyType.XHIT,
            parse: false,
        });

        if (key) {
            result = key;
        } else {
            result = this.setRequestKey();
        }

        return result;
    }

    /**
     * @name setRequestKey
     * @returns
     */
    public setRequestKey(): string {
        const idempKey = randomUUID();

        // save to cookie
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

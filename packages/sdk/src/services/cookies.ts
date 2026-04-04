import Cookies from 'universal-cookie';
import type { CookieSetOptions } from 'universal-cookie';
import type { ISetCookie, IGetCookie, IRemoveCookie } from '../types/types';

class CookieService {
    private cookie: Cookies;

    constructor() {
        this.cookie = new Cookies();
    }

    /**
     * @name setData
     * @param data
     */
    public setData(data: ISetCookie): void {
        let dataString: string = '';

        const { expireAt, key, payload, maxAge, path } = data;

        if (typeof payload === 'object') {
            dataString = JSON.stringify(payload);
        } else {
            dataString = payload.toString();
        }

        const options: CookieSetOptions = {};

        if (dataString && key) {
            options.path = path ? path : '/';

            if (expireAt) {
                options.expires = expireAt;
            }

            if (maxAge && maxAge > 0) {
                options.maxAge = maxAge;
            }

            this.cookie.set(key, dataString, options);
        }
    }

    /**
     * @name getData
     * @param data
     * @returns
     */
    public getData(data: IGetCookie): any {
        let result: any = null;

        const { key, parse = false } = data;

        const cookieData = this.cookie.get(key, { doNotParse: true });

        if (cookieData) {
            if (parse) {
                result = JSON.parse(cookieData);
            } else {
                result = cookieData.toString();
            }
        }

        return result;
    }

    /**
     * @name removeData
     * @param data
     */
    public removeData(data: IRemoveCookie): void {
        const cookieData = this.getData({ key: data.key, parse: data.parse });

        if (cookieData) {
            this.cookie.remove(data.key, { path: '/' });
        }
    }

    /**
     * @name getUserType
     * @returns
     */
    public getUserType(): string {
        const result: string = this.getData({ key: 'userType', parse: false });
        return result;
    }

    /**
     * @name getBusinessType
     * @returns BusinessType string or null
     */
    public getBusinessType(): string | null {
        const result: string = this.getData({
            key: 'businessType',
            parse: false,
        });
        return result;
    }

    public getToken(): string | null {
        const result: string = this.getData({ key: 'token', parse: false });
        return result;
    }
}

const cookieService: CookieService = new CookieService();
export default cookieService;

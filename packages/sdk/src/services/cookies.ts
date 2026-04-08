import Cookies from 'universal-cookie';
import type { CookieSetOptions } from 'universal-cookie';
import type { ISetCookie, IGetCookie, IRemoveCookie } from '@/types/types';

class CookieService {
    private cookie: Cookies;

    constructor() {
        this.cookie = new Cookies();
    }

    public setData(data: ISetCookie): void {
        let dataString = '';
        const { expireAt, key, payload, maxAge, path } = data;

        if (typeof payload === 'object') {
            dataString = JSON.stringify(payload);
        } else {
            dataString = String(payload);
        }

        const options: CookieSetOptions = {};

        if (dataString && key) {
            options.path = path ?? '/';

            if (expireAt) {
                options.expires = expireAt;
            }

            if (maxAge && maxAge > 0) {
                options.maxAge = maxAge;
            }

            this.cookie.set(key, dataString, options);
        }
    }

    public getData(data: IGetCookie): any {
        let result: any = null;
        const { key, parse = false } = data;
        const cookieData = this.cookie.get(key, { doNotParse: true });

        if (cookieData) {
            if (parse) {
                result = JSON.parse(cookieData as string);
            } else {
                result = cookieData.toString();
            }
        }

        return result;
    }

    public removeData(data: IRemoveCookie): void {
        const cookieData = this.getData({ key: data.key, parse: data.parse });

        if (cookieData) {
            this.cookie.remove(data.key, { path: '/' });
        }
    }

    public getUserType(): string {
        const result = this.getData({ key: 'userType', parse: false });
        return result != null ? String(result) : '';
    }

    public getBusinessType(): string | null {
        const result = this.getData({ key: 'businessType', parse: false });
        return result != null ? String(result) : null;
    }

    public getToken(): string | null {
        const result = this.getData({ key: 'token', parse: false });
        return result != null ? String(result) : null;
    }
}

const cookieService = new CookieService();
export default cookieService;

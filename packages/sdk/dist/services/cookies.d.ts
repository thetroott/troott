import type { ISetCookie, IGetCookie, IRemoveCookie } from '../types/types';
declare class CookieService {
    private cookie;
    constructor();
    /**
     * @name setData
     * @param data
     */
    setData(data: ISetCookie): void;
    /**
     * @name getData
     * @param data
     * @returns
     */
    getData(data: IGetCookie): any;
    /**
     * @name removeData
     * @param data
     */
    removeData(data: IRemoveCookie): void;
    /**
     * @name getUserType
     * @returns
     */
    getUserType(): string;
    /**
     * @name getBusinessType
     * @returns BusinessType string or null
     */
    getBusinessType(): string | null;
    getToken(): string | null;
}
declare const cookieService: CookieService;
export default cookieService;
//# sourceMappingURL=cookies.d.ts.map
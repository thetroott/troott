import type { ISetCookie, IGetCookie, IRemoveCookie } from '@/types/types';
declare class CookieService {
    private cookie;
    constructor();
    setData(data: ISetCookie): void;
    getData(data: IGetCookie): any;
    removeData(data: IRemoveCookie): void;
    getUserType(): string;
    getBusinessType(): string | null;
    getToken(): string | null;
}
declare const cookieService: CookieService;
export default cookieService;
//# sourceMappingURL=cookies.d.ts.map
export enum CookieKeyType {
    XHIT = 'x-hit',
}

export interface ISetCookie {
    key: string;
    payload: any;
    expireAt?: Date;
    maxAge?: number;
    path?: string;
}

export interface IGetCookie {
    key: string;
    parse?: boolean;
}

export interface IRemoveCookie {
    key: string;
    parse?: boolean;
}

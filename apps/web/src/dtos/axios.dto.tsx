import type { ApiMethodType, ApiServiceType } from "../utils/types.util";

export interface CallApiDTO {
    type: ApiServiceType,
    method: ApiMethodType,
    path: string,
    isAuth?: boolean,
    payload?: any
}
export type ApiServiceType = 'default' | 'backend' | 'identity' | 'core' | 'genius' | 'resource';
export type ApiMethodType = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export interface CallApiDTO {
    type: ApiServiceType;
    method: ApiMethodType;
    path: string;
    isAuth?: boolean;
    payload?: any;
}
//# sourceMappingURL=axios.dto.d.ts.map
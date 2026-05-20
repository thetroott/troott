export type LogRequestType = 'warning' | 'success' | 'error' | 'info';

export interface LogRequestDTO {
    type?: LogRequestType;
    label?: string;
    data: unknown;
}

export interface EncryptDataDTO {
    payload: unknown;
    password: string;
    separator: string;
}

export interface DecryptDataDTO {
    payload: unknown;
    password: string;
    separator: string;
}

export interface IPermissionDTO {
    user: string;
    permissions: Array<string>;
    role: string;
}

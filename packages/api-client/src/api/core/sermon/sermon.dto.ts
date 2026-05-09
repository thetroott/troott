import type TroottUser from '../../users/user/user.dto';

export interface SermonDTO {
    code?: string;
    name?: string;
    description?: string;
    index?: number;
    createdBy?: TroottUser;
    createdAt?: string;
    updatedAt?: string;
    _version?: number;
    _id?: string;
    id?: string;
    [key: string]: unknown;
}

export interface CreateSermonDTO {
    name: string;
    description: string;
    index?: number;
    createdBy?: string;
    user?: TroottUser;
}

export interface UpdateSermonDTO extends CreateSermonDTO {
    id: string;
}

export interface GetSermonDTO {
    id: string;
}

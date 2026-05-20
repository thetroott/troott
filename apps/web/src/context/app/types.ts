import type { ICollection, ISetLoading, IUnsetLoading } from '@/utils/interfaces.util';

export interface IClearResource {
    type: string;
    resource: 'multiple' | 'single';
}

export interface AppReducerState {
    search: ICollection;
    message: string;
    loading: boolean;
    loader: boolean;
}

export interface IAppContext extends AppReducerState {
    setLoading(data: ISetLoading): Promise<void>;
    unsetLoading(data: IUnsetLoading): Promise<void>;
    clearResource(data: IClearResource): void;
    setCollection(type: string, data: ICollection): void;
    setResource(type: string, data: unknown): void;
}

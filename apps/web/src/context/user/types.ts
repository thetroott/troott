import type {
    ICollection,
    ISetLoading,
    ISidebarProps,
    IUnsetLoading,
} from '@/utils/interfaces.util';

/** Reducer slice for {@link userReducer}. */
export interface UserReducerState {
    audits: unknown;
    users: ICollection;
    admins: unknown;
    user: unknown;
    userDetails: unknown;
    userType: string;
    businessType: string;
    talents: ICollection;
    talent: unknown;
    items: unknown[];
    sidebar: ISidebarProps;
    toast: Record<string, unknown>;
    isSuper: boolean;
    isAdmin: boolean;
    count: number;
    total: number;
    pagination: Record<string, unknown>;
    search: ICollection;
    response: unknown;
    loading: boolean;
    loader: boolean;
    message: string;
}

export type UserAction = { type: string; payload?: unknown };

export interface IUserContextValue extends UserReducerState {
    setUserType(type: string): void;
    setBusinessType(type: string): void;
    setSidebar(data: ISidebarProps): void;
    currentSidebar(collapse: boolean): ISidebarProps | null;
    setToast(data: Record<string, unknown>): void;
    clearToast(): void;
    setCollection(type: string, data: ICollection): void;
    setResource(type: string, data: unknown): void;
    setLoading(data: ISetLoading): Promise<void>;
    unsetLoading(data: IUnsetLoading): Promise<void>;
}

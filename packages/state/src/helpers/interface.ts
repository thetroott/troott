import type { ProfileDTO, TroottUser } from '@troott/api-client/dto';

export type { ProfileDTO, TroottUser };

export interface IPagination {
    next?: { page: number; limit: number };
    prev?: { page: number; limit: number };
}

export interface ICollection<T = unknown> {
    data: T[];
    count: number;
    total: number;
    pagination: IPagination;
    loading: boolean;
    message?: string;
}

export interface IToastState {
    type: 'success' | 'error' | 'warning' | 'info';
    show: boolean;
    message: string;
    title?: string;
    position?: string;
}

export interface ISidebarProps {
    collapsed: boolean;
    isOpen: boolean;
    route?: unknown;
    subroutes?: unknown[];
    inroutes?: unknown[];
}

export interface ISetLoading {
    option: 'default' | 'resource';
    type?: string;
}

export interface IUnsetLoading {
    option: 'default' | 'resource';
    type?: string;
    message?: string;
}

export interface IUserContext {
    users: ICollection;
    user: TroottUser | Record<string, unknown>;
    userType: string;
    profile: ProfileDTO | null;
    preferences: unknown;
    permissions: unknown[];
    subscription: unknown;
    plan: unknown;
    loading: boolean;
    toast: IToastState;
    sidebar: ISidebarProps;

    setUser: (data: TroottUser | Record<string, unknown>) => void;
    setUserType: (type: string) => void;
    setProfile: (data: ProfileDTO | null) => void;
    setPreferences: (data: unknown) => void;
    setPermissions: (data: unknown[]) => void;
    setSubscription: (data: unknown) => void;
    setPlan: (data: unknown) => void;
    setToast: (data: IToastState) => void;
    clearToast: () => void;
    setSidebar: (data: ISidebarProps) => void;
    setCollection: (type: string, data: ICollection) => void;
    setResource: (type: string, data: unknown) => void;
    setLoading: (data: ISetLoading) => Promise<void>;
    unsetLoading: (data: IUnsetLoading) => Promise<void>;
    refreshProfile: () => Promise<void>;
}

export interface IAppContext {
    sermons: ICollection;
    sermon: unknown;
    playlists: ICollection;
    playlist: unknown;
    ministers: ICollection;
    minister: unknown;
    listeners: ICollection;
    listener: unknown;
    creators: ICollection;
    creator: unknown;
    library: unknown;
    discoveryHome: unknown;
    featuredMinister: unknown;
    searchResults: ICollection;
    plans: ICollection;
    plan: unknown;
    transactions: ICollection;
    transaction: unknown;
    loading: boolean;

    setCollection: (type: string, data: ICollection) => void;
    setResource: (type: string, data: unknown) => void;
    setLoading: (data: ISetLoading) => Promise<void>;
    unsetLoading: (data: IUnsetLoading) => Promise<void>;
    loadDiscoveryHome: () => Promise<void>;
}

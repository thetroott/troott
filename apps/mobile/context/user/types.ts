import type {
    GET_LISTENER,
    GET_LOGGEDIN_USER,
    SET_LISTENER,
    SET_LISTENER_ONBOARDING,
    SET_LOADER,
    SET_LOADING,
    SET_USER,
    SET_USERTYPE,
    UNSET_LOADING,
} from '../types';

export type SessionUser = Record<string, unknown> | null;
export type ListenerProfile = Record<string, unknown> | null;

export interface UserReducerState {
    user: SessionUser;
    userType: string;
    listener: ListenerProfile;
    loading: boolean;
    loader: boolean;
    message: string;
}

export type UserAction =
    | { type: typeof GET_LOGGEDIN_USER; payload: SessionUser }
    | { type: typeof GET_LISTENER; payload: ListenerProfile }
    | { type: typeof SET_USER; payload: SessionUser }
    | { type: typeof SET_USERTYPE; payload: string }
    | { type: typeof SET_LISTENER; payload: ListenerProfile }
    | {
          type: typeof SET_LISTENER_ONBOARDING;
          payload: { step?: number; status?: string };
      }
    | { type: typeof SET_LOADING }
    | { type: typeof SET_LOADER; payload: boolean }
    | { type: typeof UNSET_LOADING; payload?: string };

export interface IUserContextValue extends UserReducerState {
    setUser(user: SessionUser): void;
    setUserType(type: string): void;
    setListener(listener: ListenerProfile): void;
    setResource(type: string, data: unknown): void;
    setLoading(option?: 'default' | 'loader'): void;
    unsetLoading(message?: string): void;
}

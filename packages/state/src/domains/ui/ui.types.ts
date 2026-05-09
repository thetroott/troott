import type { ISidebarProps, IToastState } from '../../helpers/interface';

/** Legacy shell chrome + global user loading flag (app loading lives on data-views). */
export interface UiDomainState {
    toast: IToastState;
    sidebar: ISidebarProps;
    loading: boolean;
}

export type UiAction =
    | { type: 'SET_TOAST'; payload: IToastState }
    | { type: 'SET_SIDEBAR'; payload: ISidebarProps }
    | { type: 'SET_LOADING' }
    | { type: 'UNSET_LOADING'; payload?: string };

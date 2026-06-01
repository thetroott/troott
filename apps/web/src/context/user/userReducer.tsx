import {
    GET_ADMINS,
    GET_LOGGEDIN_USER,
    GET_USER,
    GET_USERS,
    SET_BUSINESS_TYPE,
    SET_COUNT,
    SET_IS_ADMIN,
    SET_IS_SUPER,
    SET_ITEMS,
    SET_LOADER,
    SET_LOADING,
    SET_PAGINATION,
    SET_RESPONSE,
    SET_SEARCH,
    SET_SIDEBAR,
    SET_TOAST,
    SET_TOTAL,
    SET_USER,
    SET_USERTYPE,
    UNSET_LOADING,
} from '../types';

import type { UserAction, UserReducerState } from './types';

const userReducer = (
    state: UserReducerState,
    action: UserAction,
): UserReducerState => {
    switch (action.type) {
        case GET_USERS:
            return { ...state, users: action.payload as UserReducerState['users'] };
        case SET_TOAST:
            return { ...state, toast: action.payload as Record<string, unknown> };
        case GET_ADMINS:
            return { ...state, admins: action.payload };
        case GET_LOGGEDIN_USER:
            return { ...state, user: action.payload };
        case GET_USER:
            return { ...state, userDetails: action.payload };
        case SET_USER:
            return { ...state, user: action.payload };
        case SET_USERTYPE:
            return { ...state, userType: action.payload as string };
        case SET_BUSINESS_TYPE:
            return { ...state, businessType: action.payload as string };
        case SET_SIDEBAR:
            return { ...state, sidebar: action.payload as UserReducerState['sidebar'] };
        case SET_IS_SUPER:
            return { ...state, isSuper: action.payload as boolean };
        case SET_IS_ADMIN:
            return { ...state, isAdmin: action.payload as boolean };
        case SET_COUNT:
            return { ...state, count: action.payload as number };
        case SET_TOTAL:
            return { ...state, total: action.payload as number };
        case SET_PAGINATION:
            return {
                ...state,
                pagination: action.payload as UserReducerState['pagination'],
            };
        case SET_SEARCH:
            return {
                ...state,
                search: action.payload as UserReducerState['search'],
            };
        case SET_RESPONSE:
            return { ...state, response: action.payload };
        case SET_LOADING:
            return { ...state, loading: true };
        case SET_LOADER:
            return { ...state, loader: action.payload as boolean };
        case UNSET_LOADING:
            return {
                ...state,
                loading: false,
                message: action.payload as string,
            };
        case SET_ITEMS:
            return { ...state, items: action.payload as UserReducerState['items'] };
        default:
            return state;
    }
};

export default userReducer;

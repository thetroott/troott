import {
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
import type { UserAction, UserReducerState } from './types';

const userReducer = (
    state: UserReducerState,
    action: UserAction,
): UserReducerState => {
    switch (action.type) {
        case GET_LOGGEDIN_USER:
            return { ...state, user: action.payload };
        case GET_LISTENER:
            return { ...state, listener: action.payload };
        case SET_USER:
            return { ...state, user: action.payload };
        case SET_USERTYPE:
            return { ...state, userType: action.payload };
        case SET_LISTENER:
            return { ...state, listener: action.payload };
        case SET_LISTENER_ONBOARDING: {
            const onboard = action.payload;
            const user =
                state.user && typeof state.user === 'object'
                    ? {
                          ...state.user,
                          onboard: {
                              ...(typeof state.user.onboard === 'object' &&
                              state.user.onboard !== null
                                  ? (state.user.onboard as Record<
                                        string,
                                        unknown
                                    >)
                                  : {}),
                              ...onboard,
                          },
                      }
                    : state.user;
            const listener =
                state.listener && typeof state.listener === 'object'
                    ? {
                          ...state.listener,
                          onboarding: {
                              ...(typeof state.listener.onboarding ===
                                  'object' && state.listener.onboarding !== null
                                  ? (state.listener.onboarding as Record<
                                        string,
                                        unknown
                                    >)
                                  : {}),
                              ...onboard,
                          },
                      }
                    : state.listener;
            return { ...state, user, listener };
        }
        case SET_LOADING:
            return { ...state, loading: true };
        case SET_LOADER:
            return { ...state, loader: action.payload };
        case UNSET_LOADING:
            return {
                ...state,
                loading: false,
                message: action.payload ?? state.message,
            };
        default:
            return state;
    }
};

export default userReducer;

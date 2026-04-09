import {
    GET_LOGGEDIN_USER,
    GET_USER,
    SET_LOADING,
    SET_IS_ADMIN,
    SET_IS_SUPER,
    SET_USERTYPE,
    UNSET_LOADING,
    SET_SIDEBAR,
    SET_USER,
    GET_USERS,
    SET_COUNT,
    SET_TOTAL,
    SET_PAGINATION,
    SET_SEARCH,
    SET_RESPONSE,
    GET_ADMINS,
    GET_AUDITS,
    SET_TOAST
} from '../types';


const reducer = (state: any, action: any) => {

    switch (action.type) {
        case GET_AUDITS:
            return {
                ...state,
                audits: action.payload
            }
        case GET_USERS:
            return {
                ...state,
                users: action.payload
            }
        case SET_TOAST:
            return {
                ...state,
                toast: action.payload
            }
        case GET_ADMINS:
            return {
                ...state,
                admins: action.payload
            }
        case GET_LOGGEDIN_USER:
            return {
                ...state,
                user: action.payload,
            }
        case GET_USER:
            return {
                ...state,
                userDetails: action.payload,
            }
        case SET_USER:
            return {
                ...state,
                user: action.payload
            }
        case SET_USERTYPE:
            return {
                ...state,
                userType: action.payload
            }
        case SET_SIDEBAR:
            return {
                ...state,
                sidebar: action.payload
            }

        case SET_IS_SUPER:
            return {
                ...state,
                isSuper: action.payload
            }
        case SET_IS_ADMIN:
            return {
                ...state,
                isAdmin: action.payload
            }
        case SET_COUNT:
            return {
                ...state,
                count: action.payload
            }
        case SET_TOTAL:
            return {
                ...state,
                total: action.payload
            }
        case SET_PAGINATION:
            return {
                ...state,
                pagination: action.payload
            }
        case SET_SEARCH:
            return {
                ...state,
                search: action.payload
            }
        case SET_RESPONSE:
            return {
                ...state,
                response: action.payload
            }

        case SET_LOADING:
            return {
                ...state,
                loading: true
            }
            
        case UNSET_LOADING:
            return {
                ...state,
                loading: false,
                message: action.payload
            }

        default:
            return state;
    }

}

export default reducer;
import {
    GET_LOGGEDIN_USER,
    GET_USER,
    GET_USERS,
    GET_TALENT,
    GET_SUBSCRIPTION,
    GET_PLAN,
    GET_MEMBER,
    GET_INVITE,
    GET_WORKSPACE,
    GET_TASK,
    GET_TASKS,
    GET_PLANS,
    SET_USER,
    SET_USERTYPE,
    SET_BUSINESSTYPE,
    SET_TOAST,
    SET_WORKSPACE,
    SET_TASK,
    SET_PLAN,
    SET_TRANSACTION,
    SET_FEEDBACK,
    SET_TICKET,
    SET_IS_ADMIN,
    SET_IS_SUPER,
    SET_SIDEBAR,
    SET_COUNT,
    SET_TOTAL,
    SET_PAGINATION,
    SET_SEARCH,
    SET_LOADING,
    UNSET_LOADING,
} from '../helpers/types';

const userReducer = (state: any, action: any) => {
    switch (action.type) {
        case GET_MEMBER:
            return {
                ...state,
                member: action.payload,
            };
        case GET_INVITE:
            return {
                ...state,
                invite: action.payload,
            };
        case GET_WORKSPACE:
            return {
                ...state,
                workspace: action.payload,
            };
        case GET_TASKS:
            return {
                ...state,
                tasks: action.payload,
            };
        case GET_TASK:
            return {
                ...state,
                task: action.payload,
            };
        case GET_PLANS:
            return {
                ...state,
                plans: action.payload,
            };
        case GET_PLAN:
            return {
                ...state,
                plan: action.payload,
            };
        case GET_USERS:
            return {
                ...state,
                users: action.payload,
            };
        case SET_TOAST:
            return {
                ...state,
                toast: action.payload,
            };
        case GET_LOGGEDIN_USER:
            return {
                ...state,
                user: action.payload,
            };
        case GET_TALENT:
            return {
                ...state,
                talent: action.payload,
            };
        case GET_SUBSCRIPTION:
            return {
                ...state,
                subscription: action.payload,
            };
        case GET_USER:
            return {
                ...state,
                userDetails: action.payload,
            };
        case SET_USER:
            return {
                ...state,
                user: action.payload,
            };
        case SET_USERTYPE:
            return {
                ...state,
                userType: action.payload,
            };
        case SET_BUSINESSTYPE:
            return {
                ...state,
                businessType: action.payload,
            };
        case SET_WORKSPACE:
            return {
                ...state,
                workspace: action.payload,
            };
        case SET_TASK:
            return {
                ...state,
                task: action.payload,
            };
        case SET_PLAN:
            return {
                ...state,
                plan: action.payload,
            };
        case SET_TRANSACTION:
            return {
                ...state,
                transaction: action.payload,
            };
        case SET_FEEDBACK:
            return {
                ...state,
                feedback: action.payload,
            };
        case SET_TICKET:
            return {
                ...state,
                ticket: action.payload,
            };
        case SET_SIDEBAR:
            return {
                ...state,
                sidebar: action.payload,
            };
        case SET_IS_SUPER:
            return {
                ...state,
                isSuper: action.payload,
            };
        case SET_IS_ADMIN:
            return {
                ...state,
                isAdmin: action.payload,
            };
        case SET_COUNT:
            return {
                ...state,
                count: action.payload,
            };
        case SET_TOTAL:
            return {
                ...state,
                total: action.payload,
            };
        case SET_PAGINATION:
            return {
                ...state,
                pagination: action.payload,
            };
        case SET_SEARCH:
            return {
                ...state,
                search: action.payload,
            };
        case SET_LOADING:
            return {
                ...state,
                loading: true,
            };
        case UNSET_LOADING:
            return {
                ...state,
                loading: false,
                message: action.payload,
            };
        default:
            return state;
    }
};

export default userReducer;

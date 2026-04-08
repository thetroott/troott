import {
    GET_BUSINESSES,
    GET_BUSINESS,
    GET_ADMINS,
    GET_ADMIN,
    GET_TALENT,
    GET_TALENTS,
    GET_SUBSCRIPTION,
    GET_AUDITS,
    GET_MEMBERS,
    GET_MEMBER,
    GET_INVITES,
    GET_INVITE,
    GET_FORMS,
    GET_FORM,
    GET_RESPONSES,
    GET_RESPONSE,
    GET_WORKSPACES,
    GET_WORKSPACE,
    GET_HACKATHON,
    GET_ENTRY,
    GET_SUBMISSION,
    GET_SQUAD,
    GET_PROJECT,
    GET_TEAM,
    GET_TASKS,
    GET_TASK,
    GET_PLANS,
    GET_PLAN,
    GET_TRANSACTIONS,
    GET_TRANSACTION,
    SET_USER,
    SET_USERTYPE,
    SET_BUSINESSTYPE,
    SET_BUSINESS,
    SET_MEMBER,
    SET_INVITE,
    SET_FORM,
    SET_RESPONSE,
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



const appReducer = (state: any, action: any) => {
    switch (action.type) {
        case GET_BUSINESSES:
            return {
                ...state,
                businesses: action.payload,
            };
        case GET_BUSINESS:
            return {
                ...state,
                business: action.payload,
            };
        case GET_ADMINS:
            return {
                ...state,
                admins: action.payload,
            };
        case GET_ADMIN:
            return {
                ...state,
                admin: action.payload,
            };
        case GET_TALENT:
            return {
                ...state,
                talent: action.payload,
            };
        case GET_TALENTS:
            return {
                ...state,
                talents: action.payload,
            };
        case GET_SUBSCRIPTION:
            return {
                ...state,
                subscription: action.payload,
            };
        case GET_AUDITS:
            return {
                ...state,
                audits: action.payload,
            };
        case GET_MEMBERS:
            return {
                ...state,
                members: action.payload,
            };
        case GET_MEMBER:
            return {
                ...state,
                member: action.payload,
            };
        case GET_INVITES:
            return {
                ...state,
                invites: action.payload,
            };
        case GET_INVITE:
            return {
                ...state,
                invite: action.payload,
            };
        case GET_FORMS:
            return {
                ...state,
                forms: action.payload,
            };
        case GET_FORM:
            return {
                ...state,
                form: action.payload,
            };
        case GET_RESPONSES:
            return {
                ...state,
                responses: action.payload,
            };
        case GET_RESPONSE:
            return {
                ...state,
                response: action.payload,
            };
        case GET_WORKSPACES:
            return {
                ...state,
                workspaces: action.payload,
            };
        case GET_WORKSPACE:
            return {
                ...state,
                workspace: action.payload,
            };
        case GET_HACKATHON:
            return {
                ...state,
                hackathon: action.payload,
            };
        case GET_ENTRY:
            return {    
                ...state,
                entry: action.payload,
            };
        case GET_SUBMISSION:
            return {
                ...state,
                submission: action.payload,
            };
        case GET_SQUAD:
            return {
                ...state,
                squad: action.payload,
            };
        case GET_PROJECT:
            return {
                ...state,
                project: action.payload,
            };
        case GET_TEAM:
            return {
                ...state,
                team: action.payload,
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
        case GET_TRANSACTIONS:
            return {
                ...state,
                transactions: action.payload,
            };
        case GET_TRANSACTION:
            return {
                ...state,
                transaction: action.payload,
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
        case SET_BUSINESS:
            return {
                ...state,
                business: action.payload,
            };
        case SET_MEMBER:
            return {
                ...state,
                member: action.payload,
            };
        case SET_INVITE:
            return {
                ...state,
                invite: action.payload,
            };
        case SET_FORM:
            return {
                ...state,
                form: action.payload,
            };
        case SET_RESPONSE:
            return {
                ...state,
                response: action.payload,
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
        case SET_IS_ADMIN:
            return {
                ...state,
                isAdmin: action.payload,
            };
        case SET_IS_SUPER:
            return {
                ...state,
                isSuper: action.payload,
            };
        case SET_SIDEBAR:
            return {
                ...state,
                sidebar: action.payload,
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
            return {
                ...state,
            };
    }
};

export default appReducer;

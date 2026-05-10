import {
    SET_LOADING,
    UNSET_LOADING,
    GET_INDUSTRIES,
    GET_INDUSTRY,
    GET_CAREERS,
    GET_CAREER,
    GET_FIELDS,
    GET_FIELD,
    GET_SKILLS,
    GET_SKILL,
    GET_QUESTIONS,
    GET_QUESTION,
    GET_TOPICS,
    GET_TOPIC,
    SET_AIQUESTION,
    SET_SEARCH,
    GET_METRICS,
    SET_ITEMS,
    GET_CORE,
    SET_LOADER,
    GET_QUESTION_COUNT,
    GET_TASKS,
    GET_TASK,
    GET_COMMENTS,
    GET_COMMENT,
    SET_POLLER,
    SET_ITEM,
    GET_GROUPS,
    GET_GROUP,
    GET_LIBRARIES,
    GET_LIBRARY,
    GET_MODULES,
    GET_MODULE,
    GET_LESSONS,
    GET_LESSON
} from "../types";

const AppReducer = (state: any, action: any) => {

    switch (action.type) {
        case GET_CORE:
            return {
                ...state,
                core: action.payload
            }
        case GET_INDUSTRIES:
            return {
                ...state,
                industries: action.payload
            }
        case GET_INDUSTRY:
            return {
                ...state,
                industry: action.payload
            }
        case GET_CAREERS:
            return {
                ...state,
                careers: action.payload
            }
        case GET_CAREER:
            return {
                ...state,
                career: action.payload
            }
        case GET_LIBRARIES:
            return {
                ...state,
                libraries: action.payload
            }
        case GET_LIBRARY:
            return {
                ...state,
                library: action.payload
            }
        case GET_MODULES:
            return {
                ...state,
                modules: action.payload
            }
        case GET_MODULE:
            return {
                ...state,
                moudle: action.payload
            }
        case GET_LESSONS:
            return {
                ...state,
                lessons: action.payload
            }
        case GET_LESSON:
            return {
                ...state,
                lesson: action.payload
            }
        case GET_FIELDS:
            return {
                ...state,
                fields: action.payload
            }
        case GET_FIELD:
            return {
                ...state,
                field: action.payload
            }
        case GET_SKILLS:
            return {
                ...state,
                skills: action.payload
            }
        case GET_SKILL:
            return {
                ...state,
                skill: action.payload
            }
        case GET_QUESTIONS:
            return {
                ...state,
                questions: action.payload
            }
        case GET_QUESTION:
            return {
                ...state,
                question: action.payload
            }
        case GET_QUESTION_COUNT:
            return {
                ...state,
                questionCount: action.payload
            }
        case GET_TASKS:
            return {
                ...state,
                tasks: action.payload
            }
        case GET_TASK:
            return {
                ...state,
                task: action.payload
            }
        case GET_GROUPS:
            return {
                ...state,
                groups: action.payload
            }
        case GET_GROUP:
            return {
                ...state,
                group: action.payload
            }
        case GET_COMMENTS:
            return {
                ...state,
                comments: action.payload
            }
        case GET_COMMENT:
            return {
                ...state,
                comment: action.payload
            }
        case GET_TOPICS:
            return {
                ...state,
                topics: action.payload
            }
        case GET_TOPIC:
            return {
                ...state,
                topic: action.payload
            }
        case GET_METRICS:
            return {
                ...state,
                metrics: action.payload
            }
        case SET_ITEMS:
            return {
                ...state,
                items: action.payload
            }
        case SET_ITEM:
            return {
                ...state,
                item: action.payload
            }
        case SET_POLLER:
            return {
                ...state,
                poller: action.payload
            }
        case SET_AIQUESTION:
            return {
                ...state,
                aiQuestions: action.payload
            }
        case SET_SEARCH:
            return {
                ...state,
                search: action.payload
            }
        case SET_LOADING:
            return {
                ...state,
                loading: true
            }
        case SET_LOADER:
            return {
                ...state,
                loader: action.payload
            }
        case UNSET_LOADING:
            return {
                ...state,
                loading: false,
                message: action.payload
            }
        default:
            return {
                ...state
            }

    }
}

export default AppReducer;
import { Children, useReducer, useCallback, useContext, useMemo } from 'react'
import GeniusContext from './appContext'
import GeniusReducer from './appReducer'
import AxiosService from '../../services/axios.service'
import { IClearResource, ICollection, ISetLoading, IUnsetLoading } from '../../utils/interfaces.util'
import { useNavigate } from 'react-router-dom'
import storage from '../../utils/storage.util'
import loader from '../../utils/loader.util'
import { LoadingType } from '../../utils/types.util'
import { aiquestion, collection, coreResource, metrics, UIPoller } from '../../_data/seed'
import helper from '../../utils/helper.util'
import {
    SET_LOADER,
    SET_LOADING,
    UNSET_LOADING
} from '../types'

const AppState = (props: any) => {

    const navigate = useNavigate()

    const initialState = {
        poller: UIPoller,
        industries: collection,
        industry: {},
        careers: collection,
        career: {},
        libraries: collection,
        library: {},
        modules: collection,
        moudle: {},
        lessons: collection,
        lesson: {},
        groups: collection,
        group: {},
        fields: collection,
        field: {},
        skills: collection,
        skill: {},
        tasks: collection,
        task: {},
        comments: collection,
        comment: {},
        questions: collection,
        question: {},
        questionCount: [],
        aiQuestions: aiquestion,
        topics: collection,
        topic: {},
        items: [],
        item: {},
        core: coreResource,
        metrics: metrics,
        search: collection,
        message: '',
        loading: false,
        loader: false
    }

    const [state, dispatch] = useReducer(GeniusReducer, initialState);

    /**
     * @name setLoading
     * @param data 
     */
    const setLoading = async (data: ISetLoading) => {

        if (data.option === 'default') {
            dispatch({
                type: SET_LOADING
            })
        }

        if (data.option === 'loader') {
            dispatch({
                type: SET_LOADER,
                payload: true
            })
        }

        if (data.option === 'resource' && data.type) {

            const { loading, ...rest } = collection;

            dispatch({
                type: data.type,
                payload: {
                    ...rest,
                    loading: true
                }
            })

        }

    }

    /**
     * @name unsetLoading
     * @param data 
     */
    const unsetLoading = async (data: IUnsetLoading) => {

        if (data.option === 'default') {
            dispatch({
                type: UNSET_LOADING,
                payload: data.message
            })
        }

        if (data.option === 'loader') {
            dispatch({
                type: SET_LOADER,
                payload: false
            })
        }

        if (data.option === 'resource' && data.type) {

            const { loading, message, ...rest } = collection;

            dispatch({
                type: data.type,
                payload: {
                    ...rest,
                    loading: false,
                    message: data.message
                }
            })

        }

    }

    /**
     * @name clearResource
     * @param data 
     */
    const clearResource = (data: IClearResource) => {

        let payload: any = {}

        if (data.resource === 'multiple') {
            payload = collection
        }

        dispatch({
            type: data.type,
            payload: payload
        })

    }


    const setCollection = (type: string, data: ICollection) => {
        dispatch({
            type: type,
            payload: data
        })
    }

    const setResource = (type: string, data: any) => {
        dispatch({
            type: type,
            payload: data
        })
    }

    const contextValues = useMemo(() => ({
        poller: state.poller,
        industries: state.industries,
        industry: state.industry,
        careers: state.careers,
        career: state.career,
        libraries: state.libraries,
        library: state.library,
        modules: state.modules,
        moudle: state.moudle,
        lessons: state.lessons,
        lesson: state.lesson,
        groups: state.groups,
        group: state.group,
        fields: state.fields,
        field: state.field,
        skills: state.skills,
        skill: state.skill,
        questions: state.questions,
        question: state.question,
        tasks: state.tasks,
        task: state.task,
        comments: state.comments,
        comment: state.comment,
        questionCount: state.questionCount,
        aiQuestions: state.aiQuestions,
        topics: state.topics,
        topic: state.topic,
        items: state.items,
        item: state.item,
        core: state.core,
        metrics: state.metrics,
        search: state.search,
        message: state.message,
        loading: state.loading,
        loader: state.loader,
        setLoading: setLoading,
        unsetLoading: unsetLoading,
        clearResource: clearResource,
        setResource: setResource,
        setCollection: setCollection,
    }), [
        state.poller,
        state.industries,
        state.industry,
        state.careers,
        state.career,
        state.libraries,
        state.library,
        state.modules,
        state.moudle,
        state.lessons,
        state.lesson,
        state.groups,
        state.group,
        state.fields,
        state.field,
        state.skills,
        state.skill,
        state.questions,
        state.question,
        state.tasks,
        state.task,
        state.comments,
        state.comment,
        state.questionCount,
        state.aiQuestions,
        state.topics,
        state.topic,
        state.items,
        state.item,
        state.metrics,
        state.search,
        state.message,
        state.loading,
        state.loader,
        state.core,
        setLoading,
        unsetLoading,
        clearResource,
        setCollection,
        setResource
    ])

    return <GeniusContext.Provider
        value={contextValues}
    >
        {props.children}
    </GeniusContext.Provider>

}

export default AppState;
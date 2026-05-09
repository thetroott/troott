import React, { useCallback, useContext, useEffect, useState } from 'react'
import { ICoreMetrics, IMetricQuery } from '../../utils/interfaces.util'
import useContextType from '../useContextType'
import { GET_METRICS, GET_QUESTION_COUNT } from '../../context/types'
import AxiosService from '../../services/axios.service'
import { URL_METRICS } from '../../utils/path.util'
import useNetwork from '../useNetwork'

interface IGetQuestionCount {
    careerId: string,
    fields: Array<string>,
    skills?: Array<string>,
    topics?: Array<string>
}

const useMetrics = () => {

    const { appContext } = useContextType()
    const { popNetwork } = useNetwork(false)
    const {
        metrics,
        loading,
        loader,
        questionCount,
        setCollection,
        setResource,
        setLoading,
        unsetLoading
    } = appContext

    const [metric, setMetric] = useState({ total: 0, disabled: 0, enabled: 0 })

    useEffect(() => {

    }, [])

    const clearCounters = () => {
        setResource(GET_QUESTION_COUNT, [])
    }

    const handleSetMetric = () => {

        const mt = metrics;
        const qmt = mt.question;

        if (qmt && mt.type === 'question' && mt.resource) {

            setMetric({
                ...metric,
                total: qmt.resource.total || qmt.total,
                enabled: qmt.resource.enabled || qmt.enabled,
                disabled: qmt.resource.disabled || qmt.disabled
            })

        } else if (qmt && mt.type === 'question') {
            setMetric({
                ...metric,
                total: qmt.total,
                enabled: qmt.enabled,
                disabled: qmt.disabled
            })
        }

    }

    /**
     * @name getResourceMetrics
     */
    const getResourceMetrics = useCallback(async (data: IMetricQuery) => {

        const { metric, type, difficulties, endDate, levels, questionTypes, resource, resourceId, startDate } = data;

        if (metric === 'overview') {

            await setLoading({ option: 'resource', type: GET_METRICS })

            const response = await AxiosService.call({
                type: 'default',
                method: 'POST',
                isAuth: true,
                path: `${URL_METRICS}/overview`,
                payload: {
                    type: type,
                    difficulties: difficulties,
                    endDate: endDate,
                    levels: levels,
                    questionTypes: questionTypes,
                    resource: resource,
                    resourceId: resourceId,
                    startDate: startDate
                }
            })

            if (response.error === false) {

                if (response.status === 200) {

                    const result: ICoreMetrics = {
                        type: type,
                        resource: resource,
                        question: response.data.question,
                        loading: false,
                        message: `successful`
                    }

                    setResource(GET_METRICS, result)

                }

            }

            if (response.error === true) {

                await unsetLoading({
                    option: 'resource',
                    type: GET_METRICS,
                    message: response.message ? response.message : response.data
                })

                if (response.status === 401) {
                    AxiosService.logout()
                } else if (response.message && response.message === 'Error: Network Error') {
                    popNetwork();
                } else if (response.data) {
                    console.log(`Error! Could not get metrics ${response.data}`)
                }

            }


        } else {

            await unsetLoading({
                option: 'resource',
                type: GET_METRICS,
                message: 'invalid metric type'
            })
        }


    }, [setLoading, unsetLoading, setCollection])

    /**
     * @name getQuestionCount
     */
    const getQuestionCount = useCallback(async (data: IGetQuestionCount) => {

        setLoading({ option: 'loader' })

        let payload: any = {
            careerId: data.careerId,
            fields: data.fields
        }

        if(data.skills && data.skills.length > 0){
            payload.skills = data.skills;
        }

        if(data.topics && data.topics.length > 0){
            payload.topics = data.topics;
        }

        const response = await AxiosService.call({
            type: 'default',
            method: 'POST',
            isAuth: true,
            path: `${URL_METRICS}/question-count`,
            payload: payload
        })

        if (response.error === false) {

            unsetLoading({ option: 'loader', message: 'data fetch successful' })
            setResource(GET_QUESTION_COUNT, response.data)

        }

        if (response.error === true) {

            unsetLoading({
                option: 'loader',
                message: response.message ? response.message : response.data
            })

            if (response.status === 401) {
                AxiosService.logout()
            } else if (response.message && response.message === 'Error: Network Error') {
                popNetwork();
            } else if (response.data) {
                console.log(`Error! Could not get question count metrics ${response.data}`)
            }

        }

        return response;


    }, [setLoading, unsetLoading, setResource])

    return {
        metrics,
        metric,
        loading,
        loader,
        questionCount,

        handleSetMetric,
        clearCounters,

        getResourceMetrics,
        getQuestionCount
    }
}

export default useMetrics
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { IAddQuestion, IAIQuestion, ICollection, IGeneratedQuestion, IListQuery, IUserContext } from '../../utils/interfaces.util'
import useContextType from '../useContextType'
import { GET_FIELD, GET_FIELDS, GET_QUESTION, GET_QUESTIONS, GET_SKILL, GET_SKILLS, GET_TOPIC, GET_TOPICS, SET_AIQUESTION, } from '../../context/types'
import AxiosService from '../../services/axios.service'
import { URL_FIELD, URL_QUESTION } from '../../utils/path.util'
import useNetwork from '../useNetwork'
import helper from '../../utils/helper.util'
import QHelper from '../../utils/question.util'
import { ResourceType } from '../../utils/types.util'

interface IGenerate {
    careerId: string,
    fieldId: string,
    skillId: string,
    topicId: string,
    level: string
    model: string,
    prompt: string,
    total: number
}

interface IDetachResource {
    skills?: Array<string>,
    fields?: Array<string>,
    topics?: Array<string>,
    levels?: Array<string>,
    difficulties?: Array<string>,
    types?: Array<string>,
    type: ResourceType
}

interface IUpdateAnswer {
    action: string,
    answers: Array<{
        body?: string,
        code: string,
        toIndex?: number
    }>
}

interface IUpdateQuestion {
    body?: string,
    isEnabled?: boolean,
    difficulties?: Array<string>,
    levels?: Array<string>,
    types?: Array<string>,
    time?: {
        duration: number,
        handle: string
    },
    score?: number,
    careerId?: string
    fields?: Array<string>,
    skills?: Array<string>
    topics?: Array<string>
}

interface IAddGenerated {
    careerId: string
}

const useQuestion = () => {

    const { appContext } = useContextType()
    const { popNetwork } = useNetwork(false)
    const {
        questions,
        aiQuestions,
        question,
        loading,
        setCollection,
        setResource,
        setLoading,
        unsetLoading
    } = appContext

    useEffect(() => {

    }, [])

    const mapAIQuestions = async () => {

        let questions: Array<IAddQuestion> = [];

        for (let i = 0; i < aiQuestions.length; i++) {

            let fieldIds = aiQuestions[i].fields.map((x) => x.id);
            let skillIds = aiQuestions[i].skills.map((x) => x.id);
            let topicIds = aiQuestions[i].topics.map((x) => x.id);
            let answers = aiQuestions[i].answers.map((x) => { return { alphabet: x.alphabet, body: x.answer } })

            questions.push({
                body: aiQuestions[i].body,
                answers: answers,
                levels: aiQuestions[i].levels,
                difficulties: aiQuestions[i].difficulties,
                types: aiQuestions[i].types,
                correct: aiQuestions[i].correct,
                score: aiQuestions[i].score,
                time: aiQuestions[i].time,
                fields: fieldIds,
                skills: skillIds,
                topics: topicIds
            })

        }

        return questions;

    }

    const validateAIQuestions = async (e: any): Promise<{ error: boolean, message: string }> => {

        if (e) { e.preventDefault(); }
        let result: { error: boolean, message: string } = { error: false, message: '' };

        for (let i = 0; i < aiQuestions.length; i++) {

            let question = aiQuestions[i]

            if (!question.fields || question.fields.length === 0) {
                result.error = true;
                result.message = `Select at least one field for question ${i + 1}`;
                break;
            } else if (!question.topics || question.topics.length === 0) {
                result.error = true;
                result.message = `Select at least one topic for question ${i + 1}`;
                break;
            } else if (!question.skills || question.skills.length === 0) {
                result.error = true;
                result.message = `Select at least one skill for question ${i + 1}`;
                break;
            } else if (!question.body) {
                result.error = true;
                result.message = `Enter question body for question ${i + 1}`;
                break;
            } else if (!question.score) {
                result.error = true;
                result.message = `Enter score for question ${i + 1}`;
                break;
            } else if (!question.time.value) {
                result.error = true;
                result.message = `Enter time value for question ${i + 1}`;
                break;
            } else if (!question.time.handle) {
                result.error = true;
                result.message = `Select time handle for question ${i + 1}`;
                break;
            } else {
                result.error = false;
                result.message = ``;
                continue;
            }

        }

        return result;

    }

    const setAIQuestions = (data: Array<IAIQuestion>) => {
        setResource(SET_AIQUESTION, data)
    }

    /**
     * @name getQuestions
     */
    const getQuestions = useCallback(async (data: IListQuery) => {

        const { limit, page, select, order } = data;
        const q = `limit=${limit ? limit.toString() : 25}&page=${page ? page.toString() : 1}&order=${order ? order : 'desc'}`;

        setLoading({ option: 'resource', type: GET_QUESTIONS })

        const response = await AxiosService.call({
            type: 'default',
            method: 'GET',
            isAuth: true,
            path: `${URL_QUESTION}?${q}`
        })

        if (response.error === false) {

            if (response.status === 200) {

                const result: ICollection = {
                    data: response.data,
                    count: response.count!,
                    total: response.total!,
                    pagination: response.pagination!,
                    loading: false,
                    message: response.data.length > 0 ? `displaying ${response.count!} questions` : 'There are no questions currently'
                }

                setCollection(GET_QUESTIONS, result)

            }

        }

        if (response.error === true) {

            unsetLoading({
                option: 'resource',
                type: GET_QUESTIONS,
                message: response.message ? response.message : response.data
            })

            if (response.status === 401) {
                AxiosService.logout()
            } else if (response.message && response.message === 'Error: Network Error') {
                popNetwork();
            } else if (response.data) {
                console.log(`Error! Could not get questions ${response.data}`)
            }

        }

    }, [setLoading, unsetLoading, setCollection])

    /**
     * @name getResourceQuestions
     */
    const getResourceQuestions = useCallback(async (data: IListQuery) => {

        const { limit, page, select, order, resource, resourceId } = data;
        const q = `limit=${limit ? limit.toString() : 25}&page=${page ? page.toString() : 1}&order=${order ? order : 'desc'}&paginate=relative`;

        if (resource && resourceId) {

            setLoading({ option: 'resource', type: GET_QUESTIONS })

            const response = await AxiosService.call({
                type: 'default',
                method: 'GET',
                isAuth: true,
                path: `/${resource}/questions/${resourceId}?${q}`
            })

            if (response.error === false) {

                if (response.status === 200) {

                    const result: ICollection = {
                        data: response.data,
                        count: response.count!,
                        total: response.total!,
                        pagination: response.pagination!,
                        loading: false,
                        message: response.data.length > 0 ? `displaying ${response.count!} questions` : 'There are no questions currently'
                    }

                    setCollection(GET_QUESTIONS, result)

                }

            }

            if (response.error === true) {

                unsetLoading({
                    option: 'resource',
                    type: GET_QUESTIONS,
                    message: response.message ? response.message : response.data
                })

                if (response.status === 401) {
                    AxiosService.logout()
                } else if (response.message && response.message === 'Error: Network Error') {
                    popNetwork();
                } else if (response.data) {
                    console.log(`Error! Could not get questions ${response.data}`)
                }

            }

        } else {

            unsetLoading({
                option: 'resource',
                type: GET_QUESTIONS,
                message: 'invalid resource / resourceId'
            })

        }


    }, [setLoading, unsetLoading, setCollection])

    /**
     * @name getQuestion
     */
    const getQuestion = useCallback(async (id: string) => {

        setLoading({ option: 'default' })

        const response = await AxiosService.call({
            type: 'default',
            method: 'GET',
            isAuth: true,
            path: `${URL_QUESTION}/${id}`
        })

        if (response.error === false) {

            if (response.status === 200) {

                setResource(GET_QUESTION, response.data)
            }

            unsetLoading({
                option: 'default',
                message: 'data fetched successfully'
            })

        }

        if (response.error === true) {

            unsetLoading({
                option: 'default',
                message: response.message ? response.message : response.data
            })

            if (response.status === 401) {
                AxiosService.logout()
            } else if (response.message && response.message === 'Error: Network Error') {
                popNetwork();
            }
            else if (response.data) {
                console.log(`Error! Could not get question ${response.data}`)
            }
            else if (response.status === 500) {
                console.log(`Sorry, there was an error processing your request. Please try again later. ${response.data}`)
            }

        }

    }, [setLoading, unsetLoading, setResource])

    /**
     * @name generateQuestions
     */
    const generateQuestions = useCallback(async (data: IGenerate) => {

        setLoading({ option: 'default' })

        const response = await AxiosService.call({
            type: 'default',
            method: 'POST',
            isAuth: true,
            path: `${URL_QUESTION}/generate`,
            payload: {
                careerId: data.careerId,
                fieldId: data.fieldId,
                skillId: data.skillId,
                topics: [data.topicId],
                level: data.level,
                model: data.model,
                prompt: data.prompt,
                total: data.total
            }
        })

        if (response.error === false) {

            if (response.status === 200) {

                let questionList: Array<IAIQuestion> = [];

                for (let i = 0; i < response.data.length; i++) {
                    let item: IGeneratedQuestion = response.data[i];
                    questionList.push({
                        code: helper.random(6, true).toUpperCase(),
                        body: item.body,
                        answers: item.answers,
                        levels: [item.level],
                        difficulties: [item.difficulty],
                        types: [item.type],
                        correct: item.correct,
                        score: item.score,
                        time: {
                            value: QHelper.splitGenTime(item.time).value,
                            handle: QHelper.splitGenTime(item.time).handle
                        },
                        fields: [],
                        skills: [],
                        topics: []
                    })
                }

                setResource(SET_AIQUESTION, questionList)
            }

            unsetLoading({
                option: 'default',
                message: 'data fetched successfully'
            })

        }

        if (response.error === true) {

            unsetLoading({
                option: 'default',
                message: response.message ? response.message : response.data
            })

            if (response.status === 401) {
                AxiosService.logout()
            } else if (response.message && response.message === 'Error: Network Error') {
                popNetwork();
            }
            else if (response.data) {
                console.log(`Error! Could not generate questions ${response.data}`)
            }
            else if (response.status === 500) {
                console.log(`Sorry, there was an error processing your request. Please try again later. ${response.data}`)
            }

        }

        return response;

    }, [setLoading, unsetLoading, setResource])

    /**
     * @name addGeneratedQuestions
     */
    const addGeneratedQuestions = useCallback(async (data: IAddGenerated) => {

        const mapped = await mapAIQuestions()

        setLoading({ option: 'default' })

        const response = await AxiosService.call({
            type: 'default',
            method: 'POST',
            isAuth: true,
            path: `${URL_QUESTION}/add-generated`,
            payload: {
                careerId: data.careerId,
                generated: mapped
            }
        })

        if (response.error === false) {

            if (response.status === 200) {


            }

            unsetLoading({
                option: 'default',
                message: 'data fetched successfully'
            })

        }

        if (response.error === true) {

            unsetLoading({
                option: 'default',
                message: response.message ? response.message : response.data
            })

            if (response.status === 401) {
                AxiosService.logout()
            } else if (response.message && response.message === 'Error: Network Error') {
                popNetwork();
            }
            else if (response.data) {
                console.log(`Error! Could not generate questions ${response.data}`)
            }
            else if (response.status === 500) {
                console.log(`Sorry, there was an error processing your request. Please try again later. ${response.data}`)
            }

        }

        return response;

    }, [setLoading, unsetLoading, setResource])

    /**
     * @name updateQuestion
     */
    const updateQuestion = useCallback(async (id: string, data: IUpdateQuestion) => {

        setLoading({ option: 'default' })

        const response = await AxiosService.call({
            type: 'default',
            method: 'PUT',
            isAuth: true,
            path: `${URL_QUESTION}/${id}`,
            payload: { ...data }
        })

        if (response.error === false) {

            if (response.status === 200) {


            }

            unsetLoading({
                option: 'default',
                message: 'data fetched successfully'
            })

        }

        if (response.error === true) {

            unsetLoading({
                option: 'default',
                message: response.message ? response.message : response.data
            })

            if (response.status === 401) {
                AxiosService.logout()
            } else if (response.message && response.message === 'Error: Network Error') {
                popNetwork();
            }
            else if (response.data) {
                console.log(`Error! Could not update question ${response.data}`)
            }
            else if (response.status === 500) {
                console.log(`Sorry, there was an error processing your request. Please try again later. ${response.data}`)
            }

        }

        return response;

    }, [setLoading, unsetLoading])

    /**
     * @name detachResource
     */
    const detachResource = useCallback(async (id: string, data: IDetachResource) => {

        setLoading({ option: 'default' })

        const response = await AxiosService.call({
            type: 'default',
            method: 'PUT',
            isAuth: true,
            path: `${URL_QUESTION}/detach/${id}`,
            payload: { ...data }
        })

        if (response.error === false) {

            if (response.status === 200) {


            }

            unsetLoading({
                option: 'default',
                message: 'data fetched successfully'
            })

        }

        if (response.error === true) {

            unsetLoading({
                option: 'default',
                message: response.message ? response.message : response.data
            })

            if (response.status === 401) {
                AxiosService.logout()
            } else if (response.message && response.message === 'Error: Network Error') {
                popNetwork();
            }
            else if (response.data) {
                console.log(`Error! Could not detach resource ${response.data}`)
            }
            else if (response.status === 500) {
                console.log(`Sorry, there was an error processing your request. Please try again later. ${response.data}`)
            }

        }

        return response;

    }, [setLoading, unsetLoading])

    const updateAnswer = useCallback(async (id: string, data: IUpdateAnswer) => {

        setLoading({ option: 'default' })

        const response = await AxiosService.call({
            type: 'default',
            method: 'PUT',
            isAuth: true,
            path: `${URL_QUESTION}/update-answer/${id}`,
            payload: { ...data }
        })

        if (response.error === false) {

            if (response.status === 200) {


            }

            unsetLoading({
                option: 'default',
                message: 'data fetched successfully'
            })

        }

        if (response.error === true) {

            unsetLoading({
                option: 'default',
                message: response.message ? response.message : response.data
            })

            if (response.status === 401) {
                AxiosService.logout()
            } else if (response.message && response.message === 'Error: Network Error') {
                popNetwork();
            }
            else if (response.data) {
                console.log(`Error! Could not detach resource ${response.data}`)
            }
            else if (response.status === 500) {
                console.log(`Sorry, there was an error processing your request. Please try again later. ${response.data}`)
            }

        }

        return response;

    }, [setLoading, unsetLoading])


    return {
        questions,
        question,
        aiQuestions,
        loading,

        mapAIQuestions,
        validateAIQuestions,
        setAIQuestions,

        getQuestions,
        getResourceQuestions,
        getQuestion,
        generateQuestions,
        addGeneratedQuestions,
        updateQuestion,
        detachResource,
        updateAnswer
    }
}

export default useQuestion
import React, { useCallback, useEffect } from 'react'
import { ICollection, IListQuery } from '../../utils/interfaces.util'
import useContextType from '../useContextType'
import AxiosService from '../../services/axios.service'
import { URL_LESSONS, URL_LIBRARIES, URL_MODULES } from '../../utils/path.util'
import useNetwork from '../useNetwork'
import storage from '../../utils/storage.util'
import { GET_LESSON, GET_LESSONS, GET_LIBRARIES, GET_LIBRARY, GET_MODULE, GET_MODULES } from '../../context/types'
import helper from '../../utils/helper.util'
import { StatusEnum } from '../../utils/enums.util'
import { SemanticType } from '../../utils/types.util'

interface ICreateLibrary {
    id: string,
    title: string,
    banner?: string,
    description: string,
    status: string
}

interface ICreateModule {
    id: string,
    modules: Array<{
        title: string,
        description: string,
        status: string,
        order: number
    }>
}

interface ICreateLesson {
    id: string,
    lessons: Array<{
        title: string,
        banner?: string,
        description: string,
        status: string,
        order: number,
        url: string,
    }>
}

interface IChangeAccess {
    id: string,
    action: 'attach' | 'detach',
    groupCode?: string,
    talents?: Array<any>
}

interface IUpdateLibrary {
    id: string,
    title?: string,
    banner?: string,
    description?: string,
    status?: string
}

interface IUpdateModule {
    id: string,
    title?: string,
    banner?: string,
    description?: string,
    status?: string,
    order?: number
}

interface IUpdateLesson {
    id: string,
    title?: string,
    banner?: string,
    description?: string,
    status?: string,
    order?: number,
    url?: string,
}

const useLibrary = () => {

    const { appContext } = useContextType()
    const { popNetwork } = useNetwork(false)
    const {
        libraries,
        library,
        modules,
        moudle,
        lessons,
        lesson,
        loading,
        loader,
        setCollection,
        setResource,
        setLoading,
        unsetLoading
    } = appContext;

    const LibraryStatus = helper.pickFrom(StatusEnum, [
        'DRAFT', 'PUBLISHED', 'ARCHIVED'
    ] as const)

    useEffect(() => {
    }, [])

    const getStatusType = (status: string) => {

        let result: SemanticType = 'warning';

        switch (status) {
            case LibraryStatus.DRAFT:
                result = 'warning'
                break;
            case LibraryStatus.PUBLISHED:
                result = 'success'
                break;
            case LibraryStatus.ARCHIVED:
                result = 'ongoing'
                break;
            default:
                result = 'warning'
                break;
        }

        return result;

    }

    const selectLesson = (id: string) => {

        if (helper.isEmpty(lesson, 'object')) {

            const lesson = lessons.data.find((l) => l._id === id);

            if (lesson) {
                setResource(GET_LESSON, lesson)
            }
        } else {
            setResource(GET_LESSON, {})
        }


    }

    /**
     * @name getLibraries
     */
    const getLibraries = useCallback(async (data: IListQuery) => {

        const { limit, page, select, order } = data;
        const q = `limit=${limit ? limit.toString() : 25}&page=${page ? page.toString() : 1}&order=${order ? order : 'desc'}`;

        setLoading({ option: 'resource', type: GET_LIBRARIES })

        const response = await AxiosService.call({
            type: 'default',
            method: 'GET',
            isAuth: true,
            path: `${URL_LIBRARIES}?${q}`
        })

        if (response.error === false) {

            if (response.status === 200) {

                const result: ICollection = {
                    data: response.data,
                    count: response.count!,
                    total: response.total!,
                    pagination: response.pagination!,
                    loading: false,
                    message: response.data.length > 0 ? `displaying ${response.count!} libraries` : 'There are no libraries currently'
                }

                setCollection(GET_LIBRARIES, result);

            }

        }

        if (response.error === true) {

            unsetLoading({
                option: 'resource',
                type: GET_LIBRARIES,
                message: response.message ? response.message : response.data
            })

            if (response.status === 401) {
                AxiosService.logout()
            } else if (response.message && response.message === 'Error: Network Error') {
                popNetwork();
            } else if (response.data) {
                console.log(`Error! Could not get libraries ${response.data}`)
            }

        }

    }, [setLoading, unsetLoading, setCollection])

    /**
     * @name getModules
     */
    const getModules = useCallback(async (data: IListQuery) => {

        const { limit, page, select, order, id } = data;
        const q = `limit=${limit ? limit.toString() : 25}&page=${page ? page.toString() : 1}&order=${order ? order : 'desc'}`;

        setLoading({ option: 'resource', type: GET_MODULES })

        const response = await AxiosService.call({
            type: 'default',
            method: 'GET',
            isAuth: true,
            path: `${URL_LIBRARIES}/modules/${id}?${q}`
        })

        if (response.error === false) {

            if (response.status === 200) {

                const result: ICollection = {
                    data: response.data,
                    count: response.count!,
                    total: response.total!,
                    pagination: response.pagination!,
                    loading: false,
                    message: response.data.length > 0 ? `displaying ${response.count!} modules` : 'There are no modules currently'
                }

                setCollection(GET_MODULES, result);

            }

        }

        if (response.error === true) {

            unsetLoading({
                option: 'resource',
                type: GET_MODULES,
                message: response.message ? response.message : response.data
            })

            if (response.status === 401) {
                AxiosService.logout()
            } else if (response.message && response.message === 'Error: Network Error') {
                popNetwork();
            } else if (response.data) {
                console.log(`Error! Could not get modules ${response.data}`)
            }

        }

    }, [setLoading, unsetLoading, setCollection])

    /**
     * @name getLessons
     */
    const getLessons = useCallback(async (data: IListQuery) => {

        const { limit, page, select, order, id } = data;
        const q = `limit=${limit ? limit.toString() : 25}&page=${page ? page.toString() : 1}&order=${order ? order : 'desc'}`;

        setLoading({ option: 'resource', type: GET_LESSONS })

        const response = await AxiosService.call({
            type: 'default',
            method: 'GET',
            isAuth: true,
            path: `${URL_MODULES}/lessons/${id}?${q}`
        })

        if (response.error === false) {

            if (response.status === 200) {

                const result: ICollection = {
                    data: response.data,
                    count: response.count!,
                    total: response.total!,
                    pagination: response.pagination!,
                    loading: false,
                    message: response.data.length > 0 ? `displaying ${response.count!} lessons` : 'There are no lessons currently'
                }

                setCollection(GET_LESSONS, result);

            }

        }

        if (response.error === true) {

            unsetLoading({
                option: 'resource',
                type: GET_LESSONS,
                message: response.message ? response.message : response.data
            })

            if (response.status === 401) {
                AxiosService.logout()
            } else if (response.message && response.message === 'Error: Network Error') {
                popNetwork();
            } else if (response.data) {
                console.log(`Error! Could not get lessons ${response.data}`)
            }

        }

    }, [setLoading, unsetLoading, setCollection])

    /**
     * @name getLibrary
     */
    const getLibrary = useCallback(async (id: string) => {

        setLoading({ option: 'default' })

        const response = await AxiosService.call({
            type: 'default',
            method: 'GET',
            isAuth: true,
            path: `${URL_LIBRARIES}/${id}`
        })

        if (response.error === false) {

            if (response.status === 200) {
                setResource(GET_LIBRARY, response.data)
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
                console.log(`Error! Could not get library ${response.data}`)
            }
            else if (response.status === 500) {
                console.log(`Sorry, there was an error processing your request. Please try again later. ${response.data}`)
            }

        }

    }, [setLoading, unsetLoading, setResource])

    /**
     * @name getModule
     */
    const getModule = useCallback(async (id: string) => {

        setLoading({ option: 'default' })

        const response = await AxiosService.call({
            type: 'default',
            method: 'GET',
            isAuth: true,
            path: `${URL_MODULES}/${id}`
        })

        if (response.error === false) {

            if (response.status === 200) {
                setResource(GET_MODULE, response.data)
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
                console.log(`Error! Could not get module ${response.data}`)
            }
            else if (response.status === 500) {
                console.log(`Sorry, there was an error processing your request. Please try again later. ${response.data}`)
            }

        }

    }, [setLoading, unsetLoading, setResource])

    /**
     * @name getLesson
     */
    const getLesson = useCallback(async (id: string) => {

        setLoading({ option: 'default' })

        const response = await AxiosService.call({
            type: 'default',
            method: 'GET',
            isAuth: true,
            path: `${URL_LESSONS}/${id}`
        })

        if (response.error === false) {

            if (response.status === 200) {
                setResource(GET_LESSON, response.data)
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
                console.log(`Error! Could not get lesson ${response.data}`)
            }
            else if (response.status === 500) {
                console.log(`Sorry, there was an error processing your request. Please try again later. ${response.data}`)
            }

        }

    }, [setLoading, unsetLoading, setResource])

    /**
     * @name createLibrary
     */
    const createLibrary = useCallback(async (data: ICreateLibrary) => {

        setLoading({ option: 'loader' })

        const response = await AxiosService.call({
            type: 'default',
            method: 'POST',
            isAuth: true,
            path: `${URL_LIBRARIES}/${data.id}`,
            payload: {
                title: data.title,
                banner: data.banner ? data.banner : '',
                description: data.description,
                status: data.status
            }
        })

        if (response.error === false) {

            unsetLoading({
                option: 'loader',
                message: 'Library created successfully'
            })

            response.message = 'Library created successfully'

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
            }

        }

        return response

    }, [setLoading, unsetLoading])

    /**
     * @name createModule
     */
    const createModule = useCallback(async (data: ICreateModule) => {

        setLoading({ option: 'loader' })

        const response = await AxiosService.call({
            type: 'default',
            method: 'POST',
            isAuth: true,
            path: `${URL_MODULES}/${data.id}`,
            payload: {
                modules: data.modules
            }
        })

        if (response.error === false) {

            const title = data.modules.length > 1 ? 'Modules' : 'Module'

            unsetLoading({
                option: 'loader',
                message: `${title} created successfully`
            })

            response.message = `${title} created successfully`

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
            }

        }

        return response

    }, [setLoading, unsetLoading])

    /**
     * @name createLesson
     */
    const createLesson = useCallback(async (data: ICreateLesson) => {

        setLoading({ option: 'loader' })

        const response = await AxiosService.call({
            type: 'default',
            method: 'POST',
            isAuth: true,
            path: `${URL_LESSONS}/${data.id}`,
            payload: {
                lessons: data.lessons
            }
        })

        if (response.error === false) {

            const title = data.lessons.length > 1 ? 'Lessons' : 'Lesson'

            unsetLoading({
                option: 'loader',
                message: `${title} created successfully`
            })

            response.message = `${title} created successfully`

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
            }

        }

        return response

    }, [setLoading, unsetLoading])

    /**
     * @name changeLessonAccess
     */
    const changeLessonAccess = useCallback(async (data: IChangeAccess) => {

        setLoading({ option: 'loader' })

        const response = await AxiosService.call({
            type: 'default',
            method: 'PUT',
            isAuth: true,
            path: `${URL_LESSONS}/access/${data.id}`,
            payload: data
        })

        if (response.error === false) {

            unsetLoading({
                option: 'loader',
                message: 'lesson updated successfully'
            })

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
            }

        }

        return response

    }, [setLoading, unsetLoading])

    /**
     * @name updateLibrary
     */
    const updateLibrary = useCallback(async (data: IUpdateLibrary) => {

        setLoading({ option: 'loader' })

        const response = await AxiosService.call({
            type: 'default',
            method: 'PUT',
            isAuth: true,
            path: `${URL_LIBRARIES}/${data.id}`,
            payload: data
        })

        if (response.error === false) {

            unsetLoading({
                option: 'loader',
                message: 'library updated successfully'
            })

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
            }

        }

        return response

    }, [setLoading, unsetLoading])

    /**
     * @name updateModule
     */
    const updateModule = useCallback(async (data: IUpdateModule) => {

        setLoading({ option: 'loader' })

        const response = await AxiosService.call({
            type: 'default',
            method: 'PUT',
            isAuth: true,
            path: `${URL_MODULES}/${data.id}`,
            payload: data
        })

        if (response.error === false) {

            unsetLoading({
                option: 'loader',
                message: 'module updated successfully'
            })

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
            }

        }

        return response

    }, [setLoading, unsetLoading])

    /**
     * @name updateLesson
     */
    const updateLesson = useCallback(async (data: IUpdateLesson) => {

        setLoading({ option: 'loader' })

        const response = await AxiosService.call({
            type: 'default',
            method: 'PUT',
            isAuth: true,
            path: `${URL_LESSONS}/${data.id}`,
            payload: data
        })

        if (response.error === false) {

            unsetLoading({
                option: 'loader',
                message: 'lesson updated successfully'
            })

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
            }

        }

        return response

    }, [setLoading, unsetLoading])

    return {
        libraries,
        library,
        modules,
        moudle,
        lessons,
        lesson,
        loading,
        loader,

        LibraryStatus,
        getStatusType,
        selectLesson,

        getLibraries,
        getModules,
        getLessons,
        getLibrary,
        getModule,
        getLesson,
        createLibrary,
        createModule,
        createLesson,
        changeLessonAccess,
        updateLibrary,
        updateModule,
        updateLesson
    }
}

export default useLibrary
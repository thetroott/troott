// import React, { useCallback, useContext, useEffect, useState } from 'react'
// import useContextType from '../useContextType'
// import storage from '../../utils/storage.util'
// import AxiosService from '../../services/axios.service'
// import { URL_LOGGEDIN_USER, URL_USERS } from '../../utils/path.util'
// import { GET_LOGGEDIN_USER, GET_USER, GET_USERS } from '../../context/types'
// import { ICollection, IListQuery } from '../../utils/interfaces.util'

// const useUser = () => {

//     const { userContext } = useContextType()
//     const {
//         users,
//         user,
//         loading,
//         setLoading,
//         unsetLoading,
//         setCollection,
//         setResource
//     } = userContext

//     useEffect(() => {

//     }, [])

//     const getUsers = useCallback(async (data: IListQuery) => {

//         const { limit, page, select, order } = data;
//         const q = `limit=${limit ? limit.toString() : 25}&page=${page ? page.toString() : 1}&order=${order ? order : 'desc'}`;

//         setLoading({ option: 'resource', type: GET_USERS })

//         const response = await AxiosService.call({
//             type: 'backend',
//             method: 'GET',
//             isAuth: true,
//             path: `${URL_USERS}?${q}`
//         });

//         if (!response.error) {

//             if (response.status === 200) {

//                 const result: ICollection = {
//                     count: response.count!,
//                     total: response.total!,
//                     data: response.data,
//                     pagination: response.pagination!,
//                     loading: false,
//                     message: response.data.length > 0 ? `displaying ${response.count!} users` : 'There are no users currently'
//                 }
//                 setCollection(GET_USERS, result)

//             }

//         } else {
//             unsetLoading({ option: 'default', message: response.message })
//         }

//     }, [setLoading, unsetLoading, setResource])

//     /**
//      * @name getUser
//      */
//     const getUser = useCallback(async (id?: string) => {

//         const userId = id ? id : storage.getUserID();

//         setLoading({ option: 'default' });

//         const response = await AxiosService.call({
//             type: 'backend',
//             method: 'GET',
//             isAuth: true,
//             path: `${URL_LOGGEDIN_USER}/${userId}`
//         });

//         if (!response.error) {
//             setResource(GET_LOGGEDIN_USER, response.data)
//             unsetLoading({ option: 'default', message: 'data fetched successfully' })
//         } else {
//             setResource(GET_LOGGEDIN_USER, null)
//             unsetLoading({ option: 'default', message: response.message })
//         }

//     }, [setLoading, unsetLoading, setResource])

//     return {
//         users,
//         user,
//         loading,

//         getUsers,
//         getUser
//     }
// }

// export default useUser
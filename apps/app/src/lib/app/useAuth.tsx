// import React, { useContext, useEffect, useState } from 'react'
// import { IUserContext } from '../../utils/interfaces.util'
// import UserContext from '../../context/user/userContext'
// import useContextType from '../useContextType'
// import useGoTo from '../useGoTo'
// import CookieService from '../../services/cookie.service'
// import storage from '../../utils/storage.util'
// import routes from '../../routes/routes'
// import AxiosService from '../../services/axios.service'
// import { UserEnumType } from '../../utils/enums.util'
// import { URL_LOGIN, URL_USERS } from '../../utils/path.util'

// interface IRegister {
//     email: string,
//     password: string,
//     userType: string,
// }

// interface ILogin {
//     email: string,
//     password: string,
//     method: 'email' | 'biometric',
// }

// const useAuth = () => {

//     const { goTo, location, navigate, toMainRoute } = useGoTo()
//     const { userContext } = useContextType()

//     const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

//     const {
//         users,
//         user,
//         userType,
//         setUserType,
//         currentSidebar
//     } = userContext

//     useEffect(() => {
//         let ut = CookieService.getUserType();
//         setUserType(ut ? ut : '');
//     }, [])

//     useEffect(() => {

//         if (storage.checkToken() === false || storage.checkUserID() === false) {

//             if (
//                 location.pathname.includes('/invite') || location.pathname.includes('/invite') ||
//                 location.pathname.includes('/register') || location.pathname.includes('/register') ||
//                 location.pathname.includes('/verify')) {
//                 goTo(location.pathname);
//             } else {
//                 AxiosService.logout()
//                 goTo('/login');
//             }

//         } else {

//             setIsLoggedIn(true)
//             currentSidebar(false)

//             if (location.pathname === '/login' || location.pathname === '/home' || location.pathname === '/') {
//                 goTo('/dashboard')
//             }

//         }

//     }, [navigate])

//     useEffect(() => {
//         let ut = CookieService.getUserType();
//         setUserType(ut ? ut : '');
//     }, [isLoggedIn])

//     const redirect = (roles: Array<string>) => {

//         if (storage.checkToken() === false || storage.checkUserID() === false) {
//             AxiosService.logout()
//             goTo('/login');
//         } else {

//             const userType = CookieService.getUserType();
//             const token = storage.getToken()

//             if (token) {

//                 if (userType && !roles.includes(userType)) {
//                     goTo('/login')
//                     AxiosService.logout()
//                 } else {

//                     setIsLoggedIn(true);
//                     currentSidebar(false) // set sidebar

//                     if (location.pathname === '/login' || location.pathname === '/home' || location.pathname === '/') {
//                         toMainRoute(null, 'dashboard')
//                     }

//                 }

//             } else {
//                 AxiosService.logout()
//                 goTo('/login')
//             }

//         }

//     }

//     const login = async (data: ILogin) => {

//         const response = await AxiosService.call({
//             type: 'backend',
//             method: 'POST',
//             path: URL_LOGIN,
//             isAuth: false,
//             payload: { ...data }
//         })

//         if (!response.error) {

//             if (response.status === 200) {

//                 if (response.data.userType === UserEnumType.SUPER || response.data.userType === UserEnumType.ADMIN) {

//                     // store auth credentials
//                     storage.storeAuth(response.token!, response.data._id);

//                     CookieService.setData({
//                         key: 'userType',
//                         payload: response.data.userType,
//                         expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
//                         path: '/'
//                     })

//                     setIsLoggedIn(true)

//                 }

//             }

//             if (response.status === 206) {

//             }

//         }

//         return response

//     }

//     const logout = async () => {
//         await AxiosService.logout()
//         goTo('/login')
//     }

//     const register = async (data: IRegister) => {

//         const response = await AxiosService.call({
//             type: 'backend',
//             method: 'POST',
//             path: `/auth/register`,
//             isAuth: false,
//             payload: { ...data }
//         })

//         if (!response.error) {
//             setIsLoggedIn(false)
//         }

//         return response

//     }

//     return {
//         users,
//         user,
//         userType,

//         redirect,
//         login,
//         register,
//         logout
//     }
// }

// export default useAuth
// import UserContext from './userContext';
// import UserReducer from './userReducer';
// import {
//     SET_USERTYPE,
//     SET_LOADING,
//     SET_SIDEBAR,
//     UNSET_LOADING
// } from '../types'
// import { useReducer } from 'react';
// import type { ISetLoading, ISidebarProps, IUnsetLoading } from '@/utils/interfaces.util';
// import storage from '../../utils/storage.util'

// const UserState = (props: any) => {

//     const initialState = {
//         users: {},
//         user: {},
//         userType: '',
//         loading: false,
//     }

//     const [state, dispatch] = useReducer(UserReducer, initialState);

//     /**
//      * @name setLoading
//      * @param data 
//      */
//     const setLoading = async (data: ISetLoading) => {

//         if (data.option === 'default') {
//             dispatch({
//                 type: SET_LOADING
//             })
//         }

//         if (data.option === 'resource' && data.type) {

//             const { loading, ...rest } = collection;

//             dispatch({
//                 type: data.type,
//                 payload: {
//                     ...rest,
//                     loading,
//                 }
//             })

//         }

//     }

//     /**
//      * @name unsetLoading
//      * @param data 
//      */
//     const unsetLoading = async (data: IUnsetLoading) => {

//         if (data.option === 'default') {
//             dispatch({
//                 type: UNSET_LOADING,
//                 payload: data.message
//             })
//         }

//         if (data.option === 'resource' && data.type) {

//             const { loading, message, ...rest } = collection;

//             dispatch({
//                 type: data.type,
//                 payload: {
//                     ...rest,
//                     loading: false,
//                     message: data.message
//                 }
//             })

//         }

//     }

//     const setUserType = (type: string) => {

//         dispatch({
//             type: SET_USERTYPE,
//             payload: type
//         })

//     }

//     const setSidebar = (data: ISidebarProps) => {
//         dispatch({
//             type: SET_SIDEBAR,
//             payload: data
//         })
//     }

//     const currentSidebar = (collapse:boolean): ISidebarProps | null => {

//         let result: ISidebarProps | null = null;
    
//         const name = storage.fetch('route.name');
//         const sub = storage.fetch('route.subroute');
    
//         const route = sidebarRoutes.find((x) => x.name === name);
    
//         if(route && route.subroutes && route.subroutes.length > 0){
    
//             const subroute = route.subroutes.find((m) => m.name === sub);
    
//             if(subroute){
//                 result = {
//                     collapsed: collapse,
//                     route: route,
//                     subroutes: route.subroutes,
//                     inroutes: route.inroutes ? route.inroutes : [],
//                     isOpen: true
//                 }
//             } else {
//                 result = {
//                     collapsed: collapse,
//                     route: route,
//                     subroutes: route.subroutes,
//                     inroutes: route.inroutes ? route.inroutes : [],
//                     isOpen: true
//                 }
//             }
    
//         } else if(route) {
//             result = {
//                 collapsed: collapse,
//                 route: route,
//                 subroutes: route.subroutes ? route.subroutes : [],
//                 inroutes: route.inroutes ? route.inroutes : [],
//                 isOpen: false
//             }
//         }
    
//         return result;
    
//     }


//     return <UserContext.Provider
//         value={{
//             users: state.users,
//             user: state.user,
//             userType: state.userType,
//             loading: state.loading,
//             toast: state.toast,
//             sidebar: state.sidebar,
//             setUserType,
//             setSidebar,
//             currentSidebar,

//             setLoading,
//             unsetLoading
//         }}
//     >
//         {props.children}

//     </UserContext.Provider>

// }

// export default UserState

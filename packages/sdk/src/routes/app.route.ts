import { IRoute } from "@/utils/interfaces";


const appRoutes: Array<IRoute> = [

    {
        name: 'home',
        url: '/',
        isAuth: false,
        redirect: '/login',
        params: [],
        content: {}
    },

    {
        name: 'preview',
        url: '/preview',
        isAuth: false,
        params: [],
        content: {}
    },
    
    {
        name: 'no-network',
        url: '/no-network',
        isAuth: false,
        params: [],
        content: {}
    },
    {
        name: 'not-found',
        url: '/not-found',
        isAuth: false,
        params: [],
        content: {}
    },


    {
        name: 'login',
        url: '/login',
        isAuth: false,
        params: [],
        content: {}
    },

    {
        name: 'register',
        url: '/register',
        isAuth: false,
        params: [],
        content: {}
    },

    {
        name: 'verify-otp',
        url: '/verify-otp',
        isAuth: false,
        params: [],
        content: {}
    },

    {
        name: 'activate-account',
        url: '/activate-account',
        isAuth: false,
        params: [],
        content: {}
    },
    {
        name: 'reset-password',
        url: '/reset-password',
        isAuth: false,
        params: [],
        content: {}
    },

]

export default appRoutes;
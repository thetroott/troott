import React, { useContext, useEffect, useState } from 'react'
import useContextType from './useContextType'
import useGoTo from './useGoTo'
import storage from '../utils/storage.util'
import routes from '../routes/sidebar.route'

interface IUseSidebar {
    type?: 'sidebar' | 'page',
    init?: boolean
}

const useSidebar = ({ type = 'sidebar', init = false }: IUseSidebar) => {

    const { userContext } = useContextType()
    const { getRoute } = useGoTo()

    const {
        sidebar,
        currentSidebar,
        setSidebar
    } = userContext;

    useEffect(() => {

        if (init) {
            initSidebar()
        }

    }, [init])

    const initSidebar = () => {

        if (type === 'page') {

            const result = currentSidebar(sidebar.collapsed);

            if (result) {
                setSidebar(result)
            }

        }

        if (type === 'sidebar') {
            const name = storage.fetch('route.name');

            if (name) {
                setSidebar({
                    collapsed: false,
                    route: getRoute(name),
                    subroutes: [],
                    inroutes: [],
                    isOpen: false
                })
            } else {
                setSidebar({
                    collapsed: false,
                    route: routes[0],
                    subroutes: [],
                    inroutes: [],
                    isOpen: false
                })
            }
        }


    }

    return {
        sidebar, currentSidebar, setSidebar, initSidebar
    }
}

export default useSidebar
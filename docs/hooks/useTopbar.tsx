import React, { useContext, useEffect, useState } from 'react'
import useContextType from './useContextType'
import useGoTo from './useGoTo'

const useTopbar = () => {

    const { userContext } = useContextType()
    const { getRoute } = useGoTo()

    const {
        topbar,
        setTopbar
    } = userContext;

    useEffect(() => {

    }, [])

    return {
        topbar, setTopbar
    }
}

export default useTopbar
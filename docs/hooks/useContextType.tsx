import React, { useContext, useEffect, useState } from 'react'
import { IAppContext, IUserContext } from '../utils/interfaces.util'
import UserContext from '../context/user/userContext'
import AppContext from '../context/app/appContext'

const useContextType = () => {

    const userContext = useContext<IUserContext>(UserContext)
    const appContext = useContext<IAppContext>(AppContext)

    useEffect(() => {

    }, [])

    return {
        userContext,
        appContext
    }
}

export default useContextType
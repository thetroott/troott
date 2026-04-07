import React, { useContext, useEffect, useState } from 'react'
import { IAppContext, IUserContext } from './helpers/interface'
import UserContext from './user/userContext'
import AppContext from './app/appContext'


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
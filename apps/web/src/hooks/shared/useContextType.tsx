import { useContext, useEffect } from 'react';

import type { IAppContext } from '@/context/app/types';
import type { IUserContextValue } from '@/context/user/types';
import UserContext from '../../context/user/userContext';
import AppContext from '../../context/app/appContext';

const useContextType = () => {
    const userContextValue = useContext(UserContext);
    const appContextValue = useContext(AppContext);

    if (appContextValue === null) {
        throw new Error('AppState provider is missing above this component.');
    }

    if (userContextValue === null) {
        throw new Error('UserState provider is missing above this component.');
    }

    const appContext: IAppContext = appContextValue;
    const userContext: IUserContextValue = userContextValue;

    useEffect(() => {}, []);

    return {
        userContext,
        appContext,
    };
};

export default useContextType;

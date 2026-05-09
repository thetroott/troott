import { useContext, useMemo } from 'react';
import type { IAppContext, IUserContext } from '../helpers/interface';
import AppContext from '../app/appContext';
import UserContext from '../user/userContext';

/** Narrow app context with a selector (memoized on context identity). */
export function useAppSelector<T>(selector: (ctx: IAppContext) => T): T {
    const ctx = useContext(AppContext) as IAppContext;
    return useMemo(() => selector(ctx), [ctx, selector]);
}

/** Narrow user context with a selector (memoized on context identity). */
export function useUserSelector<T>(selector: (ctx: IUserContext) => T): T {
    const ctx = useContext(UserContext) as IUserContext;
    return useMemo(() => selector(ctx), [ctx, selector]);
}

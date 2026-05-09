import {
    createContext,
    useContext,
    useReducer,
    type Dispatch,
    type ReactNode,
    type Reducer,
} from 'react';

type Action = { type: string; payload?: unknown };

/**
 * Standard split context for a domain: state + dispatch, with null guards.
 */
export function createDomainContext<S, A extends Action>(
    name: string,
    reducer: Reducer<S, A>,
    initialState: S,
) {
    const StateContext = createContext<S | null>(null);
    const DispatchContext = createContext<Dispatch<A> | null>(null);

    function useDomainState(): S {
        const s = useContext(StateContext);
        if (s == null) {
            throw new Error(
                `${name}: state used outside <TroottStateProvider> (or missing ${name} provider).`,
            );
        }
        return s;
    }

    function useDomainDispatch(): Dispatch<A> {
        const d = useContext(DispatchContext);
        if (d == null) {
            throw new Error(
                `${name}: dispatch used outside <TroottStateProvider> (or missing ${name} provider).`,
            );
        }
        return d;
    }

    function Provider({ children }: { children: ReactNode }) {
        const [state, dispatch] = useReducer(reducer, initialState);
        return (
            <DispatchContext.Provider value={dispatch as Dispatch<A>}>
                <StateContext.Provider value={state}>
                    {children}
                </StateContext.Provider>
            </DispatchContext.Provider>
        );
    }

    return {
        Provider,
        useState: useDomainState,
        useDispatch: useDomainDispatch,
        StateContext,
        DispatchContext,
    };
}

import { useSyncExternalStore } from 'react';

type SetState<T> = (
    partial: Partial<T> | ((state: T) => Partial<T>),
) => void;
type GetState<T> = () => T;
type Listener = () => void;
type StateCreator<T> = (set: SetState<T>, get: GetState<T>) => T;

type BoundStore<T> = {
    <U = T>(selector?: (state: T) => U): U;
    getState: GetState<T>;
    setState: SetState<T>;
    subscribe: (listener: Listener) => () => void;
};

function createStore<T>(creator: StateCreator<T>): BoundStore<T> {
    let state!: T;
    const listeners = new Set<Listener>();

    const getState: GetState<T> = () => state;
    const setState: SetState<T> = (partial) => {
        const next =
            typeof partial === 'function'
                ? partial(state)
                : partial;
        state = { ...state, ...next };
        listeners.forEach((listener) => listener());
    };
    const subscribe = (listener: Listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    };

    state = creator(setState, getState);

    const useStore = ((selector?: (s: T) => unknown) => {
        const pick = selector ?? ((s: T) => s);
        return useSyncExternalStore(
            subscribe,
            () => pick(getState()),
            () => pick(getState()),
        );
    }) as BoundStore<T>;

    useStore.getState = getState;
    useStore.setState = setState;
    useStore.subscribe = subscribe;
    return useStore;
}

export function create<T>(): (
    nextCreator: StateCreator<T>,
) => BoundStore<T>;
export function create<T>(creator: StateCreator<T>): BoundStore<T>;
export function create<T>(creator?: StateCreator<T>) {
    if (!creator) {
        return (nextCreator: StateCreator<T>) => createStore(nextCreator);
    }
    return createStore(creator);
}

type PersistOptions<T> = {
    name: string;
    partialize?: (state: T) => Partial<T>;
};

export function persist<T>(
    creator: StateCreator<T>,
    options: PersistOptions<T>,
): StateCreator<T> {
    return (set, get) => {
        const setAndPersist: SetState<T> = (partial) => {
            set(partial);
            const current = get();
            const payload = options.partialize
                ? options.partialize(current)
                : current;
            localStorage.setItem(
                options.name,
                JSON.stringify({ state: payload }),
            );
        };

        const created = creator(setAndPersist, get);

        try {
            const raw = localStorage.getItem(options.name);
            if (raw) {
                const parsed = JSON.parse(raw) as
                    | { state?: Partial<T> }
                    | Partial<T>;
                const restored =
                    parsed &&
                    typeof parsed === 'object' &&
                    'state' in parsed
                        ? parsed.state
                        : parsed;
                if (restored && typeof restored === 'object') {
                    return { ...created, ...restored };
                }
            }
        } catch {
            // ignore invalid persisted state
        }

        return created;
    };
}

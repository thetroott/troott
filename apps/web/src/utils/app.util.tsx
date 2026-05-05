import type { Theme } from './types.util';

export interface IAppUser {
    id: string;
    name: string;
    email: string;
}

export interface IAppState {
    theme: {
        mode: Theme;
    };
    user: IAppUser | null;
}

const initialState: IAppState = {
    theme: {
        mode: 'system',
    },
    user: null,
};

export default initialState;

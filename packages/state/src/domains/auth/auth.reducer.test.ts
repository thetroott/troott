import { describe, expect, it } from 'vitest';
import { authReducer } from './auth.reducer';
import { authInitial } from './auth.seed';
import { SET_USER_TYPE } from '../../helpers/types';

describe('authReducer', () => {
    it('handles SET_USER_TYPE', () => {
        const next = authReducer(authInitial, {
            type: SET_USER_TYPE,
            payload: 'listener',
        });
        expect(next.userType).toBe('listener');
    });

    it('handles SET_USER with id and userType', () => {
        const next = authReducer(authInitial, {
            type: 'SET_USER',
            payload: { id: 'u1', userType: 'minister' },
        });
        expect(next.userId).toBe('u1');
        expect(next.userType).toBe('minister');
        expect(next.isLoggedIn).toBe(true);
    });
});

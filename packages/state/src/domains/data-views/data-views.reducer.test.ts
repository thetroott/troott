import { describe, expect, it } from 'vitest';
import { collection } from '../../helpers/seed';
import { GET_SERMONS, GET_USERS } from '../../helpers/types';
import { dataViewsReducer } from './data-views.reducer';
import { dataViewsInitial } from './data-views.seed';

describe('dataViewsReducer', () => {
    it('routes GET_USERS and GET_SERMONS', () => {
        const usersNext = dataViewsReducer(dataViewsInitial, {
            type: GET_USERS,
            payload: { ...collection, count: 2 },
        });
        expect(usersNext.users.count).toBe(2);

        const sermonsNext = dataViewsReducer(usersNext, {
            type: GET_SERMONS,
            payload: { ...collection, count: 5 },
        });
        expect(sermonsNext.sermons.count).toBe(5);
    });
});

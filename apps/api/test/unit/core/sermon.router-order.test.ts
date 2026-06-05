import { describe, it, expect } from '@jest/globals';
import sermonRouter from '../../../src/routes/sermon.router';

/**
 * Ensures multi-segment GET routes are registered before `/:id` so Express
 * does not treat literal segments (e.g. `stats`, `user`) as sermon ids.
 */
describe('sermon.router route order', () => {
    it('registers /, /stats/*, /user/*, /topic/*, /minister/* before /:id', () => {
        const paths = sermonRouter.stack
            .map((layer: { route?: { path?: string } }) => layer.route?.path)
            .filter((p): p is string => typeof p === 'string');

        const idxList = paths.indexOf('/');
        const idxId = paths.indexOf('/:id');
        const idxTopic = paths.indexOf('/topic/:topic');
        const idxStatsPlayed = paths.indexOf('/stats/most-played');
        const idxUserPlayed = paths.indexOf('/user/recently-played');

        expect(idxId).toBeGreaterThan(-1);
        expect(idxList).toBeGreaterThan(-1);
        expect(idxList).toBeLessThan(idxId);
        expect(idxTopic).toBeGreaterThan(-1);
        expect(idxTopic).toBeLessThan(idxId);
        expect(idxStatsPlayed).toBeLessThan(idxId);
        expect(idxUserPlayed).toBeLessThan(idxId);
    });
});

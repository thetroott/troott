import { describe, expect, it } from 'vitest';
import { studioPortalPath } from './studio-portal.util';

describe('studioPortalPath', () => {
    it('returns studio home (Dashboard), not sermons list', () => {
        expect(studioPortalPath('Q2fy6og5duah')).toBe(
            '/studio/q2fy6og5duah',
        );
    });
});

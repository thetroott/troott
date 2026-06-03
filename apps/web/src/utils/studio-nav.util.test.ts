import { describe, expect, it } from 'vitest';
import {
    isStudioHomePath,
    resolveStudioNavUrl,
} from './studio-nav.util';

describe('resolveStudioNavUrl', () => {
    it('maps Dashboard to studio home', () => {
        expect(resolveStudioNavUrl('/dashboard', 'q2fy6og5duah')).toBe(
            '/studio/q2fy6og5duah',
        );
    });

    it('maps Sermons to sermons list', () => {
        expect(resolveStudioNavUrl('/sermons', 'q2fy6og5duah')).toBe(
            '/studio/q2fy6og5duah/sermons',
        );
    });
});

describe('isStudioHomePath', () => {
    it('matches studio home only', () => {
        expect(isStudioHomePath('/studio/q2fy6og5duah')).toBe(true);
        expect(isStudioHomePath('/studio/q2fy6og5duah/')).toBe(true);
        expect(isStudioHomePath('/studio/q2fy6og5duah/sermons')).toBe(false);
    });
});

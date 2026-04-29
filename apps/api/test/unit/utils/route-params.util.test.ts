import { describe, it, expect } from '@jest/globals';
import { pathParam } from '@/utils/route-params.util';

describe('pathParam', () => {
    it('returns undefined for undefined', () => {
        expect(pathParam(undefined)).toBeUndefined();
    });

    it('returns the string as-is', () => {
        expect(pathParam('abc123')).toBe('abc123');
    });

    it('returns first element when value is string[]', () => {
        expect(pathParam(['first', 'second'])).toBe('first');
    });

    it('returns empty string when array first element is empty', () => {
        expect(pathParam([''])).toBe('');
    });
});

import { describe, it, expect } from '@jest/globals';
import { Types } from 'mongoose';
import type { IUserPreferencesDoc } from '@/modules/core/preference/preference.interface';
import {
    applyPreferenceStateToDoc,
    docToPreferenceState,
    isMongoDuplicateKeyError,
    legacyMinisterToObjectIds,
    preferencePatchHasKeys,
} from '@/modules/core/preference/preference.util';
import type { PreferenceSectionState } from '@/modules/core/preference/preference.merge';

function mockDoc(
    overrides: Partial<
        Pick<
            IUserPreferencesDoc,
            'taste' | 'notifications' | 'playback' | 'downloads' | 'privacy'
        >
    > & {
        user?: Types.ObjectId;
    } = {},
): IUserPreferencesDoc {
    const user = overrides.user ?? new Types.ObjectId();
    const base = {
        user,
        schemaVersion: 1,
        taste: {
            favoriteTopics: ['a'],
            favoriteMinisters: [new Types.ObjectId()],
        },
        notifications: { email: true, push: false, sms: true },
        playback: { q: 1 } as Record<string, unknown>,
        downloads: {},
        privacy: {},
        ...overrides,
    };
    return base as unknown as IUserPreferencesDoc;
}

describe('preference.util', () => {
    describe('legacyMinisterToObjectIds', () => {
        it('returns empty array for non-array input', () => {
            expect(legacyMinisterToObjectIds(null)).toEqual([]);
            expect(legacyMinisterToObjectIds(undefined)).toEqual([]);
            expect(legacyMinisterToObjectIds('x')).toEqual([]);
        });

        it('keeps ObjectId instances', () => {
            const id = new Types.ObjectId();
            expect(legacyMinisterToObjectIds([id])).toEqual([id]);
        });

        it('parses valid hex strings', () => {
            const hex = '507f191e810c19729de860ea';
            const out = legacyMinisterToObjectIds([hex]);
            expect(out).toHaveLength(1);
            expect(out[0]!.toString()).toBe(hex);
        });

        it('skips invalid strings', () => {
            expect(legacyMinisterToObjectIds(['not-an-objectid'])).toEqual([]);
        });
    });

    describe('preferencePatchHasKeys', () => {
        it('returns false for empty patch', () => {
            expect(preferencePatchHasKeys({})).toBe(false);
        });

        it('detects taste partials', () => {
            expect(
                preferencePatchHasKeys({
                    taste: { favoriteTopics: ['x'] },
                }),
            ).toBe(true);
            expect(
                preferencePatchHasKeys({
                    taste: { favoriteMinisters: [] },
                }),
            ).toBe(true);
        });

        it('detects legacy keys', () => {
            expect(preferencePatchHasKeys({ topics: [] })).toBe(true);
            expect(preferencePatchHasKeys({ minister: [] })).toBe(true);
        });

        it('detects non-empty playback object', () => {
            expect(preferencePatchHasKeys({ playback: { a: 1 } })).toBe(true);
        });

        it('ignores empty playback object', () => {
            expect(preferencePatchHasKeys({ playback: {} })).toBe(false);
        });

        it('treats notifications key as present even if empty object', () => {
            expect(preferencePatchHasKeys({ notifications: {} })).toBe(true);
        });
    });

    describe('isMongoDuplicateKeyError', () => {
        it('returns true for code 11000', () => {
            expect(isMongoDuplicateKeyError({ code: 11000 })).toBe(true);
        });

        it('returns false otherwise', () => {
            expect(isMongoDuplicateKeyError(null)).toBe(false);
            expect(isMongoDuplicateKeyError({ code: 1 })).toBe(false);
            expect(isMongoDuplicateKeyError('err')).toBe(false);
        });
    });

    describe('docToPreferenceState / applyPreferenceStateToDoc', () => {
        it('round-trips clone semantics for taste arrays', () => {
            const oid = new Types.ObjectId();
            const doc = mockDoc({
                taste: {
                    favoriteTopics: ['t1'],
                    favoriteMinisters: [oid],
                },
            });
            const state = docToPreferenceState(doc);
            expect(state.taste.favoriteTopics).toEqual(['t1']);
            expect(state.taste.favoriteMinisters[0]).toEqual(oid);
            state.taste.favoriteTopics.push('mutated');
            expect(doc.taste.favoriteTopics).toEqual(['t1']);

            const next: PreferenceSectionState = {
                ...state,
                taste: {
                    favoriteTopics: ['new'],
                    favoriteMinisters: [],
                },
            };
            applyPreferenceStateToDoc(doc, next);
            expect(doc.taste.favoriteTopics).toEqual(['new']);
            expect(doc.taste.favoriteMinisters).toEqual([]);
        });
    });
});

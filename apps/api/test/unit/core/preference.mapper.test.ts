import { describe, it, expect } from '@jest/globals';
import { Types } from 'mongoose';
import type { IUserPreferencesDoc } from '@/modules/core/preference/preference.interface';
import preferenceMapper from '@/modules/core/preference/preference.mapper';

function mockDoc(overrides: Partial<IUserPreferencesDoc> = {}): IUserPreferencesDoc {
    const user = new Types.ObjectId();
    const minister = new Types.ObjectId();
    const doc = {
        user,
        schemaVersion: 1,
        taste: {
            favoriteTopics: ['faith'],
            favoriteMinisters: [minister],
        },
        notifications: { email: true, push: true, sms: false },
        playback: { quality: 'high' },
        downloads: {},
        privacy: {},
        ...overrides,
    };
    return doc as unknown as IUserPreferencesDoc;
}

describe('PreferenceMapper', () => {
    describe('toResponse', () => {
        it('maps document fields and tasteComplete when taste is non-empty', () => {
            const doc = mockDoc();
            const out = preferenceMapper.toResponse(doc);
            expect(out.userId).toBe(doc.user.toString());
            expect(out.schemaVersion).toBe(1);
            expect(out.taste.favoriteTopics).toEqual(['faith']);
            expect(out.taste.favoriteMinisters).toHaveLength(1);
            expect(out.taste.favoriteMinisters[0]).toBe(
                doc.taste.favoriteMinisters[0]!.toString(),
            );
            expect(out.notifications).toEqual({
                email: true,
                push: true,
                sms: false,
            });
            expect(out.playback).toEqual({ quality: 'high' });
            expect(out.tasteComplete).toBe(true);
            expect(out.listenerTasteOnboardingComplete).toBe(true);
        });

        it('sets tasteComplete false when taste sections are empty', () => {
            const doc = mockDoc({
                taste: { favoriteTopics: [], favoriteMinisters: [] },
            });
            const out = preferenceMapper.toResponse(doc);
            expect(out.tasteComplete).toBe(false);
            expect(out.listenerTasteOnboardingComplete).toBe(false);
        });

        it('sets listenerTasteOnboardingComplete false when only topics are set', () => {
            const doc = mockDoc({
                taste: { favoriteTopics: ['hope'], favoriteMinisters: [] },
            });
            const out = preferenceMapper.toResponse(doc);
            expect(out.tasteComplete).toBe(true);
            expect(out.listenerTasteOnboardingComplete).toBe(false);
        });

        it('sets listenerTasteOnboardingComplete false when only ministers are set', () => {
            const m = new Types.ObjectId();
            const doc = mockDoc({
                taste: { favoriteTopics: [], favoriteMinisters: [m] },
            });
            const out = preferenceMapper.toResponse(doc);
            expect(out.tasteComplete).toBe(true);
            expect(out.listenerTasteOnboardingComplete).toBe(false);
        });
    });
});

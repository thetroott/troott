import { describe, it, expect } from '@jest/globals';
import { Types } from 'mongoose';
import { mergePreferencePatch } from '@/modules/core/preference/preference.merge';

describe('Preference merge (mergePreferencePatch)', () => {
    const oid = (s: string) => new Types.ObjectId(s.padEnd(24, '0').slice(0, 24));

    const base = {
        taste: {
            favoriteTopics: ['faith'],
            favoriteMinisters: [oid('507f1f77bcf86cd799439011')],
        },
        notifications: { email: true, push: false, sms: true },
        playback: { quality: 'high' } as Record<string, unknown>,
        downloads: {} as Record<string, unknown>,
        privacy: {} as Record<string, unknown>,
    };

    it('merges only notifications and leaves taste unchanged', () => {
        const next = mergePreferencePatch(base, {
            notifications: { push: true },
        });
        expect(next.taste.favoriteTopics).toEqual(['faith']);
        expect(next.taste.favoriteMinisters).toHaveLength(1);
        expect(next.notifications).toEqual({
            email: true,
            push: true,
            sms: true,
        });
        expect(next.playback).toEqual({ quality: 'high' });
    });

    it('accepts legacy topics/minister keys', () => {
        const next = mergePreferencePatch(base, {
            topics: ['grace'],
            minister: ['507f191e810c19729de860ea'],
        });
        expect(next.taste.favoriteTopics).toEqual(['grace']);
        expect(next.taste.favoriteMinisters.at(0)?.toString()).toBe(
            '507f191e810c19729de860ea',
        );
    });
});

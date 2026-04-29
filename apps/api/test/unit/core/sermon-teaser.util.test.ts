import { describe, it, expect } from '@jest/globals';
import {
    buildSermonTeaserPayload,
    isSermonPublicTeaserEligible,
} from '@/modules/core/open/sermon-teaser.util';
import { ContentState, ContentStatus } from '@/utils/content.enums';

describe('sermon-teaser.util', () => {
    it('rejects non-public', () => {
        expect(
            isSermonPublicTeaserEligible({
                isPublic: false,
                status: ContentStatus.PUBLISHED,
                state: ContentState.ACTIVE,
            }),
        ).toBe(false);
    });

    it('rejects non-published status', () => {
        expect(
            isSermonPublicTeaserEligible({
                isPublic: true,
                status: ContentStatus.DRAFT,
                state: ContentState.ACTIVE,
            }),
        ).toBe(false);
    });

    it('rejects deleted state', () => {
        expect(
            isSermonPublicTeaserEligible({
                isPublic: true,
                status: ContentStatus.PUBLISHED,
                state: ContentState.DELETED,
            }),
        ).toBe(false);
    });

    it('accepts public published active', () => {
        expect(
            isSermonPublicTeaserEligible({
                isPublic: true,
                status: ContentStatus.PUBLISHED,
                state: ContentState.ACTIVE,
            }),
        ).toBe(true);
    });

    it('builds teaser payload with minister summary', () => {
        const payload = buildSermonTeaserPayload({
            _id: '507f1f77bcf86cd799439011',
            title: 'T',
            description: 'D',
            imageUrl: 'https://x/i.jpg',
            duration: 120,
            topic: 'faith',
            shareableUrl: 'https://app/sermon/507f1f77bcf86cd799439011',
            minister: {
                _id: '507f191e810c19729de860ea',
                firstName: 'A',
                lastName: 'B',
            },
        });
        expect(payload.id).toBe('507f1f77bcf86cd799439011');
        expect(payload.title).toBe('T');
        expect(payload.minister?.name).toBe('A B');
        expect(payload.minister?.id).toBe('507f191e810c19729de860ea');
    });
});

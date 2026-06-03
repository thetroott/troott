import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Types } from 'mongoose';
import { MediaStatus } from '../../../src/interfaces/core/sermon.interface';
import { ContentState } from '../../../src/types/common.enum';

const ministerFindOne = jest.fn();
const creatorFindOne = jest.fn();

function chainLean(value: unknown) {
    return {
        select: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(value),
        }),
    };
}

jest.mock('../../../src/models/core/minister.model', () => ({
    __esModule: true,
    default: {
        findOne: (...args: unknown[]) => ministerFindOne(...args),
    },
}));

jest.mock('../../../src/models/core/creator.model', () => ({
    __esModule: true,
    default: {
        findOne: (...args: unknown[]) => creatorFindOne(...args),
    },
}));

jest.mock('../../../src/configs/aws.config', () => ({
    AWS_BUCKETS_ORIGINALS: 'troott-originals',
    AWS_BUCKETS_PLAYBACK: 'troott-playback',
    AWS_BUCKETS_STORAGE: 'troott-storage',
    s3: {},
}));

jest.mock('@aws-sdk/lib-storage', () => ({
    Upload: jest.fn(),
}));

jest.mock('../../../src/tasks/jobs/job', () => ({ addJob: jest.fn() }));
jest.mock('../../../src/queues/queue', () => ({ default: {} }));
jest.mock('../../../src/utils/logger.util', () => ({
    default: { log: jest.fn() },
}));

import sermonService from '../../../src/services/core/sermon.service';

describe('sermon.service access (feat-0011)', () => {
    const userId = new Types.ObjectId().toString();
    const otherUserId = new Types.ObjectId().toString();
    const ministerProfileId = new Types.ObjectId().toString();

    beforeEach(() => {
        jest.clearAllMocks();
        ministerFindOne.mockReturnValue(chainLean(null));
        creatorFindOne.mockReturnValue(chainLean(null));
    });

    it('allows uploader on draft row with empty minister[]', async () => {
        const doc = {
            status: MediaStatus.DRAFT,
            minister: [],
            item: { uploadedBy: userId, uploadStatus: 'extracting' },
        };

        const allowed = await sermonService.canUserViewSermonDetail(
            userId,
            doc,
        );

        expect(allowed).toBe(true);
        expect(ministerFindOne).not.toHaveBeenCalled();
    });

    it('allows minister owner via minister[] profile id', async () => {
        ministerFindOne.mockReturnValue(chainLean({ _id: ministerProfileId }));

        const doc = {
            status: MediaStatus.DRAFT,
            minister: [ministerProfileId],
            item: { uploadedBy: otherUserId },
        };

        const allowed = await sermonService.canUserViewSermonDetail(
            userId,
            doc,
        );

        expect(allowed).toBe(true);
    });

    it('denies unrelated user on private draft', async () => {
        const doc = {
            status: MediaStatus.DRAFT,
            minister: [ministerProfileId],
            item: { uploadedBy: otherUserId },
        };

        const allowed = await sermonService.canUserViewSermonDetail(
            userId,
            doc,
        );

        expect(allowed).toBe(false);
    });

    it('allows any authenticated user on published catalog sermon', async () => {
        const doc = {
            status: MediaStatus.PUBLISHED,
            isPublic: true,
            state: ContentState.ACTIVE,
            minister: [ministerProfileId],
            item: { uploadedBy: otherUserId },
        };

        const allowed = await sermonService.canUserViewSermonDetail(
            userId,
            doc,
        );

        expect(allowed).toBe(true);
        expect(ministerFindOne).not.toHaveBeenCalled();
    });

    it('isSermonOwnedByUser allows cancel for uploader without minister linkage', async () => {
        const doc = {
            minister: [],
            item: { uploadedBy: userId },
        };

        const owned = await sermonService.isSermonOwnedByUser(userId, doc);

        expect(owned).toBe(true);
    });

    it('normalizes populated minister array entries', async () => {
        ministerFindOne.mockReturnValue(chainLean({ _id: ministerProfileId }));

        const doc = {
            status: MediaStatus.DRAFT,
            minister: [{ _id: ministerProfileId }],
            item: {},
        };

        const allowed = await sermonService.canUserViewSermonDetail(
            userId,
            doc,
        );

        expect(allowed).toBe(true);
    });
});

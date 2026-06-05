import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Types } from 'mongoose';

jest.mock('@/repository/core/recommendation.repository', () => ({
    __esModule: true,
    default: {
        bulkUpsert: jest.fn(),
        findByListenerOrGlobal: jest.fn(),
        recordFeedback: jest.fn(),
    },
}));

jest.mock('@/repository/core/sermon.repository', () => ({
    __esModule: true,
    default: {
        findAllSorted: jest.fn(),
        findByTopic: jest.fn(),
        findByMinisterSorted: jest.fn(),
    },
}));

import recommendationRepository from '@/repository/core/recommendation.repository';
import sermonRepository from '@/repository/core/sermon.repository';

const mockBulkUpsert = jest.mocked(recommendationRepository.bulkUpsert);
const mockFindByListenerOrGlobal = jest.mocked(
    recommendationRepository.findByListenerOrGlobal,
);
const mockFindAllSorted = jest.mocked(sermonRepository.findAllSorted);
const mockFindByTopic = jest.mocked(sermonRepository.findByTopic);
const mockFindByMinisterSorted = jest.mocked(
    sermonRepository.findByMinisterSorted,
);

describe('RecommendationService', () => {
    let recommendationService: {
        seedColdStart: (
            listenerId: string,
            country?: string,
        ) => Promise<{ error: boolean; data?: unknown }>;
        seedFromTopics: (
            listenerId: string,
            topicIds: string[],
        ) => Promise<{ error: boolean }>;
        seedFromMinisters: (
            listenerId: string,
            ministerIds: string[],
        ) => Promise<{ error: boolean }>;
        getForListener: (
            listenerId: string,
            section?: string,
            limit?: number,
        ) => Promise<unknown>;
    };
    const listenerId = new Types.ObjectId().toString();

    const mockSermons = (count: number) =>
        Array.from({ length: count }, (_, i) => ({
            _id: new Types.ObjectId(),
            title: `Sermon ${i}`,
            language: 'en',
            topics: [new Types.ObjectId()],
        }));

    beforeEach(async () => {
        jest.clearAllMocks();

        mockBulkUpsert.mockResolvedValue({
            error: false,
            data: { upserted: 5, modified: 0 },
        } as never);

        mockFindAllSorted.mockResolvedValue({
            error: false,
            data: mockSermons(5),
        } as never);

        mockFindByTopic.mockResolvedValue({
            error: false,
            data: mockSermons(3),
        } as never);

        mockFindByMinisterSorted.mockResolvedValue({
            error: false,
            data: mockSermons(3),
        } as never);

        const mod = await import('@/services/core/recommendation.service');
        recommendationService = mod.default;
    });

    describe('seedColdStart', () => {
        it('should create trending + new sermon recommendations', async () => {
            const result =
                await recommendationService.seedColdStart(listenerId, 'NG');

            expect(result.error).toBe(false);
            expect(mockFindAllSorted).toHaveBeenCalledWith('playCount', {
                limit: 10,
            });
            expect(mockFindAllSorted).toHaveBeenCalledWith('releaseDate', {
                limit: 10,
            });
            expect(mockBulkUpsert).toHaveBeenCalledTimes(1);

            const batch = mockBulkUpsert.mock.calls[0][0] as Array<{
                section: string;
            }>;
            expect(batch.length).toBe(10);

            const trendingBatch = batch.filter(
                (r) => r.section === 'trending_now',
            );
            const newBatch = batch.filter((r) => r.section === 'new_sermons');
            expect(trendingBatch.length).toBe(5);
            expect(newBatch.length).toBe(5);
        });

        it('should handle empty sermon data gracefully', async () => {
            mockFindAllSorted.mockResolvedValue({
                error: false,
                data: [],
            } as never);

            const result =
                await recommendationService.seedColdStart(listenerId);

            expect(result.error).toBe(false);
            expect(mockBulkUpsert).not.toHaveBeenCalled();
        });
    });

    describe('seedFromTopics', () => {
        it('should create BASED_ON_TOPICS recommendations', async () => {
            const topicIds = [
                new Types.ObjectId().toString(),
                new Types.ObjectId().toString(),
            ];

            const result = await recommendationService.seedFromTopics(
                listenerId,
                topicIds,
            );

            expect(result.error).toBe(false);
            expect(mockFindByTopic).toHaveBeenCalledTimes(2);
            expect(mockBulkUpsert).toHaveBeenCalledTimes(1);

            const batch = mockBulkUpsert.mock.calls[0][0] as Array<{
                section: string;
                reason: string;
            }>;
            expect(batch.length).toBe(6);
            batch.forEach((r) => {
                expect(r.section).toBe('based_on_topics');
                expect(r.reason).toBe('similar_topic');
            });
        });
    });

    describe('seedFromMinisters', () => {
        it('should create FROM_YOUR_MINISTERS recommendations', async () => {
            const ministerIds = [new Types.ObjectId().toString()];

            const result = await recommendationService.seedFromMinisters(
                listenerId,
                ministerIds,
            );

            expect(result.error).toBe(false);
            expect(mockFindByMinisterSorted).toHaveBeenCalledTimes(1);
            expect(mockBulkUpsert).toHaveBeenCalledTimes(1);

            const batch = mockBulkUpsert.mock.calls[0][0] as Array<{
                section: string;
                reason: string;
            }>;
            expect(batch.length).toBe(3);
            batch.forEach((r) => {
                expect(r.section).toBe('from_your_ministers');
                expect(r.reason).toBe('similar_minister');
            });
        });
    });

    describe('getForListener', () => {
        it('should delegate to repository', async () => {
            mockFindByListenerOrGlobal.mockResolvedValue({
                error: false,
                data: [],
            } as never);

            await recommendationService.getForListener(listenerId);
            expect(mockFindByListenerOrGlobal).toHaveBeenCalledWith(
                listenerId,
                undefined,
                undefined,
            );
        });
    });
});

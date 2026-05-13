import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Types } from 'mongoose';

const mockBulkUpsert = jest.fn<() => Promise<any>>();
const mockFindByListenerOrGlobal = jest.fn<() => Promise<any>>();
const mockRecordFeedback = jest.fn<() => Promise<any>>();

jest.mock('../../../src/repository/core/recommendation.repository', () => ({
    default: {
        bulkUpsert: mockBulkUpsert,
        findByListenerOrGlobal: mockFindByListenerOrGlobal,
        recordFeedback: mockRecordFeedback,
    },
}));

const mockFindAllSorted = jest.fn<() => Promise<any>>();
const mockFindByTopic = jest.fn<() => Promise<any>>();
const mockFindByMinisterSorted = jest.fn<() => Promise<any>>();

jest.mock('../../../src/repository/core/sermon.repository', () => ({
    default: {
        findAllSorted: mockFindAllSorted,
        findByTopic: mockFindByTopic,
        findByMinisterSorted: mockFindByMinisterSorted,
    },
}));

describe('RecommendationService', () => {
    let recommendationService: any;
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
        });

        mockFindAllSorted.mockResolvedValue({
            error: false,
            data: mockSermons(5),
        });

        mockFindByTopic.mockResolvedValue({
            error: false,
            data: mockSermons(3),
        });

        mockFindByMinisterSorted.mockResolvedValue({
            error: false,
            data: mockSermons(3),
        });

        const mod = await import(
            '../../../src/services/core/recommendation.service'
        );
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

            const batch = mockBulkUpsert.mock.calls[0][0] as any[];
            expect(batch.length).toBe(10);

            const trendingBatch = batch.filter(
                (r) => r.section === 'trending_now',
            );
            const newBatch = batch.filter(
                (r) => r.section === 'new_sermons',
            );
            expect(trendingBatch.length).toBe(5);
            expect(newBatch.length).toBe(5);
        });

        it('should handle empty sermon data gracefully', async () => {
            mockFindAllSorted.mockResolvedValue({
                error: false,
                data: [],
            });

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

            const batch = mockBulkUpsert.mock.calls[0][0] as any[];
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

            const batch = mockBulkUpsert.mock.calls[0][0] as any[];
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
            });

            await recommendationService.getForListener(listenerId);
            expect(mockFindByListenerOrGlobal).toHaveBeenCalledWith(
                listenerId,
                undefined,
                undefined,
            );
        });
    });
});

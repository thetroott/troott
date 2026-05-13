import { IResult } from '@/interfaces/common.interface';
import type { IRecommendationDoc } from '@/interfaces/core/recommendation.interface';
import {
    RecommendationTargetType,
    RecommendationReason,
    RecommendationReasonType,
    RecommendationCandidateSource,
    RecommendationAlgorithm,
    RecommendationSection,
    TimeOfDay,
} from '@/interfaces/core/recommendation.interface';
import type { ISermonDoc } from '@/interfaces/core/sermon.interface';
import recommendationRepository from '@/repository/core/recommendation.repository';
import sermonRepository from '@/repository/core/sermon.repository';

function currentTimeOfDay(): TimeOfDay {
    const hour = new Date().getHours();
    if (hour < 12) return TimeOfDay.MORNING;
    if (hour < 17) return TimeOfDay.AFTERNOON;
    if (hour < 21) return TimeOfDay.EVENING;
    return TimeOfDay.NIGHT;
}

function expiresInDays(days: number): Date {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
}

class RecommendationService {
    /**
     * Seed cold-start recommendations for a new listener.
     * Pulls trending + new sermons so the home feed is not empty
     * before onboarding personalises it.
     */
    public async seedColdStart(
        listenerId: string,
        country?: string,
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        try {
            const batch: Array<Partial<IRecommendationDoc>> = [];
            const now = new Date();
            const timeOfDay = currentTimeOfDay();
            const expires = expiresInDays(7);

            const trendingResult = await sermonRepository.findAllSorted(
                'playCount',
                { limit: 10 },
            );
            const trending: ISermonDoc[] = !trendingResult.error
                ? (trendingResult.data as ISermonDoc[]) || []
                : [];

            trending.forEach((sermon, idx) => {
                batch.push({
                    listener: listenerId as any,
                    targetType: RecommendationTargetType.SERMON,
                    targetId: String(sermon._id),
                    reason: RecommendationReason.TRENDING,
                    reasonType: RecommendationReasonType.TRENDING,
                    reasonMetadata: { label: 'Trending Now' },
                    candidateSource: RecommendationCandidateSource.POPULARITY_RANK,
                    score: 1.0 - idx * 0.05,
                    confidence: 0.6,
                    rank: idx,
                    position: idx,
                    freshnessScore: 1.0,
                    decayRate: 0.1,
                    section: RecommendationSection.TRENDING_NOW,
                    algorithm: RecommendationAlgorithm.POPULARITY,
                    modelVersion: '1.0.0',
                    context: {
                        timeOfDay,
                        deviceType: 'unknown' as any,
                        networkType: 'unknown' as any,
                    },
                    generatedAt: now,
                    expiresAt: expires,
                    isActive: true,
                    version: 1,
                    listenerCountry: country || '',
                    contentLanguage: (sermon as any).language || '',
                    contentTopics: ((sermon as any).topics || []).map(String),
                });
            });

            const newResult = await sermonRepository.findAllSorted(
                'releaseDate',
                { limit: 10 },
            );
            const newSermons: ISermonDoc[] = !newResult.error
                ? (newResult.data as ISermonDoc[]) || []
                : [];

            newSermons.forEach((sermon, idx) => {
                batch.push({
                    listener: listenerId as any,
                    targetType: RecommendationTargetType.SERMON,
                    targetId: String(sermon._id),
                    reason: RecommendationReason.NEW_RELEASE,
                    reasonType: RecommendationReasonType.NEW_RELEASE,
                    reasonMetadata: { label: 'New Sermons' },
                    candidateSource: RecommendationCandidateSource.POPULARITY_RANK,
                    score: 0.9 - idx * 0.05,
                    confidence: 0.5,
                    rank: idx,
                    position: idx,
                    freshnessScore: 1.0,
                    decayRate: 0.08,
                    section: RecommendationSection.NEW_SERMONS,
                    algorithm: RecommendationAlgorithm.POPULARITY,
                    modelVersion: '1.0.0',
                    context: {
                        timeOfDay,
                        deviceType: 'unknown' as any,
                        networkType: 'unknown' as any,
                    },
                    generatedAt: now,
                    expiresAt: expires,
                    isActive: true,
                    version: 1,
                    listenerCountry: country || '',
                    contentLanguage: (sermon as any).language || '',
                    contentTopics: ((sermon as any).topics || []).map(String),
                });
            });

            if (batch.length > 0) {
                const upsertResult =
                    await recommendationRepository.bulkUpsert(batch);
                result.data = upsertResult.data;
            }

            result.message = `Seeded ${batch.length} cold-start recommendations`;
        } catch (err: any) {
            result.error = true;
            result.code = 500;
            result.message =
                err.message || 'Failed to seed cold-start recommendations';
        }

        return result;
    }

    /**
     * Generate BASED_ON_TOPICS recommendations after the listener
     * completes onboarding step 1 (topic selection).
     */
    public async seedFromTopics(
        listenerId: string,
        topicIds: string[],
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        try {
            const batch: Array<Partial<IRecommendationDoc>> = [];
            const now = new Date();
            const timeOfDay = currentTimeOfDay();
            const expires = expiresInDays(7);

            for (const topicId of topicIds) {
                const topicSermons = await sermonRepository.findByTopic(
                    topicId,
                    { limit: 5 },
                );
                const sermons: ISermonDoc[] = !topicSermons.error
                    ? (topicSermons.data as ISermonDoc[]) || []
                    : [];

                sermons.forEach((sermon, idx) => {
                    batch.push({
                        listener: listenerId as any,
                        targetType: RecommendationTargetType.SERMON,
                        targetId: String(sermon._id),
                        reason: RecommendationReason.SIMILAR_TOPIC,
                        reasonType: RecommendationReasonType.BASED_ON_TOPIC,
                        reasonMetadata: { topicId, label: 'Based on Your Topics' },
                        candidateSource:
                            RecommendationCandidateSource.ONBOARDING_SELECTION,
                        basedOnTopics: [topicId as any],
                        score: 0.85 - idx * 0.05,
                        confidence: 0.7,
                        rank: idx,
                        position: idx,
                        freshnessScore: 1.0,
                        decayRate: 0.05,
                        section: RecommendationSection.BASED_ON_TOPICS,
                        algorithm: RecommendationAlgorithm.CONTENT_BASED,
                        modelVersion: '1.0.0',
                        context: {
                            timeOfDay,
                            deviceType: 'unknown' as any,
                            networkType: 'unknown' as any,
                        },
                        generatedAt: now,
                        expiresAt: expires,
                        isActive: true,
                        version: 1,
                        contentTopics: [topicId],
                    });
                });
            }

            if (batch.length > 0) {
                await recommendationRepository.bulkUpsert(batch);
            }

            result.data = { seeded: batch.length };
            result.message = `Seeded ${batch.length} topic-based recommendations`;
        } catch (err: any) {
            result.error = true;
            result.code = 500;
            result.message =
                err.message || 'Failed to seed topic recommendations';
        }

        return result;
    }

    /**
     * Generate FROM_YOUR_MINISTERS recommendations after the listener
     * completes onboarding step 2 (minister selection).
     */
    public async seedFromMinisters(
        listenerId: string,
        ministerIds: string[],
    ): Promise<IResult> {
        const result: IResult = {
            error: false,
            message: '',
            code: 200,
            data: {},
        };

        try {
            const batch: Array<Partial<IRecommendationDoc>> = [];
            const now = new Date();
            const timeOfDay = currentTimeOfDay();
            const expires = expiresInDays(7);

            for (const ministerId of ministerIds) {
                const ministerSermons =
                    await sermonRepository.findByMinisterSorted(
                        ministerId,
                        'playCount',
                        { limit: 5 },
                    );
                const sermons: ISermonDoc[] = !ministerSermons.error
                    ? (ministerSermons.data as ISermonDoc[]) || []
                    : [];

                sermons.forEach((sermon, idx) => {
                    batch.push({
                        listener: listenerId as any,
                        targetType: RecommendationTargetType.SERMON,
                        targetId: String(sermon._id),
                        reason: RecommendationReason.SIMILAR_MINISTER,
                        reasonType: RecommendationReasonType.BASED_ON_MINISTER,
                        reasonMetadata: { ministerId, label: 'From Your Ministers' },
                        candidateSource:
                            RecommendationCandidateSource.ONBOARDING_SELECTION,
                        basedOnMinisters: [ministerId as any],
                        score: 0.85 - idx * 0.05,
                        confidence: 0.7,
                        rank: idx,
                        position: idx,
                        freshnessScore: 1.0,
                        decayRate: 0.05,
                        section: RecommendationSection.FROM_YOUR_MINISTERS,
                        algorithm: RecommendationAlgorithm.CONTENT_BASED,
                        modelVersion: '1.0.0',
                        context: {
                            timeOfDay,
                            deviceType: 'unknown' as any,
                            networkType: 'unknown' as any,
                        },
                        generatedAt: now,
                        expiresAt: expires,
                        isActive: true,
                        version: 1,
                    });
                });
            }

            if (batch.length > 0) {
                await recommendationRepository.bulkUpsert(batch);
            }

            result.data = { seeded: batch.length };
            result.message = `Seeded ${batch.length} minister-based recommendations`;
        } catch (err: any) {
            result.error = true;
            result.code = 500;
            result.message =
                err.message || 'Failed to seed minister recommendations';
        }

        return result;
    }

    public async getForListener(
        listenerId: string,
        section?: RecommendationSection,
        limit?: number,
    ): Promise<IResult> {
        return recommendationRepository.findByListenerOrGlobal(
            listenerId,
            section,
            limit,
        );
    }

    public async recordFeedback(
        recoId: string,
        feedback: Partial<IRecommendationDoc['feedback']>,
    ): Promise<IResult> {
        return recommendationRepository.recordFeedback(recoId, feedback);
    }
}

export default new RecommendationService();

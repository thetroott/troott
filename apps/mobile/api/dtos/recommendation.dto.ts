/**
 * Recommendation DTOs aligned with `apps/api/src/dtos/core/recommendation.dto.ts`.
 * Enum string values mirror `apps/api/src/interfaces/core/recommendation.interface.ts`.
 */
export enum RecommendationTargetType {
    SERMON = 'sermon',
    SERIES = 'series',
    MINISTER = 'minister',
    PLAYLIST = 'playlist',
    TOPIC = 'topic',
}

export enum RecommendationReason {
    TRENDING = 'trending',
    FEATURED = 'featured',
    MOST_PLAYED = 'most_played',
    NEW_RELEASE = 'new_release',
    EDITORIAL_PICK = 'editorial_pick',
    POPULAR_MINISTER = 'popular_minister',
    SIMILAR_TOPIC = 'similar_topic',
    SIMILAR_MINISTER = 'similar_minister',
    RECENTLY_PLAYED_POPULAR = 'recently_played_popular',
    COLLABORATIVE = 'collaborative',
    REGION_POPULAR = 'region_popular',
    LANGUAGE_MATCH = 'language_match',
    COMPLETION_BASED = 'completion_based',
    SERIES_CONTINUATION = 'series_continuation',
}

export enum RecommendationReasonType {
    BASED_ON_TOPIC = 'based_on_topic',
    BASED_ON_MINISTER = 'based_on_minister',
    BASED_ON_SERMON = 'based_on_sermon',
    TRENDING = 'trending',
    NEW_RELEASE = 'new_release',
    CONTINUE_LISTENING = 'continue_listening',
    BECAUSE_YOU_LIKED = 'because_you_liked',
    COLLABORATIVE_FILTERING = 'collaborative_filtering',
    EDITORIAL = 'editorial',
    POPULAR_IN_REGION = 'popular_in_region',
}

export enum RecommendationSection {
    TRENDING_NOW = 'trending_now',
    NEW_SERMONS = 'new_sermons',
    FEATURED_SERIES = 'featured_series',
    POPULAR_MINISTERS = 'popular_ministers',
    MOST_PLAYED_THIS_WEEK = 'most_played_this_week',
    RECOMMENDED_FOR_YOU = 'recommended_for_you',
    RECENTLY_ADDED = 'recently_added',
    FROM_YOUR_MINISTERS = 'from_your_ministers',
    BASED_ON_TOPICS = 'based_on_topics',
    CONTINUE_LISTENING = 'continue_listening',
}

export interface ReasonMetadata {
    topicName?: string;
    topicId?: string;
    ministerName?: string;
    ministerId?: string;
    regionName?: string;
    languageCode?: string;
    seriesTitle?: string;
    seriesId?: string;
    label?: string;
}

export interface RecommendationResponseDTO {
    id: string;
    code: string;
    targetType: RecommendationTargetType;
    targetId: string;
    reason: RecommendationReason;
    reasonType: RecommendationReasonType;
    reasonMetadata: ReasonMetadata;
    section: RecommendationSection;
    score: number;
    position: number;
    generatedAt: string;
    expiresAt: string;
}

export interface RecordFeedbackDTO {
    recommendationId: string;
    clicked?: boolean;
    dismissed?: boolean;
    played?: boolean;
    playbackCompletionRate?: number;
    skipped?: boolean;
    savedToLibrary?: boolean;
    shared?: boolean;
    liked?: boolean;
}

export interface GetRecommendationsDTO {
    listenerId: string;
    section?: RecommendationSection;
    limit?: number;
}

import {
    RecommendationTargetType,
    RecommendationReason,
    RecommendationReasonType,
    RecommendationSection,
    ReasonMetadata,
    RecommendationFeedback,
} from '@/interfaces/core/recommendation.interface';

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

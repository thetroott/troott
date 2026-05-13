import { Document, Types } from 'mongoose';
import IListenerDoc from './listener.interface';
import IMinisterDoc from './minister.interface';
import ISermonDoc from './sermon.interface';
import ITopicDoc from './topic.interface';
import { DeviceType, NetworkType } from './playback.interface';

type ObjectId = Types.ObjectId;


/**
 * Mongoose document for a pre-computed recommendation.
 *
 * Each document ties a specific listener to a specific piece of content
 * with a score, a reason, and a home-screen section. A background
 * pipeline generates recommendations in batches; the home-feed endpoint
 * reads them sorted by {@link score} within each {@link section}.
 *
 * For global / non-personalised rails (e.g. Trending Now) the
 * {@link listener} field is `null` -- these rows are shared across all
 * users.
 */
interface IRecommendationDoc extends Document {
    /** Short unique code. */
    code: string;

    // -- who ------------------------------------------------------------------

    /**
     * The listener this recommendation is for.
     *
     * `null` for global rails (trending, featured, new releases) that
     * are identical for every user.
     */
    listener: IListenerDoc | null;

    // -- what -----------------------------------------------------------------

    /** Kind of content being recommended. */
    targetType: RecommendationTargetType;

    /**
     * String ID of the recommended content document.
     *
     * Resolved to the concrete type via {@link targetType} in the
     * service layer. Kept as a plain string to avoid heavy population,
     * inconsistent hydration, and Mongo join complexity.
     */
    targetId: string;

    // -- why ------------------------------------------------------------------

    /** Primary algorithm signal that produced this recommendation. */
    reason: RecommendationReason;
    /** Granular reason type for UI explanation strings. */
    reasonType: RecommendationReasonType;
    /** Human-readable context for the client UI. */
    reasonMetadata: ReasonMetadata;

    // -- candidate provenance -------------------------------------------------

    /** Pipeline stage that nominated this content before ranking. */
    candidateSource: RecommendationCandidateSource;

    // -- diversity seeds (content the recommendation was derived from) ---------

    /** Topics that influenced this recommendation. */
    basedOnTopics: Array<ITopicDoc | any>;
    /** Ministers that influenced this recommendation. */
    basedOnMinisters: Array<IMinisterDoc | any>;
    /** Sermons that influenced this recommendation. */
    basedOnSermons: Array<ISermonDoc | any>;

    // -- ranking --------------------------------------------------------------

    /**
     * Composite relevance score (0-1).
     *
     * Higher is better. Allows mixing signals: a sermon that is both
     * trending AND matches a liked topic scores higher than one that
     * is only trending.
     */
    score: number;
    /** Model confidence in this recommendation (0-1). */
    confidence: number;
    /** Ordinal rank within the full feed (across all sections). */
    rank: number;
    /** Pre-computed display order within its section. */
    position: number;

    // -- freshness / decay ----------------------------------------------------

    /**
     * Freshness multiplier (0-1).
     *
     * Newer content starts near 1.0 and decays toward 0 over time.
     * Applied as a multiplicative factor to {@link score} at serve time.
     */
    freshnessScore: number;
    /**
     * Rate at which {@link freshnessScore} decays per day.
     *
     * A rate of 0.05 means the score drops ~5% per day.
     * Trending rails use higher decay; editorial picks use lower.
     */
    decayRate: number;

    // -- similarity (optional, for offline analysis / ML) ---------------------

    /**
     * Dense embedding vector for the recommended content.
     *
     * Used for nearest-neighbour lookups and offline similarity
     * analysis. Not populated on every row -- only when the content-
     * based pipeline runs.
     */
    embeddingVector?: number[];
    /** Cosine similarity between listener taste profile and this content. */
    similarityScore?: number;

    // -- grouping -------------------------------------------------------------

    /** Home-screen rail this recommendation belongs to. */
    section: RecommendationSection;

    // -- model / experiment tracking ------------------------------------------

    /** Ranking algorithm that produced the final score. */
    algorithm: RecommendationAlgorithm;
    /** Semantic version of the model weights (e.g. `1.2.0`). */
    modelVersion: string;
    /** A/B experiment identifier (omitted when not running an experiment). */
    experimentId?: string;
    /** Variant within the experiment (e.g. `control`, `treatment_a`). */
    variantId?: string;

    // -- generation context ---------------------------------------------------

    /** Listener environment snapshot at generation time. */
    context: RecommendationContext;

    // -- lifecycle ------------------------------------------------------------

    /** When the recommendation pipeline generated this row. */
    generatedAt: Date;
    /** After this timestamp the recommendation is stale and should not be served. */
    expiresAt: Date;
    /** Soft toggle for admin override. */
    isActive: boolean;
    /**
     * Batch version from the recommendation pipeline.
     *
     * Bumped on each full re-generation so old and new sets can be
     * swapped atomically.
     */
    version: number;

    // -- feedback loop --------------------------------------------------------

    /** Implicit interaction signals collected after serving. */
    feedback: RecommendationFeedback;

    // -- denormalised context --------------------------------------------------

    /** Listener's country code, copied at generation time for region queries. */
    listenerCountry: string;
    /** Content's ISO-639 language code. */
    contentLanguage: string;
    /** Topic IDs associated with the content. */
    contentTopics: Array<string>;

    // -- standard fields ------------------------------------------------------

    /** ISO-8601 creation timestamp. */
    createdAt: Date;
    /** ISO-8601 last-update timestamp. */
    updatedAt: Date;
    /** Optimistic concurrency version. */
    _version: number;
    /** MongoDB ObjectId. */
    _id: ObjectId;
    /** Virtual `id` getter. */
    id: ObjectId;
}

/** The type of content being recommended. */
export enum RecommendationTargetType {
    SERMON = 'sermon',
    SERIES = 'series',
    MINISTER = 'minister',
    PLAYLIST = 'playlist',
    TOPIC = 'topic',
}

/** Algorithmic signal that produced the recommendation. */
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

/** Where the candidate was sourced before ranking. */
export enum RecommendationCandidateSource {
    TRENDING_ENGINE = 'trending_engine',
    COLLABORATIVE_FILTER = 'collaborative_filter',
    CONTENT_BASED_FILTER = 'content_based_filter',
    ONBOARDING_SELECTION = 'onboarding_selection',
    SEARCH_HISTORY = 'search_history',
    LISTENING_HISTORY = 'listening_history',
    MINISTER_GRAPH = 'minister_graph',
    EDITORIAL_CURATION = 'editorial_curation',
    POPULARITY_RANK = 'popularity_rank',
    REGIONAL_RANK = 'regional_rank',
}

/** Ranking algorithm that scored this recommendation. */
export enum RecommendationAlgorithm {
    POPULARITY = 'popularity',
    COLLABORATIVE = 'collaborative',
    CONTENT_BASED = 'content_based',
    HYBRID = 'hybrid',
    EDITORIAL = 'editorial',
    CONTEXTUAL = 'contextual',
}

/** Granular reason type for the UI explanation string. */
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

/** Home-screen section / rail the recommendation belongs to. */
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

// ---------------------------------------------------------------------------
// Sub-documents
// ---------------------------------------------------------------------------

/**
 * Human-readable metadata explaining *why* the recommendation was made.
 *
 * Denormalised so the client can render "Because you like Faith" or
 * "Popular in Nigeria" without additional lookups.
 */
export interface ReasonMetadata {
    topicName?: string;
    topicId?: string;
    ministerName?: string;
    ministerId?: string;
    regionName?: string;
    languageCode?: string;
    seriesTitle?: string;
    seriesId?: string;
    /** Free-form label the UI can render directly. */
    label?: string;
}

/**
 * Implicit-feedback signals collected after serving.
 *
 * Updated in real time as the listener interacts with the card.
 * These signals feed back into the ranking pipeline to improve
 * future recommendations.
 */
export interface RecommendationFeedback {
    /** Number of times this card was rendered on screen. */
    impressionCount: number;
    /** When the listener tapped the card (`null` if never). */
    clickedAt: Date | null;
    /** Whether the listener explicitly dismissed it ("not interested"). */
    dismissed: boolean;
    /** Whether playback actually started after the click. */
    played: boolean;
    /** Completion rate of the resulting playback (0-1). */
    playbackCompletionRate: number;
    /** Whether the listener skipped the content quickly after starting. */
    skipped: boolean;
    /** When the skip occurred. */
    skippedAt: Date | null;
    /** Whether the listener saved the content to their library. */
    savedToLibrary: boolean;
    /** Number of times the listener shared this content from the card. */
    shareCount: number;
    /** Whether the listener liked the content after engaging. */
    likeSignal: boolean;
}

/**
 * Snapshot of the listener's environment at generation time.
 *
 * Captures context that affects consumption patterns: morning vs night,
 * mobile vs desktop, wifi vs cellular. Enables context-aware ranking.
 */
export interface RecommendationContext {
    /** Time-of-day bucket when the recommendation was generated. */
    timeOfDay: TimeOfDay;
    /** Device category the listener was using. */
    deviceType: DeviceType;
    /** Network transport at generation time. */
    networkType: NetworkType;
}

/** Coarse time-of-day buckets for context-aware ranking. */
export enum TimeOfDay {
    MORNING = 'morning',
    AFTERNOON = 'afternoon',
    EVENING = 'evening',
    NIGHT = 'night',
}



export type { IRecommendationDoc };
export default IRecommendationDoc;

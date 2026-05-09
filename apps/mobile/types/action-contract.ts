/**
 * Lightweight contract for high-impact user actions (navigation, feedback, API).
 * Use for documentation alignment and future centralized dispatch — callers may still
 * implement effects imperatively today.
 */
export type ActionEffectKind =
    | 'navigation'
    | 'state'
    | 'api'
    | 'feedback'
    | 'composite';

export type MobileHighImpactActionContract = {
    /** Stable id e.g. `sermon.save_to_playlist` */
    id: string;
    /** Route or logical screen id */
    sourceScreen: string;
    preconditions?: string[];
    primaryEffect: ActionEffectKind;
    /** Human-readable outcome */
    outcome: string;
    fallbackEffect?: string;
};

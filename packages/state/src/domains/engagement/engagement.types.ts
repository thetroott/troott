export interface EngagementState {
    badges: unknown[];
    streaks: { listeningStreakDays: number; lastActiveDate: string | null };
    listeningGoals: { dailyMinutesTarget: number; currentMinutes: number };
    yearInReview: unknown | null;
    isLoading: boolean;
}

export type EngagementAction = { type: string; payload?: unknown };

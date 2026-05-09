import type { EngagementState } from './engagement.types';

export const engagementInitial: EngagementState = {
    badges: [],
    streaks: { listeningStreakDays: 0, lastActiveDate: null },
    listeningGoals: { dailyMinutesTarget: 0, currentMinutes: 0 },
    yearInReview: null,
    isLoading: false,
};

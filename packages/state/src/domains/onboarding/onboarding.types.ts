export interface OnboardingState {
    account: {
        step: string | null;
        status: string | null;
        completedAt: string | null;
        documents: Array<{
            type: string;
            status: string;
            uploadedAt: string | null;
        }>;
    };
    taste: {
        complete: boolean;
        selectedGenreIds: string[];
        selectedArtistIds: string[];
        selectedMinisterIds: string[];
        profile: unknown;
    };
}

export type OnboardingAction = { type: string; payload?: unknown };

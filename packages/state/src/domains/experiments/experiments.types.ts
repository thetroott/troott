export interface ExperimentsState {
    featureFlags: Record<string, boolean>;
    abAssignments: Record<string, unknown>;
    exposures: unknown[];
    developer: { developerOptionsEnabled: boolean; prId: string | null };
}

export type ExperimentsAction = { type: string; payload?: unknown };

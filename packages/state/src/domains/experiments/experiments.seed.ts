import type { ExperimentsState } from './experiments.types';

export const experimentsInitial: ExperimentsState = {
    featureFlags: {},
    abAssignments: {},
    exposures: [],
    developer: { developerOptionsEnabled: false, prId: null },
};

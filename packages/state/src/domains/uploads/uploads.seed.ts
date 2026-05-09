import type { UploadsState } from './uploads.types';

export const uploadsInitial: UploadsState = {
    inFlight: {},
    completedIds: [],
    failedIds: [],
    deletedTrackIds: [],
    deletedSeriesIds: [],
};

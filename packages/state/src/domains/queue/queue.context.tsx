import { createDomainContext } from '../_shared/createDomain';
import { queueReducer } from './queue.reducer';
import { queueInitial } from './queue.seed';
import type { QueueAction, QueueState } from './queue.types';

const d = createDomainContext<QueueState, QueueAction>(
    'queue',
    queueReducer,
    queueInitial,
);

export const QueueProvider = d.Provider;
export const useQueueState = d.useState;
export const useQueueDispatch = d.useDispatch;

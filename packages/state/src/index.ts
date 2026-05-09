export { TroottStateProvider } from './TroottStateProvider';

/** @deprecated Nest only `TroottStateProvider` at the app root; these wrappers are pass-through. */
export { default as UserState } from './user/userState';
/** @deprecated Nest only `TroottStateProvider` at the app root; these wrappers are pass-through. */
export { default as AppState } from './app/appState';
export { default as UserContext } from './user/userContext';
export { default as AppContext } from './app/appContext';
export { default as useContextType } from './useContextType';

export { useAuthDispatch, useAuthState } from './domains/auth/auth.context';
export { usePlaybackDispatch, usePlaybackState } from './domains/playback/playback.context';
export { useQueueDispatch, useQueueState } from './domains/queue/queue.context';
export { useUploadsDispatch, useUploadsState } from './domains/uploads/uploads.context';

export * from './helpers/types';
export * from './helpers/interface';
export { collection, sidebarSeed, toastSeed } from './helpers/seed';

export { useAppSelector, useUserSelector } from './hooks/selectors';

export { default as Troott, troottAPIClient, TroottAPIClient } from './api/_base/config';
export { default } from './api/_base/config';
export type {
    IAPIResponse,
    ApiMethodType,
    ApiServiceType,
    CallApiDTO,
    ChannelType,
    IListQuery,
    TroottAxiosOptions,
} from './api/_base/types';
export { normalizeApiBaseUrl, detectDefaultChannel } from './api/_base/env';
export { P } from './api/_base/paths';

export { TroottAPIError, unwrapResponse, assertOk } from './utils/helpers';
export * from './utils/enums';
export * from './dto-index';

export {
    createMemoryTokenStorage,
    createWebLocalStorageAdapter,
    type TokenStorage,
    type IdempotencyKeyStorage,
} from './storage/token-storage';
export {
    createCookieTokenStorage,
    createMmkvTokenStorage,
    createElectronFileTokenPlaceholder,
} from './storage/adapters';

export {
    createIdempotencyService,
    createMemoryIdempotencyStore,
    createMmkvIdempotencyStorage,
} from './api/_base/idempotent';

export { resolveAssetUrl } from './utils/asset-url';
export type { AssetResizeOptions } from './utils/asset-url';

export { default as AuthAPI } from './api/authentication/auth';
export { default as RoleAPI } from './api/authentication/role';
export { default as PermissionAPI } from './api/authentication/permission';
export { default as UserAPI } from './api/users/user/user';
export { default as ProfileAPI } from './api/users/profile/profile';
export { default as ListenerAPI } from './api/users/listener/listener';
export { default as MinisterAPI } from './api/users/minister/minister';
export { default as CreatorAPI } from './api/users/creator/creator';
export { default as AdminAPI } from './api/users/admin/admin';
export { default as SermonAPI } from './api/core/sermon/sermon';
export { default as LibraryAPI } from './api/core/library/library';
export { default as PlaylistAPI } from './api/core/playlist/playlist';
export { default as PreferenceAPI } from './api/core/preference/preference';
export { default as SearchAPI } from './api/core/search/search';
export { default as DiscoveryAPI } from './api/core/discovery/discovery';
export { default as PlaybackAPI } from './api/core/playback/playback';
export { default as OpenAPI } from './api/core/open/open';
export { default as ShareAPI } from './api/platform/share/share';
export { default as StorageAPI } from './api/platform/storage/storage';
export { default as InvitationAPI } from './api/platform/Invitation/invitation';
export { default as PushAPI } from './api/notifications/push';
export { default as PlanAPI } from './api/payments/plan';
export { default as SubscriptionAPI } from './api/payments/subscription';
export { default as TransactionAPI } from './api/payments/transaction';

export { queryKeys } from './hooks/queryKeys';
export { TroottQueryProvider, createQueryClient } from './hooks/QueryProvider';
export { useDiscoveryHome } from './hooks/useDiscoveryHome';

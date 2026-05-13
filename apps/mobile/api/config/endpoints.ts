/**
 * Troott API endpoint paths.
 *
 * Mirrors `apps/api/src/routes/v1/routes.router.ts` (mounted at `/api/v1`).
 * `API_BASE_PATH` is defined in `./index` (default `/api/v1`).
 */
import { API_BASE_PATH } from './index';

const BASE = API_BASE_PATH || '/api/v1';

// ---------------------------------------------------------------------------
// Auth (`/auth`)
// ---------------------------------------------------------------------------

export const authEndpoints = {
    register: `${BASE}/auth/register`,
    login: `${BASE}/auth/login`,
    verifyOtp: `${BASE}/auth/verify-otp`,
    resendOtp: `${BASE}/auth/resend-otp`,
    activate: `${BASE}/auth/activate`,
    forgotPassword: `${BASE}/auth/forgot-password`,
    resetPassword: `${BASE}/auth/reset-password`,
    changePassword: `${BASE}/auth/change-password`,
    refreshToken: `${BASE}/auth/token`,
    logout: `${BASE}/auth/logout`,
    oauthGoogle: `${BASE}/auth/google`,
    oauthGithub: `${BASE}/auth/github`,
    oauthApple: `${BASE}/auth/apple`,
    oauthGoogleCallback: `${BASE}/auth/google/callback`,
    oauthGithubCallback: `${BASE}/auth/github/callback`,
    oauthAppleCallback: `${BASE}/auth/apple/callback`,
} as const;

// ---------------------------------------------------------------------------
// User account (`/user`)
// ---------------------------------------------------------------------------

export const userEndpoints = {
    /** Current authenticated user profile. */
    me: `${BASE}/user`,
    /** Paginated / filtered user list (staff). */
    list: `${BASE}/user/list`,
    deactivate: `${BASE}/user/deactivate`,
} as const;

// ---------------------------------------------------------------------------
// Listener (`/listener`)
// ---------------------------------------------------------------------------

export const listenerEndpoints = {
    profile: `${BASE}/listener`,
    list: `${BASE}/listener/list`,
    interests: `${BASE}/listener/interests`,
    invite: `${BASE}/listener/invite`,
    inviteBulk: `${BASE}/listener/invite/bulk`,
    inviteResend: `${BASE}/listener/invite/resend`,
    inviteAccept: `${BASE}/listener/invite/accept`,
    inviteRevoke: `${BASE}/listener/invite/revoke`,
    setPassword: `${BASE}/listener/set-password`,
    onboardingTopics: `${BASE}/listener/onboarding/topics`,
    onboardingMinisters: `${BASE}/listener/onboarding/ministers`,
    onboardingSkip: `${BASE}/listener/onboarding/skip`,
} as const;

// ---------------------------------------------------------------------------
// Minister (`/minister`)
// ---------------------------------------------------------------------------

export const ministerEndpoints = {
    profile: `${BASE}/minister`,
    list: `${BASE}/minister/list`,
    verification: `${BASE}/minister/verification`,
    verificationStatus: `${BASE}/minister/verification/status`,
    invite: `${BASE}/minister/invite`,
    inviteBulk: `${BASE}/minister/invite/bulk`,
    inviteResend: `${BASE}/minister/invite/resend`,
    inviteAccept: `${BASE}/minister/invite/accept`,
    inviteRevoke: `${BASE}/minister/invite/revoke`,
    setPassword: `${BASE}/minister/set-password`,
    byId: (id: string) => `${BASE}/minister/${id}`,
} as const;

// ---------------------------------------------------------------------------
// Creator (`/creator`)
// ---------------------------------------------------------------------------

export const creatorEndpoints = {
    profile: `${BASE}/creator`,
    list: `${BASE}/creator/list`,
    byId: (id: string) => `${BASE}/creator/${id}`,
    invite: `${BASE}/creator/invite`,
    inviteAccept: `${BASE}/creator/invite/accept`,
    inviteRevoke: `${BASE}/creator/invite/revoke`,
    setPassword: `${BASE}/creator/set-password`,
    verification: `${BASE}/creator/verification`,
    verificationStatus: `${BASE}/creator/verification/status`,
} as const;

// ---------------------------------------------------------------------------
// Admin (`/admin`)
// ---------------------------------------------------------------------------

export const adminEndpoints = {
    profile: `${BASE}/admin`,
    list: `${BASE}/admin/list`,
    byId: (id: string) => `${BASE}/admin/${id}`,
    invite: `${BASE}/admin/invite`,
    inviteAccept: `${BASE}/admin/invite/accept`,
    inviteRevoke: `${BASE}/admin/invite/revoke`,
    setPassword: `${BASE}/admin/set-password`,
} as const;

// ---------------------------------------------------------------------------
// Sermon (`/sermon`)
// ---------------------------------------------------------------------------

export const sermonEndpoints = {
    root: `${BASE}/sermon`,
    byId: (id: string) => `${BASE}/sermon/${id}`,
    startUpload: `${BASE}/sermon/start-upload`,
    imageUpload: `${BASE}/sermon/image-upload`,
    publish: (id: string) => `${BASE}/sermon/publish/${id}`,
    update: (id: string) => `${BASE}/sermon/update/${id}`,
    moveToBin: (id: string) => `${BASE}/sermon/move-to-bin/${id}`,
    delete: (id: string) => `${BASE}/sermon/delete/${id}`,
    topic: (topic: string) => `${BASE}/sermon/topic/${encodeURIComponent(topic)}`,
    minister: (ministerId: string) => `${BASE}/sermon/minister/${ministerId}`,
    ministerMostPlayed: (ministerId: string) =>
        `${BASE}/sermon/minister/${ministerId}/most-played`,
    ministerMostLiked: (ministerId: string) =>
        `${BASE}/sermon/minister/${ministerId}/most-liked`,
    ministerMostShared: (ministerId: string) =>
        `${BASE}/sermon/minister/${ministerId}/most-shared`,
    ministerRecentlyPublished: (ministerId: string) =>
        `${BASE}/sermon/minister/${ministerId}/recently-published`,
    statsMostPlayed: `${BASE}/sermon/stats/most-played`,
    statsMostLiked: `${BASE}/sermon/stats/most-liked`,
    statsMostShared: `${BASE}/sermon/stats/most-shared`,
    statsRecentlyPublished: `${BASE}/sermon/stats/recently-published`,
    userRecentlyAdded: `${BASE}/sermon/user/recently-added`,
    userRecentlyPlayed: `${BASE}/sermon/user/recently-played`,
    userPopular: `${BASE}/sermon/user/popular`,
    userFavoriteMinisters: `${BASE}/sermon/user/favorite-ministers`,
    userInterests: `${BASE}/sermon/user/interests`,
} as const;

// ---------------------------------------------------------------------------
// Library (`/library`)
// ---------------------------------------------------------------------------

export const libraryEndpoints = {
    root: `${BASE}/library`,
    byUser: (userId: string) => `${BASE}/library/user/${userId}`,
    byUserAndId: (userId: string, libraryId: string) =>
        `${BASE}/library/user/${userId}/${libraryId}`,
} as const;

// ---------------------------------------------------------------------------
// Playlist (`/playlist`)
// ---------------------------------------------------------------------------

export const playlistEndpoints = {
    root: `${BASE}/playlist`,
    byId: (id: string) => `${BASE}/playlist/${id}`,
    byUser: (userId: string) => `${BASE}/playlist/user/${userId}`,
    addItem: (playlistId: string) => `${BASE}/playlist/${playlistId}/add`,
    removeItem: (playlistId: string) => `${BASE}/playlist/${playlistId}/remove`,
} as const;

// ---------------------------------------------------------------------------
// Search (`/search`)
// ---------------------------------------------------------------------------

export const searchEndpoints = {
    catalog: `${BASE}/search`,
    sermons: `${BASE}/search/sermons`,
    ministers: `${BASE}/search/ministers`,
    series: `${BASE}/search/series`,
    playlists: `${BASE}/search/playlists`,
    topics: `${BASE}/search/topics`,
    withinMinister: (ministerId: string) => `${BASE}/search/minister/${ministerId}`,
    withinSeries: (seriesId: string) => `${BASE}/search/series/${seriesId}`,
    autocomplete: `${BASE}/search/autocomplete`,
    trending: `${BASE}/search/trending`,
    popular: `${BASE}/search/popular`,
    recent: `${BASE}/search/recent`,
    recentById: (id: string) => `${BASE}/search/recent/${id}`,
} as const;

// ---------------------------------------------------------------------------
// Discovery (`/discovery`)
// ---------------------------------------------------------------------------

export const discoveryEndpoints = {
    home: `${BASE}/discovery/home`,
} as const;

// ---------------------------------------------------------------------------
// Share (`/share`)
// ---------------------------------------------------------------------------

export const shareEndpoints = {
    resolve: `${BASE}/share/resolve`,
} as const;

// ---------------------------------------------------------------------------
// Open / public teaser (`/open`)
// ---------------------------------------------------------------------------

export const openEndpoints = {
    sermonTeaser: (id: string) => `${BASE}/open/sermon/${id}`,
} as const;

// ---------------------------------------------------------------------------
// Playback progress (`/playback`)
// ---------------------------------------------------------------------------

export const playbackEndpoints = {
    root: `${BASE}/playback`,
    Sermon: (sermonId: string) => `${BASE}/playback/sermon/${sermonId}`,
} as const;

// ---------------------------------------------------------------------------
// Plans & subscriptions (`/plans`, `/subscriptions`)
// ---------------------------------------------------------------------------

export const planEndpoints = {
    root: `${BASE}/plans`,
    byId: (planId: string) => `${BASE}/plans/${planId}`,
} as const;

export const subscriptionEndpoints = {
    root: `${BASE}/subscriptions`,
} as const;

// ---------------------------------------------------------------------------
// Storage (`/storage`)
// ---------------------------------------------------------------------------

export const storageEndpoints = {
    upload: `${BASE}/storage/upload`,
} as const;

// ---------------------------------------------------------------------------
// Invitations (`/invitation`)
// ---------------------------------------------------------------------------

export const invitationEndpoints = {
    byId: (invitationId: string) => `${BASE}/invitation/id/${invitationId}`,
    byInviter: (inviterId: string) => `${BASE}/invitation/inviter/${inviterId}`,
    byInvitee: `${BASE}/invitation/invitee`,
    byResource: (resourceId: string) => `${BASE}/invitation/resource/${resourceId}`,
} as const;

// ---------------------------------------------------------------------------
// Roles (`/roles`)
// ---------------------------------------------------------------------------

export const roleEndpoints = {
    root: `${BASE}/roles`,
    list: `${BASE}/roles/list`,
    byId: (id: string) => `${BASE}/roles/${id}`,
    userRoles: (userId: string) => `${BASE}/roles/user/${userId}`,
    userAttach: (userId: string) => `${BASE}/roles/user/${userId}/attach`,
    userDetach: (userId: string) => `${BASE}/roles/user/${userId}/detach`,
} as const;

// ---------------------------------------------------------------------------
// Webhooks (`/webhook`) — server-to-server; listed for completeness
// ---------------------------------------------------------------------------

export const webhookEndpoints = {
    email: `${BASE}/webhook/email`,
} as const;

// ---------------------------------------------------------------------------
// API root (HTML health view in browser)
// ---------------------------------------------------------------------------

export const apiRootEndpoint = `${BASE}/`;

/**
 * All Troott endpoints grouped by domain.
 */
export const endpoints = {
    auth: authEndpoints,
    user: userEndpoints,
    listener: listenerEndpoints,
    minister: ministerEndpoints,
    creator: creatorEndpoints,
    admin: adminEndpoints,
    sermon: sermonEndpoints,
    library: libraryEndpoints,
    playlist: playlistEndpoints,
    search: searchEndpoints,
    discovery: discoveryEndpoints,
    share: shareEndpoints,
    open: openEndpoints,
    playback: playbackEndpoints,
    plan: planEndpoints,
    subscription: subscriptionEndpoints,
    storage: storageEndpoints,
    invitation: invitationEndpoints,
    role: roleEndpoints,
    webhook: webhookEndpoints,
    root: apiRootEndpoint,
} as const;

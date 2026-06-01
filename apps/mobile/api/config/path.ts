/**
 * Troott API paths (same `URL_*` names as `apps/web/src/api/core/paths.ts`).
 * Values are absolute path prefixes including `/api/v1` for use with {@link httpClient}.
 *
 * Keep `BASE` in sync with `API_BASE_PATH` in `./index.ts`.
 */
const BASE = '/api/v1';

const api = (relativePath: string): string => {
    const p = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
    return `${BASE}${p}`;
};

// ---------------------------------------------------------------------------
// Auth (`/auth`)
// ---------------------------------------------------------------------------

export const URL_LOGIN = api('/auth/login');
export const URL_REGISTER = api('/auth/register');
export const URL_ACTIVATE = api('/auth/activate');
export const URL_VERIFY_OTP = api('/auth/verify-otp');
export const URL_FORGOT_PASSWORD = api('/auth/forgot-password');
export const URL_RESET_PASSWORD = api('/auth/reset-password');
export const URL_RESEND_OTP = api('/auth/resend-otp');
export const URL_GET_TOKEN = api('/auth/token');
export const URL_LOGOUT = api('/auth/logout');
export const URL_LOGGEDIN_USER = api('/auth/user');
export const URL_CHANGE_PASSWORD = api('/auth/change-password');

export const URL_AUTH_GOOGLE = api('/auth/google');
export const URL_AUTH_GITHUB = api('/auth/github');
export const URL_AUTH_APPLE = api('/auth/apple');
export const URL_AUTH_GOOGLE_CALLBACK = api('/auth/google/callback');
export const URL_AUTH_GITHUB_CALLBACK = api('/auth/github/callback');
export const URL_AUTH_APPLE_CALLBACK = api('/auth/apple/callback');

export const URL_USERS = api('/users');
export const URL_USER = api('/user');
export const URL_USER_LIST = `${URL_USER}/list`;
export const URL_USER_DEACTIVATE = `${URL_USER}/deactivate`;

export const URL_LIBRARY = api('/library');
export const URL_PLAYLIST = api('/playlist');
export const URL_PLAYBACK = api('/playback');

export const URL_LISTENER = api('/listener');
export const URL_LISTENER_LIST = `${URL_LISTENER}/list`;
export const URL_LISTENER_INTERESTS = `${URL_LISTENER}/interests`;
export const URL_LISTENER_INVITE = `${URL_LISTENER}/invite`;
export const URL_LISTENER_INVITE_BULK = `${URL_LISTENER}/invite/bulk`;
export const URL_LISTENER_INVITE_RESEND = `${URL_LISTENER}/invite/resend`;
export const URL_LISTENER_INVITE_ACCEPT = `${URL_LISTENER}/invite/accept`;
export const URL_LISTENER_INVITE_REVOKE = `${URL_LISTENER}/invite/revoke`;
export const URL_LISTENER_SET_PASSWORD = `${URL_LISTENER}/set-password`;
export const URL_LISTENER_ONBOARDING_TOPICS = `${URL_LISTENER}/onboarding/topics`;
export const URL_LISTENER_ONBOARDING_MINISTERS = `${URL_LISTENER}/onboarding/ministers`;
export const URL_LISTENER_ONBOARDING_SKIP = `${URL_LISTENER}/onboarding/skip`;

export const URL_MINISTERS = api('/ministers');
export const URL_MINISTER = api('/minister');
export const URL_MINISTER_LIST = `${URL_MINISTER}/list`;
export const URL_MINISTER_VERIFICATION = `${URL_MINISTER}/verification`;
export const URL_MINISTER_VERIFICATION_STATUS = `${URL_MINISTER}/verification/status`;
export const URL_MINISTER_INVITE = `${URL_MINISTER}/invite`;
export const URL_MINISTER_INVITE_BULK = `${URL_MINISTER}/invite/bulk`;
export const URL_MINISTER_INVITE_RESEND = `${URL_MINISTER}/invite/resend`;
export const URL_MINISTER_INVITE_ACCEPT = `${URL_MINISTER}/invite/accept`;
export const URL_MINISTER_INVITE_REVOKE = `${URL_MINISTER}/invite/revoke`;
export const URL_MINISTER_SET_PASSWORD = `${URL_MINISTER}/set-password`;
export const URL_MINISTER_BY_ID = (id: string) => `${URL_MINISTER}/${id}`;
export const URL_MINISTER_ONBOARDING_PERSONAL_COMPLETE = `${URL_MINISTER}/onboarding/personal-complete`;
export const URL_MINISTER_ONBOARDING_DOCUMENT_COMPLETE = `${URL_MINISTER}/onboarding/document-complete`;
export const URL_MINISTER_ONBOARDING_ADDRESS_COMPLETE = `${URL_MINISTER}/onboarding/address-complete`;
export const URL_MINISTER_ONBOARDING_MINISTRY_COMPLETE = `${URL_MINISTER}/onboarding/ministry-complete`;
export const URL_MINISTER_ONBOARDING_TOUR_COMPLETE = `${URL_MINISTER}/onboarding/tour-complete`;
export const URL_MINISTER_ONBOARDING_FIRST_SERMON_COMPLETE = `${URL_MINISTER}/onboarding/first-sermon-complete`;
export const URL_MINISTER_ONBOARDING_SKIP = `${URL_MINISTER}/onboarding/skip`;

export const URL_CREATOR = api('/creator');
export const URL_CREATOR_LIST = `${URL_CREATOR}/list`;
export const URL_CREATOR_BY_ID = (id: string) => `${URL_CREATOR}/${id}`;
export const URL_CREATOR_INVITE = `${URL_CREATOR}/invite`;
export const URL_CREATOR_INVITE_ACCEPT = `${URL_CREATOR}/invite/accept`;
export const URL_CREATOR_INVITE_REVOKE = `${URL_CREATOR}/invite/revoke`;
export const URL_CREATOR_SET_PASSWORD = `${URL_CREATOR}/set-password`;
export const URL_CREATOR_VERIFICATION = `${URL_CREATOR}/verification`;
export const URL_CREATOR_VERIFICATION_STATUS = `${URL_CREATOR}/verification/status`;

export const URL_ADMIN = api('/admin');
export const URL_ADMIN_LIST = `${URL_ADMIN}/list`;
export const URL_ADMIN_BY_ID = (id: string) => `${URL_ADMIN}/${id}`;
export const URL_ADMIN_INVITE = `${URL_ADMIN}/invite`;
export const URL_ADMIN_INVITE_ACCEPT = `${URL_ADMIN}/invite/accept`;
export const URL_ADMIN_INVITE_REVOKE = `${URL_ADMIN}/invite/revoke`;
export const URL_ADMIN_SET_PASSWORD = `${URL_ADMIN}/set-password`;

export const URL_TOPIC = api('/topics');

export const URL_PLANS = api('/plans');
export const URL_PLAN_BY_ID = (planId: string) => `${URL_PLANS}/${planId}`;

export const URL_SUBSCRIPTIONS = api('/subscriptions');
export const URL_TRANSACTION = api('/transactions');

export const URL_STORAGE_UPLOAD = api('/storage/upload');

export const URL_ROLES = api('/roles');
export const URL_ROLES_LIST = `${URL_ROLES}/list`;
export const URL_ROLE_BY_ID = (id: string) => `${URL_ROLES}/${id}`;
export const URL_ROLES_USER = (userId: string) => `${URL_ROLES}/user/${userId}`;
export const URL_ROLES_USER_ATTACH = (userId: string) =>
    `${URL_ROLES}/user/${userId}/attach`;
export const URL_ROLES_USER_DETACH = (userId: string) =>
    `${URL_ROLES}/user/${userId}/detach`;

export const URL_SERMON = api('/sermon');
export const URL_SERMON_START_UPLOAD = `${URL_SERMON}/start-upload`;
export const URL_SERMON_IMAGE_UPLOAD = `${URL_SERMON}/image-upload`;
export const URL_SERMON_PUBLISH = (id: string) => `${URL_SERMON}/publish/${id}`;
export const URL_SERMON_UPDATE = (id: string) => `${URL_SERMON}/update/${id}`;
export const URL_SERMON_MOVE_TO_BIN = (id: string) =>
    `${URL_SERMON}/move-to-bin/${id}`;
export const URL_SERMON_DELETE = (id: string) => `${URL_SERMON}/delete/${id}`;
export const URL_SERMON_TOPIC = (topic: string) =>
    `${URL_SERMON}/topic/${encodeURIComponent(topic)}`;
export const URL_SERMON_BY_ID = (id: string) => `${URL_SERMON}/${id}`;
export const URL_SERMON_MINISTER = (ministerId: string) =>
    `${URL_SERMON}/minister/${ministerId}`;
export const URL_SERMON_MINISTER_MOST_PLAYED = (ministerId: string) =>
    `${URL_SERMON}/minister/${ministerId}/most-played`;
export const URL_SERMON_MINISTER_MOST_LIKED = (ministerId: string) =>
    `${URL_SERMON}/minister/${ministerId}/most-liked`;
export const URL_SERMON_MINISTER_MOST_SHARED = (ministerId: string) =>
    `${URL_SERMON}/minister/${ministerId}/most-shared`;
export const URL_SERMON_MINISTER_RECENTLY_PUBLISHED = (ministerId: string) =>
    `${URL_SERMON}/minister/${ministerId}/recently-published`;
export const URL_SERMON_STATS_MOST_PLAYED = `${URL_SERMON}/stats/most-played`;
export const URL_SERMON_STATS_MOST_LIKED = `${URL_SERMON}/stats/most-liked`;
export const URL_SERMON_STATS_MOST_SHARED = `${URL_SERMON}/stats/most-shared`;
export const URL_SERMON_STATS_RECENTLY_PUBLISHED = `${URL_SERMON}/stats/recently-published`;
export const URL_SERMON_USER_RECENTLY_ADDED = `${URL_SERMON}/user/recently-added`;
export const URL_SERMON_USER_RECENTLY_PLAYED = `${URL_SERMON}/user/recently-played`;
export const URL_SERMON_USER_POPULAR = `${URL_SERMON}/user/popular`;
export const URL_SERMON_USER_FAVORITE_MINISTERS = `${URL_SERMON}/user/favorite-ministers`;
export const URL_SERMON_USER_INTERESTS = `${URL_SERMON}/user/interests`;

export const URL_LIBRARY_USER = (userId: string) =>
    `${URL_LIBRARY}/user/${userId}`;
export const URL_LIBRARY_USER_LIBRARY = (userId: string, libraryId: string) =>
    `${URL_LIBRARY}/user/${userId}/${libraryId}`;

export const URL_PLAYLIST_USER = (userId: string) =>
    `${URL_PLAYLIST}/user/${userId}`;
export const URL_PLAYLIST_BY_ID = (id: string) => `${URL_PLAYLIST}/${id}`;
export const URL_PLAYLIST_ADD = (playlistId: string) =>
    `${URL_PLAYLIST}/${playlistId}/add`;
export const URL_PLAYLIST_REMOVE = (playlistId: string) =>
    `${URL_PLAYLIST}/${playlistId}/remove`;

export const URL_SEARCH = api('/search');
export const URL_SEARCH_SERMONS = `${URL_SEARCH}/sermons`;
export const URL_SEARCH_MINISTERS = `${URL_SEARCH}/ministers`;
export const URL_SEARCH_SERIES = `${URL_SEARCH}/series`;
export const URL_SEARCH_PLAYLISTS = `${URL_SEARCH}/playlists`;
export const URL_SEARCH_TOPICS = `${URL_SEARCH}/topics`;
export const URL_SEARCH_MINISTER_SCOPED = (ministerId: string) =>
    `${URL_SEARCH}/minister/${ministerId}`;
export const URL_SEARCH_SERIES_SCOPED = (seriesId: string) =>
    `${URL_SEARCH}/series/${seriesId}`;
export const URL_SEARCH_AUTOCOMPLETE = `${URL_SEARCH}/autocomplete`;
export const URL_SEARCH_TRENDING = `${URL_SEARCH}/trending`;
export const URL_SEARCH_POPULAR = `${URL_SEARCH}/popular`;
export const URL_SEARCH_RECENT = `${URL_SEARCH}/recent`;
export const URL_SEARCH_RECENT_BY_ID = (id: string) =>
    `${URL_SEARCH}/recent/${id}`;

export const URL_DISCOVERY_HOME = api('/discovery/home');

export const URL_SHARE_RESOLVE = api('/share/resolve');

export const URL_PLAYBACK_SERMON = (sermonId: string) =>
    `${URL_PLAYBACK}/sermon/${sermonId}`;

export const URL_INVITATION_BY_ID = (invitationId: string) =>
    `${api('/invitation/id')}/${invitationId}`;
export const URL_INVITATION_INVITER = (inviterId: string) =>
    `${api('/invitation/inviter')}/${inviterId}`;
export const URL_INVITATION_INVITEE = api('/invitation/invitee');
export const URL_INVITATION_RESOURCE = (resourceId: string) =>
    `${api('/invitation/resource')}/${resourceId}`;

export const URL_WEBHOOK_EMAIL = api('/webhook/email');

/** Browser health HTML at API root. */
export const URL_API_ROOT = `${BASE}/`;

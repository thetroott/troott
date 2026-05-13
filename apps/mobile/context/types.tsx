/**
 * Reducer action type constants.
 *
 * Base URL: `${API_ORIGIN}/api/v1` (see `@/api/client` and `api/config`).
 *
 * GET_* — dispatch after a successful read from the API (or from cache that
 * mirrors that read). Payload shape should match the controller response.
 *
 * SET_* — local UI state, optimistic updates, or hydration from auth/login
 * responses; not a dedicated HTTP verb by itself.
 *
 */

// ---------------------------------------------------------------------------
// Auth / session (mostly `SET_*` + login/register responses)
// ---------------------------------------------------------------------------
// POST /v1/auth/register
// POST /v1/auth/login
// POST /v1/auth/verify-otp
// POST /v1/auth/resend-otp
// POST /v1/auth/activate
// POST /v1/auth/forgot-password
// POST /v1/auth/reset-password
// POST /v1/auth/change-password
// POST /v1/auth/token
// POST /v1/auth/logout
// GET  /v1/auth/google | /github (+ callbacks) — OAuth only

/** Hydrate current user from GET /v1/user (see `user.router`). */
export const GET_LOGGEDIN_USER = 'GET_LOGGEDIN_USER';

/**
 * Single-user detail in `userReducer` (`userDetails`).
 * Troott exposes GET /v1/user (self) and GET /v1/user/list; no public GET-by-id
 * on `user` routes — use list + client filter or domain-specific routes.
 */
export const GET_USER = 'GET_USER';

// ---------------------------------------------------------------------------
// User / admin lists (`userReducer`)
// ---------------------------------------------------------------------------
/** GET /v1/user/list */
export const GET_USERS = 'GET_USERS';

/** GET /v1/admin/list */
export const GET_ADMINS = 'GET_ADMINS';

/** Not implemented on Troott v1 — remove or map to your analytics service. */
export const GET_AUDITS = 'GET_AUDITS';
export const GET_AUDIT = 'GET_AUDIT';

// ---------------------------------------------------------------------------
// Geo / infra (not on Troott v1)
// ---------------------------------------------------------------------------
export const GET_COUNTRIES = 'GET_COUNTRIES';
export const GET_LOCATIONS = 'GET_LOCATIONS';
export const GET_COUNTRY = 'GET_COUNTRY';
export const GET_IP_ADDRESS = 'GET_IP_ADDRESS';

// ---------------------------------------------------------------------------
// Generic / UI (`userReducer` + shared)
// ---------------------------------------------------------------------------
export const SET_PAGINATION = 'SET_PAGINATION';
export const SET_NOTIFICATIONS = 'SET_NOTIFICATIONS';
export const SET_SEARCH = 'SET_SEARCH';
export const SET_TOTAL = 'SET_TOTAL';
export const SET_COUNT = 'SET_COUNT';
export const SET_LOADING = 'SET_LOADING';
export const SET_TOAST = 'SET_TOAST';
export const UNSET_LOADING = 'UNSET_LOADING';
export const SET_USERTYPE = 'SET_USERTYPE';
export const SET_RESPONSE = 'SET_RESPONSE';
export const SET_IS_SUPER = 'SET_IS_SUPER';
export const SET_IS_ADMIN = 'SET_IS_ADMIN';
export const SET_SIDEBAR = 'SET_SIDEBAR';
export const SET_USER = 'SET_USER';
export const SET_ITEMS = 'SET_ITEMS';
export const SET_PERMISSIONS = 'SET_PERMISSIONS';

// ---------------------------------------------------------------------------
// Troott reads you will wire from `apps/api` (add reducers as needed)
// ---------------------------------------------------------------------------
// GET /v1/discovery/home
export const GET_DISCOVERY_HOME = 'GET_DISCOVERY_HOME';
// GET /v1/search/... (see `search.router`: /, /sermons, /ministers, …)
export const GET_SEARCH_CATALOG = 'GET_SEARCH_CATALOG';
// GET /v1/sermon/... and GET /v1/sermon/:id
export const GET_SERMONS = 'GET_SERMONS';
export const GET_SERMON = 'GET_SERMON';
// GET /v1/library/user/:userId  (+ optional :libraryId)
export const GET_LIBRARY_USER = 'GET_LIBRARY_USER';
// GET /v1/playlist/user/:userId | GET /v1/playlist/:id | GET /v1/playlist/
export const GET_PLAYLISTS_USER = 'GET_PLAYLISTS_USER';
export const GET_PLAYLIST = 'GET_PLAYLIST';
// GET /v1/playback | GET /v1/playback/sermon/:sermonId
export const GET_PLAYBACK_LIST = 'GET_PLAYBACK_LIST';
export const GET_PLAYBACK_SERMON = 'GET_PLAYBACK_SERMON';
// GET /v1/plans
export const GET_PLANS = 'GET_PLANS';
// GET /v1/subscriptions — route registered with no handler yet; add controller before use
export const GET_SUBSCRIPTIONS = 'GET_SUBSCRIPTIONS';
// GET /v1/listener (profile)
export const GET_LISTENER = 'GET_LISTENER';
// GET /v1/minister/... | GET /v1/creator/...
export const GET_MINISTER = 'GET_MINISTER';
export const GET_CREATOR = 'GET_CREATOR';
// GET /v1/roles/list | GET /v1/roles/user/:userId
export const GET_ROLES = 'GET_ROLES';
export const GET_USER_ROLES = 'GET_USER_ROLES';
// GET /v1/open/sermon/:id — teaser (public)
export const GET_OPEN_SERMON_TEASER = 'GET_OPEN_SERMON_TEASER';
// GET /v1/share/resolve — deep link
export const GET_SHARE_RESOLVE = 'GET_SHARE_RESOLVE';

// ---------------------------------------------------------------------------
// Troott writes (dispatch after POST/PUT/PATCH/DELETE + optional refetch)
// ---------------------------------------------------------------------------
// POST /v1/playback — save progress
export const SET_PLAYBACK_PROGRESS = 'SET_PLAYBACK_PROGRESS';
// POST /v1/playlist | PUT /v1/playlist/:id | DELETE … | PATCH …/add|remove
export const SET_PLAYLIST_MUTATION = 'SET_PLAYLIST_MUTATION';
// PUT /v1/library/user/:userId
export const SET_LIBRARY_USER = 'SET_LIBRARY_USER';
// PUT /v1/listener — profile / PUT /interests
export const SET_LISTENER_PROFILE = 'SET_LISTENER_PROFILE';
// POST /v1/listener/onboarding/topics | ministers | skip
export const SET_LISTENER_ONBOARDING = 'SET_LISTENER_ONBOARDING';
// POST /v1/subscriptions
export const SET_SUBSCRIPTION = 'SET_SUBSCRIPTION';



export const GET_CORE = 'GET_CORE';

/**
 * In Troott, closest reads are:
 * - GET_LIBRARY → GET /v1/library/user/:userId (and optional library doc)
 * - GET_TOPICS → GET /v1/search/topics or GET /v1/sermon/topic/:topic
 */
export const GET_LIBRARIES = 'GET_LIBRARIES';
export const GET_LIBRARY = 'GET_LIBRARY';
export const GET_TOPICS = 'GET_TOPICS';
export const GET_TOPIC = 'GET_TOPIC';

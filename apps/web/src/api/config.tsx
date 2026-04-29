import axios, { AxiosError, AxiosHeaders } from "axios";
import storage from "../utils/storage.util";
import Auth from "./auth";
import Bite from "./bite";
import Catalog from "./catalog";
import Email from "./email";
import Feed from "./feed";
import Invitation from "./invitation";
import Library from "./library";
import Notification from "./notification";
import Playlist from "./playlist";
import Minister from "./minister";
import Search from "./search";
import Sermon from "./sermon";
import Staff from "./staff";
import Subscription from "./subscription";
import User from "./user";
import logger from "@/utils/logger.util";


/**
 * All web API paths are written as `/auth/...`, `/sermon/...`, etc., which assume
 * the server mount point is `/api/v1` (see apps/api `app.use("/api/v1", v1Routes)`).
 * Accept env values with or without the suffix so uploads and other calls hit the real routes.
 */
function normalizeApiBaseUrl(url: string): string {
  const trimmed = url.trim().replace(/\/+$/, "");
  if (!trimmed) return url;
  if (/\/api\/v1$/i.test(trimmed)) return trimmed;
  // Legacy envs pointed at `.../v1` only; map to the correct API prefix.
  if (/\/v1$/i.test(trimmed)) {
    return trimmed.replace(/\/v1$/i, "/api/v1");
  }
  return `${trimmed}/api/v1`;
}

function resolveRawApiBaseUrl(): string {
  const fromPrimary = (import.meta.env.VITE_APP_API_URL as string | undefined)?.trim();
  const fromLegacy = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  return fromPrimary || fromLegacy || "";
}

const rawApiUrl = resolveRawApiBaseUrl();
/** Lets `vite` start without `.env` while building UI; sermon upload is mocked in dev unless opted in. */
const DEV_API_PLACEHOLDER_ORIGIN = "http://localhost:3000";
const effectiveRawApiUrl =
  rawApiUrl || (import.meta.env.DEV ? DEV_API_PLACEHOLDER_ORIGIN : "");
const BaseURL = normalizeApiBaseUrl(effectiveRawApiUrl);

logger.log({ data: BaseURL, label: "The BaseURL is: ", type: "info" });
if (!rawApiUrl && import.meta.env.DEV) {
  logger.log({
    type: "warning",
    label: "DEV",
    data: "VITE_APP_API_URL / VITE_API_BASE_URL unset — using localhost placeholder. Sermon upload is mocked unless VITE_USE_REAL_API_UPLOAD=true.",
  });
}
if (!effectiveRawApiUrl) {
  throw new Error(
    "API base url not defined: set VITE_APP_API_URL or VITE_API_BASE_URL (origin only, e.g. http://localhost:3000)",
  );
}

/**
 * Axios instance for public API requests that do not require authentication.
 * @type {import('axios').AxiosInstance}
 */
export const axiosPublic = axios.create({
  baseURL: BaseURL,
  headers: storage.getConfig().headers,
});

/**
 * Axios instance for private API requests that require authentication.
 * Automatically includes credentials and merges the Authorization header
 * from storage on every request via an interceptor.
 * @type {import('axios').AxiosInstance}
 */
export const axiosPrivate = axios.create({
  baseURL: BaseURL,
  withCredentials: true,
});

/**
 * Axios request interceptor that adds device ID and authentication headers
 * @param {AxiosRequestConfig} config - The axios request configuration
 * @returns {Promise<AxiosRequestConfig>} Modified request configuration
 */
axiosPrivate.interceptors.request.use(
  async function (config) {
    const bearerConfig = storage.getConfigWithBearer();
    const isFormData = config.data instanceof FormData;

    const merged = AxiosHeaders.from(config.headers ?? {});
    merged.set("lg", bearerConfig.headers.lg ?? "en");
    merged.set("ch", bearerConfig.headers.ch ?? "web");
    if (bearerConfig.headers.Authorization) {
      merged.set("Authorization", bearerConfig.headers.Authorization);
    }
    if (!isFormData) {
      merged.set(
        "Content-Type",
        (bearerConfig.headers["Content-Type"] as string) ?? "application/json"
      );
    } else {
      merged.delete("Content-Type");
      merged.delete("content-type");
    }
    config.headers = merged;

    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

/**
 * Axios response interceptor for private API requests.
 * - Handles network errors, session expiration (401/403), request timeouts, and HTTP errors
 * - Automatically clears token and redirects to login on session expiration
 * - Returns a standardized error object
 * @param {import('axios').AxiosResponse} response - The successful axios response
 * @returns {import('axios').AxiosResponse} The response (unchanged)
 * @param {AxiosError} error - The error thrown by axios
 * @returns {Promise<never>} Rejected promise with standardized error object
 */
axiosPrivate.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    // No HTTP response: wrong URL, CORS, offline, or (for some clients) timeout/abort
    if (!error.response) {
      if (error.code === "ECONNABORTED") {
        console.error("Request timeout:", error.message);
        return Promise.reject({
          error: true,
          data: null,
          message: "Request timed out. Please try again.",
          errors: [error.message],
        });
      }
      console.error("Network or connection error:", error.message);
      return Promise.reject({
        error: true,
        data: null,
        message: "A network error occurred. Please check your connection.",
        errors: [error.message],
      });
    }

    const { status, data } = error.response;

    // Handle session expiration
    if (status === 401 || status === 403) {
      await storage.deleteItem("accessToken");
      console.warn("Session expired. Redirecting to login...");
      window.location.href = "/login";
      
      return Promise.reject({
        error: true,
        data: null,
        message: "Session expired. Please login again.",
        errors: ["Session expired"],
      });
    }

    if (error.code === "ECONNABORTED") {
      console.error("Request timeout:", error.message);
      return Promise.reject({
        error: true,
        data: null,
        message: "Request timed out. Please try again.",
        errors: [error.message],
      });
    }

    // Specific HTTP errors
    if (status === 404 || status === 502) {
      
      return Promise.reject({
        error: true,
        data: null,
        message: (data as any)?.message || "Unable to get requested resource",
        errors: (data as any)?.errors || [],
      });
    }

    // Default case: use whatever came from server if available
    if (data) {
      return Promise.reject({
        error: true,
        data: data ?? null,
        message: (data as any).message || "An error occurred",
        errors: (data as any).errors || ["An error occurred"],
      });
    }

    // Fallback for unknown errors
    return Promise.reject({
      error: true,
      data: null,
      message: "An unknown error occurred",
      errors: [error.message || "Unknown error"],
    });
  }
);


/**
 * `apiCall` is the central API client for the application.
 * It aggregates all domain-specific API modules and provides
 * preconfigured axios instances for each module.
 *
 * ### Axios Usage
 * - `axiosPublic` is used for endpoints that **do not require authentication**.
 * - `axiosPrivate` is used for endpoints that **require authentication**.
 *   It automatically adds the Bearer token from storage on every request
 *   and handles session expiration, network errors, and timeouts.
 *
 * ### API Modules
 * Each module corresponds to a specific feature/domain in the app:
 * - `auth`: Handles authentication (login, signup, logout, token refresh). Uses **both public and private** axios instances depending on the endpoint.
 * - `bite`: Manages bite-sized content interactions (private API only).
 * - `catalog`: Fetches and manages catalog data such as media or resources (private API only).
 * - `email`: Handles email-related actions like sending or verifying emails (private API only).
 * - `feed`: Manages user feed interactions, posts, and updates (private API only).
 * - `invitation`: Handles sending, accepting, and tracking invitations (private API only).
 * - `library`: Manages user library items like saved resources or favorites (private API only).
 * - `notification`: Handles notifications and push events (private API only).
 * - `playlist`: Manages playlists and user-curated content (private API only).
 * - `minister`: Fetches and manages minister data (private API only).
 * - `search`: Handles search queries across app resources (private API only).
 * - `sermon`: Manages sermon content including uploads, metadata, and retrieval (private API only).
 * - `staff`: Manages staff-related data and permissions (private API only).
 * - `subscription`: Handles subscription plans, status, and billing (private API only).
 * - `user`: Manages user profile, preferences, and account settings (private API only).
 *
 * ### Example Usage
 * ```ts
 * import apiCall from "@/api";
 * 
 * // Public request
 * const res = await apiCall.auth.login({ email, password });
 * 
 * // Private request
 * const feed = await apiCall.feed.getUserFeed();
 * ```
 *
 * @namespace apiCall
 */
const apiCall = {
  auth: new Auth(axiosPublic, axiosPrivate),
  bite: new Bite(axiosPrivate),
  catalog: new Catalog(axiosPrivate),
  email: new Email(axiosPrivate),
  feed: new Feed(axiosPrivate),
  invitation: new Invitation(axiosPrivate),
  library: new Library(axiosPrivate),
  notification: new Notification(axiosPrivate),
  playlist: new Playlist(axiosPrivate),
  minister: new Minister(axiosPrivate),
  search: new Search(axiosPrivate),
  sermon: new Sermon(axiosPrivate),
  staf: new Staff(axiosPrivate),
  subsription: new Subscription(axiosPrivate),
  user: new User(axiosPrivate),
};

export default apiCall;

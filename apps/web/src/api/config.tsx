import axios, { AxiosError } from "axios";
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


const BaseURL = import.meta.env.VITE_APP_API_URL as string;

logger.log({ data: BaseURL, label: "The BaseURL is: ", type: "info" });
if (!BaseURL) throw new Error("API base url not defined");

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
    // Merge existing config headers with storage headers
    const bearerConfig = storage.getConfigWithBearer();
    config.headers = {
      ...config.headers,
      ...bearerConfig.headers,
    };

    if (config.data instanceof FormData) {
      delete (config.headers as Record<string, unknown>)["Content-Type"];
    }

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
    // If no response, probably a network error
    if (!error.response) {
      console.error("The Network error:", error.message);
      
      return Promise.reject({
        error: true,
        data: null,
        message: "As Network Error. Please check your connection.",
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

    // Request timeout
    if (error.code === "ECONNABORTED") {
      console.error("Request timeout:", error.message);
     
      return Promise.reject({
        error: true,
        data: null,
        message: "Request Timeout. Please try again.",
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

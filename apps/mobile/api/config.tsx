// import axios from "axios";
// import { Platform } from "react-native";
// import Constants from "expo-constants";
// import * as Device from "expo-device";
// import * as RNLocalize from "react-native-localize";
// import moment from "moment-timezone";
// import { CommonActions } from "@react-navigation/native";
// import Auth from "./auth";
// import User from "./user";
// import Catalog from "./catalog";
// import Invitation from "./invitation";
// import Library from "./library";
// import Notification from "./notification";
// import Playlist from "./playlist";
// import Preacher from "./preacher";
// import Search from "./search";
// import Sermon from "./sermon";
// import Subscription from "./subscription";
// import storage from "@/services/shared/storage-service";


// /**
//  * Sets the navigation reference for handling navigation outside of React components
//  * @param {any} ref - The navigation reference object
//  * @returns {void}
//  */
// let navigationRef: any = null;
// export const setNavigationRef = (ref: any): void => {
//   navigationRef = ref;
// };

// const BaseURL: string = process.env.EXPO_PUBLIC_TROOTT_API_URL;
// const appVersion: string = Constants.expoConfig?.version as string;

// export const axiosPublic = axios.create({
//   baseURL: BaseURL,
//   headers: {
//     "Content-Type": "application/json",
//     "X-Client-Type": "mobile",
//     "X-Platform": Platform.OS,
//     "X-App-Version": appVersion,
//     "User-Agent": `Troott/${appVersion} (${Platform.OS} 
//       ${Device.osVersion}; ${Device.modelName})`,
//     "X-Locale": RNLocalize.getLocales()[0].languageTag,
//     "X-Timezone": moment.tz.guess(),
//   },
// });

// export const axiosPrivate = axios.create({
//   baseURL: BaseURL,
//   headers: {
//     "Content-Type": "application/json",
//     "X-Client-Type": "mobile",
//     "X-Platform": Platform.OS,
//     "X-App-Version": appVersion,
//     "User-Agent": `Troott/${appVersion} (${Platform.OS} 
//       ${Device.osVersion}; ${Device.modelName})`,
//     "X-Locale": RNLocalize.getLocales()[0].languageTag,
//     "X-Timezone": moment.tz.guess(),
//   },
// });

// /**
//  * Axios request interceptor that adds device ID and authentication headers
//  * @param {AxiosRequestConfig} config - The axios request configuration
//  * @returns {Promise<AxiosRequestConfig>} Modified request configuration
//  */
// axiosPrivate.interceptors.request.use(
//   async function (config) {
//     const deviceId = await Device.modelId;
//     config.headers["X-Device-ID"] = deviceId;

//     const accessToken = await storage.getData("accessToken");
//     if (accessToken) {
//       config.headers.authorization = `Bearer ${accessToken}`;
//     }
//     return config;
//   },
//   function (error) {
//     return Promise.reject(error);
//   }
// );


// /**
//  * Axios response interceptor that handles request timeouts
//  * @param {AxiosResponse} response - The axios response object
//  * @returns {Promise<AxiosResponse>} The response or rejected promise with timeout error
//  */
// axiosPrivate.interceptors.response.use(
//   function (response) {
//     return response;
//   },
//   async function (error) {
//     if (!error.response) {
//       console.error("Network error: ", error.message);
//       return Promise.reject({
//         message: "Network Error. Please check your internet connection.",
//       });
//     }

//     const { status } = error?.response?.status;

//     if (status === 403 || status === 401) {
//       await storage.removeData("acessToken");
//       console.log("Unauthorized. Redirecting to login.");
      
//       if (navigationRef?.dispatch) {
//         navigationRef.dispatch(
//           CommonActions.reset({
//             index: 0,
//             routes: [{ name: "Login" }],
//           })
//         );
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// axiosPrivate.defaults.timeout = 10000;


// /**
//  * Axios response interceptor that handles request timeouts
//  * @param {AxiosResponse} response - The axios response object
//  * @returns {Promise<AxiosResponse>} The response or rejected promise with timeout error
//  */
// axiosPrivate.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.code === "ECONNABORTED") {
//       console.error("Request timeout:", error.message);
//       return Promise.reject({ message: "Request Timeout. Please try again." });
//     }
//     return Promise.reject(error);
//   }
// );

// const requestController = new AbortController();

// /**
//  * Axios request interceptor that adds abort signal to requests
//  * @param {AxiosRequestConfig} config - The axios request configuration
//  * @returns {AxiosRequestConfig} Modified request configuration with abort signal
//  */
// axiosPrivate.interceptors.request.use((config) => {
//   config.signal = requestController.signal;
//   return config;
// });

// /**
//  * Cancels all pending API requests
//  * @returns {void}
//  */
// export const cancelRequests = () => {
//   requestController.abort();
// };




// /**
//  * API instance containing all service endpoints
//  * @type {Object} API service instances for different endpoints
//  * @property {Auth} auth - Authentication service
//  * @property {User} user - User management service
//  * @property {Catalog} catalog - Catalog management service
//  * @property {Invitation} invitation - Invitation handling service
//  * @property {Library} library - Library management service
//  * @property {Notification} notification - Notification handling service
//  * @property {Playlist} playlist - Playlist management service
//  * @property {Search} search - Search functionality service
//  * @property {Sermon} sermon - Sermon management service
//  * @property {Subscription} subscription - Subscription handling service
//  */
// const api = {
//   auth: new Auth(axiosPublic, axiosPrivate),
//   catalog: new Catalog(axiosPrivate),
//   invitation: new Invitation(axiosPrivate),
//   library: new Library(axiosPrivate),
//   notification: new Notification(axiosPrivate),
//   playlist: new Playlist(axiosPrivate),
//   search: new Search(axiosPrivate),
//   sermon: new Sermon(axiosPrivate),
//   subsription: new Subscription(axiosPrivate),
//   user: new User(axiosPrivate),
// };


// export default api;

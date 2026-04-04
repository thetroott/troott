import Constants from 'expo-constants';

/**
 * Environment types
 */
export type Environment = 'development' | 'staging' | 'production';

/**
 * Get current environment from Expo constants
 */
export const getEnvironment = (): Environment => {
  const env = Constants.expoConfig?.extra?.env || process.env.NODE_ENV || 'development';
  
  if (env === 'production' || env === 'prod') return 'production';
  if (env === 'staging' || env === 'stage') return 'staging';
  return 'development';
};



// import { ENVType } from "@/utils/enums.util";


// class AppENV {
//   constructor() {}

//   /**
//    * @name isProduction
//    * @description Determine if app is in production
//    * @returns {boolean} - boolean
//    */
//   public isProduction(): boolean {
//     let result: boolean = false;

//     if (process.env.APP_ENV === ENVType.PRODUCTION) {
//       result = true;
//     }
//     return result;
//   }


//   /**
//    * @name isStaging
//    * @description Determine if app is in staging
//    * @returns {boolean} - boolean
//    */
//   public isStaging(): boolean {
//     let result: boolean = false;

//     if (process.env.APP_ENV === ENVType.STAGING) {
//       result = true;
//     }
//     return result;
//   }


//   /**
//    * @name isDevelopment
//    * @description Determine if app is in development
//    * @returns {boolean} - boolean
//    */
//   public isDevelopment(): boolean {
//     let result: boolean = false;

//     if (process.env.APP_ENV === ENVType.DEVELOPMENT) {
//       result = true;
//     }
//     return result;
//   }
// }

// export default new AppENV



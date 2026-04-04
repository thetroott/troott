import mmkvstorage from "./mmkv-storage";
import secureStorage from "./secure-storage";
import idempotent from "./idempotent";

export enum HeaderType {
    IDEMPOTENT = 'Idempotent-Key',
}

// Config functions
const getConfig = () => {


    const config = {

        headers: {
            ContentType: 'application/json',
            lg: 'en',
            ch: 'web'
        }
    }

    return config;
};

const getConfigWithBearer = () => {

    const token = getToken();


    const config: any = {

        headers: {
            ContentType: 'application/json',
            Authorization: `Bearer ${token}`,
            lg: 'en',
            ch: 'web'
        }
    }

    config.headers[HeaderType.IDEMPOTENT] = idempotent.getRequestKey();

    return config;
};

// Store auth
const storeAuth = (token: string, userId: string) => {

    mmkvstorage.setData({ key: 'token', payload: token });
    mmkvstorage.setData({ key: 'userId', payload: userId });

    secureStorage.setData({ key: 'token', payload: token });
    secureStorage.setData({ key: 'userId', payload: userId });
};

const clearAuth = async (): Promise<void> => {
    
    // First check if token and userId exist in MMKV
    const hasToken = await getToken();
    const hasUserId = await getUserId(); 
  
    if (hasToken && hasUserId) {
      // Remove from MMKV (sync)
      mmkvstorage.removeData('token');
      mmkvstorage.removeData('userId');
      mmkvstorage.removeData('userType');
      mmkvstorage.removeData('userEmail');
  
      // Remove from SecureStore (async)
      await secureStorage.removeData({ key: 'token' });
      await secureStorage.removeData({ key: 'userId' });
      await secureStorage.removeData({ key: 'userType' });
      await secureStorage.removeData({ key: 'userEmail' });
    }
  };
  






// Setters
const setUserType = (userType: string): Promise<void> =>
    mmkvstorage.setData({ key: "userType", payload: userType });

const setToken = (token: string): Promise<void> =>
    mmkvstorage.setData({ key: "token", payload: token });

const setUserId = (userId: string): Promise<void> =>
    mmkvstorage.setData({ key: "userId", payload: userId });

const setUserEmail = (userEmail: string): Promise<void> =>
    mmkvstorage.setData({ key: "userEmail", payload: userEmail });

// Getters
const getUserType = (): Promise<string> =>
    mmkvstorage.getData({ key: "userType", parse: false });

const getToken = (): Promise<string> =>
    mmkvstorage.getData({ key: "token", parse: false });

const getUserId = (): Promise<string> =>
    mmkvstorage.getData({ key: "userId", parse: false });

const getUserEmail = (): Promise<string> =>
    mmkvstorage.getData({ key: "userEmail", parse: false });

// Checkers
const checkToken = (): Promise<boolean> =>
    (mmkvstorage.checkData("token")) ?? false;

const checkUserEmail = (): Promise<boolean> =>
    (mmkvstorage.checkData("userEmail")) ?? false;

const checkUserId = (): Promise<boolean> =>
    (mmkvstorage.checkData("userId")) ?? false;

const checkUserType = (): Promise<boolean> =>
    (mmkvstorage.checkData("userType")) ?? false;

// Export storage
export const storage = {
    getConfig,
    getConfigWithBearer,
    storeAuth,
    clearAuth,
    setUserType,
    setToken,
    setUserId,
    setUserEmail,
    getUserType,
    getToken,
    getUserId,
    getUserEmail,
    checkToken,
    checkUserEmail,
    checkUserId,
    checkUserType,
};

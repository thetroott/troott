import cookieService from "../services/cookies";
import { IStorage } from "../utils/interfaces";


const storeAuth = (token: string, id: string, userType: string, email: string, businessType?: string) => {
    
    localStorage.setItem('token', token);
    localStorage.setItem('userId', id);
    localStorage.setItem('role', userType);
    localStorage.setItem('userEmail', email) 

    if (businessType) {
        localStorage.setItem('businessType', businessType);
    }

    cookieService.setData({
        key: 'token',
        payload: token,
        expireAt: new Date( Date.now() + 24 * 60 * 60 * 1000 ),
        path: '/'
    })

    cookieService.setData({
        key: 'userId',
        payload: id,
        expireAt: new Date( Date.now() + 24 * 60 * 60 * 1000 ),
        path: '/'
    })
     cookieService.setData({
        key: 'userType',
        payload: userType,
        expireAt: new Date( Date.now() + 24 * 60 * 60 * 1000 ),
        path: '/'
    })
      cookieService.setData({
        key: 'userEmail',
        payload: email,
        expireAt: new Date( Date.now() + 24 * 60 * 60 * 1000 ),
        path: '/'
    })

    if (businessType) {
        cookieService.setData({
            key: 'businessType',
            payload: businessType,
            expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            path: '/'
        });
    }
}

const checkToken = () => {
    const token = localStorage.getItem('token');
    if (!token || token.trim() === '') {
        return false;
    }
    
    // Basic JWT token validation (should have 3 parts separated by dots)
    const tokenParts = token.split('.');
    return tokenParts.length === 3;
}

const getToken = () => {
    return localStorage.getItem('token');
}

const checkUserID = () => {
    return localStorage.getItem('userId') ? true : false;
}

const getUserID = () => {
    const uid = localStorage.getItem('userId');
    return uid ? uid : '';
}

const checkUserType = () => {
    return localStorage.getItem('userType') ? true : false;
}

const getUserType = () => {
    return localStorage.getItem('userType')
}

const checkBusinessType = () => {
    return localStorage.getItem('businessType') ? true : false;
}

const getBusinessType = () => {
    return localStorage.getItem('businessType');
}


const checkUserEmail = () => {
    return localStorage.getItem('userEmail') ? true : false;
}

const getUserEmail = () => {
    return localStorage.getItem('userEmail');
}

const getConfig = () => {

    const config = {
        headers: {
            "Content-Type": 'application/json',
            lg: 'en',
            ch: 'web'
        }
    }

    return config;

}

const getConfigWithBearer = () => {
    const token = getToken();
    
    if (!token) {
        console.warn("No token found when trying to create bearer config");
        return {
            headers: {
                "Content-Type": 'application/json',
                lg: 'en',
                ch: 'web'
            }
        };
    }

    const config: any = {
        headers: {
            "Content-Type": 'application/json',
            Authorization: `Bearer ${token}`,
            lg: 'en',
            ch: 'web'
        }
    }

    return config;

}

const clearAuth = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('userType');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('businessType');
    // Clear cookies
    cookieService.removeData({ key: 'token' });
    cookieService.removeData({ key: 'userId' });
    cookieService.removeData({ key: 'userType' });
    cookieService.removeData({ key: 'userEmail' });
    cookieService.removeData({ key: 'businessType' });
}

const keep = (key: string, data: any) => {

    if(data && data !== undefined && data !== null){
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    }else{
        return false
    }
    
}

const keepLegacy = (key: string, data: any) => {

    if(data){
        localStorage.setItem(key, data);
        return true;
    }else{
        return false
    }
    
}

const fetch = (key: string) => {

    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
}

const fetchLegacy = (key: string) => {
    const data = localStorage.getItem(key);
    return data ? data : null;
}

const deleteItem = (key: string, legacy: boolean = false) => {
    
    let data; 

    if(legacy && legacy === true){
        data = localStorage.getItem(key);
    }else{
        data = fetch(key);
    }

    if(data && data !== null && data !== undefined){
        localStorage.removeItem(key)
        return true;
    }else{
        return false;
    }
}

const trimSpace = (str: string) => {
    return str.replace(/\s/g, '');
}

const copyCode = (code: string) => {
    
    if(code !== '' && code !== undefined && typeof(code) === 'string'){
        navigator.clipboard.writeText(code);
        return true;
    }else{
        return false;
    }
}

const debugAuth = () => {
    const token = getToken();
    const userId = getUserID();
    const userType = getUserType();
    const userEmail = getUserEmail();
    
    console.log('Auth Debug Info:', {
        hasToken: !!token,
        tokenLength: token ? token.length : 0,
        tokenValid: checkToken(),
        hasUserId: !!userId,
        hasUserType: !!userType,
        hasUserEmail: !!userEmail,
        userId,
        userType,
        userEmail
    });
    
    return {
        hasToken: !!token,
        tokenValid: checkToken(),
        hasUserId: !!userId,
        hasUserType: !!userType,
        hasUserEmail: !!userEmail
    };
}

const storage: IStorage = {

    storeAuth: storeAuth,
    checkToken: checkToken,
    getToken: getToken,
    checkUserType: checkUserType,
    getUserType: getUserType,
    checkUserID: checkUserID,
    getUserID: getUserID,
    checkUserEmail: checkUserEmail,
    getUserEmail: getUserEmail,
    checkBusinessType: checkBusinessType,
    getBusinessType: getBusinessType,
    
    getConfig: getConfig,
    getConfigWithBearer: getConfigWithBearer,
    clearAuth: clearAuth,
    keep: keep,
    keepLegacy: keepLegacy,
    fetch: fetch,
    fetchLegacy: fetchLegacy,
    deleteItem: deleteItem,
    trimSpace: trimSpace,
    copyCode: copyCode,
    debugAuth: debugAuth

}

export default storage;
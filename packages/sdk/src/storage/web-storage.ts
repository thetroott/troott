import cookieService from '@/services/cookies';
import type { IStorage } from './types';

const storeAuth = (
    token: string,
    id: string,
    userType: string,
    email: string,
    businessType?: string,
) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userId',id);
    localStorage.setItem('role', userType);
    localStorage.setItem('userEmail', email);
    if (businessType !== undefined) {
        localStorage.setItem('businessType', businessType);
    }

    cookieService.setData({
        key: 'token',
        payload: token,
        expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        path: '/',
    });
    cookieService.setData({
        key: 'userId',
        payload: id,
        expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        path: '/',
    });
    cookieService.setData({
        key: 'userType',
        payload: userType,
        expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        path: '/',
    });
    cookieService.setData({
        key: 'userEmail',
        payload: email,
        expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        path: '/',
    });
};

const checkToken = () => {
    const token = localStorage.getItem('token');
    if (!token || token.trim() === '') {
        return false;
    }
    const tokenParts = token.split('.');
    return tokenParts.length === 3;
};

const getToken = () => localStorage.getItem('token');

const checkUserID = () => !!localStorage.getItem('userId');

const getUserID = () => localStorage.getItem('userId') ?? '';

const checkUserType = () => !!localStorage.getItem('userType');

const getUserType = () => localStorage.getItem('userType');

const checkUserEmail = () => !!localStorage.getItem('userEmail');

const getUserEmail = () => localStorage.getItem('userEmail');

const checkBusinessType = () => !!localStorage.getItem('businessType');

const getBusinessType = () => localStorage.getItem('businessType');

const getConfig = () => ({
    headers: {
        'Content-Type': 'application/json',
        lg: 'en',
        ch: 'web',
    },
});

const getConfigWithBearer = () => {
    const token = getToken();

    if (!token) {
        return {
            headers: {
                'Content-Type': 'application/json',
                lg: 'en',
                ch: 'web',
            },
        };
    }

    return {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            lg: 'en',
            ch: 'web',
        },
    };
};

const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('userType');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('businessType');

    cookieService.removeData({ key: 'token' });
    cookieService.removeData({ key: 'userId' });
    cookieService.removeData({ key: 'userType' });
    cookieService.removeData({ key: 'userEmail' });
};

const keep = (key: string, data: any) => {
    if (data !== undefined && data !== null) {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    }
    return false;
};

const fetch = (key: string) => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
};

const deleteItem = (key: string) => {
    const data = fetch(key);
    if (data !== null && data !== undefined) {
        localStorage.removeItem(key);
        return true;
    }
    return false;
};

const trimSpace = (str: string) => str.replace(/\s/g, '');

const copyCode = (code: string) => {
    if (code !== '' && code !== undefined && typeof code === 'string') {
        void navigator.clipboard.writeText(code);
        return true;
    }
    return false;
};

const debugAuth = () => ({
    hasToken: !!getToken(),
    tokenValid: checkToken(),
    hasUserId: !!getUserID(),
    hasUserType: !!getUserType(),
    hasUserEmail: !!getUserEmail(),
});

const storage: IStorage = {
    storeAuth,
    checkToken,
    getToken,
    checkUserType,
    getUserType,
    checkUserID,
    getUserID,
    checkUserEmail,
    getUserEmail,
    checkBusinessType,
    getBusinessType,
    getConfig,
    getConfigWithBearer,
    clearAuth,
    keep,
    fetch,
    deleteItem,
    trimSpace,
    copyCode,
    debugAuth,
};

export default storage;

import { Linking, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { toast } from '@/components/ui/toast';

export const debounce = (fn: (...args: any[]) => void, delay: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
    };
};

export const throttle = (fn: (...args: any[]) => void, limit: number) => {
    let inThrottle: boolean;
    return (...args: any[]) => {
        if (!inThrottle) {
            fn(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
};

export const deepClone = (obj: any): any => JSON.parse(JSON.stringify(obj));

export const deepMerge = (target: any, source: any): any => {
    if (typeof target !== 'object' || typeof source !== 'object') return source;
    for (const key in source) {
        if (typeof source[key] === 'object' && target[key]) {
            target[key] = deepMerge(target[key], source[key]);
        } else {
            target[key] = source[key];
        }
    }
    return target;
};

export const safeParseJSON = (data: string | null) => {
    try {
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('JSON Parse Error:', error);
        return null;
    }
};

export const checkNetworkStatus = async () => {
    const state = await NetInfo.fetch();
    return state.isConnected;
};

export const numberFormat = (
    value: any,
    locale: string = 'en-GB',
    options: any = {},
) => new Intl.NumberFormat(locale, options).format(value);

export const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

/**
 * Opens the app's Play Store page (Android).
 */
export const openAppInPlayStore = async (
    appPackageName: string,
): Promise<void> => {
    const url = `market://details?id=${appPackageName}`;
    const canOpen = await Linking.canOpenURL(url);

    if (canOpen) {
        await Linking.openURL(url);
    } else {
        console.warn('Cannot open Play Store URL:', url);
    }
};
/**
 * Opens the app's App Store page (iOS).
 */
export const openAppInAppStore = async (appStoreId: string): Promise<void> => {
    const url = `https://apps.apple.com/app/id${appStoreId}`;
    const canOpen = await Linking.canOpenURL(url);

    if (canOpen) {
        await Linking.openURL(url);
    } else {
        console.warn('Cannot open App Store URL:', url);
    }
};

/**
 * Opens the app store depending on the platform.
 */
export const openExternalApp = async (
    appPackageName: string,
    appStoreId: string,
): Promise<void> => {
    if (Platform.OS === 'ios') {
        await openAppInAppStore(appStoreId);
    } else if (Platform.OS === 'android') {
        await openAppInPlayStore(appPackageName);
    }
};

// utils/firstTimeUser.ts
const STORAGE_KEY = 'hasVisited';

/**
 * Check if the user is visiting for the first time
 * @returns boolean - true if first time, false if returning
 */
const isFirstTimeUser = (): boolean => {
    try {
        const value = localStorage.getItem(STORAGE_KEY);
        return value !== 'true';
    } catch (error) {
        console.error('Error accessing localStorage:', error);
        // fallback to treating user as first time
        return true;
    }
};

/**
 * Mark user as returning
 */
const markUserAsReturning = (): void => {
    try {
        localStorage.setItem(STORAGE_KEY, 'true');
    } catch (error) {
        console.error('Error setting localStorage:', error);
    }
};
/**
 * Full helper to check and handle navigation logic
 * @param onFirstTime callback when user is first time
 * @param onReturning callback when user is returning
 */
export const handleUserNavigation = (
    onFirstTime: () => void,
    onReturning: () => void,
) => {
    if (isFirstTimeUser()) {
        onFirstTime();
        markUserAsReturning();
    } else {
        onReturning();
    }
};

export const handleMutationError = (error: any) => {
    const message =
        error?.response?.data?.errors?.[0] ||
        error?.response?.data?.message ||
        error.message;
    toast.error(message);
};

export default {
    debounce,
    throttle,
    deepClone,
    deepMerge,
    safeParseJSON,
    checkNetworkStatus,
    numberFormat,
    formatDate,
    openAppInPlayStore,
    openExternalApp,
    handleMutationError,
    handleUserNavigation,
};

export interface IStorageAdapter {
    getToken(): Promise<string | null>;
    setToken(token: string): Promise<void>;
    removeToken(): Promise<void>;
    checkToken(): Promise<boolean>;
    getUserId(): Promise<string | null>;
    setUserId(id: string): Promise<void>;
    storeAuth(
        token: string,
        userId: string,
        userType: string,
        email: string,
        businessType?: string,
    ): Promise<void>;
    clearAuth(): Promise<void>;
    clear(): Promise<void>;
}
